import React, { useState, useEffect } from "react";

const Itinerary = () => {
    const [itinerary, setItinerary] = useState(null);
    const [locationData, setLocationData] = useState([]);
    const [locationDict, setLocationDict] = useState({}); // State to store location dictionary

    useEffect(() => {
        // Retrieve JSON data from localStorage for itinerary
        const storedItinerary = localStorage.getItem('itinerary');
        console.log(storedItinerary)
        if (storedItinerary) {
            const parsedItinerary = JSON.parse(storedItinerary);
            setItinerary(parsedItinerary);

            // Retrieve location dictionary from localStorage
            const storedLocationDict = localStorage.getItem('locationDict');
            console.log(storedLocationDict)
            if (storedLocationDict) {
                console.log('Location dictionary found.');
                const parsedLocationDict = JSON.parse(storedLocationDict);
                console.log(parsedLocationDict)
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
        console.log("fetchLocationData")
        console.log(locationData)
        if (!locationDict) {
            console.error('locationDict is not defined or null.');
            return;
        }
        if (!itinerary) {
            console.error('locationDict is not defined or null.');
            return;
        }
    
        const matchedLocations = Object.keys(itinerary.data.optimized_route).map((placeId) => {
            console.log(locationData)
            console.log("placeId")
            const location = locationDict[placeId];
            const stayTime = itinerary.data.predictions[placeId];
            if (location) {
                return { placeId,
                    location,                    
                    stayTime: stayTime || 0,
                    order: itinerary.data.optimized_route[placeId]
                };
            } else {
                return null;
            }            
        });        
        console.log("Heeey")
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
                                        <th>Stay time</th>
                                        <th>Order</th> 
                                        {/* Add more fields as needed */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {locationData.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.placeId}</td>
                                            <td>{item.location}</td>                                            
                                            <td>{item.stayTime}</td>
                                            <td>{item.order}</td>
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
