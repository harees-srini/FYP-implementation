import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import { Paper, TextField } from '@mui/material';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Modal from '@mui/material/Modal';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select'
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@emotion/react'
import FormControl from '@mui/material/FormControl';



const OptimizationForm = () => {
    const [result, setResult] = useState('')
    const [selectedLocation, setSelectedLocation] = useState([])
    const [startTime, setStartTime] = useState(null)
    const [endTime, setEndTime] = useState(null)
    const [locationDict, setLocationDict] = useState([])
    const [openModal, setOpenModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [firstLocation, setFirstLocation] = useState('')
    const navigate = useNavigate();
    const theme = useTheme();

    const handleOptimize = async () => {

        // Display the modal overlay
        setOpenModal(true);
        setLoading(true);

        // Simulate optimization process (15 seconds)
        setTimeout(() => {
            setLoading(false);
        }, 15000);

        try {
            localStorage.setItem('locationDict', JSON.stringify(locationDict))
            const response = await axios.post('http://localhost:8000/api/predict/', {
                locations: Object.values(locationDict),
                placeIds: Object.keys(locationDict),
                startTime: startTime,
                endTime: endTime,
                firstLocation: firstLocation
            })
            setResult(response.data.message)
            localStorage.setItem('itinerary', JSON.stringify(response))
        } catch (error) {
            console.error('Error optimizing: ', error)
        }
        
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    const handleViewItinerary = () => {        
        navigate('/itinerary');
    };


    useEffect(() => {
        if (window.google) {
            navigator.geolocation.getCurrentPosition(position => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                // Define AutocompleteOptions with bias towards user's location
                const autocompleteOptions = {
                    bounds: new window.google.maps.LatLngBounds(userLocation, userLocation), // Bias towards user's location                    
                };

                const autocomplete = new window.google.maps.places.Autocomplete(
                    document.getElementById('locations-search'),
                    autocompleteOptions
                );



                autocomplete.addListener('place_changed', () => {
                    const place = autocomplete.getPlace();
                    const placeId = place.place_id;
                    const location = place.name;
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

    const handleSelectLocation = (e) => {
        setFirstLocation(e.target.value);
    }


    return (
        <div style={{ backgroundColor: theme.palette.background.default, minHeight: '100vh', display: 'flex' }}>
            <div style={{ flex: '1' , maxWidth: '50%'}}>
                <div>
                    <TextField
                        id="locations-search"
                        label="Search locations"
                        variant="filled"
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        style={{ height: '60px', marginLeft: '100px', marginTop: '100px', width: '500px', fontSize: '50px', position: 'relative', top: '10px' }}
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '150px', position: 'relative' }}>
                    <Paper style={{  padding: '50px', borderRadius: '5px', backgroundColor: 'rgba(0, 0, 0, 0.1)'}}>
                        <div style={{ marginLeft: '75px' }}>
                            <label htmlFor="startTime">Enter your Start Time here:</label>
                            <br />                    
                            <input
                                type="time"
                                id="startTime"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}                        
                            />
                        </div>
                        <div style={{ marginLeft: '75px' }}>
                            <label htmlFor="endTime">Enter your End Time here:</label>
                            <br/>
                            <input
                                type="time"
                                id="endTime"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}                        
                                style={{ marginRight: '0px' }}
                            />                    
                        </div>                
                    </Paper>
                </div>                    
                    <Modal
                        open={openModal}
                        onClose={handleCloseModal}
                        aria-labelledby="modal-title"
                        aria-describedby="modal-description"
                    >
                        <div style={{ width: 300, padding: 20, backgroundColor: 'white', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                            {loading ? (
                                <>
                                    <p>Optimizing...</p>
                                    <LinearProgress />
                                </>
                            ) : (
                                <>
                                    <p>Optimization completed!</p>
                                    <Button variant="contained" onClick={handleViewItinerary}>View Itinerary</Button>
                                </>
                            )}
                        </div>
                    </Modal>        
                    <Button variant="contained" onClick={handleOptimize} style={{ marginLeft: '250px', marginTop: '100px' }}>Optimize</Button>   
            </div>            
            <div style={{ width: '200px', display: 'flex', marginLeft: '300px', marginRight: '300px', marginTop: '100px', flexDirection: 'column' , flex: '2', maxWidth: '50%' }}>                
                <div style={{ position: 'relative' , flex: '1' }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><b>Selected location list</b></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.entries(locationDict).map(([placeId, location]) => (
                                    <TableRow key={placeId}>
                                        <TableCell>{location}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
                <div style={{ position: 'relative', flex: '2', marginTop: '100px' }}>
                    <Box sx={{ minWidth: 120 }}>
                        <label><b>Select the location you wish to visit first</b></label>
                        <FormControl fullWidth>                            
                            <InputLabel style={{ width: '100%', marginTop: '20px' }} id="demo-simple-select-label">Select location</InputLabel>                        
                            <Select
                                style={{ width: '100%', marginTop: '20px' }}
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={firstLocation}
                                label="Locations"
                                onChange={handleSelectLocation}
                            >
                                {Object.values(locationDict).map((location, index) => (
                                    <MenuItem key={index} value={location}>
                                        {location}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                </div>
            </div>
        </div>
    )
}

// export default OptimizationForm
export default OptimizationForm