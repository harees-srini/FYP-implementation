import React, { useEffect, useState } from 'react'
import { Typography, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@emotion/react'
import Fade from '@mui/material/Fade';

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
        <div style={{ backgroundColor: theme.palette.background.default, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {/* Add the image */}
        <Fade in={showText}>
            <img src={"../../delta-logo2.png"} alt="Delta Logo" style={{ maxHeight: '5%', maxWidth: '25%', marginTop: '-200px' }} />
        </Fade>
        {/* Conditionally render the large text after the delay */}
        <Fade in={showText}>
            <div>
                <Typography variant="h3" gutterBottom style={{ fontWeight: '1000', marginLeft: '385px' }}>
                    DELTA
                </Typography>
                <Typography variant="h3" gutterBottom>
                    Route Optimization and Stay Time prediction
                </Typography>
            </div>
        </Fade>
        
        {/* Add a button to navigate to the next page */}
        <Fade in={showText}>
            <Button variant="contained" color="primary" onClick={handleViewOptimizationForm} style={{ marginTop: '20px' }}>
                Let's Delta
            </Button>
        </Fade>
    </div>
    )
}

export default LandingPage