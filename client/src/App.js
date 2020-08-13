import React from 'react';
import './App.css';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import {ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';

// Components
import Navbar from './components/Navbar';

// Pages
import home from './pages/home';
import login from './pages/login';
import signUp from './pages/signUp';

const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#ff7961',
      main: '#f44336',
      dark: '#ba000d',
      contrastText: '#000',
    },
    secondary: {
      light: '#757ce8',
      main: '#3f50b5',
      dark: '#002884',
      contrastText: '#fff',
    },
  },
  typography: {
    useNextVariants: true
  }
});

// react router does partial matching, giving '/' it'll return the home page 
// rather than continuing searching for what comes next. (such as '/login'). 
// use the exact keyword to disable partial matching. 

function App() {
  return (
    <MuiThemeProvider theme={theme}>
      <div className="App">
      <Router>
        <Navbar />
        <div className="container">
          <Switch>
            <Route exact path="/" component={home} />
            <Route exact path="/login" component={login} />
            <Route exact path="/signup" component={signUp} />
          </Switch>
        </div>
      </Router>
      </div>
    </MuiThemeProvider>
  );
}

export default App;
