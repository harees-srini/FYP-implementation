import React, { useState, useEffect } from "react";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useTheme } from '@emotion/react'
import ButtonAppBar from '../components/NavBar'
import Footer from '../components/Footer'
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

const Itinerary = () => {
    const [itinerary, setItinerary] = useState(null);
    const [locationData, setLocationData] = useState([]);
    const [locationDict, setLocationDict] = useState({}); // State to store location dictionary
    const theme = useTheme();

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
                return {
                    placeId,
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
        <Container id="faq"
            sx={{
                pt: { xs: 4, sm: 12 },
                pb: { xs: 8, sm: 16 },
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: { xs: 3, sm: 6 },
            }}>
            <ButtonAppBar />
            <Typography
                component="h2"
                variant="h4"
                color="text.primary"
                sx={{
                    width: { sm: '100%', md: '60%' },
                    textAlign: { sm: 'left', md: 'center' },
                }}
            >
                Your Delta-optimized travel itinerary
            </Typography>
            <TableContainer component={Paper} sx={{ sm: { width: '100%', md: '60%' } }}>
                <Table aria-label="simple table" sx={{ sm: { width: '100%', md: '60%' } }}>
                    <TableHead sx={{ backgroundColor: "#4169E1" }}>
                        <TableRow>
                            <TableCell sx={{ fontSize: 'large', fontWeight: 'bolder' }} align="center">Order</TableCell>
                            <TableCell sx={{ fontSize: 'large', fontWeight: 'bolder' }} align="center">Name</TableCell>
                            <TableCell sx={{ fontSize: 'large', fontWeight: 'bolder' }} align="center">Stay time</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {locationData.map((item, index) => (
                            <TableRow
                                key={index}                                 
                            >
                                <TableCell align="center">{item.order + 1}</TableCell>
                                <TableCell align="center">{item.location}</TableCell>
                                <TableCell align="center">{item.stayTime[0] + " - " + item.stayTime[1]}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Button variant="contained" color="primary" sx={{ width: { sm: '100%', md: '30%' },
                                    textAlign: { sm: 'center', md: 'center' } }}>
                            Download Itinerary
                        </Button>
            <Footer />
        </Container>
    );
}

export default Itinerary;
