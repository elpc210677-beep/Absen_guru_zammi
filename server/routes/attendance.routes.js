const express = require('express');
const { body, validationResult } = require('express-validator');
const Attendance = require('../models/Attendance');
const SchoolSettings = require('../models/SchoolSettings');
const auth = require('../middleware/auth');

const router = express.Router();

// ============================================
// Helper: Hitung jarak antara 2 koordinat (meter)
// Menggunakan Haversine Formula
// ============================================
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Radius bumi dalam meter
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Hasil dalam meter
};

// ============================================
// POST /api/attendance/check-in - Check-in guru
// ============================================
router.post('/check-in', auth, [
  body('latitude').isFloat().withMessage('Latitude harus angka'),
  body('longitude').isFloat().withMessage('Longitude harus angka'),
  body('accuracy').optional().isFloat()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { latitude, longitude, accuracy } = req.body;
    const userId = req.user.userId;

    // Ambil pengaturan sekolah
    const schoolSettings = await SchoolSettings.findOne() || {
      geolocation: { latitude: -6.1753, longitude: 106.8249 },
      geoRadius: 15
    };

    // Hitung jarak dari sekolah
    const distance = calculateDistance(
      latitude,
      longitude,
      schoolSettings.geolocation.latitude,
      schoolSettings.geolocation.longitude
    );

    // OPSI A: Cek apakah dalam radius
    // ✅ HADIR (≤ 15m)
    // ❌ LUAR_LOKASI (> 15m)
    const isWithinRadius = distance <= schoolSettings.geoRadius;
    const status = isWithinRadius ? 'hadir' : 'luar_lokasi';

    // Cek apakah sudah check-in hari ini
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let attendance = await Attendance.findOne({
      userId,
      date: today
    });

    if (!attendance) {
      // Buat record absensi baru
      attendance = new Attendance({
        userId,
        date: today,
        checkIn: {
          time: new Date(),
          latitude,
          longitude,
          accuracy,
          distance: Math.round(distance),
          isValid: isWithinRadius
        },
        status: status
      });
    } else if (attendance.checkIn && attendance.checkIn.time) {
      // Sudah check-in
      return res.status(400).json({
        success: false,
        message: 'Anda sudah check-in hari ini pada pukul ' + 
                 new Date(attendance.checkIn.time).toLocaleTimeString('id-ID')
      });
    } else {
      // Update check-in jika belum ada
      attendance.checkIn = {
        time: new Date(),
        latitude,
        longitude,
        accuracy,
        distance: Math.round(distance),
        isValid: isWithinRadius
      };
      attendance.status = status;
    }

    await attendance.save();

    // Response berdasarkan status
    const responseMessage = isWithinRadius 
      ? '✅ Check-in berhasil! Status: HADIR'
      : '❌ Check-in ditolak! Anda berada di luar lokasi sekolah';

    res.json({
      success: isWithinRadius,
      message: responseMessage,
      data: {
        status: attendance.status,
        checkInTime: attendance.checkIn.time,
        distance: Math.round(distance),
        allowedRadius: schoolSettings.geoRadius,
        isWithinRadius
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error saat check-in',
      error: error.message
    });
  }
});

// ============================================
// POST /api/attendance/check-out - Check-out guru
// ============================================
router.post('/check-out', auth, [
  body('latitude').isFloat().withMessage('Latitude harus angka'),
  body('longitude').isFloat().withMessage('Longitude harus angka'),
  body('accuracy').optional().isFloat()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { latitude, longitude, accuracy } = req.body;
    const userId = req.user.userId;

    const schoolSettings = await SchoolSettings.findOne() || {
      geolocation: { latitude: -6.1753, longitude: 106.8249 },
      geoRadius: 15
    };

    const distance = calculateDistance(
      latitude,
      longitude,
      schoolSettings.geolocation.latitude,
      schoolSettings.geolocation.longitude
    );

    // OPSI A: Cek apakah dalam radius
    const isWithinRadius = distance <= schoolSettings.geoRadius;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let attendance = await Attendance.findOne({ userId, date: today });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: 'Anda belum check-in hari ini. Silakan check-in terlebih dahulu'
      });
    }

    if (attendance.checkOut && attendance.checkOut.time) {
      return res.status(400).json({
        success: false,
        message: 'Anda sudah check-out hari ini pada pukul ' + 
                 new Date(attendance.checkOut.time).toLocaleTimeString('id-ID')
      });
    }

    // Jika check-out di luar lokasi
    if (!isWithinRadius) {
      return res.status(400).json({
        success: false,
        message: '❌ Check-out ditolak! Anda harus berada di lokasi sekolah untuk check-out',
        data: {
          distance: Math.round(distance),
          allowedRadius: schoolSettings.geoRadius
        }
      });
    }

    attendance.checkOut = {
      time: new Date(),
      latitude,
      longitude,
      accuracy,
      distance: Math.round(distance),
      isValid: isWithinRadius
    };

    await attendance.save();

    res.json({
      success: true,
      message: '✅ Check-out berhasil. Terima kasih telah bekerja hari ini',
      data: {
        checkOutTime: attendance.checkOut.time,
        distance: Math.round(distance),
        allowedRadius: schoolSettings.geoRadius,
        isWithinRadius
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error saat check-out',
      error: error.message
    });
  }
});

// ============================================
// GET /api/attendance/today - Lihat absensi hari ini
// ============================================
router.get('/today', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({ userId, date: today });

    if (!attendance) {
      return res.json({
        success: true,
        message: 'Belum ada data absensi hari ini',
        data: null
      });
    }

    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error',
      error: error.message
    });
  }
});

// ============================================
// GET /api/attendance/history - Riwayat absensi guru
// ============================================
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate, limit = 30, page = 1 } = req.query;

    let query = { userId };

    // Filter berdasarkan range tanggal
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const skip = (page - 1) * limit;

    const history = await Attendance.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Attendance.countDocuments(query);

    res.json({
      success: true,
      data: history,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error',
      error: error.message
    });
  }
});

module.exports = router;
