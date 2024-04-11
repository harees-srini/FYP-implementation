import BottomNavigation from '@mui/material/BottomNavigation';
import * as React from 'react';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { AppBar } from '@mui/material';

export default function Footer() {
    return (
      <Box sx={{ flexGrow: 1 }} style={{ width: '100%', height: 'inherit', marginTop: 'inherit', position: 'static', bottom: 0 }}>
        <AppBar position="static" style={{ backgroundColor: 'black', boxShadow: 'None', height: '150px' }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              DELTA - Route Optimization and Stay Time Prediction
            </Typography>
            <Button color="inherit" href="https://github.com/harees-srini/FYP-implementation" target="_blank">Github</Button>
            <Button color="inherit">Watch Demo</Button>
          </Toolbar>
        </AppBar>
      </Box>
    );
  }