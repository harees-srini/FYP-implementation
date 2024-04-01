import React, { useState, useEffect } from "react";

const Itinerary = () => {
    const [itinerary, setItinerary] = useState(null);
    const [locationData, setLocationData] = useState([]);
    const [locationDict, setLocationDict] = useState({}); // State to store location dictionary

    useEffect(() => {
        // Retrieve JSON data from localStorage for itinerary
        const storedItinerary = localStorage.getItem('itinerary');
        if (storedItinerary) {
            const parsedItinerary = JSON.parse(storedItinerary);
            setItinerary(parsedItinerary);

            // Retrieve location dictionary from localStorage
            const storedLocationDict = localStorage.getItem('locationDict');
            if (storedLocationDict) {
                const parsedLocationDict = JSON.parse(storedLocationDict);
                setLocationDict(parsedLocationDict);

                // Fetch location data and match with itinerary
                fetchLocationData(parsedItinerary, parsedLocationDict);
            } else {
                console.error('No location dictionary found.');
            }
        } else {
            console.error('No itinerary data found.');
        }
    }, []);

    const fetchLocationData = (itinerary, locationDict) => {
        const matchedLocations = Object.keys(itinerary.data).map((placeId) => {
            const location = locationDict[placeId];
            if (location) {
                return { placeId, location, value: itinerary.data[placeId] };
            } else {
                return null;
            }
        });
        // Filter out null values
        const filteredLocations = matchedLocations.filter((location) => location !== null);
        setLocationData(filteredLocations);
    };

    return (
        <div>
            <h2>Itinerary</h2>
            {itinerary ? (
                <div>
                    <h3>Received Data</h3>
                    {/* <pre>{JSON.stringify(itinerary, null, 2)}</pre> */}
                    {locationData.length > 0 && (
                        <div>                            
                            <table>
                                <thead>
                                    <tr>
                                        <th>Place ID</th>
                                        <th>Name</th>
                                        <th>Address</th>
                                        <th>Value</th> {/* Add field for value */}
                                        {/* Add more fields as needed */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {locationData.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.placeId}</td>
                                            <td>{item.location}</td>
                                            <td>{item.location.formatted_address}</td>
                                            <td>{item.value}</td> {/* Display value */}
                                            {/* Add more fields as needed */}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}                
                </div>
            ) : (
                <p>Can't find it</p>
            )}
        </div>
    );
}

export default Itinerary;
