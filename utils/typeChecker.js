const isType = obj => {
    var type = typeof obj;

    if (typeof obj === 'object') {
        // is Null
        if (obj === null) {
            type = 'null';
        }
        // is DOM
        else if ((typeof window !== 'undefined' && obj instanceof HTMLElement) || obj.toString() === '[object HTMLDocument]') {
            if (obj.toString() === '[object HTMLDocument]') {
                type = 'document';
            } else {
                type = 'dom';
            }
        }
        // is Array
        else if (Array.isArray(obj)) {
            type = 'array';
        }
        // is Date
        else if (obj instanceof Date) {
            type = 'date';
        }
        // is Arguments
        else if (typeof obj.length === 'number' && typeof obj === 'object' && Array.isArray(obj) === false) {
            type = 'arguments';
        }
    }
    else if (typeof obj === 'number') {
        type = 'number';
        // is NaN
        if (isNaN(obj) && typeof obj === 'number') {
            type = 'NaN';
        }
    }

    else if (typeof obj === 'function') {
        type = 'function';
        if (obj.toString) {
            var fnString = obj.toString();
            var isClass = fnString.indexOf('class') === 0;

            if (isClass) {
                type = 'class';
            }
        }
    }

    return type;
};

function _isUrl(s) {
    var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
    return regexp.test(s);
}

const isArray = obj => isType(obj) === 'array';
const isNan = obj => isType(obj) === 'NaN';
const isString = obj => isType(obj) === 'string';
const isNumber = obj => isType(obj) === 'number';
const isBoolean = obj => isType(obj) === 'boolean';
const isUndefined = obj => isType(obj) === 'undefined';
const isDefined = obj =>  typeof obj !== 'undefined';
const isEmpty    = obj => ( obj === '' || obj === 0 || obj === '0' || obj === null || obj === false || !obj);
const isClass = obj => isType(obj) === 'class';
const isFunction = obj => isType(obj) === 'function';
const isObject = obj => isType(obj) === 'object';
const isNull = obj => isType(obj) === 'null';
const isDOM = obj => isType(obj) === 'dom';
const isArguments = obj => isType(obj) === 'arguments';
const isDate = obj => isType(obj) === 'date';
const isAsync = cb => cb instanceof Promise;
const isUrl = url => isType(url) === 'string' && _isUrl(url);

const isBase64 = (str) => {
    return isString(str) && str.indexOf('base64') >= 0 && str.indexOf('data:') === 0;
};

const isEmptyObject = (obj) => {
    if (isObject(obj)) {
        return Object.keys(obj).length === 0;
    }
    return false;
};
const isEmptyArray = (obj) => {
    if (isArray(obj)) {
        return obj.length === 0;
    }
    return false;
};


module.exports = {
    isFunction,
    isObject,
    isArray,
    isString,
    isBoolean,
    isUndefined,
    isNumber
};