import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import { Menu, Paper, TextField } from '@mui/material';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Modal from '@mui/material/Modal';
import LinearProgress from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AddHomeIcon from '@mui/icons-material/AddHome';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select'
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@emotion/react'
import FormControl from '@mui/material/FormControl';
import ButtonAppBar from '../components/NavBar'
import Tooltip from '@mui/material/Tooltip';
import Footer from '../components/Footer'

const OptimizationForm = () => {
    const [result, setResult] = useState('')
    const [selectedLocation, setSelectedLocation] = useState([])
    const [startTime, setStartTime] = useState(null)
    const [endTime, setEndTime] = useState(null)
    const [locationDict, setLocationDict] = useState([])
    const [openModal, setOpenModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [firstLocation, setFirstLocation] = useState('')
    const [currentPlaceId, setCurrentPlaceId] = useState('')
    const [startLocation, setStartLocation] = useState('')
    const [endLocation, setEndLocation] = useState('')
    const [startLocPlaceID, setStartLocPlaceID] = useState('')
    const [endLocPlaceID, setEndLocPlaceID] = useState('')
    const [startLocDict, setStartLocDict] = useState([])
    const [endLocDict, setEndLocDict] = useState([])
    const [userPreference, setUserPreference] = useState('')
    const navigate = useNavigate();
    const theme = useTheme();

    const handleOptimize = async () => {

        // Display the modal overlay
        setOpenModal(true);
        setLoading(true);

        // Simulate optimization process (15 seconds)
        setTimeout(() => {
            setLoading(false);
        }, 45000);

        try {
            localStorage.setItem('locationDict', JSON.stringify(locationDict))
            const response = await axios.post('http://localhost:8000/api/predict/', {
                locations: Object.values(locationDict),
                placeIds: Object.keys(locationDict),
                startTime: startTime,
                endTime: endTime,
                firstLocation: firstLocation,
                currentPlaceId: currentPlaceId,
                startLocDict: startLocDict,
                endLocDict: endLocDict,
                userPreference: userPreference
            })
            setResult(response.data.message)
            localStorage.setItem('itinerary', JSON.stringify(response))
        } catch (error) {
            console.error('Error optimizing: ', error)
        }

    };

    const handleSelectCurrentLocation = (locationType) => {
        navigator.geolocation.getCurrentPosition(position => {
            const userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            const geocoder = new window.google.maps.Geocoder();
            const latLng = new window.google.maps.LatLng(userLocation.lat, userLocation.lng);
            geocoder.geocode({ 'location': latLng }, (results, status) => {
                if (status === window.google.maps.GeocoderStatus.OK) {
                    if (results[0]) {
                        console.log(results[0]);
                        const currentPlaceId = results[0].place_id;
                        const currentLocation = results[0].formatted_address;
                        if (locationType === 'start') {
                            setStartLocation(currentLocation);
                            setStartLocPlaceID(currentPlaceId);
                            updateStartLocationDict(currentPlaceId, currentLocation);
                            document.getElementById('start-location-search').value = currentLocation || '';
                        } else if (locationType === 'end') {
                            setEndLocation(currentLocation);
                            setEndLocPlaceID(currentPlaceId);
                            updateEndLocationDict(currentPlaceId, currentLocation)
                            document.getElementById('end-location-search').value = currentLocation || '';
                        }
                    }
                }
            });
        })
    }

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
                const geocoder = new window.google.maps.Geocoder();
                const latLng = new window.google.maps.LatLng(userLocation.lat, userLocation.lng);
                geocoder.geocode({ 'location': latLng }, (results, status) => {
                    if (status === window.google.maps.GeocoderStatus.OK) {
                        if (results[0]) {
                            const currentPlaceId = results[0].place_id;
                            setCurrentPlaceId(currentPlaceId);
                        }
                    }
                });
                // Define AutocompleteOptions with bias towards user's location
                const setAutocompleteOptions = (inputId) => {
                    const options = {
                        bounds: new window.google.maps.LatLngBounds(userLocation, userLocation), // Bias towards user's location                    
                    }
                    return options
                };

                const autocomplete = new window.google.maps.places.Autocomplete(
                    document.getElementById('locations-search'),
                    setAutocompleteOptions('locations-search')
                );

                const startAutocomplete = new window.google.maps.places.Autocomplete(
                    document.getElementById('start-location-search'),
                    setAutocompleteOptions('start-location-search')
                );

                const endAutocomplete = new window.google.maps.places.Autocomplete(
                    document.getElementById('end-location-search'),
                    setAutocompleteOptions('end-location-search')
                );


                autocomplete.addListener('place_changed', () => {
                    const place = autocomplete.getPlace();
                    const placeId = place.place_id;
                    const location = place.name;
                    setSelectedLocation(location);
                    updateLocationDict(placeId, location);
                });

                startAutocomplete.addListener('place_changed', () => {
                    const place = startAutocomplete.getPlace();
                    const placeId = place.place_id;
                    const location = place.name;
                    setStartLocation(location);
                    // updateStartLocationDict(startLocPlaceID, startLocation);
                });

                endAutocomplete.addListener('place_changed', () => {
                    const place = endAutocomplete.getPlace();
                    const placeId = place.place_id;
                    const location = place.name;
                    setEndLocation(location);
                    // updateEndLocationDict(endLocPlaceID, endLocation);
                });
                console.log({ startLocDict });
                console.log({ endLocDict });
                console.log({ endLocPlaceID });
                console.log({ startLocPlaceID });

            })
        }
    }, []);

    const updateLocationDict = (placeId, location) => {
        setLocationDict(prevDictionary => ({
            ...prevDictionary,
            [placeId]: location // Add or update the location for the given place ID
        }));
    };

    const updateStartLocationDict = (placeId, location) => {
        setStartLocDict({
            [placeId]: location // Add or update the location for the given place ID
        });
    };

    const updateEndLocationDict = (placeId, location) => {
        setEndLocDict({
            [placeId]: location // Add or update the location for the given place ID    
        });
    };

    const handleSelectLocation = (e) => {
        setFirstLocation(e.target.value);
    }

    const handleDeleteLocation = (placeId) => {
        setLocationDict(prevDictionary => {
            const newDictionary = { ...prevDictionary };
            delete newDictionary[placeId];
            return newDictionary;
        });
    }
    console.log({ locationDict })

    const handleUserPreference = (e) => {
        setUserPreference(e.target.value);
    }


    return (
        <div style={{ maxHeight: '100vh' }}>
            <ButtonAppBar />
            <div style={{ backgroundColor: theme.palette.background.default, minHeight: '100vh', display: 'flex' }}>
                <div style={{ flex: '1', minWidth: '100vh' }}>
                    <div>
                        <TextField
                            required={true}
                            helperText="Please enter the location from where you will start your journey."
                            id="start-location-search"
                            label="Search to add origin"
                            variant="filled"
                            value={startLocation}
                            onChange={(e) => setStartLocation(e.target.value)}
                            style={{ height: '60px', marginLeft: '100px', marginTop: '100px', width: '500px', fontSize: '50px', position: 'relative', top: '10px' }}
                        />
                        <Tooltip title="Add current location"><IconButton style={{ marginTop: '120px', marginLeft: '50px', fontSize: 'medium' }} aria-label="add-home" onClick={() => handleSelectCurrentLocation('start')}><AddHomeIcon /></IconButton></Tooltip>
                        {/* <Button id="start-location-btn" variant="contained" onClick={() => handleSelectCurrentLocation('start')} style={{ marginLeft: '250px', marginTop: '30px' }}>Add current location</Button> */}
                    </div>
                    <div>
                        <TextField
                            required={true}
                            helperText="Enter the first few letters of the locations you wish to add to your itinerary."
                            id="locations-search"
                            label="Search to add locations to your itinerary"
                            variant="filled"
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                            style={{ height: '60px', marginLeft: '100px', marginTop: '70px', width: '500px', fontSize: '50px', position: 'relative', top: '10px' }}
                        />
                    </div>
                    <div>
                        <TextField
                            required={true}
                            helperText="Please enter the location where you will end your journey."
                            id="end-location-search"
                            label="Search to add destination"
                            variant="filled"
                            value={endLocation}
                            onChange={(e) => setEndLocation(e.target.value)}
                            style={{ height: '60px', marginLeft: '100px', marginTop: '70px', width: '500px', fontSize: '50px', position: 'relative', top: '10px' }}
                        />
                        <Tooltip title="Add current location"><IconButton style={{ marginTop: '90px', marginLeft: '50px' }} aria-label="add-home" onClick={() => handleSelectCurrentLocation('end')}><AddHomeIcon /></IconButton></Tooltip>
                        {/* <Button id="end-location-btn" variant="contained" onClick={() => handleSelectCurrentLocation('end')} style={{ marginLeft: '250px', marginTop: '30px' }}>Add current location</Button> */}
                        {/* <Button id="end-location-btn2" variant="contained" onClick={'add function'} style={{ marginLeft: '250px', marginTop: '100px' }}>Same as start location</Button> */}
                    </div>
                    <div style={{ display: 'flex', marginTop: '100px', position: 'relative' }}>
                        <Paper style={{ padding: '50px', borderRadius: '5px', backgroundColor: 'rgba(0, 0, 0, 0.05)', width: '400px', marginLeft: '100px' }}>
                            <div style={{ display: 'inline-flex' }}>
                                <label htmlFor="startTime"><h3>Enter your Start Time here:</h3></label>
                                {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DemoContainer components={['TimePicker']}>
                                        <TimePicker id="startTime"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)} label="Basic time picker" />
                                    </DemoContainer>
                                </LocalizationProvider> */}
                                <input
                                    required={true}
                                    type="time"
                                    id="startTime"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    style={{ marginLeft: '40px', width: '100px', fontSize: '20px', backgroundColor: 'lightblue' }}
                                />
                            </div>
                            <div style={{ display: 'inline-flex' }}>
                                <label htmlFor="endTime"><h3>Enter your End Time here:</h3></label>
                                {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DemoContainer components={['TimePicker']}>
                                        <TimePicker id="endTime"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)} label="Basic time picker" />
                                    </DemoContainer>
                                </LocalizationProvider> */}
                                <input
                                    required={true}
                                    type="time"
                                    id="endTime"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    style={{ marginLeft: '50px', width: '100px', fontSize: '20px', backgroundColor: 'lightblue' }}
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
                    <Button variant="contained" onClick={handleOptimize} style={{ marginLeft: '250px', marginTop: '50px' }}>Optimize</Button>
                </div>
                <div style={{ width: '200px', display: 'flex', marginLeft: '250px', marginRight: '100px', marginTop: '70px', flexDirection: 'column', flex: '2', maxWidth: '50%' }}>
                    <div style={{ position: 'relative', flex: '1' }}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><h3>Selected location list</h3></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Object.entries(locationDict).map(([placeId, location]) => (
                                        <TableRow key={placeId}>
                                            <TableCell>{location}</TableCell>
                                            <TableCell>
                                                <IconButton aria-label="delete" onClick={() => handleDeleteLocation(placeId)}><DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                    <div style={{ position: 'relative', flex: '2', marginTop: '100px' }}>
                        <Box sx={{ minWidth: 120 }}>
                            <label><b>Select your interests</b></label>
                            <FormControl fullWidth>
                                <InputLabel required={true} style={{ width: '100%', marginTop: '20px' }} id="demo-simple-select-label">Select your preferred activity</InputLabel>
                                <Select
                                    required={true}
                                    variant="filled"
                                    style={{ width: '100%', marginTop: '18px' }}
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={userPreference}
                                    label="Locations"
                                    onChange={handleUserPreference}
                                >
                                    <MenuItem value="shopping">Shopping - You wish to spend more time shopping</MenuItem>
                                    <MenuItem value="relax">Relaxation - You wish to relax at a beach, park, etc.</MenuItem>
                                    <MenuItem value="explore">Explore - You wish to explore new locations, structures, etc.</MenuItem>
                                    <MenuItem value="sightsee">Sightsee - You wish to look at attractions, museums, etc.</MenuItem>
                                    <MenuItem value="worship">Worship - You wish to spend more time at a place of worship</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default OptimizationForm