const express = require('express');
const router = express.Router();
const multer = require('../utils/multer');
const authController = require('../controllers/authController');

router.post(
  '/upload',
  authController.protect,
  authController.restrictTo('student'),
  multer.upload.single('file'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        status: 'fail',
        message: 'No file uploaded'
      });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    res.status(200).json({
      status: 'success',
      data: {
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileUrl: fileUrl
      }
    });
  }
);

module.exports = router;