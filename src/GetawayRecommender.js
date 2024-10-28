import React, { useState, useEffect } from 'react';

const GetawayRecommender = () => {
  const [activity, setActivity] = useState('');
  const [numPeople, setNumPeople] = useState(1);
  const [budgetPerPerson, setBudgetPerPerson] = useState(100); // Default budget per person
  const [totalBudget, setTotalBudget] = useState(numPeople * budgetPerPerson);
  const [weatherPref, setWeatherPref] = useState('');
  const [recommendations, setRecommendations] = useState([]);

  // Recalculate total budget whenever numPeople or budgetPerPerson changes
  useEffect(() => {
    setTotalBudget(numPeople * budgetPerPerson);
  }, [numPeople, budgetPerPerson]);

  const handleSearch = async () => {
    console.log(`Searching for getaways with:
      Activity: ${activity},
      Total Budget: ${totalBudget},
      Weather Preference: ${weatherPref}`);
    
    setRecommendations([
      {
        city: 'Sample City',
        country: 'Sample Country',
        lodging: [{ name: 'Sample Hotel', price: 150 }],
        travelOptions: [{ type: 'Flight', price: 200 }],
        attractions: [{ name: 'Sample Attraction' }],
        weather: { description: 'Sunny', temp: 75 },
      },
    ]);
  };

  return (
    <div>
      <h1>Weekend Getaway Recommender</h1>
      
      <label>Activity:
        <select value={activity} onChange={(e) => setActivity(e.target.value)}>
          <option value="">Select an Activity</option>
          <option value="beach">Beach</option>
          <option value="hiking">Hiking</option>
          <option value="city">City Tour</option>
        </select>
      </label>

      <label>Number of People:
        <input
          type="number"
          min="1"
          value={numPeople}
          onChange={(e) => setNumPeople(Number(e.target.value) || 1)}
        />
      </label>

      <label>Budget per Person:
        <input
          type="number"
          value={budgetPerPerson}
          onChange={(e) => setBudgetPerPerson(Number(e.target.value))}
        />
      </label>

      <label>Total Budget: ${totalBudget}</label>

      <label>Weather Preference:
        <select value={weatherPref} onChange={(e) => setWeatherPref(e.target.value)}>
          <option value="">Select Weather</option>
          <option value="sunny">Sunny</option>
          <option value="mild">Mild</option>
          <option value="rainy">Rainy</option>
        </select>
      </label>

      <button onClick={handleSearch}>Find Getaways</button>

      <div>
        {recommendations.map((rec, index) => (
          <div key={index}>
            <h2>{rec.city}, {rec.country}</h2>
            <p>Weather Forecast: {rec.weather.description}, {rec.weather.temp}°F</p>
            
            <h3>Lodging Options</h3>
            {rec.lodging.map((lodging, i) => (
              <p key={i}>{lodging.name} - ${lodging.price}</p>
            ))}

            <h3>Travel Options</h3>
            {rec.travelOptions.map((option, i) => (
              <p key={i}>{option.type} - ${option.price}</p>
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