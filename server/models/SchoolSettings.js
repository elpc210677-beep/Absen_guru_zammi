const mongoose = require('mongoose');

const schoolSettingsSchema = new mongoose.Schema({
  schoolName: {
    type: String,
    default: 'Sekolah Zammi'
  },
  schoolAddress: {
    type: String,
    trim: true
  },
  geolocation: {
    latitude: {
      type: Number,
      default: -6.1753
    },
    longitude: {
      type: Number,
      default: 106.8249
    }
  },
  geoRadius: {
    type: Number,
    default: 15, // dalam meter
    min: 10,
    max: 100
  },
  workingHours: {
    startTime: {
      type: String,
      default: '07:00' // format HH:mm
    },
    endTime: {
      type: String,
      default: '14:00'
    }
  },
  lateTime: {
    type: Number,
    default: 15 // menit
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

module.exports = mongoose.model('SchoolSettings', schoolSettingsSchema);
