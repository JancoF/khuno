const express = require('express');
const router = express.Router();
const House = require('../models/house');

// Ruta para guardar un video
router.post('/house', async (req, res) => {
  try {
    const { movie, title, description } = req.body;

    // Crear un nuevo documento
    const newHouse = new House({
      movie: Buffer.from(movie, 'base64'), // Convertir base64 a Buffer
      title,
      description
    });

    // Guardar en la base de datos
    await newHouse.save();

    res.status(201).send('Video guardado exitosamente');
  } catch (error) {
    res.status(500).send('Error al guardar el video');
  }
});

module.exports = router;
