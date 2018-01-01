(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _defaults = require('./../data/defaults.js');

var _defaults2 = _interopRequireDefault(_defaults);

var _data = require('./../data/data.js');

var _data2 = _interopRequireDefault(_data);

var _helpers = require('./../utils/helpers.js');

var _helpers2 = _interopRequireDefault(_helpers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var VtexWishlist = function () {
    /**
     * Create a new VtexWishlist
     */
    function VtexWishlist() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, VtexWishlist);

        this.options = _helpers2.default.extend({}, _defaults2.default, _helpers2.default.isPlainObject(options) && options);
        // this.masterdata = new Masterdata(options.storeName, options.wishlistEntity);
        this.validate();
        this.init();
    }

    _createClass(VtexWishlist, [{
        key: 'validate',
        value: function validate() {
            // Validate Store.js
            if (typeof window.store === 'undefined') {
                throw new Error('Store.js is required. Download it from https://www.npmjs.com/package/store');
            }

            if (window.store.version < '2.0.12') {
                throw new Error('Store.js 2.0.12 is required. Download it from https://www.npmjs.com/package/store');
            }

            // Validate VtexHelpers
            if (typeof window.VtexHelpers === 'undefined') {
                throw new Error('VtexHelpers is required. Download it from https://www.npmjs.com/package/vtex-helpers');
            }

            // Validate store name
            if (!this.options.storeName || !_helpers2.default.isString(this.options.storeName)) {
                throw new Error('The option "storeName" is required and must be a string.');
            }

            // Validate wishlist entity
            if (!this.options.wishlistEntity || !_helpers2.default.isString(this.options.wishlistEntity)) {
                throw new Error('The option "wishlistEntity" is required and must be a string.');
            }

            // Validate shelf id
            if (!this.options.shelfId || !_helpers2.default.isString(this.options.shelfId)) {
                throw new Error('The option "shelfId" is required and must be a string.');
            }

            if (this.options.notFound === null) {
                this.options.notFound = function () {
                    return '<div class="wishlist__not-found">Nenhum produto em sua lista</div>';
                };
            } else {
                if (!_helpers2.default.isFunction(this.options.notFound)) {
                    throw new Error('The option "notFound" must be a function.');
                }

                this.options.notFound.call(this);
            }
        }
    }, {
        key: 'init',
        value: function init() {
            var _this = this;

            this.storageName = _helpers2.default.strReplace(['{storeName}', '-'], [this.options.storeName, '_'], _data2.default.storageName);
            this.storage = window.store;
            this.vtexHelpers = new VtexHelpers();

            this.initStorage();
            this.storageObserve();
            this.setWishlistProduct();
            this.setUserEmail();

            $(document).on('ajaxStop', function () {
                return _this.storageObserve();
            });
        }
    }, {
        key: 'setWishlistProduct',
        value: function setWishlistProduct() {
            var _this2 = this;

            $(document).on('click', '[data-wishlist-add]', function (ev) {
                ev.preventDefault();
                var $this = $(ev.currentTarget);
                var productId = $this.data('wishlistProductId');

                if (!_this2.checkUserEmail()) {
                    _this2.getUserEmail();

                    return false;
                }

                $this.addClass(_this2.options.loaderClass);

                if ($this.hasClass(_this2.options.activeClass)) {
                    setTimeout(function () {
                        $this.removeClass(_this2.options.activeClass);
                        $this.attr('title', _this2.options.linkTitle.add);
                        _this2.deleteWishlistProducts(productId);
                        $this.removeClass(_this2.options.loaderClass);
                    }, 1000);

                    return false;
                }

                setTimeout(function () {
                    $this.addClass(_this2.options.activeClass);
                    $this.attr('title', _this2.options.linkTitle.remove);
                    _this2.saveWishlistProducts(productId);
                    $this.removeClass(_this2.options.loaderClass);
                }, 1000);
            });
        }
    }, {
        key: 'checkUserEmail',
        value: function checkUserEmail() {
            var storeVal = this.storage.get(this.storageName);

            if (storeVal.userEmail === null) {
                return false;
            }

            return true;
        }
    }, {
        key: 'getUserEmail',
        value: function getUserEmail() {
            var _this3 = this;

            this.vtexHelpers.checkLogin().done(function (user) {}).fail(function (err) {
                if (!err.IsUserDefined) {
                    _this3.vtexHelpers.openPopupLogin();
                }
            });
        }
    }, {
        key: 'setUserEmail',
        value: function setUserEmail() {
            var _this4 = this;

            this.vtexHelpers.checkLogin().done(function (user) {
                if (user.IsUserDefined) {
                    var storeVal = _this4.storage.get(_this4.storageName);
                    storeVal.userEmail = user.Email;
                    _this4.storage.set(_this4.storageName, storeVal);
                }
            }).fail(function (err) {});
        }
    }, {
        key: 'saveWishlistProducts',
        value: function saveWishlistProducts(productId) {
            var storeVal = this.storage.get(this.storageName);
            var isProductAdded = storeVal.productsId.some(function (elem) {
                return elem === productId;
            });

            if (!isProductAdded) {
                storeVal.productsId.push(productId);
                this.storage.set(this.storageName, storeVal);
            }
        }
    }, {
        key: 'deleteWishlistProducts',
        value: function deleteWishlistProducts(productId) {
            var storeVal = this.storage.get(this.storageName);
            var isProductAdded = storeVal.productsId.some(function (elem) {
                return elem === productId;
            });

            if (isProductAdded) {
                var filteredProducts = storeVal.productsId.filter(function (_productId) {
                    return _productId !== productId;
                });
                storeVal.productsId = filteredProducts;

                this.storage.set(this.storageName, storeVal);
            }
        }
    }, {
        key: 'initStorage',
        value: function initStorage() {
            if (this.storage.get(this.storageName) === undefined) {
                this.storage.set(this.storageName, {
                    userEmail: null,
                    productsId: []
                });
            }
        }
    }, {
        key: 'storageObserve',
        value: function storageObserve() {
            var _this5 = this;

            if (this.storage.get(this.storageName) !== undefined) {
                this.storage.observe(this.storageName, function (storeVal, oldVal) {
                    var $wishlistAdd = $(document).find('[data-wishlist-add]');

                    $('[data-wishlist-amount]').text(storeVal.productsId.length);

                    storeVal.productsId.map(function (productId) {
                        $wishlistAdd.map(function (i, wishlistVal) {
                            if (productId === $(wishlistVal).data('wishlistProductId')) {
                                $(wishlistVal).addClass(_this5.options.activeClass);
                            }
                        });
                    });
                });
            } else {
                $('[data-wishlist-amount]').text('0');
            }
        }
    }]);

    return VtexWishlist;
}();

