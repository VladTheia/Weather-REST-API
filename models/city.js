const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');

autoIncrement.initialize(mongoose.connection);

const { Schema } = mongoose;
const citySchema = new Schema({
    idTara: {type: Schema.Types.Number, required: true, ref: 'Country'},
    nume: {type: String, required: true},
    lat: {type: Number, required: true},
    lon: {type: Number, required: true}
});

citySchema.plugin(autoIncrement.plugin, 'City');
citySchema.index({ idTara: 1, nume: 1 }, { unique: true });
const City = mongoose.model('City', citySchema);

module.exports = City;