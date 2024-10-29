import React, { useState, useEffect } from "react";
import "./GetawayRecommender.css";
import {
  fetchIATACode,
  fetchDestinations,
  fetchAttractions,
  fetchHotels,
} from "../services/amadeusService";
import {
  fetchWeatherForecast,
  checkWeatherPreference,
} from "../services/weatherService";

const GetawayRecommender = () => {
  const [activity, setActivity] = useState("");
  const [numPeople, setNumPeople] = useState(1);
  const [budgetPerPerson, setBudgetPerPerson] = useState(100); // Default budget per person
  const [totalBudget, setTotalBudget] = useState(numPeople * budgetPerPerson);
  const [weatherPref, setWeatherPref] = useState("");
  const [departureLocation, setDepartureLocation] = useState("");
  const [departureDay, setDepartureDay] = useState("Friday");
  const [earliestDepartureTime, setEarliestDepartureTime] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Recalculate total budget whenever numPeople or budgetPerPerson changes
  useEffect(() => {
    setTotalBudget(numPeople * budgetPerPerson);
  }, [numPeople, budgetPerPerson]);

  useEffect(() => {
    const calculateEarliestDepartureTime = () => {
      const now = new Date();
      const dayOfWeek = now.getDay();

      const daysUntilNextFriday =
        (5 - dayOfWeek + 7) % 7 || (now.getHours() >= 17 ? 7 : 0);
      const daysUntilNextSaturday =
        (6 - dayOfWeek + 7) % 7 || (now.getHours() >= 5 ? 7 : 0);

      const nextFriday = new Date(now);
      nextFriday.setDate(now.getDate() + daysUntilNextFriday);
      nextFriday.setHours(17, 0, 0, 0);

      const nextSaturday = new Date(now);
      nextSaturday.setDate(now.getDate() + daysUntilNextSaturday);
      nextSaturday.setHours(5, 0, 0, 0);

      return departureDay === "Friday"
        ? nextFriday.toLocaleString()
        : nextSaturday.toLocaleString();
    };

    setEarliestDepartureTime(calculateEarliestDepartureTime());
  }, [departureDay]);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const iataCode = await fetchIATACode(departureLocation);
      const flightBudget = totalBudget * .4; // arbitrary but we'll try with 40%
      const destinations = await fetchDestinations(iataCode, flightBudget);
      const recommendations = await Promise.all(
        destinations.map(async (destination) => {
          const lodgingBudget = totalBudget - destination.price.total;
          const hotels = await fetchHotels(destination.destination, lodgingBudget);
          const { latitude, longitude } = destination;
          const attractions = await fetchAttractions(latitude, longitude, activity);
          const weatherData = await fetchWeatherForecast(destination.destination);
          const matchesWeather = checkWeatherPreference(weatherData, weatherPref);
          if (matchesWeather) {
            return {
              city: destination.destination,
              country: destination.country,
              lodging: hotels,
              travelOptions: [{ type: "Flight", price: destination.price.total }],
              attractions,
              weather: weatherData[0],
            };
          }
          return null;
        })
      );
      setRecommendations(recommendations.filter((rec) => rec));
    } catch (error) {
      setError("Error fetching recommendations.")
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="getaway-container">
      <h1>Git Ahhhhhtta Here</h1>

      {/* Add form-container wrapper here */}
      <div className="form-container">
        <div className="input-field">
          <label>
            Departure Location:
            <input
              type="text"
              placeholder="Which city do you live?"
              value={departureLocation}
              onChange={(e) => setDepartureLocation(e.target.value)}
            />
          </label>
        </div>

        <div className="input-field">
          <label>
            Departure Date:
            <select
              value={departureDay}
              onChange={(e) => setDepartureDay(e.target.value)}
            >
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
            </select>
          </label>
        </div>

        <div className="input-field">
          <label>Earliest Departure Time: {earliestDepartureTime}</label>
        </div>

        <div className="input-field">
          <label>
            Activity:
            <select
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
            >
              <option value="">Select an Activity</option>
              <option value="beach">Beach</option>
              <option value="hiking">Hiking</option>
              <option value="city">City Tour</option>
            </select>
          </label>
        </div>

        <div className="input-field">
          <label>
            Number of People:
            <input
              type="number"
              min="1"
              value={numPeople}
              onChange={(e) => {
                const value = e.target.value;
                setNumPeople(value === "" ? "" : parseInt(value));
              }}
              onBlur={() => {
                if (numPeople === "" || numPeople < 1) {
                  setNumPeople(1);
                }
              }}
            />
          </label>
        </div>

        <div className="input-field">
          <label>
            Budget per Person:
            <input
              type="number"
              value={budgetPerPerson}
              onChange={(e) => {
                const value = e.target.value;
                setBudgetPerPerson(value === "" ? "" : parseInt(value));
              }}
              onBlur={() => {
                if (budgetPerPerson === "" || budgetPerPerson < 1) {
                  setBudgetPerPerson(1);
                }
              }}
            />
          </label>
        </div>

        <div className="input-field">
          <label>Total Budget: ${totalBudget}</label>
        </div>

        <div className="input-field">
          <label>
            Weather Preference:
            <select
              value={weatherPref}
              onChange={(e) => setWeatherPref(e.target.value)}
            >
              <option value="">Select Weather</option>
              <option value="sunny">Sunny</option>
              <option value="mild">Mild</option>
              <option value="rainy">Rainy</option>
            </select>
          </label>
        </div>

        <button className="search-button" onClick={handleSearch}>
          Find Getaways
        </button>
      </div>

      <div className="recommendations">
        {recommendations.map((rec, index) => (
          <div key={index}>
            <h2>
              {rec.city}, {rec.country}
            </h2>
            <p>
              Weather Forecast: {rec.weather.description}, {rec.weather.temp}°F
            </p>

            <h3>Lodging Options</h3>
            {rec.lodging.map((lodging, i) => (
              <p key={i}>
                {lodging.name} - ${lodging.price}
              </p>
            ))}

            <h3>Travel Options</h3>
            {rec.travelOptions.map((option, i) => (
              <p key={i}>
                {option.type} - ${option.price}
              </p>
            ))}

            <h3>Local Attractions</h3>
            {rec.attractions.map((attraction, i) => (
              <p key={i}>{attraction.name}</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GetawayRecommender;