exports.default = VtexWishlist;

},{"./../data/data.js":2,"./../data/defaults.js":3,"./../utils/helpers.js":5}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = {
    storageName: '{storeName}_wishlist',
    masterdataUrl: '\/\/api.vtexcrm.com.br/{storeName}/dataentities/{entity}/{type}/'
};

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = {
    appendTo: '.js--wishlist-items',
    activeClass: 'is--active',
    loaderClass: 'has--wishlist-loader',
    linkTitle: {
        add: 'Adicionar a wishlist',
        remove: 'Remover da wishlist'
    },
    notFound: null
};

},{}],4:[function(require,module,exports){
'use strict';

var _VtexWishlist = require('./class/VtexWishlist.js');

var _VtexWishlist2 = _interopRequireDefault(_VtexWishlist);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// /buscapagina?fq=productId:10001,productId:10002,productId:10003&PS=3&sl=19ccd66b-b568-43cb-a106-b52f9796f5cd&cc=1&sm=0&sc=1&PageNumber=1

if (typeof window.VtexWishlist === 'undefined') {
    window.VtexWishlist = _VtexWishlist2.default;
}

document.addEventListener('DOMContentLoaded', function () {
    new _VtexWishlist2.default({
        storeName: 'mob', // Nome da url da loja (required)
        wishlistEntity: 'WL', // Entidade de dados (required)
        shelfId: '2d5c05cd-75d7-42aa-b9b3-c4824ac2063a', // Id da vitrine que renderizará os elementos (required)
        appendTo: '.js--wishlist-items', // Classe do elemento que receberá os resultados (default)
        loaderClass: 'has--wishlist-loader', // (default)
        activeClass: 'is--active', // (default)
        linkTitle: {
            add: 'Adicionar a wishlist',
            remove: 'Remover da wishlist'
        },
        notFound: function notFound() {
            return '<div class="wishlist__not-found">Nenhum produto em sua lista</div>';
        } // Element to append if no results (default)
    });
});

},{"./class/VtexWishlist.js":1}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = {
    /**
     * Extend the given object.
     * @param {*} obj - The object to be extended.
     * @param {*} args - The rest objects which will be merged to the first object.
     * @returns {Object} The extended object.
     */
    extend: function extend(obj) {
        var _this = this;

        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
        }

        if (this.isObject(obj) && args.length > 0) {
            if (Object.assign) {
                return Object.assign.apply(Object, [obj].concat(args));
            }

            args.forEach(function (arg) {
                if (_this.isObject(arg)) {
                    Object.keys(arg).forEach(function (key) {
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
    isString: function isString(value) {
        return typeof value === 'string';
    },


    /**
     * Check if the given value is a number.
     * @param {*} value - The value to check.
     * @returns {boolean} Returns `true` if the given value is a number, else `false`.
     */
    isNumber: function isNumber(value) {
        return typeof value === 'number' && !isNaN(value);
    },


    /**
     * Check if the given value is undefined.
     * @param {*} value - The value to check.
     * @returns {boolean} Returns `true` if the given value is undefined, else `false`.
     */
    isUndefined: function isUndefined(value) {
        return typeof value === 'undefined';
    },


    /**
     * Check if the given value is an object.
     * @param {*} value - The value to check.
     * @returns {boolean} Returns `true` if the given value is an object, else `false`.
     */
    isObject: function isObject(value) {
        return (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && value !== null;
    },


    /**
     * Check if the given value is a plain object.
     * @param {*} value - The value to check.
     * @returns {boolean} Returns `true` if the given value is a plain object, else `false`.
     */
    isPlainObject: function isPlainObject(value) {
        if (!this.isObject(value)) {
            return false;
        }

        try {
            var _constructor = value.constructor;
            var prototype = _constructor.prototype;


            return _constructor && prototype && hasOwnProperty.call(prototype, 'isPrototypeOf');
        } catch (e) {
            return false;
        }
    },


    /**
     * Check if the given value is a function.
     * @param {*} value - The value to check.
     * @returns {boolean} Returns `true` if the given value is a function, else `false`.
     */
    isFunction: function isFunction(value) {
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
    strReplace: function strReplace(search, replace, subject) {
        var regex = void 0;
        if (search instanceof Array) {
            for (var i = 0; i < search.length; i++) {
                search[i] = search[i].replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
                regex = new RegExp(search[i], 'g');
                subject = subject.replace(regex, replace instanceof Array ? replace[i] : replace);
            }
        } else {
            search = search.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
            regex = new RegExp(search, 'g');
            subject = subject.replace(regex, replace instanceof Array ? replace[0] : replace);
        }

        return subject;
    }
};

},{}]},{},[4]);
