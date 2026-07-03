# Sistem Absensi Guru Digital Zammi

Sistem absensi guru berbasis web dengan verifikasi geolocation. Guru dapat melakukan check-in hanya jika berada dalam radius 10-20 meter dari titik koordinat sekolah yang ditentukan.

## 📋 Fitur Utama

- ✅ Check-in dengan verifikasi geolocation (GPS)
- ✅ History/riwayat absensi
- ✅ Admin dashboard untuk monitoring
- ✅ Real-time status kehadiran
- ✅ Export laporan absensi
- ✅ Responsive design (mobile & desktop)

## 🛠️ Tech Stack

- **Frontend:** React.js
- **Backend:** Node.js + Express.js
- **Database:** MongoDB
- **Authentication:** JWT
- **Geolocation:** HTML5 Geolocation API

## 📁 Struktur Project

```
Absen_guru_zammi/
├── server/                 # Backend Node.js
│   ├── config/            # Konfigurasi database, env
│   ├── models/            # Schema MongoDB
│   ├── routes/            # API routes
│   ├── controllers/        # Business logic
│   ├── middleware/        # Auth, validation
│   ├── .env               # Environment variables
│   ├── server.js          # Entry point
│   └── package.json       # Dependencies
│
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API calls
│   │   ├── utils/         # Geolocation utils
│   │   ├── App.js         # Main app
│   │   └── index.js       # Entry point
│   ├── public/            # Static files
│   └── package.json       # Dependencies
│
└── docs/                   # Dokumentasi
    ├── API.md             # API documentation
    ├── SETUP.md           # Setup guide
    └── DEPLOYMENT.md      # Deployment guide
```

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone git@github.com:elpc210677-beep/Absen_guru_zammi.git
cd Absen_guru_zammi
```

### 2. Setup Backend
```bash
cd server
npm install
cp .env.example .env
# Edit .env dengan konfigurasi Anda
npm start
```

### 3. Setup Frontend
```bash
cd ../client
npm install
npm start
```

Aplikasi akan berjalan di `http://localhost:3000`

## 📖 Dokumentasi

- [Setup Guide](./docs/SETUP.md) - Panduan instalasi lengkap
- [API Documentation](./docs/API.md) - Dokumentasi API
- [Deployment Guide](./docs/DEPLOYMENT.md) - Panduan deploy ke production

## 🔒 Keamanan

- JWT authentication untuk API
- HTTPS untuk production
- Validasi server-side untuk geolocation
- Input sanitization & validation

## 📝 License

MIT

## 👥 Support

Untuk bantuan, buat issue di repository ini.
