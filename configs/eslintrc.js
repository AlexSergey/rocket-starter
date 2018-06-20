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
    "parser": require.resolve("babel-eslint"),
    "rules": {}
};