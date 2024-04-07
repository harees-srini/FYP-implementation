import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

export default function ButtonAppBar() {
  return (
    <Box sx={{ flexGrow: 1 }} style={{ width: '100%', height: 'inherit'}}>
      <AppBar position="static" style={{ backgroundColor: 'black', boxShadow: 'None' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            DELTA - Route Optimization and Stay Time Prediction
          </Typography>
          <Button color="inherit">Github</Button>
          <Button color="inherit">Watch Demo</Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}