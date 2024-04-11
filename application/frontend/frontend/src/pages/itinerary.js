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
        <div style={{ backgroundColor: theme.palette.background.default, minHeight: '100vh', backgroundRepeat: 'no-repeat' }}>
            <div>
                <ButtonAppBar />
                <h1 style={{ display: 'flex', justifyContent: 'center' }}>Travel Itinerary provided by DELTA</h1>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <TableContainer component={Paper} style={{ width: "70%" }}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead style={{ backgroundColor: "#4169E1" }}>
                            <TableRow>
                                {/* <TableCell>Place ID</TableCell> */}
                                <TableCell style={{ fontSize: 'large', fontWeight: 'bolder' }} align="center">Order</TableCell>
                                <TableCell style={{ fontSize: 'large', fontWeight: 'bolder' }} align="center">Name</TableCell>
                                <TableCell style={{ fontSize: 'large', fontWeight: 'bolder' }} align="center">Stay time</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {locationData.map((item, index) => (
                                <TableRow
                                    key={index}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    {/* <TableCell component="th" scope="row">
                                        {item.placeId}
                                    </TableCell> */}
                                    <TableCell align="center">{item.order + 1}</TableCell>
                                    <TableCell align="center">{item.location}</TableCell>
                                    <TableCell align="center">{item.stayTime[0] + " - " + item.stayTime[1]}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
            {/* <Footer /> */}
        </div>
    );
}

export default Itinerary;
