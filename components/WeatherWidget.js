import { useState, useEffect } from 'react';
import { MapPin, Thermometer, Droplet, Wind, Sun, Cloud, CloudRain, CloudLightning, CloudSnow, Search, RefreshCw } from 'react-feather';

// Weather condition icons with enhanced styling
const getWeatherIcon = (condition, size = 36) => {
  switch (condition.toLowerCase()) {
    case 'clear':
      return <Sun size={size} className="text-warning" />;
    case 'clouds':
      return <Cloud size={size} className="text-secondary" />;
    case 'rain':
      return <CloudRain size={size} className="text-primary" />;
    case 'drizzle':
      return <CloudRain size={size} className="text-primary" />;
    case 'thunderstorm':
      return <CloudLightning size={size} className="text-primary" />;
    case 'snow':
      return <CloudSnow size={size} className="text-info" />;
    default:
      return <Sun size={size} className="text-warning" />;
  }
};

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [location, setLocation] = useState('');
  const [forecast, setForecast] = useState([]);

  const fetchWeather = async (city) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch weather data');
      }

      setWeather(data.current);
      setForecast(data.forecast);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching weather:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSubmit = (e) => {
    e.preventDefault();
    if (location.trim()) {
      fetchWeather(location.trim());
    }
  };

  const handleRefresh = () => {
    if (weather && weather.name) {
      fetchWeather(weather.name);
    } else if (location.trim()) {
      fetchWeather(location.trim());
    }
  };

  // Format date for forecast
  const formatDay = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', { weekday: 'short' });
  };

  return (
    <div className="rbt-dashboard-content">
      <div className="rbt-dashboard-title mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h4 className="title mb-2 text-dark fw-bold">Weather Forecast</h4>
            <p className="description text-secondary">
              Check current weather conditions and forecast for any location.
            </p>
          </div>
          <button 
            className="btn btn-sm btn-light mt-3 d-flex align-items-center" 
            onClick={handleRefresh}
            style={{
              borderRadius: '10px',
              padding: '8px 16px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              color: '#495057',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
              transition: 'all 0.2s ease'
            }}
          >
            <RefreshCw size={14} className="me-2" /> Refresh
          </button>
        </div>
      </div>

      <div className="search-container mb-4 d-flex">
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter city name..."
          className="form-control"
          style={{
            borderRadius: '12px 0 0 12px',
            padding: '12px 16px',
            border: '1px solid #e0e0e0',
            boxShadow: 'none',
            fontSize: '15px'
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleLocationSubmit(e)}
        />
        <button 
          type="button"
          onClick={(e) => handleLocationSubmit(e)}
          style={{
            borderRadius: '0 12px 12px 0',
            padding: '0 20px',
            background: 'linear-gradient(45deg, #3F51B5, #5677fd)',
            color: 'white',
            border: 'none',
            boxShadow: '0 4px 10px rgba(63, 81, 181, 0.2)',
            transition: 'all 0.3s ease'
          }}
        >
          <Search size={18} />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger rounded-4 shadow-sm" role="alert">
          <div className="d-flex align-items-center">
            <MapPin size={20} className="me-2" />
            <span className="fw-medium">{error}</span>
          </div>
        </div>
      ) : weather ? (
        <>
          {/* Current Weather Card */}
          <div className="card border-0 shadow-lg rounded-4 mb-4 overflow-hidden">
            <div className="card-body p-0">
              <div className="row g-0">
                <div className="col-md-8 p-4" style={{background: "linear-gradient(120deg, #2980b9, #6dd5fa)"}}>
                  <div className="d-flex align-items-center mb-3">
                    <MapPin size={20} className="me-2 text-white" />
                    <h3 className="mb-0 fs-4 fw-bold text-white">{weather.name}</h3>
                  </div>
                  <div className="d-flex align-items-center mb-3">
                    <span className="display-1 fw-bold me-3 text-white">{Math.round(weather.temp)}°</span>
                    <div className="fs-5 text-white text-capitalize fw-medium" style={{letterSpacing: "0.01em"}}>
                      {weather.weather[0].description}
                    </div>
                  </div>
                  <div className="bg-white bg-opacity-25 p-3 rounded-3 mt-3">
                    <div className="row g-3">
                      <div className="col-4">
                        <div className="d-flex align-items-center">
                          <Thermometer size={16} className="me-2 text-white" />
                          <span className="text-white">Feels like {Math.round(weather.feels_like)}°</span>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="d-flex align-items-center">
                          <Droplet size={16} className="me-2 text-white" />
                          <span className="text-white">{weather.humidity}% humidity</span>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="d-flex align-items-center">
                          <Wind size={16} className="me-2 text-white" />
                          <span className="text-white">{Math.round(weather.wind_speed * 3.6)} km/h</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 d-flex justify-content-center align-items-center p-4 bg-light">
                  <div className="weather-icon d-flex flex-column align-items-center">
                    {getWeatherIcon(weather.weather[0].main, 100)}
                    <span className="fs-4 fw-bold mt-3 text-dark">{weather.weather[0].main}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Forecast */}
          {forecast.length > 0 && (
            <>
              <h5 className="mb-3 mt-4 text-dark fw-bold">5-Day Forecast</h5>
              <div className="row g-3">
                {forecast.map((day, index) => (
                  <div key={index} className="col">
                    <div className="card h-100 border-0 shadow-sm rounded-4 text-center">
                      <div className="card-header bg-primary bg-opacity-10 border-0 py-3">
                        <div className="fw-bold text-primary">{formatDay(day.dt)}</div>
                      </div>
                      <div className="card-body p-3">
                        <div className="my-3 d-flex justify-content-center">
                          {getWeatherIcon(day.weather[0].main, 40)}
                        </div>
                        <div className="fs-4 fw-bold mb-1 text-dark">
                          {Math.round(day.temp.day)}°
                        </div>
                        <div className="small text-secondary fw-medium">
                          {Math.round(day.temp.min)}° / {Math.round(day.temp.max)}°
                        </div>
                        <div className="small text-capitalize text-secondary mt-2" style={{fontWeight: "500", letterSpacing: "0.01em"}}>
                          {day.weather[0].description}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <div className="text-center py-5 p-4 bg-light rounded-4 shadow-sm">
          <MapPin size={36} className="mb-3 text-primary" />
          <p className="text-dark fw-medium">Enter a city name to get weather information</p>
          <p className="small text-secondary">Examples: London, Tokyo, New York, Paris, Dubai</p>
        </div>
      )}
      <div className="mt-4 text-center">
        <small className="text-secondary">Powered by <a href="https://openweathermap.org/" target="_blank" rel="noopener noreferrer" className="text-decoration-none">OpenWeatherMap</a></small>
      </div>
    </div>
  );
} 