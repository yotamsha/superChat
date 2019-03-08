import React, {Component} from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import appPropTypes from './appPropTypes';
import FontAwesome from 'react-fontawesome';

const {userType} = appPropTypes;

class UsersTab extends Component {
  static propTypes = {
    isOpen: PropTypes.bool,
    currentUser: userType,
    openNewChannel: PropTypes.func,
    activeUsers: PropTypes.array
  }

  render() {
    return (
      <div className={'app-tab users-list-tab ' + (this.props.isOpen ? 'show' : 'hide')} >
        <div className="tab-header">
          <h3 className="tab-title"></h3>
        </div>
        <div className="users-list">
          <div className="list-title">Active Users</div>
          <ul className="users">
            {_.map(this.props.activeUsers, user => {
              const ownerMsg = user.id === this.props.currentUser.id;
              return <li className={'user-row ' + (ownerMsg ? 'me' : '')} key={user.id}>
                <div className="user">
                  {/*<FontAwesome className="circle" name='circle-thin' />*/}

                  {user.id !== this.props.currentUser.id ? (
                    <a className="username other"
                       onClick={() => this.props.openNewChannel([this.props.currentUser.id, user.id])}>
                      {user.username}</a>
                  ) : (
                    <a className="username me">{user.username} (me)</a>
                  )}

                </div>
              </li>
            })}
          </ul>
        </div>
      </div>);
  }
}

export default UsersTab;
