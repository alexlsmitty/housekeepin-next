'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Paper, 
  Skeleton,
  Divider,
  Grid,
  Chip
} from '@mui/material';
import { 
  MapPin, 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  CloudLightning,
  Thermometer
} from 'lucide-react';
import { 
  GoogleMap, 
  useJsApiLoader, 
  Marker, 
  InfoWindow 
} from '@react-google-maps/api';

// Weather condition to message and icon mapping
const weatherMessages = {
  Clear: {
    message: "Perfect day to enjoy some outdoor activities!",
    icon: (props) => <Sun {...props} />,
    color: '#FFC107'
  },
  Clouds: {
    message: "Cloudy skies, perfect for indoor projects or cozy time.",
    icon: (props) => <Cloud {...props} />,
    color: '#9E9E9E'
  },
  Rain: {
    message: "Rainy day ahead. Time to plan some indoor fun!",
    icon: (props) => <CloudRain {...props} />,
    color: '#2196F3'
  },
  Snow: {
    message: "Snowy weather calls for hot cocoa and warm blankets.",
    icon: (props) => <CloudSnow {...props} />,
    color: '#90CAF9'
  },
  Thunderstorm: {
    message: "Stay safe and warm during the thunderstorm.",
    icon: (props) => <CloudLightning {...props} />,
    color: '#9C27B0'
  },
  default: {
    message: "Enjoy your day, whatever the weather!",
    icon: (props) => <Sun {...props} />,
    color: '#757575'
  }
};

export interface Household {
  id?: string;
  name?: string;
  description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  member_count?: number;
}

interface DashboardLocationWeatherProps {
  household: Household | null;
}

// Google Maps container styles
const containerStyle = {
  width: '100%',
  height: '200px',
  borderRadius: '4px'
};

export default function DashboardLocationWeather({ household }: DashboardLocationWeatherProps) {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showInfoWindow, setShowInfoWindow] = useState<boolean>(false);

  // Default coordinates for Calgary if none are provided (as a fallback)
  const defaultLatitude = 51.0447;
  const defaultLongitude = -114.0719;

  // Use household coordinates if available, otherwise use defaults
  const latitude = household?.latitude || defaultLatitude;
  const longitude = household?.longitude || defaultLongitude;

  // Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
        if (!apiKey) {
          throw new Error('OpenWeatherMap API key is missing');
        }

        // Remove whitespace from API key
        const cleanApiKey = apiKey.trim();

        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${cleanApiKey}&units=metric`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }

        const data = await response.json();
        setWeatherData(data);
      } catch (err) {
        console.error('Weather fetch error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWeatherData();
  }, [latitude, longitude]);

  // Determine weather condition and message
  const mainWeather = weatherData?.weather?.[0]?.main || 'default';
  const weatherInfo = weatherMessages[mainWeather] || weatherMessages.default;
  const WeatherIcon = weatherInfo.icon;

  // Render map only when Google Maps API is loaded
  const renderMap = () => {
    if (!isLoaded) {
      return (
        <Paper 
          elevation={0} 
          sx={{ 
            bgcolor: 'grey.100', 
            height: 200, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderRadius: 1,
            mb: 2
          }}
        >
          <Typography>Loading map...</Typography>
        </Paper>
      );
    }

    return (
      <Paper 
        elevation={0} 
        sx={{ 
          height: 200, 
          borderRadius: 1,
          mb: 2,
          overflow: 'hidden'
        }}
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={{ lat: latitude, lng: longitude }}
          zoom={13}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false
          }}
        >
          <Marker 
            position={{ lat: latitude, lng: longitude }}
            onClick={() => setShowInfoWindow(true)}
          >
            {showInfoWindow && (
              <InfoWindow
                position={{ lat: latitude, lng: longitude }}
                onCloseClick={() => setShowInfoWindow(false)}
              >
                <Typography variant="body2">
                  {household?.address || 'Your location'}
                </Typography>
              </InfoWindow>
            )}
          </Marker>
        </GoogleMap>
      </Paper>
    );
  };

  return (
    <Card elevation={2} sx={{ mb: 3, overflow: 'hidden' }}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center" mb={2}>
              <MapPin size={24} color="#1976D2" />
              <Typography variant="h6" sx={{ ml: 1, fontWeight: 'medium' }}>
                {household?.address || 'Your Household Location'}
              </Typography>
            </Box>
            
            {renderMap()}
            
            <Typography variant="body2" sx={{ textAlign: 'center' }}>
              {household?.latitude && household?.longitude 
                ? `Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
                : 'Location coordinates not available'}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>
              Current Weather
            </Typography>
            
            {loading ? (
              <Box>
                <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 1, mb: 2 }} />
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="60%" />
              </Box>
            ) : error ? (
              <Paper 
                elevation={0} 
                sx={{ 
                  bgcolor: 'error.light', 
                  p: 2, 
                  borderRadius: 1,
                  color: 'error.contrastText'
                }}
              >
                <Typography>Unable to load weather data</Typography>
              </Paper>
            ) : weatherData && (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  borderRadius: 1,
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText'
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box display="flex" alignItems="center">
                    <WeatherIcon size={32} color={weatherInfo.color} />
                    <Box ml={2}>
                      <Typography variant="h5" fontWeight="medium">
                        {Math.round(weatherData.main.temp)}°C
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Feels like: {Math.round(weatherData.main.feels_like)}°C
                      </Typography>
                    </Box>
                  </Box>
                  <Chip 
                    label={weatherData.weather[0].main} 
                    size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
                  />
                </Box>
                
                <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.2)' }} />
                
                <Box display="flex" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Humidity: {weatherData.main.humidity}%
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Wind: {Math.round(weatherData.wind.speed * 3.6)} km/h
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {weatherInfo.message}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}