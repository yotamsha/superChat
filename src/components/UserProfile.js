import React, {Component} from 'react';
import PropTypes from 'prop-types';
import appPropTypes from './appPropTypes';
import FontAwesome from 'react-fontawesome';
import userImagePlaceholder from './../images/251981-P43JLR-579.jpg'
const {userType} = appPropTypes;

class UserProfile extends Component {
  static propTypes = {
    user: userType,
    loginUser: PropTypes.func
  }

  render() {
    return (
      <div className="app-tab user-tab">
        <div className="tab-header">
          <h3 className="tab-title">User Details</h3>
        </div>
        <img className="user-img" src={userImagePlaceholder}></img>
        {/*<label htmlFor="username">Username</label>*/}
        <input id="username" placeholder="Username" defaultValue={this.props.user.username}
               onBlur={(event) => {
                 this.chosenUsername = event.target.value
               }}></input>
        <button type="submit" onClick={() => this.props.loginUser(this.chosenUsername)}>
          <FontAwesome name='check' />
        </button>
      </div>);
  }
}

export default UserProfile;
