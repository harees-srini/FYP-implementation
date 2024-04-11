import React, { useEffect, useState } from 'react'
import { Typography, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@emotion/react'
import Fade from '@mui/material/Fade';
import ButtonAppBar from '../components/NavBar'
import Footer from '../components/Footer'

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
        <div style={{ backgroundColor: theme.palette.background.default }} >
            <ButtonAppBar />
            <div position='fixed' style={{ backdropFilter: 'blur', height: '93.1vh', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
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
                            <Typography variant="body1" gutterBottom>
                            ˈdɛltə : <b>noun</b>
                            </Typography>                          
                            <Typography variant="h5" gutterBottom>
                                To move or change places, people, or things
                            </Typography>
                            <Typography variant="h5" gutterBottom>
                            <i>Let's delta outta here!</i>
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
            <Footer />
        </div>
    )
}

export default LandingPage