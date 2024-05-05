# Weather Forecast Web Application
This is my first JS application I have ever made. The goal was to try as many new (to me) technologies as possible in short time (about 2 days).

## Description
This project is a small web application for Weather forecast. The main usecase is searching specific location on map, then being shown three day weather forecast for chosen location. 

## What you should not expect
You should not expect best practices in this project as it was created in short time and using technologies I was not much aknowledged with. Also no autoformatter was used.

## Technologies used
- JavaScript
- Node.js
- Express.js (backend server)
- GoogleApi (mostly Google Maps)
- WeatherApi (https://www.weatherapi.com/)
- Bootstrap (https://getbootstrap.com/)

## How to start
- First of all you need to get your API keys from https://www.weatherapi.com/ and https://console.cloud.google.com/.
- Add corresponding keys into .env file located in project's root directory.
- Open SHELL and navigate to projects root directory.
- Run command `node index.js`. This will start the server on `localhost:3001`. 

When you're done with what's above, you can open internet browser of your choice and navigate to `http://localhost:3001/`. The application should be located here.
You can adjust server port manually in `PROJECT_ROOT_DIRECTORY/index.js`.