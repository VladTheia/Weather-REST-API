const express = require('express');
const app = express();
const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const Country = require('../models/country');
const City = require('../models/city');
const Temp = require('../models/temp');

mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
mongoose.connect('mongodb://mongo/api', {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        const port = 3000;

        app.listen(port, () => {
            console.log(`App listening at port ${port}`);
        });
    })

app.use(express.json());

app.post('/api/countries', (req, res) => {
    const { nume, lat, lon } = req.body;

    if (nume == undefined || lat == undefined || lon == undefined) {
        // Bad Request if members are missing
        res.sendStatus(400);
        return;
    }

    const country = new Country({
        nume,
        lat,
        lon
    });

    country.save()
        .then((result) => {
            // Created if db adds data
            res.status(201).json({id: result._id});
        }).catch((err) => {
            // Coflict if db finds the same unique field
            res.sendStatus(409);
        });
});

app.get('/api/countries', (req, res) => {
    Country.find({}, (err, countries) => {
        let countriesArr = [];

        countries.forEach(country => {
            const { _id, nume, lat, lon } = country;
            countriesArr.push({id: _id, nume, lat, lon});
        });

        res.status(200).json(countriesArr);
    });
});

app.put('/api/countries/:id', (req, res) => {
    const id = req.params.id;
    const { nume, lat, lon } = req.body;
    
    if (nume == undefined || lat == undefined || lon == undefined) {
        // Bad Request if members are missing
        res.send(400);
        return;
    }

    const country = new Country({
        nume,
        lat,
        lon
    });

    Country.updateOne({_id: id}, country, (err, result) => {
        if (err) {
            // Conflict if unique field already exists
            res.send(409);
        } else if (!result.n) {
            // Not found if there's no country with that id
            res.send(404);
        } else {
            // OK if db updates fine
            res.send(200);
        }
    });
});

app.delete('/api/countries/:id', async (req, res) => {
    const id = req.params.id;

    Country.deleteOne({_id: id}, (err, result) => {
        if (!result.n) {
            // Not Found if there's no country with that id
            res.sendStatus(404);
        } else {
            // OK if db deletes country
            res.sendStatus(200);
        }
    });

    let cities = await City.find({ idTara: id }).exec();
    for (let city of cities) {
        Temp.deleteMany({ idOras: city._id }, (err, result) => {
            // console.log(err, result);
        });
    }

    // delete the cities that have this country id
    City.deleteMany({ idTara: id }, (err, result) => {
        // console.log(err, result);
    });
});
