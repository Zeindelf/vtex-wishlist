
export default {
    /**
     * Extend the given object.
     * @param {*} obj - The object to be extended.
     * @param {*} args - The rest objects which will be merged to the first object.
     * @returns {Object} The extended object.
     */
    extend(obj, ...args) {
        if ( this.isObject(obj) && args.length > 0 ) {
            if ( Object.assign ) {
                return Object.assign(obj, ...args);
            }

            args.forEach((arg) => {
                if ( this.isObject(arg) ) {
                    Object.keys(arg).forEach((key) => {
                        obj[key] = arg[key];
                    });
                }
            });
        }

        return obj;
    },

    /**
     * Check if the given value is a string.
     * @param {*} value - The value to check.
     * @returns {boolean} Returns `true` if the given value is a string, else `false`.
     */
    isString(value) {
        return typeof value === 'string';
    },

    /**
     * Check if the given value is a number.
     * @param {*} value - The value to check.
     * @returns {boolean} Returns `true` if the given value is a number, else `false`.
     */
    isNumber(value) {
        return typeof value === 'number' && ! isNaN(value);
    },

    /**
     * Check if the given value is undefined.
     * @param {*} value - The value to check.
     * @returns {boolean} Returns `true` if the given value is undefined, else `false`.
     */
    isUndefined(value) {
        return typeof value === 'undefined';
    },

    /**
     * Check if the given value is an object.
     * @param {*} value - The value to check.
     * @returns {boolean} Returns `true` if the given value is an object, else `false`.
     */
    isObject(value) {
        return typeof value === 'object' && value !== null;
    },

    /**
     * Check if the given value is a plain object.
     * @param {*} value - The value to check.
     * @returns {boolean} Returns `true` if the given value is a plain object, else `false`.
     */
    isPlainObject(value) {
        if ( ! this.isObject(value) ) {
            return false;
        }

        try {
            const { constructor } = value;
            const { prototype } = constructor;

            return constructor && prototype && hasOwnProperty.call(prototype, 'isPrototypeOf');
        } catch (e) {
            return false;
        }
    },

    /**
     * Check if the given value is a function.
     * @param {*} value - The value to check.
     * @returns {boolean} Returns `true` if the given value is a function, else `false`.
     */
    isFunction(value) {
        return typeof value === 'function';
    },

    /**
     * Multiple string replace, PHP str_replace clone
     * @param {string|Array} search - The value being searched for, otherwise known as the needle. An array may be used to designate multiple needles.
     * @param {string|Array} replace - The replacement value that replaces found search values. An array may be used to designate multiple replacements.
     * @param {string} subject - The subject of the replacement
     * @returns {string} The modified string
     * @example strReplace(["olá", "mundo"], ["hello", "world"], "olá mundo"); //Output "hello world"
     *      strReplace(["um", "dois"], "olá", "um dois três"); // Output "olá olá três"
     */
    strReplace(search, replace, subject) {
        let regex;
        if ( search instanceof Array ) {
            for ( let i = 0; i < search.length; i++ ) {
                search[i] = search[i].replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
                regex = new RegExp(search[i], 'g');
                subject = subject.replace(regex, (replace instanceof Array ? replace[i] : replace));
            }
        } else {
            search = search.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
            regex = new RegExp(search, 'g');
            subject = subject.replace(regex, (replace instanceof Array ? replace[0] : replace));
        }

        return subject;
    },
};
