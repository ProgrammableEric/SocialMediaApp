import React from "react";
import "./App.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { ThemeProvider as MuiThemeProvider } from "@material-ui/core/styles";
import createMuiTheme from "@material-ui/core/styles/createMuiTheme";
import themeFile from "./util/theme";
import jwtDecode from "jwt-decode";

// Redux
import { Provider } from "react-redux";
import store from "./redux/store";

// Components
import Navbar from "./components/Navbar";
import AuthRoute from "./util/AuthRoute";

// Pages
import home from "./pages/home";
import login from "./pages/login";
import signUp from "./pages/signUp";

const theme = createMuiTheme(themeFile);

// take care of token authentication
let authenticated;
const token = localStorage.FBIdToken;
if (token) {
  const decodedToken = jwtDecode(token);
  console.log(decodedToken);
  if (decodedToken.exp * 1000 < Date.now()) {
    window.location.href = "/login";
    authenticated = false;
  } else {
    authenticated = true;
  }
}

// react router does partial matching, giving '/' it'll return the home page
// rather than continuing searching for what comes next. (such as '/login').
// use the exact keyword to disable partial matching.

function App() {
  return (
    <MuiThemeProvider theme={theme}>
      <Provider store={store}>
        <div className="App">
          <Router>
            <Navbar />
            <div className="container">
              <Switch>
                <Route exact path="/" component={home} />
                <AuthRoute
                  exact
                  path="/login"
                  component={login}
                  authenticated={authenticated}
                />
                <AuthRoute
                  exact
                  path="/signup"
                  component={signUp}
                  authenticated={authenticated}
                />
              </Switch>
            </div>
          </Router>
        </div>
      </Provider>
    </MuiThemeProvider>
  );
}

export default App;
