import React, { useEffect, useState } from 'react'
import axios from 'axios'

const OptimizationForm = () => {
    const [result, setResult] = useState('')
    const [selectedLocation, setSelectedLocation] = useState([])
    const [startTime, setStartTime] = useState('')
    const [endTime, setEndTime] = useState('')
    const [locationDict, setLocationDict] = useState([])
    const [autocomplete, setAutocomplete] = useState(null)

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
            const autocomplete = new window.google.maps.places.Autocomplete(
                document.getElementById('locations'),
                { types: ['geocode'] }
            );
            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                const placeId = place.place_id;
                const location = place.formatted_address;
                setSelectedLocation(location); 
                updateLocationDict(placeId, location);
            });
        }
    }, [])

    const updateLocationDict = (placeId, location) => {
        setLocationDict(prevDictionary => ({
            ...prevDictionary,
            [placeId]: location // Add or update the location for the given place ID
        }));
    };

    return (
        <div style={{ backgroundColor: '#00BF63', minHeight: '100vh', display: 'flex' }}>
            <div style={{ backgroundColor: '#ffffff', display: 'flex', width: '25%' }}>
                {'Nav bar goes here'}
            </div>
            <div>
                <label htmlFor="locations">Locations:</label>
                <input
                    type="text"
                    id="locations"
                    value={selectedLocation}
                    placeholder='Search here to add more locations'
                    onChange={(e) => setSelectedLocation(e.target.value)}
                />
                <label htmlFor="startTime">Start Time:</label>
                <input
                    type="time"
                    id="startTime"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                />
                <label htmlFor="endTime">End Time:</label>
                <input
                    type="time"
                    id="endTime"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                />
                <button onClick={handleOptimize}>Optimize</button>
                <p>{result}</p>
            </div>
        </div>
    )
}

// export default OptimizationForm
export default OptimizationForm