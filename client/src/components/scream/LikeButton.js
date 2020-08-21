import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import FancyButton from "../../util/FancyButton";
import withStyles from "@material-ui/core/styles/withStyles";
import dayjs from "dayjs";
import { Link } from "react-router-dom";

// Icons
import FavoriteBorder from "@material-ui/icons/FavoriteBorder";
import FavoriteIcon from "@material-ui/icons/Favorite";

// redux stuff
import { connect } from "react-redux";
import { likeScream, unlikeScream } from "../../redux/actions/dataActions";

class LikeButton extends Component {
  likedScream = () => {
    if (
      this.props.user.likes &&
      this.props.user.likes.find(like => like.screamId === this.props.screamId)
    ) {
      return true;
    } else {
      return false;
    }
  };

  likeScream = () => {
    this.props.likeScream(this.props.screamId);
  };

  unlikeScream = () => {
    this.props.unlikeScream(this.props.screamId);
  };

  render() {
    const { authenticated } = this.props.user;

    const likeButton = !authenticated ? (
      <Link to="/login">
        <FancyButton tip="like">
          <FavoriteBorder color="primary" />
        </FancyButton>
      </Link>
    ) : this.likedScream() ? (
      <FancyButton tip="undo like" onClick={this.unlikeScream}>
        <FavoriteIcon color="primary" />
      </FancyButton>
    ) : (
      <FancyButton tip="like" onClick={this.likeScream}>
        <FavoriteBorder color="primary" />
      </FancyButton>
    );

    return likeButton;
  }
}

LikeButton.propTypes = {
  user: PropTypes.object.isRequired,
  screamId: PropTypes.string.isRequired,
  likeScream: PropTypes.func.isRequired,
  unlikeScream: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  user: state.user
});

const mapActionsToProps = {
  likeScream,
  unlikeScream
};

// const mapDispatchToProps = {

// }

export default connect(mapStateToProps, mapActionsToProps)(LikeButton);
