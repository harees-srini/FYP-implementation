import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import { RadioGroup, TextField } from '@mui/material';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import Modal from '@mui/material/Modal';
import LinearProgress from '@mui/material/LinearProgress';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { StaticTimePicker } from '@mui/x-date-pickers/StaticTimePicker';
import Radio from '@mui/material/Radio';
// import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import dayjs from 'dayjs';


const OptimizationForm = () => {
    const [result, setResult] = useState('')
    const [selectedLocation, setSelectedLocation] = useState([])
    const [startTime, setStartTime] = useState(null)
    const [endTime, setEndTime] = useState(null)
    const [locationDict, setLocationDict] = useState([])
    const [openModal, setOpenModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // const [autocomplete, setAutocomplete] = useState(null)
    // const [isSelectingStartTime, setIsSelectingStartTime] = useState(true)

    // const [selectedTime, setSelectedTime] = useState(dayjs())

    // const handleTimeSelection = (selectedTime) => {
    //     setSelectedTime(selectedTime.format('HH:mm'));
    //     if (isSelectingStartTime) {
    //         setStartTime(selectedTime.format('HH:mm'));            
    //         console.log('Start Time: ', selectedTime)
    //     } else {
    //         setEndTime(selectedTime);            
    //         console.log('End Time: ', selectedTime.format('HH:mm'))
    //     }
    // };

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
                endTime: endTime
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
        // Redirect to another page
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

    const handleDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(locationDict);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setLocationDict(Object.fromEntries(items));
    };

    return (
        <div style={{ backgroundColor: '#88CD82', minHeight: '100vh', display: 'flex' }}>
            <div style={{ backgroundColor: '#ffffff', display: 'flex', width: '25%' }}>
                <img src="../../delta-logo2.png" alt="Delta Logo" />
            </div>
            <div style={{ display: 'grid' }}>
                <div>
                    {/* <label htmlFor="locations">Locations:</label> */}
                    {/* <input
                        type="text"
                        id="locations"
                        value={selectedLocation}
                        style={{ height: '50px', marginLeft: '200px', marginTop: '200px', width: '500px', fontSize: '20px' }}
                        placeholder='Start typing to add more locations.....'
                        onChange={(e) => setSelectedLocation(e.target.value)}                  
                        size={50}      
                    /> */}
                    <TextField
                        id="locations-search"
                        label="Search locations"
                        variant="filled"
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        style={{ height: '60px', marginLeft: '100px', marginTop: '100px', width: '500px', fontSize: '50px', position: 'relative', top: '10px' }}
                    />
                </div>
                <div style={{ marginLeft: '150px', marginTop: '50px' }}>
                    {/* <FormControl>
                        <FormLabel id='radio-group-label'>Select your preferred time</FormLabel>
                        <RadioGroup row aria-label="time" name="time" value={isSelectingStartTime ? 'start' : 'end'} onChange={(e) => setIsSelectingStartTime(e.target.value === 'start')}>
                            <FormControlLabel value="start" control={<Radio />} label="Start Time" />
                            <FormControlLabel value="end" control={<Radio />} label="End Time" />
                        </RadioGroup>
                    </FormControl>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>                        
                        <StaticTimePicker orientation="landscape" value={selectedTime} onAccept={handleTimeSelection} />
                    </LocalizationProvider> */}
                    {/* {startTime && endTime && (
                        <p>{`Start Time: ${startTime.format('HH:mm')} - End Time: ${endTime.format('HH:mm')}`}</p>
                    )} */}
                    <label htmlFor="startTime">Enter your Start Time here:</label>
                    <input
                        type="time"
                        id="startTime"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                    />

                </div>
                <div style={{ marginLeft: '150px', marginTop: '20px' }}>
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
                    {/* <p>Start time: {startTime}</p>
                    <p>End time: {endTime}</p> */}
                    {/* <button onClick={handleOptimize} style={{ marginLeft: '400px',  }}>Optimize</button> */}
                    <Button variant="contained" onClick={handleOptimize} style={{ marginLeft: '250px' }}>Optimize</Button>
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
                    {/* <label htmlFor="result">Result:</label>
                    <p>{result}</p> */}
                </div>
            </div>
            <div style={{ backgroundColor: 'white', width: '400px', display: 'flex', marginLeft: '50px', marginRight: '0px' }}>
                {/* <h2>Chosen location list</h2> */}
                <div>
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="placeId">
                            {(provided) => (
                                <TableContainer {...provided.droppableProps} ref={provided.innerRef}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Location</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {Object.entries(locationDict).map(([placeId, location], index) => (
                                                <Draggable key={placeId} draggableId={placeId} index={index}>
                                                    {(provided) => (
                                                        <TableRow
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                        >
                                                            <TableCell>{location}</TableCell>
                                                        </TableRow>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>
            </div>
        </div>
    )
}

// export default OptimizationForm
export default OptimizationForm