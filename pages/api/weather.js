export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { city } = req.query;

  if (!city) {
    return res.status(400).json({ message: 'City parameter is required' });
  }

  try {
    const API_KEY = process.env.OPENWEATHER_API_KEY;
    
    if (!API_KEY) {
      return res.status(500).json({ message: 'OpenWeather API key is not configured' });
    }
    
    // Fetch current weather data
    const currentWeatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`
    );

    if (currentWeatherResponse.status === 404) {
      return res.status(404).json({ message: `City '${city}' not found` });
    }

    if (!currentWeatherResponse.ok) {
      const errorData = await currentWeatherResponse.json();
      throw new Error(errorData.message || `Weather API responded with status: ${currentWeatherResponse.status}`);
    }

    const currentWeatherData = await currentWeatherResponse.json();

    // Fetch 5-day forecast data
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`
    );

    if (!forecastResponse.ok) {
      const errorData = await forecastResponse.json();
      throw new Error(errorData.message || `Forecast API responded with status: ${forecastResponse.status}`);
    }

    const forecastData = await forecastResponse.json();

    // Process forecast data to get daily forecast (one per day)
    const dailyForecasts = {};
    forecastData.list.forEach(item => {
      const date = new Date(item.dt * 1000).toISOString().split('T')[0];
      
      if (!dailyForecasts[date]) {
        dailyForecasts[date] = {
          dt: item.dt,
          temp: {
            min: item.main.temp_min,
            max: item.main.temp_max
          },
          weather: item.weather,
          humidity: item.main.humidity,
          wind_speed: item.wind.speed
        };
      } else {
        // Update min/max temperatures if needed
        dailyForecasts[date].temp.min = Math.min(dailyForecasts[date].temp.min, item.main.temp_min);
        dailyForecasts[date].temp.max = Math.max(dailyForecasts[date].temp.max, item.main.temp_max);
      }
    });

    // Convert to array and limit to 5 days
    const forecast = Object.values(dailyForecasts).slice(0, 5);

    // Return structured weather data
    return res.status(200).json({
      current: {
        name: currentWeatherData.name,
        country: currentWeatherData.sys.country,
        temp: currentWeatherData.main.temp,
        feels_like: currentWeatherData.main.feels_like,
        humidity: currentWeatherData.main.humidity,
        wind_speed: currentWeatherData.wind.speed,
        visibility: currentWeatherData.visibility,
        weather: currentWeatherData.weather,
      },
      forecast: forecast
    });
  } catch (error) {
    console.error('Weather API error:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch weather data', 
      error: error.message 
    });
  }
} 