const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: () => new Date(new Date().setHours(0, 0, 0, 0))
  },
  checkIn: {
    time: Date,
    latitude: Number,
    longitude: Number,
    accuracy: Number,
    distance: Number, // jarak dari titik koordinat sekolah dalam meter
    isValid: Boolean
  },
  checkOut: {
    time: Date,
    latitude: Number,
    longitude: Number,
    accuracy: Number,
    distance: Number,
    isValid: Boolean
  },
  status: {
    type: String,
    enum: ['hadir', 'terlambat', 'izin', 'sakit', 'libur', 'belum_absen'],
    default: 'belum_absen'
  },
  notes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index untuk query yang lebih cepat
attendanceSchema.index({ userId: 1, date: -1 });
attendanceSchema.index({ date: -1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
