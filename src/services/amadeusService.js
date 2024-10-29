const AMADEUS_API_KEY = process.env.REACT_APP_AMADEUS_API_KEY;
const AMADEUS_API_SECRET = process.env.REACT_APP_AMADEUS_API_SECRET;

export const getAccessToken = async () => {
  const url = "https://test.api.amadeus.com/v1/security/oauth2/token";
  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  params.append("client_id", AMADEUS_API_KEY);
  params.append("client_secret", AMADEUS_API_SECRET);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error fetching access token:", error);
    return null;
  }
};

export const fetchIATACode = async (cityName) => {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  try {
    const response = await fetch(
      `https://test.api.amadeus.com/v1/reference-data/locations/cities?keyword=${cityName}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const data = await response.json();
    return data.data && data.data.length > 0 ? data.data[0].iataCode : null;
  } catch (error) {
    console.error("Error fetching IATA code:", error);
    return null;
  }
};

export const fetchCoordinates = async (cityCode) => {
    const accessToken = await getAccessToken();
    if (!accessToken) return null;
  
    try {
      const response = await fetch(
        `https://test.api.amadeus.com/v1/reference-data/locations?subType=CITY&keyword=${cityCode}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();
  
      const location = data.data && data.data[0];
      if (location && location.geoCode) {
        return {
          latitude: location.geoCode.latitude,
          longitude: location.geoCode.longitude,
        };
      }
      return { latitude: null, longitude: null };
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      return { latitude: null, longitude: null };
    }
  };
  

export const fetchDestinations = async (iataCode, maxBudget) => {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  try {
    const response = await fetch(
      `https://test.api.amadeus.com/v1/shopping/flight-destinations?origin=${iataCode}&maxPrice=${maxBudget}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const data = await response.json();

    // check if destinations provide latitude and longitude and if not fetch them
    const destinations = await Promise.all(
        data.data.map(async (destination) => {
            if (!destination.latitude || !destination.longitude) {
                const coordinates = await fetchCoordinates(destination.destination);
                return {...destination, ...coordinates};
            }
            return destination;
        })
    );

    return destinations;
  } catch (error) {
    console.error("Error fetching destinations:", error);
    return null;
  }
};

export const fetchAttractions = async (latitude, longitude, activity) => {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  try {
    const response = await fetch(
      `https://test.api.amadeus.com/v1/reference-data/locations/pois?latitude=${latitude}&longitude=${longitude}&radius=10&category=${activity}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching attractions:", error);
    return null;
  }
};

export const fetchHotels = async (cityCode, budget) => {
    const accessToken = await getAccessToken();
    if (!accessToken) return null;

    try {
        const response = await fetch(
            `https://test.api.amadeus.com/v2/shopping/hotel-offers?cityCode=${cityCode}&radius=10`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
        const data = await response.json();
        return data.data.filter((hotel) => hotel.price.total <= budget);
    } catch (error) {
        console.error("Error fetching hotels:", error);
        return null;
    }
};
