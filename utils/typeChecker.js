const isFunction = fn => typeof fn === 'function';

const isObject = o => typeof o !== null && typeof o === 'object';

const isArray = arr => Array.isArray(arr);

const isString = str => typeof str === 'string';

const isNumber = num => typeof num === 'number';

const isBoolean = bool => typeof bool === 'boolean';

const isUndefined = und => typeof und === 'undefined';

module.exports = {
    isFunction,
    isObject,
    isArray,
    isString,
    isBoolean,
    isUndefined,
    isNumber
};