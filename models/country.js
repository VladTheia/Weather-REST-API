const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');

autoIncrement.initialize(mongoose.connection);

const { Schema } = mongoose;
const countrySchema = new Schema({
    nume: {type: String, required: true},
    lat: {type: Number, required: true},
    lon: {type: Number, required: true}
});

countrySchema.index({ nume: 1}, { unique: true });
countrySchema.plugin(autoIncrement.plugin, 'Country');
countrySchema.pre('remove', next => {
    this.model('City').remove({ idTara: this._id }, next);
});
const Country = mongoose.model('Country', countrySchema);

module.exports = Country;