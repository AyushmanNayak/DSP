// server/server.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const corsOptions = {
    origin: 'http://localhost:5174',
    credentials: true,
    optionsSuccessStatus: 200,
};

app.use(express.json());
app.use(cors(corsOptions));

const upload = multer({ dest: 'uploads/' });



// MongoDB connection
mongoose.connect('mongodb+srv://ayushmannayak2311:ayushmannayak2311@cluster0.tlzly8z.mongodb.net/dsp?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1); // Exit the process with failure
});
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
  app.post('/api/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
  
    const file = req.file;
    const fileMetadata = new File({
      originalName: file.originalname,
      encoding: file.encoding,
      mimeType: file.mimetype,
      size: file.size,
      path: file.path,
    });
  
    try {
      await fileMetadata.save();
      res.json({ message: 'File uploaded successfully', file: fileMetadata });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save file metadata' });
    }
  });
  
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));