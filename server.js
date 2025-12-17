const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');

const app = express();

// Настройка CORS
app.use(cors({
  origin: 'http://localhost:3000', // React приложение
  credentials: true
}));

// Настройка загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'dataemu', 'temp_roms');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '_' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// Эндпоинт для загрузки файлов
app.post('/upload', upload.single('rom'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Файл не загружен' });
  }
  
  res.json({
    success: true,
    filename: req.file.filename,
    originalName: req.file.originalname,
    path: `/temp_roms/${req.file.filename}`
  });
});

// Эндпоинт для очистки временных файлов
app.post('/cleanup', (req, res) => {
  const filename = req.query.filename;
  if (filename) {
    const filePath = path.join(__dirname, 'dataemu', 'temp_roms', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
  res.json({ success: true });
});

// Сервим статические файлы EmulatorJS
app.use('/emulator', express.static(path.join(__dirname, 'dataemu')));

// Разрешаем доступ к temp_roms
app.use('/temp_roms', express.static(path.join(__dirname, 'dataemu', 'temp_roms')));

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Сервер эмулятора запущен на порту ${PORT}`);
  console.log(`📁 EmulatorJS: http://localhost:${PORT}/emulator/index.html`);
  console.log(`📤 API загрузки: http://localhost:${PORT}/upload`);
});