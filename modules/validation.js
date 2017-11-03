const validationProps = (props, addProps = []) => {
    let isRequired = ['root', 'src', 'dist'].concat(addProps);
    let message = '';
    let keys = Object.keys(props);
    if (keys.length === 0) {
        message = 'Properties are empty';
    }

    isRequired.forEach(prop => {
        if (keys.indexOf(prop) < 0) {
            let postfix = ' - is required field!';
            let newMessage = message.length === 0 ? `${prop}${postfix}` : `\n${prop}${postfix}`;
            message += newMessage;
        }
    });
    return {
        state: message.length === 0,
        message
    }
};

module.exports = {
    validationProps,
};