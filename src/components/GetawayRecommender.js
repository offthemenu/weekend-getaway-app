import React, { useState, useEffect } from "react";
import "./GetawayRecommender.css";
import {
  fetchIATACode,
  fetchDestinations,
  fetchAttractions,
  fetchHotels,
  fetchCityNameFromIATACode
} from "../services/amadeusService";

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
      if (!iataCode) {
        setError("Could not find IATA code for the departure location.");
        setLoading(false);
        return;
      }

      const flightBudget = Math.floor(totalBudget * 0.6); // arbitrary but we'll try with 40%

      const destinations = await fetchDestinations(iataCode, flightBudget);
      if (!destinations || destinations.length === 0) {
        setError(
          "No destinations found within budget. Try adjusting criteria."
        );
        setLoading(false);
        return;
      }
      const topDestinations = destinations.slice(0, 3);
      
      const recommendations = await Promise.all(
        topDestinations.map(async (destination) => {
          const lodgingBudget = totalBudget - destination.price.total;
          const hotels = await fetchHotels(
            destination.destination,
            lodgingBudget
          );
          const { latitude, longitude } = destination;
          const attractions = await fetchAttractions(
            latitude,
            longitude,
            activity
          );

          const cityName = await fetchCityNameFromIATACode(destination.destination);
          
          return {
            city: cityName,
            country: destination.country,
            lodging: hotels,
            travelOptions: [{ type: "Flight", price: destination.price.total }],
            attractions,
          };
        })
      );
      setRecommendations(recommendations.filter((rec) => rec));
    } catch (error) {
      setError("Error fetching recommendations.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="getaway-container">
      <h1>Git Ahhhhhtta Here</h1>

      {/* Input form fields */}
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

        <button className="search-button" onClick={handleSearch}>
          Find Getaways
        </button>
      </div>

      {loading && <p>Cooking up your weekend getaway...</p>}
      {error && <p className="error">{error}</p>}

      {/* Recommendations Display */}
      <div className="recommendations">
        {recommendations && recommendations.length > 0
          ? recommendations.map((rec, index) => (
              <div key={index} className="recommendation">
                <h2>
                  {rec.city}
                </h2>

                <h3>Flight Options</h3>
                {/* Ensure `rec.travelOptions` is not null before mapping */}
                {rec.travelOptions && rec.travelOptions.length > 0 ? (
                  rec.travelOptions.map((option, i) => (
                    <p key={i}>
                      {option.type}: ${option.price}
                    </p>
                  ))
                ) : (
                  <p>No flight options available.</p>
                )}
              </div>
            ))
          : !loading &&
            !error && (
              <p>
                No recommendations found. Try adjusting your criteria...or just
                clean your house or something.
              </p>
            )}
      </div>
    </div>
  );
};

export default GetawayRecommender;
