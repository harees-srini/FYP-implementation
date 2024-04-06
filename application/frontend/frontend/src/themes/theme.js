import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#007bff', // Blue color
    },
    secondary: {
      main: '#ffc107', // Amber color
    },
    background: {
      default: '#88CD82',      
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
  },
  breakpoints: {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1536,
  },

  Box: {    
      backgroundColor: 'green',
      border: '1px solid rgba(0, 0, 0, 0.12)',
      boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
      padding: '16px',
      borderRadius: 4,
    },
});

export default theme;
