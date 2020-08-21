import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import FancyButton from "../../util/FancyButton";
import withStyles from "@material-ui/core/styles/withStyles";

// MUI stuff
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogTitle from "@material-ui/core/DialogTitle";

// ICON
import DeleteOutIcon from "@material-ui/icons/DeleteOutline";

import { connect } from "react-redux";
import { deleteScream } from "../../redux/actions/dataActions";

const styles = {
  deleteButton: {
    position: "absolute",
    left: "90%",
    top: "10%"
  }
};

class DeleteScream extends Component {
  state = {
    open: false
  };

  handleOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  deleteScream = () => {
    this.props.deleteScream(this.props.screamId);
    this.setState({ open: false });
  };

  render() {
    const { classes } = this.props;

    return (
      <Fragment>
        <FancyButton
          tip="Delete scream"
          onClick={this.handleOpen}
          btnClassName={classes.deleteButton}
        >
          <DeleteOutIcon color="secondary" />
        </FancyButton>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          fullWidth
          maxWitdh="sm"
        >
          <DialogTitle>
            Are you sure you want to delete this scream ??
          </DialogTitle>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Cancel
            </Button>
            <Button onClick={this.deleteScream} color="secondary">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Fragment>
    );
  }
}

DeleteScream.propTypes = {
  deleteScream: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  screamId: PropTypes.string.isRequired
};

export default connect(null, { deleteScream })(
  withStyles(styles)(DeleteScream)
);
