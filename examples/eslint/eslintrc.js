module.exports = {
    "parserOptions": {
        "ecmaVersion": 6,
        "sourceType": "module",
        "ecmaFeatures": {
            "jsx": true
        },
    },
    "plugins": [
        "react"
    ],
    "env": {
        "browser": true,
        "node": true,
        "es6": true,
        "mocha": true,
        "commonjs": true
    },
    "parser": "babel-eslint",
    "rules": {
        "jsx-quotes": [2, "prefer-double"], //Двойные кавычки в JSX
        "react/jsx-uses-react": 2, //no-unused не будет ругаться на import React
        "indent": [2, 4], //4 пробела отступы
        "quotes": [2, "single"], //Использовать одинарные кавычки
    }
};