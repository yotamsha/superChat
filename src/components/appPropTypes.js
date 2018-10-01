import PropTypes from 'prop-types';

const  messageType = PropTypes.shape({
    id: PropTypes.string,
    text: PropTypes.string
});

export default {
    messageType: messageType,
    channelType: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        messages: PropTypes.arrayOf(messageType),
    }),
    userType: PropTypes.shape({
        id: PropTypes.string,
        username: PropTypes.string
    })
}