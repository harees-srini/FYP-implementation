import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import OptimizationForm from './components/OptimizationForm'
import LandingPage from './pages/landingpage'
import Itinerary from './pages/itinerary'

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<LandingPage />} />
        <Route path="/optimize" element={<OptimizationForm />} />
        <Route path='/itinerary' element={<Itinerary />} />
      </Routes>
    </Router>
  );
}

export default App;
