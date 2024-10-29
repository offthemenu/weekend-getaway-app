const OPENWEATHER_API_KEY = process.env.REACT_APP_WEATHER_API_KEY;

export const fetchWeatherForecast = async (cityName) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${OPENWEATHER_API_KEY}`
    );
    const data = await response.json();

    if (data.cod !== "200") {
      console.error(`Error fetching weather data: ${data.message}`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
};

export const checkWeatherPreference = (forecastData, preference) => {
  if (!forecastData) return false;

  return forecastData.some((entry) =>
    entry.weather[0].description
      .toLowerCase()
      .includes(preference.toLowerCase())
  );
};

export const filterForecastByDate = (
  forecastData,
  targetDate,
  timeRangeStart,
  timeRangeEnd
) => {
  return forecastData.filter((entry) => {
    const entryDate = new Date(entry.dt * 1000);

    const isSameDate = entryDate.toDateString() === targetDate.toDateString();

    const hours = entryDate.getHours();

    const isWithinTimeRange = hours >= timeRangeStart && hours <= timeRangeEnd;

    return isSameDate && isWithinTimeRange;
  });
};
