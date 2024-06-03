const mongoose = require('mongoose');

const houseSchema = new mongoose.Schema({
  movie: Buffer,
  title: String,
  description: String
});

const House = mongoose.model('House', houseSchema);

module.exports = House;
