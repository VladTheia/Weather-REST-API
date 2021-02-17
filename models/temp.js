const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');

autoIncrement.initialize(mongoose.connection);

const { Schema } = mongoose;
const tempSchema = new Schema({
    valoare: {type: Number, required: true},
    timestamp: {type: Date, required: true},
    idOras: {type: Number, required: true}
});

tempSchema.plugin(autoIncrement.plugin, 'Temp');
tempSchema.index({ idOras: 1, timestamp: 1 }, { unique: true });
const Temp = mongoose.model('Temp', tempSchema);

module.exports = Temp;