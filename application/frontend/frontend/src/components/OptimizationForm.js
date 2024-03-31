import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Button from '@mui/material/Button';

const OptimizationForm = () => {
    const [result, setResult] = useState('')
    const [selectedLocation, setSelectedLocation] = useState([])
    const [startTime, setStartTime] = useState('')
    const [endTime, setEndTime] = useState('')
    const [locationDict, setLocationDict] = useState([])
    // const [autocomplete, setAutocomplete] = useState(null)

    const handleOptimize = async () => {
        try {
            const response = await axios.post('http://localhost:8000/api/optimize/', {
                locations: Object.values(locationDict),
                placeIds: Object.keys(locationDict),
                startTime: startTime,
                endTime: endTime
            })
            setResult(response.data.message)
        } catch (error) {
            console.error('Error optimizing: ', error)
        }
    }

    useEffect(() => {
        if (window.google) {
            navigator.geolocation.getCurrentPosition(position => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                // Define AutocompleteOptions with bias towards user's location
                const autocompleteOptions = {
                    // types: ['geocode'],
                    bounds: new window.google.maps.LatLngBounds(userLocation, userLocation), // Bias towards user's location
                    // fields: ['formatted_address', 'geometry', 'name', 'address_components', 'regions', 'address', 'establishment'],                    
                };

                const autocomplete = new window.google.maps.places.Autocomplete(
                    document.getElementById('locations'),                    
                    autocompleteOptions
                );

                

                autocomplete.addListener('place_changed', () => {
                    const place = autocomplete.getPlace();
                    const placeId = place.place_id;
                    const location = place.formatted_address;                    
                    setSelectedLocation(location); 
                    updateLocationDict(placeId, location);
                });  
            })
        }          
        }, []);

    const updateLocationDict = (placeId, location) => {
        setLocationDict(prevDictionary => ({
            ...prevDictionary,
            [placeId]: location // Add or update the location for the given place ID
        }));
    };

    return (
        <div style={{ backgroundColor: '#88CD82', minHeight: '100vh', display: 'flex' }}>
            <div style={{ backgroundColor: '#ffffff', display: 'flex', width: '25%' }}>
                {'Nav bar goes here'}
            </div>
            <div style={{ display: 'grid' }}>
                <div>
                    {/* <label htmlFor="locations">Locations:</label> */}
                    <input
                        type="text"
                        id="locations"
                        value={selectedLocation}
                        style={{ height: '50px', marginLeft: '200px', marginTop: '200px', width: '500px', fontSize: '20px' }}
                        placeholder='Start typing to add more locations.....'
                        onChange={(e) => setSelectedLocation(e.target.value)}                  
                        size={50}      
                    />
                </div>
                <div style={{ marginLeft: '290px' }}>
                    <label htmlFor="startTime">Enter your Start Time here:</label>
                    <input
                        type="time"
                        id="startTime"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                    />
                </div>
                <div style={{ marginLeft: '290px' }}>
                    <label htmlFor="endTime">Enter your End Time here:</label>
                    <input
                        type="time"
                        id="endTime"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                    />            
                    <p>{result}</p>
                </div>
                <div>
                    {/* <button onClick={handleOptimize} style={{ marginLeft: '400px',  }}>Optimize</button> */}
                    <Button variant="contained" onClick={handleOptimize} style={{ marginLeft: '400px' }}>Optimize</Button>
                    {/* <label htmlFor="result">Result:</label>
                    <p>{result}</p> */}
                </div>
            </div>
            <div style={{ backgroundColor: 'white' , width: '400px', display: 'flex', marginLeft: '50px'}}>Chosen location list</div>
        </div>        
    )   
}   

// export default OptimizationForm
export default OptimizationForm