const express = require('express');
const hbs = require('hbs');
const fs = require('fs');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up handlebars
app.set('view engine', 'hbs');
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Cities data
const cities = JSON.parse(fs.readFileSync('./data/cities.json', 'utf-8'));

// Default city (first in the list)
const defaultCity = cities[0].name;

// Routes
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Weather Info',
  });
});

app.get('/weather', async (req, res) => {
  const city = req.query.city || defaultCity; // Use default city if not specified
  const apiKey = 'b68cc24fe173620b4131c10cae7fbbd7'; // Replace with your API key
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.cod === 200) {
      res.render('weather', {
        title: `Weather in ${city}`,
        city: city,
        cities: cities.map(c => ({ name: c.name, isActive: c.name === city })),
        weather: data.weather[0].description,
        pressure: data.main.pressure,
        humidity: data.main.humidity,
        temperature: data.main.temp,
        icon: `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`,
      });
    } else {
      res.status(404).render('404', {
        title: 'City Not Found',
        message: `Weather data for ${city} is not available.`,
      });
    }
  } catch (error) {
    res.status(500).render('500', {
      title: 'Server Error',
      message: 'Unable to fetch weather data.',
    });
  }
});

// Error handling
app.use((req, res) => {
  res.status(404).render('404', {
    title: '404 Not Found',
    message: 'Page not found.',
  });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
