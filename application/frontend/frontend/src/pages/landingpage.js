import React, { useEffect, useState } from 'react'
import { Typography, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@emotion/react'
import Fade from '@mui/material/Fade';
import ButtonAppBar from '../components/NavBar'

// import axios from 'axios'



const LandingPage = () => {
    const [showText, setShowText] = useState(false);
    const navigate = useNavigate();
    const theme = useTheme();

    useEffect(() => {
        // Set a timeout to show the text after a delay (e.g., 1 second)
        const timeout = setTimeout(() => {
            setShowText(true);
        }, 1000);

        // Clean up the timeout to avoid memory leaks
        return () => clearTimeout(timeout);
    }, []);

    const handleViewOptimizationForm = () => {
        // Redirect to another page
        navigate('/optimize');
    };

    return (
        <div>
            <ButtonAppBar />
            <div position='fixed' style={{ backgroundColor: theme.palette.background.default, height: '93.1vh', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <Fade in={showText} timeout={5000}>
                    <img position='relative' src={"../../landing_page_map.png"} alt="Landing Page image" />
                </Fade>
                {/* Conditionally render the large text after the delay */}
                <div style={{ flexDirection: 'column' }}>
                    <Fade in={showText} timeout={1000}>
                        <div>
                            <Typography variant="h3" gutterBottom style={{ fontWeight: '1000' }}>
                                DELTA
                            </Typography>
                            <Typography variant="h3" gutterBottom>
                                Route Optimization and Stay Time Prediction
                            </Typography>
                        </div>
                    </Fade>

                    {/* Add a button to navigate to the next page */}
                    <Fade in={showText} timeout={3000}>
                        <Button variant="contained" color="primary" onClick={handleViewOptimizationForm} style={{ marginTop: '20px' }}>
                            Let's Delta
                        </Button>
                    </Fade>
                </div>
            </div>
        </div>
    )
}

export default LandingPage