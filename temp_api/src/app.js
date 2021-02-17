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

// app.post('/api/cities', (req, res) => {
//     const { idTara, nume, lat, lon } = req.body;

//     if (idTara == undefined || nume == undefined || lat == undefined || lon == undefined) {
//         // Bad Request if members are missing
//         res.sendStatus(400);
//         return;
//     }

//     Country.exists({ _id: idTara })
//         .then(result => {
//             if (result) {
//                 const city = new City({
//                     idTara,
//                     nume,
//                     lat,
//                     lon
//                 });
            
//                 city.save()
//                     .then(result => {
//                         // Created if db adds data
//                         res.status(201).json({ id: result._id });
//                     })
//                     .catch(err => {
//                         // console.log(err);
//                         // Coflict if db finds the same unique field
//                         res.sendStatus(409);
//                     })  
//             } else {
//                 // Not Found if there's no country with the given country id
//                 res.sendStatus(404);
//             }
//         })
//         .catch(err => {
//             console.log(err);
//         })
// });

// app.get('/api/cities', (req, res) => {
//     City.find({}, (err, cities) => {
//         let citiesArr = [];

//         cities.forEach(city => {
//             const { _id, idTara, nume, lat, lon } = city;
//             citiesArr.push({id: _id, idTara, nume, lat, lon});
//         });

//         res.status(200).json(citiesArr);
//     });
// });

// app.get('/api/cities/country/:id', (req, res) => {
//     const id = req.params.id;

//     City.find({ idTara: id }, (err, cities) => {
//         let citiesArr = [];

//         cities.forEach(city => {
//             const { _id, idTara ,nume, lat, lon } = city;
//             citiesArr.push({id: _id, idTara, nume, lat, lon});
//         });

//         res.status(200).json(citiesArr);
//     });
// });

// app.put('/api/cities/:id', (req, res) => {
//     const id = req.params.id;

//     const { idTara, nume, lat, lon } = req.body;

//     if (idTara == undefined || nume == undefined || lat == undefined || lon == undefined) {
//         res.sendStatus(400);
//         return;
//     }

//     const city = new City({
//         idTara,
//         nume,
//         lat,
//         lon
//     });

//     Country.find({ _id: idTara }, (err, countries) => {
//         if (!countries.length) {
//             // Not Found if there's no country with the updated country id
//             res.sendStatus(404);
//             return;
//         }
        
//         City.updateOne({_id: id}, city, (err, result) => {
//             if (err) {
//                 // Conflict if there's already a city with that name and country id
//                 res.sendStatus(409);
//             } else if (!result.n) {
//                 // Not Found if there's no city with that id
//                 res.sendStatus(404);
//             } else {
//                 // Success if it updates
//                 res.sendStatus(200);
//             }
//         });
//     })
// });

// app.delete('/api/cities/:id', async (req, res) => {
//     const id = req.params.id;

//     City.deleteOne({ _id: id }, (err, result) => {
//         if (!result.n) {
//             // Not Found if there's no city with that id
//             res.sendStatus(404);
//         } else {
//             // OK if db deletes city
//             res.sendStatus(200);
//         }
//     });

//     // Delete all temps registered for that city
//     Temp.deleteMany({ idOras: id }, (err, result) => {
//         // console.log(err, result);
//     });

// });

function formatDate(date) {
    let d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    let year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

app.post('/api/temperatures', async (req, res) => {
    const idOras = Number(req.body.idOras);
    const valoare = Number(req.body.valoare);

    if (isNaN(idOras) || isNaN(valoare)) {
        res.sendStatus(400);
        return
    }

    let cities = await City.find({ _id: idOras }).exec();

    if (!cities.length) {
        // Not Found if there's no city with that city id
        res.sendStatus(404);
        return;
    }

    const temp = new Temp({
        valoare,
        timestamp: formatDate(new Date()),
        idOras
    });

    temp.save()
    .then(result => {
        // Created if db adds data
        res.status(201).json({ id: result._id });
    })
    .catch(err => {
        // Coflict if db finds the same unique field
        res.sendStatus(409);
    })  
});

app.get('/api/temperatures', async (req, res) => {
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);
    const from = req.query.from;
    const until = req.query.until;

    console.log(lat, lon, from, until);

    let cities
    if (!isNaN(lat) && !isNaN(lon)) {
        cities = await City.find({ lat, lon }).exec();
    } else if (!isNaN(lat)) {
        cities = await City.find({ lat }).exec();
    } else if (!isNaN(lon)) {
        cities = await City.find({ lon }).exec();
    } else {
        cities = await City.find({}).exec();
    }

    console.log(cities);

    let resTemps = [];

    for (let city of cities) {
        let temps;

        if (from && until) {
            temps = await Temp.find({ idOras: city._id, timestamp: { $gte: formatDate(from), $lte: formatDate(until) } }).exec();
        } else if (from) {
            temps = await Temp.find({ idOras: city._id, timestamp: { $gte: formatDate(from) } }).exec();
        } else if (until) {
            temps = await Temp.find({ idOras: city._id, timestamp: { $lte: formatDate(until) } }).exec();
        } else {
            temps = await Temp.find({ idOras: city._id }).exec();
        }

        for (let temp of temps) {
            resTemps.push({ id: temp._id, valoare: temp.valoare, timestamp: formatDate(temp.timestamp) });
        }
    }

    res.status(200).json(resTemps);
});

