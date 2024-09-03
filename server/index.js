// server/server.js
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { memoryStorage } = require('multer')
const storage = memoryStorage()
const upload = multer({ storage })
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const { s3_bucket, s3 } = require('./config/s3');
const { connectDB } = require('./config/db');

// MongoDB connection
connectDB();

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
};

const app = express();
const DIRNAME = path.resolve();
const PORT = process.env.PORT || 5000;

//Middlewares
app.use(cors(corsOptions));
app.use(express.json());

// Schema for file metadata// Schema for file metadata
  const fileSchema = new mongoose.Schema({
    originalName: String,
    encoding: String,
    mimeType: String,
    size: Number,
    path: String,
    createdAt: { type: Date, default: Date.now },
  });
  
  const File = mongoose.model('File', fileSchema);
  
  // Endpoint to handle file upload
  // app.post('/api/upload', upload.single('file'), async (req, res) => {
  //   if (!req.file) {
  //     return res.status(400).json({ error: 'No file uploaded' });
  //   }
  
  //   const file = req.file;
  //   const fileMetadata = new File({
  //     originalName: file.originalname,
  //     encoding: file.encoding,
  //     mimeType: file.mimetype,
  //     size: file.size,
  //     path: file.path,
  //   });
  
  //   try {
  //     await fileMetadata.save();
  //     res.json({ message: 'File uploaded successfully', file: fileMetadata });
  //   } catch (error) {
  //     res.status(500).json({ error: 'Failed to save file metadata' });
  //   }
  // });

  const generateUniqueFileName = (file) => {
    return (
      (Date.now() + Math.random()).toString().replace(".", "") +
      "---" +
      file.originalname
    );
  };

  const uploadAudio = async (filename, file) => {
      const params = {
          Key: filename,
          Bucket: s3_bucket,
          Body: file,
          ContentType: 'audio/mpeg',
      };
      //sleep token

      try {
          const command = new PutObjectCommand(params);
          const data = await s3.send(command);
          const location = `https://${s3_bucket}.s3.${process.env.S3_REGION}.amazonaws.com/${filename}`;
          return location;
      } catch (err) {
          throw err;
      }
  };
  
  app.post('/upload', upload.single('audiofile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
  
      const filename = generateUniqueFileName(req.file);
      const file = req.file.buffer;
      const link = await uploadAudio(filename, file);
      res.status(200).json({ signed_url: link });
    } catch (err) {
      console.error('Error during upload:', err);  // Log the error
      res.status(500).json({ message: 'Failed to upload audio file', error: err.message });
    }
  });
  

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));