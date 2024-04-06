import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import OptimizationForm from './pages/OptimizationForm'
import LandingPage from './pages/landingpage'
import Itinerary from './pages/itinerary'
import { ThemeProvider } from '@mui/material/styles';
import theme from './themes/theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route exact path="/" element={<LandingPage />} />
          <Route path="/optimize" element={<OptimizationForm />} />
          <Route path='/itinerary' element={<Itinerary />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
