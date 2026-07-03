const adminAuth = (req, res, next) => {
  try {
    // Cek apakah user adalah admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Akses ditolak. Hanya admin yang dapat mengakses fitur ini' 
      });
    }
    
    next(); // Lanjut ke route berikutnya jika admin
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error verifikasi admin', 
      error: error.message 
    });
  }
};

module.exports = adminAuth;
