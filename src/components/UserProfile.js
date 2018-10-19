import React, {Component} from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import appPropTypes from './appPropTypes';
import FontAwesome from 'react-fontawesome';

const {userType} = appPropTypes;

class UserProfile extends Component {
  static propTypes = {
    user: userType,
    loginUser: PropTypes.func.isRequired,
    updateUser: PropTypes.func.isRequired
  }

  submitClicked (user) {
    if (this.props.user.id) {
      this.props.updateUser(_.defaults(user, this.props.user));
    } else {
      this.props.loginUser(user);
    }
  }

  render() {
    return (
      <div className="app-tab user-tab">
        <div className="tab-header">
          <h3 className="tab-title">User Details</h3>
        </div>
        <img className="user-img" src={process.env.PUBLIC_URL + '/images/profile-back.jpg'}></img>
        <input id="username" placeholder="Username" defaultValue={this.props.user.username}
               onBlur={(event) => {
                 this.chosenUsername = event.target.value
               }}></input>
        <button type="submit" onClick={() => this.submitClicked({username: this.chosenUsername})}>
          <FontAwesome name='check' />
        </button>
      </div>);
  }
}

export default UserProfile;
