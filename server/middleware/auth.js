const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    // Ambil token dari header Authorization
    // Format: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token tidak ditemukan. Silakan login terlebih dahulu' 
      });
    }

    // Verifikasi token apakah valid
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    // Simpan data user di req.user untuk digunakan route berikutnya
    req.user = decoded;
    
    next(); // Lanjut ke route berikutnya
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token telah kadaluarsa. Silakan login kembali' 
      });
    }
    res.status(401).json({ 
      success: false, 
      message: 'Token tidak valid' 
    });
  }
};

module.exports = auth;
