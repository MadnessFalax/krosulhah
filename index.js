const PORT = 3001;

// -------- response prototypes -------------

function Hour(time, temp_c, condition, icon) {
  this.time = time;
  this.temp_c = temp_c;
  this.condition = condition;
  this.icon = icon;
}

function mDay(date, hours) {
  this.date = date;
  this.hours = hours;
}

function Today(temp_c, condition, icon) {
  this.temp_c = temp_c;
  this.condition = condition;
  this.icon = icon;
}

//--------- dotenv ------------------------

const dotenv = require('dotenv');
dotenv.config();

const apiKey = process.env.GOOGLE_MAPS_API_KEY;
const weatherKey = process.env.WEATHER_API_KEY;

// -------- http ---------------------------

const http = require('https');

// weather api get example
function weather_get(location_obj, fn_res) {
    http.get('https://api.weatherapi.com/v1/current.json?key=' + weatherKey + '&q=' + location_obj.lat + ',' + location_obj.lng + '&days=3', (resp) => {
        let data = '';

        resp.on('data', (chunk) => {
          data += chunk;
        });

        resp.on('end', () => {
          console.log(JSON.parse(data));
          fn_res = true;
        });
    }).on("error", (err) => {
      console.log("Error: " + err.message);
      fn_res = false;
    });
}

// -------- NodeGeo -----------------------

const NodeGeocoder = require('node-geocoder');

const options = {
  provider: 'google',
  apiKey: apiKey
};

const geocoder = NodeGeocoder(options);

// ---------- GoogleMapsService ------------------

const googleMapsServices = require('@googlemaps/google-maps-services-js');

const client = new googleMapsServices.Client({});

client
  .elevation({
    params: {
      locations: [{ lat: 45, lng: -110 }],
      key: process.env.GOOGLE_MAPS_API_KEY,
    },
    timeout: 1000, // milliseconds
  })
  .then((r) => {
    console.log(r.data.results[0].elevation);
  })
  .catch((e) => {
    console.log(e.response.data.error_message);
  });

// ------- Express --------------

const express = require('express');
const app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index', { apiKey: process.env.GOOGLE_MAPS_API_KEY });
});

app.get('/style.css', (req, res) => {
    res.sendFile('./views/style.css', {root: __dirname});
});

app.get('/script.js', (req, res) => {
    res.sendFile('./views/script.js', {root: __dirname});
});

app.get("/png", (req, res) => {
    var name = req.query.id;
    res.sendFile("./views/day/" + name, {root: __dirname});
})

app.get("/loc", (req, res) => {
    var location = req.query.location;
    console.log("Processing geocoding for location: " + location);

    var obj;

    const args = {
        params: {
            key: apiKey,
            address: location,
        }
    };

    client.geocode(args).then(gcResponse => {
        g_res = gcResponse.data.results[0];
        console.log(`${JSON.stringify(g_res.geometry.location)}`);
        obj = JSON.stringify(g_res.geometry.location);
        res.send(obj);
    });
})

app.get("/weather_cur", (req, res) => {
  var location = req.query.location;
  console.log("Processing current weather for location: " + location);
  var location_obj = JSON.parse(location);

  var obj;

  var myPromise = new Promise(function(resolve, reject) {
    http.get('https://api.weatherapi.com/v1/current.json?key=' + weatherKey + '&q=' + location_obj.lat + ',' + location_obj.lng + '&days=3&lang=cs', (resp) => {
      let data = '';

      resp.on('data', (chunk) => {
        data += chunk;
      });

      resp.on('end', () => {
        data_obj = JSON.parse(data);
        
        obj = new Today(data_obj.current.temp_c, data_obj.current.condition.text, data_obj.current.condition.icon);
        
        resolve(true);
      });
    }).on("error", (err) => {
      console.log("Error: " + err.message);
      resolve(false);
    });
  });

  myPromise.then(
    function(result) {
      if (result)
        res.send(obj);
    }   
  );

})

app.get("/weather", (req, res) => {
    var location = req.query.location;
    console.log("Processing weather for location: " + location);
    var location_obj = JSON.parse(location);

    var obj;

    var myPromise = new Promise(function(resolve, reject) {
      http.get('https://api.weatherapi.com/v1/forecast.json?key=' + weatherKey + '&q=' + location_obj.lat + ',' + location_obj.lng + '&days=3&lang=cs', (resp) => {
        let data = '';

        resp.on('data', (chunk) => {
          data += chunk;
        });

        resp.on('end', () => {
          obj = new Array();
          data_obj = JSON.parse(data);
          data_obj.forecast.forecastday.forEach(function (value, index, array) {
            var hours = [];
            value.hour.forEach(function (hour_value, hour_index, hour_array) {
              hours.push(new Hour(hour_value.time, hour_value.temp_c, hour_value.condition.text, hour_value.condition.icon));
            });

            var tmp_day = new mDay(value.date, hours);
            obj.push(tmp_day);
          });
          
          resolve(true);
        });
      }).on("error", (err) => {
        console.log("Error: " + err.message);
        resolve(false);
      });
    });

    myPromise.then(
      function(result) {
        if (result)
          res.send(obj);
      }   
    );

});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
