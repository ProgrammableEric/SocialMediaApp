import { SET_USER, SET_ERRORS, CLEAR_ERRORS, LOADING_UI } from "../types";
import axios from "axios";

// dispathcer takes care of sending actions to the right places, and applying middlewares
// reducer actually does the action process logic

export const loginUser = (userData, history) => dispatch => {
  dispatch({ type: LOADING_UI });

  axios
    .post("/login", userData)
    .then(res => {
      const FBIdToken = `Bearer ${res.data.token}`;
      localStorage.setItem("FBIdToken", FBIdToken); // ADD AN authorization header to the request.
      axios.defaults.headers.common["Authorization"] = FBIdToken;
      dispatch(getUserData());
      dispatch({ type: CLEAR_ERRORS });
      history.push("/"); // redirect and add the page to the browser history.
    })
    .catch(err => {
      dispatch({
        type: SET_ERRORS,
        payload: err.response.data
      });
    });
};

export const getUserData = () => dispatch => {
  axios
    .get("/user")
    .then(res => {
      dispatch({
        type: SET_USER,
        payload: res.data
      });
    })
    .catch(err => console.log(err));
};