app.get('/api/temperatures/cities/:id', async (req, res) => {
    const { from, until } = req.query;
    const idOras = Number(req.params.id);

    let cities = await City.find({ _id: idOras }).exec();

    const resTemps = [];

    for (let city of cities) {
        let temps;

        if (from && until) {
            temps = await Temp.find({ idOras: city._id, timestamp: { $gte: formatDate(from), $lte: formatDate(until) } }).exec();
        } else if (from) {
            temps = await Temp.find({ idOras: city._id, timestamp: { $gte: formatDate(from) } }).exec();
        } else if (until) {
            temps = await Temp.find({ idOras: city._id, timestamp: { $lte: formatDate(until) } }).exec();
        } else {
            temps = await Temp.find({ idOras: city._id }).exec();
        }

        for (let temp of temps) {
            resTemps.push({ id: temp._id, valoare: temp.valoare, timestamp: formatDate(temp.timestamp) });
        }
    }

    res.status(200).json(resTemps);
});

app.get('/api/temperatures/countries/:id', async (req, res) => {
    const { from, until } = req.query;
    const idTara = Number(req.params.id);

    let countries = await Country.find({ _id: idTara }).exec();

    let cities = [];

    for (let country of countries) {
        let res = await City.find({ idTara: country._id }).exec();

        cities.push(...res);
    }

    const resTemps = [];

    for (let city of cities) {
        let temps;

        if (from && until) {
            temps = await Temp.find({ idOras: city._id, timestamp: { $gte: formatDate(from), $lte: formatDate(until) } }).exec();
        } else if (from) {
            temps = await Temp.find({ idOras: city._id, timestamp: { $gte: formatDate(from) } }).exec();
        } else if (until) {
            temps = await Temp.find({ idOras: city._id, timestamp: { $lte: formatDate(until) } }).exec();
        } else {
            temps = await Temp.find({ idOras: city._id }).exec();
        }

        for (let temp of temps) {
            resTemps.push({ id: temp._id, valoare: temp.valoare, timestamp: formatDate(temp.timestamp) });
        }
    }

    res.status(200).json(resTemps);
});

app.put('/api/temperatures/:id', async (req, res) => {
    const id = req.params.id;
    const idOras = Number(req.body.idOras);
    const valoare = Number(req.body.valoare);

    if (isNaN(idOras) || isNaN(valoare)) {
        res.sendStatus(400);
        return
    }

    let cities = await City.find({ _id: idOras }).exec();

    if (!cities.length) {
        // Not Found if there's no city with that city id
        res.sendStatus(404);
        return;
    }

    const temp = new Temp({
        valoare,
        timestamp: formatDate(new Date()),
        idOras
    });

    Temp.updateOne({_id: id}, temp, (err, result) => {
        if (err) {
            // Conflict if unique field already exists
            res.sendStatus(409);
        } else if (!result.n) {
            // Not found if there's no temperature with that id
            res.sendStatus(404);
        } else {
            // OK if db updates fine
            res.sendStatus(200);
        }
    });
});

app.delete('/api/temperatures/:id', async (req, res) => {
    const id = req.params.id;

    Temp.deleteOne({ _id: id }, (err, result) => {
        if (!result.n) {
            // Not Found if there's no temperature with that id
            res.sendStatus(404);
        } else {
            // OK if db deletes country
            res.sendStatus(200);
        }
    });
});

