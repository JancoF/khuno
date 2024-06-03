const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configurar EJS y archivos estáticos
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configurar Multer para almacenar archivos
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const dir = './uploads';
    try {
      await fs.mkdir(dir, { recursive: true });
      cb(null, dir);
    } catch (err) {
      cb(err, null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/khamani', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error al conectar a MongoDB', err));

// Esquema y modelo para videos
const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  filename: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  views: [{
    user: { type: String, default: 'anonymous' },
    percentage: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now }
  }]
});

const Video = mongoose.model('house', videoSchema);

// Rutas
app.get('/', (req, res) => {
  res.render('upload');
});

app.post('/upload', upload.single('video'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No se subió ningún archivo.');
  }

  try {
    const { title } = req.body;
    const video = new Video({
      title: title || 'Sin título',
      filename: req.file.filename
    });

    await video.save();
    console.log('Video guardado:', video);
    res.send('Video subido y guardado en MongoDB exitosamente.');
  } catch (error) {
    console.error('Error al guardar el video:', error);
    res.status(500).send('Error al subir el video.');
  }
});

app.get('/pampa', async (req, res) => {
  try {
    const videos = await Video.find();
    res.render('pampa', { videos });
  } catch (error) {
    console.error('Error al obtener videos:', error);
    res.status(500).send('Error al cargar los videos.');
  }
});

app.post('/update-view', async (req, res) => {
  try {
    const { videoId, percentage } = req.body;
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).send('Video no encontrado.');
    }

    video.views.push({ percentage: parseFloat(percentage) });
    await video.save();
    res.status(200).send('Porcentaje de visualización actualizado.');
  } catch (error) {
    console.error('Error al actualizar visualización:', error);
    res.status(500).send('Error al actualizar la visualización.');
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});