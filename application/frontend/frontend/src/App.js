import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import OptimizationForm from './pages/OptimizationForm'
import LandingPage from './pages/landingpage'
import Itinerary from './pages/itinerary'
import { ThemeProvider } from '@mui/material/styles';
import theme from './themes/theme';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

function App() {
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    // Request location access when the component mounts
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Success callback
        console.log("User's position:", position);
      },
      (error) => {
        // Error callback
        console.error("Error getting location:", error);
        setAccessDenied(true);
      }
    );
  }, []); // Empty dependency array ensures this effect runs only once when the component mounts


  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route exact path="/" element={<LandingPage />} />
          <Route path="/optimize" element={<OptimizationForm />} />
          <Route path='/itinerary' element={<Itinerary />} />
        </Routes>
      </Router>
      <Dialog open={accessDenied} onClose={() => setAccessDenied(false)}>
        <DialogTitle>Enable Location Access</DialogTitle>
        <DialogContent>
          <p>Please enable location access to provide better predictions and optimal routes</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAccessDenied(false)} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}

export default App;
