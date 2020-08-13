import React from 'react';
import './App.css';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

// Components
import Navbar from './components/Navbar';

// Pages
import home from './pages/home';
import login from './pages/login';
import signUp from './pages/signUp';

// react router does partial matching, giving '/' it'll return the home page 
// rather than continuing searching for what comes next. (such as '/login'). 
// use the exact keyword to disable partial matching. 

function App() {
  return (
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
  );
}

export default App;
