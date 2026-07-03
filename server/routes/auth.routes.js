const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// ============================================
// POST /api/auth/register - Daftar user baru
// ============================================
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Nama harus diisi'),
  body('email').isEmail().withMessage('Email tidak valid'),
  body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
  body('nip').optional().trim()
], async (req, res) => {
  try {
    // Validasi input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, nip } = req.body;

    // Cek apakah email sudah terdaftar
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email sudah terdaftar. Gunakan email lain' 
      });
    }

    // Buat user baru
    user = new User({
      name,
      email,
      password,
      nip,
      role: 'guru' // Default role adalah guru
    });

    // Simpan ke database
    await user.save();

    // Generate JWT token (berlaku 7 hari)
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil. Selamat datang!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Error saat registrasi', 
      error: error.message 
    });
  }
});

// ============================================
// POST /api/auth/login - Login user
// ============================================
router.post('/login', [
  body('email').isEmail().withMessage('Email tidak valid'),
  body('password').notEmpty().withMessage('Password harus diisi')
], async (req, res) => {
  try {
    // Validasi input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    // Cari user berdasarkan email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email atau password salah' 
      });
    }

    // Cek password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email atau password salah' 
      });
    }

    // Cek apakah user aktif
    if (!user.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: 'Akun Anda telah dinonaktifkan. Hubungi admin' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      message: 'Login berhasil. Selamat datang kembali!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Error saat login', 
      error: error.message 
    });
  }
});

// ============================================
// GET /api/auth/me - Ambil data user yang login
// ============================================
router.get('/me', auth, async (req, res) => {
  try {
    // auth middleware sudah verifikasi token & set req.user
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User tidak ditemukan' 
      });
    }

    res.json({ 
      success: true, 
      user 
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
