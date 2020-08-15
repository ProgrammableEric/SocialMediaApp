import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import PropTypes from 'prop-types';
import AppIcon from '../images/icon.png';
import axios from 'axios';
import { Link } from 'react-router-dom';

// MUI stuff
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';


// style the component in the same file, grab class names from the styles object. 
const styles = {
    form: {
        textAlign: 'center'
    },
    image: {
        margin: '20px auto 20px auto',
        width: '15%'
    }, 
    pageTitle: {
        margin: '10px auto 10px auto'
    },
    textField: {
        margin: '10px auto 10px auto'
    }, 
    button: {
        marginTop: 20,
        marginBottom: 20,
        position: 'relative'
    },
    customError: {
        color: 'red',
        fontSize: '0.8rem',
        marginTop: 10
    },
    progress: {
        position: 'absolute'
    },
}


// change image width actually scales the image

class login extends Component {
    constructor(){
        super();
        this.state = {
            email: '',
            password: '',
            loading: false, 
            errors: {}
        }
    }

    handleSubmit = (event) => {
        event.preventDefault();
        this.setState({
            loading: true
        });
        const userData = {
            email: this.state.email,
            password: this.state.password
        }
        axios.post('/login', userData)
            .then(res => {
                console.log(res.data);
                this.setState({
                    loading: false
                });
                this.props.history.push('/');   // redirect and add the page to the browser history. 
            })
            .catch(err => {
                this.setState({
                    errors: err.response.data,
                    loading: false
                })
            })
    }

    handleChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value   // generic way of handling both email and password. 
        })
    }


    render() {
        const { classes } = this.props;
        const { errors, loading } = this.state; 
        return (
            <Grid container className={classes.form}>
                <Grid item sm />
                <Grid item sm>
                    <img src={AppIcon} alt="app icon" className={classes.image}/> 
                    <Typography variant="h2" className={classes.pageTitle}>
                        Login
                    </Typography>
                    <form noValidate onSubmit={this.handleSubmit} >
                        <TextField id="email" name="email" type="email" label="Email" className={classes.textField} helperText={errors.email}
                            error={errors.email ? true : false} value={this.state.email} onChange={this.handleChange} fullWidth />
                        <TextField id="password" name="password" type="password" label="Password" className={classes.textField} helperText={errors.email}
                            error={errors.email ? true : false} value={this.state.password} onChange={this.handleChange} fullWidth />
                        { errors.general && (
                            <Typography variant="body2" className={classes.customError} >
                                { errors.general }
                            </Typography>
                        ) }
                        <Button type="submit" variant="contained" color="primary" className={classes.button} disabled={loading}>
                            LOGIN
                            {loading && (
                                <CircularProgress className={classes.progress} size={25} />
                            )}
                        </Button>
                        <br></br>
                        <small>Don't have an account ? sign up <Link to="/signup" > here </Link></small>
                    </form>
                </Grid>
                <Grid item sm />
            </Grid>
        )
    }
}

login.propTypes = {
    classes: PropTypes.object.isRequired
}

export default withStyles(styles)(login);
