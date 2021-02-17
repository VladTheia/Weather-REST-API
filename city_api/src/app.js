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

app.post('/api/cities', (req, res) => {
    const { idTara, nume, lat, lon } = req.body;

    if (idTara == undefined || nume == undefined || lat == undefined || lon == undefined) {
        // Bad Request if members are missing
        res.sendStatus(400);
        return;
    }

    Country.exists({ _id: idTara })
        .then(result => {
            if (result) {
                const city = new City({
                    idTara,
                    nume,
                    lat,
                    lon
                });
            
                city.save()
                    .then(result => {
                        // Created if db adds data
                        res.status(201).json({ id: result._id });
                    })
                    .catch(err => {
                        // console.log(err);
                        // Coflict if db finds the same unique field
                        res.sendStatus(409);
                    })  
            } else {
                // Not Found if there's no country with the given country id
                res.sendStatus(404);
            }
        })
        .catch(err => {
            console.log(err);
        })
});

app.get('/api/cities', (req, res) => {
    City.find({}, (err, cities) => {
        let citiesArr = [];

        cities.forEach(city => {
            const { _id, idTara, nume, lat, lon } = city;
            citiesArr.push({id: _id, idTara, nume, lat, lon});
        });

        res.status(200).json(citiesArr);
    });
});

app.get('/api/cities/country/:id', (req, res) => {
    const id = req.params.id;

    City.find({ idTara: id }, (err, cities) => {
        let citiesArr = [];

        cities.forEach(city => {
            const { _id, idTara ,nume, lat, lon } = city;
            citiesArr.push({id: _id, idTara, nume, lat, lon});
        });

        res.status(200).json(citiesArr);
    });
});

app.put('/api/cities/:id', (req, res) => {
    const id = req.params.id;

    const { idTara, nume, lat, lon } = req.body;

    if (idTara == undefined || nume == undefined || lat == undefined || lon == undefined) {
        res.sendStatus(400);
        return;
    }

    const city = new City({
        idTara,
        nume,
        lat,
        lon
    });

    Country.find({ _id: idTara }, (err, countries) => {
        if (!countries.length) {
            // Not Found if there's no country with the updated country id
            res.sendStatus(404);
            return;
        }
        
        City.updateOne({_id: id}, city, (err, result) => {
            if (err) {
                // Conflict if there's already a city with that name and country id
                res.sendStatus(409);
            } else if (!result.n) {
                // Not Found if there's no city with that id
                res.sendStatus(404);
            } else {
                // Success if it updates
                res.sendStatus(200);
            }
        });
    })
});

app.delete('/api/cities/:id', async (req, res) => {
    const id = req.params.id;

    City.deleteOne({ _id: id }, (err, result) => {
        if (!result.n) {
            // Not Found if there's no city with that id
            res.sendStatus(404);
        } else {
            // OK if db deletes city
            res.sendStatus(200);
        }
    });

    // Delete all temps registered for that city
    Temp.deleteMany({ idOras: id }, (err, result) => {
        // console.log(err, result);
    });
});
