
/*!!
 * VtexWishlist.js v0.1.0
 * https://github.com/zeindelf/vtex-wishlist
 *
 * Copyright (c) 2017-2018 Zeindelf
 * Released under the MIT license
 *
 * Date: 2018-03-12T06:34:24.578Z
 */

'use strict';

var vtexUtilsVersion = '1.2.0';

var CONSTANTS = {
    DELAY_TIME: 150, // Miliseconds
    STORAGE_NAME: '__vtexWishlist.attributes__',
    SESSION_NAME: '__vtexWishlist.session__',
    RETRIEVED_DATA: ['wishlistProducts'],
    MESSAGES: {
        vtexUtils: 'VtexUtils.js is required and must be an instance. Download it from https://www.npmjs.com/package/vtex-utils',
        vtexUtilsVersion: vtexUtilsVersion,
        vtexUtilsVersionMessage: 'VtexUtils version must be higher than ' + vtexUtilsVersion + '. Download last version on https://www.npmjs.com/package/vtex-utils',
        vtexMasterdata: 'VtexMasterdata.js is required. Download it from https://www.npmjs.com/package/vtex-masterdata',
        storeName: 'The option \'storeName\' is required and must be a string.',
        shelfId: 'The option \'shelfId\' is required and must be a string.',
        notFound: 'The option \'notFound\' must be a function.'
    }
};

var DEFAULTS = {
    activeClass: 'is--active',
    inactiveClass: 'is--inactive',
    loaderClass: 'has--wishlist-loader',
    linkTitle: {
        add: 'Adicionar a wishlist',
        remove: 'Remover da wishlist'
    },
    order: 'OrderByPriceASC',
    notFound: null,
    zeroPadding: false
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var Private = function () {
    function Private() {
        classCallCheck(this, Private);
    }

    createClass(Private, [{
        key: '_setInstance',
        value: function _setInstance(self) {
            this._self = self;
            this._vtexHelpers = self.vtexHelpers;
            this._globalHelpers = self.globalHelpers;
            this._vtexMasterdata = self.vtexMasterdata;
            this._vtexCatalog = self.vtexCatalog;

            this._storage = self.storage;
            this._session = self.storage.session;
        }

        /**
         * Init and validate Storage / Session
         * @return {Void}
         */

    }, {
        key: '_initStorage',
        value: function _initStorage() {
            var sessionOptions = {
                userDefined: false
            };

            var storageOptions = {
                userEmail: null,
                userId: null,
                productsId: []
            };

            if (this._globalHelpers.isNull(this._storage.get(CONSTANTS.STORAGE_NAME))) {
                this._storage.set(CONSTANTS.STORAGE_NAME, storageOptions);
            }

            if (this._globalHelpers.isNull(this._session.get(CONSTANTS.SESSION_NAME))) {
                this._session.set(CONSTANTS.SESSION_NAME, sessionOptions);
            }
        }

        /**
         * **********************************************
         * SET PRODUCTS ACTIONS
         * **********************************************
         */

    }, {
        key: '_setWishlistProduct',
        value: function _setWishlistProduct() {
            var _this = this;

            var setData = function setData(ev) {
                ev.preventDefault();

                var $this = $(ev.currentTarget);
                var productId = $this.data('wishlistProductId');

                // Validate Session Ended / Local persisted
                var storeVal = _this._storage.get(CONSTANTS.STORAGE_NAME);
                var sessionVal = _this._session.get(CONSTANTS.SESSION_NAME);
                if (!sessionVal.userDefined && _this._globalHelpers.length(storeVal.productsId) > 0) {
                    // Buscar produtos do masterdata
                    _this._setWishlistUser();
                    _this._vtexHelpers.openPopupLogin(true);

                    return false;
                }

                if (!_this._checkUserEmail()) {
                    _this._vtexHelpers.openPopupLogin(true);

                    return false;
                }

                $this.addClass(_this._self.options.loaderClass);
                $(':button').prop('disabled', true);

                _this._removeWishlistProduct(productId, $this);
                _this._addWishlistProduct(productId, $this);
            };

            $(document).on('click', '[data-wishlist-add]', this._globalHelpers.debounce(setData, 70));
        }
    }, {
        key: '_addWishlistProduct',
        value: function _addWishlistProduct(productId, $context) {
            var _this2 = this;

            var storeVal = this._storage.get(CONSTANTS.STORAGE_NAME);
            var isProductAdded = storeVal.productsId.some(function (elem) {
                return elem === productId;
            });

            if (!isProductAdded) {
                this._requestStartEvent();
                this._requestAddStartEvent();

                storeVal.productsId.push(productId);
                this._storage.set(CONSTANTS.STORAGE_NAME, storeVal);

                this._vtexMasterdata.updateUser(storeVal.userEmail, { wishlistProducts: JSON.stringify(storeVal.productsId) }).done(function (res) {
                    $context.addClass(_this2._self.options.activeClass);
                    $context.attr('title', _this2._self.options.linkTitle.remove);
                    $context.removeClass(_this2._self.options.loaderClass);
                    $(':button').prop('disabled', false);

                    _this2._requestEndEvent(productId);
                    _this2._requestAddEndEvent(productId);
                    _this2._storageObserve();
                }).fail(function (err) {
                    return window.console.log(err);
                });
            }
        }
    }, {
        key: '_removeWishlistProduct',
        value: function _removeWishlistProduct(productId, $context) {
            var _this3 = this;

            var storeVal = this._storage.get(CONSTANTS.STORAGE_NAME);
            var isProductAdded = storeVal.productsId.some(function (elem) {
                return elem === productId;
            });
            var filteredProducts = storeVal.productsId.filter(function (_productId) {
                return _productId !== productId;
            });

            if ($context.hasClass(this._self.options.activeClass)) {
                this._requestStartEvent();
                this._requestRemoveStartEvent();

                if (isProductAdded) {
                    this._vtexMasterdata.updateUser(storeVal.userEmail, { wishlistProducts: JSON.stringify(filteredProducts) }).done(function (res) {
                        $context.removeClass(_this3._self.options.activeClass);
                        $context.attr('title', _this3._self.options.linkTitle.add);

                        storeVal.productsId = filteredProducts;

                        _this3._storage.set(CONSTANTS.STORAGE_NAME, storeVal);

                        $context.removeClass(_this3._self.options.loaderClass);
                        $(':button').prop('disabled', false);

                        // Remove class of all products
                        var $wishlistAdd = $(document).find('[data-wishlist-add]');
                        $wishlistAdd.map(function (index, wishlistVal) {
                            if (productId === $(wishlistVal).data('wishlistProductId')) {
                                $(wishlistVal).removeClass(_this3._self.options.activeClass);
                            }
                        });

                        _this3._requestEndEvent(productId);
                        _this3._requestRemoveEndEvent(productId);
                        _this3._storageObserve();
                    }).fail(function (err) {
                        return window.console.log(err);
                    });
                }

                return false;
            }
        }
    }, {
        key: '_clearWishlist',
        value: function _clearWishlist() {
            var _this4 = this;

            $(document).on('click', '[data-wishlist-clear]', function (ev) {
                ev.preventDefault();
                // const $this = $(ev.currentTarget);
                var $wishlistAdd = $(document).find('[data-wishlist-add]');
                var storeVal = _this4._storage.get(CONSTANTS.STORAGE_NAME);

                if (storeVal.productsId.length < 1) {
                    // $this.addClass(this._self.options.inactiveClass)
                    //     .prop('disabled', true);

                    return false;
                }

                _this4._beforeClearItemsEvent();
                storeVal.productsId = [];
                _this4._storage.set(CONSTANTS.STORAGE_NAME, storeVal);

                _this4._vtexMasterdata.updateUser(storeVal.userEmail, { wishlistProducts: '[]' }).done(function (res) {
                    $wishlistAdd.map(function (index, wishlistVal) {
                        return $(wishlistVal).removeClass(_this4._self.options.activeClass);
                    });
                    _this4._storageObserve();
                    _this4._renderProducts();
                }).fail(function (err) {
                    return window.console.log(err);
                }).always(function () {
                    return _this4._afterClearItemsEvent();
                });
            });
        }
    }, {
        key: '_storageObserve',
        value: function _storageObserve() {
            var _this5 = this;

            var storeVal = this._storage.get(CONSTANTS.STORAGE_NAME);

            this._setUserData();

            if (!this._globalHelpers.isNull(storeVal)) {
                var $wishlistAdd = $(document).find('[data-wishlist-add]');

                $('[data-wishlist-amount]').html(this._setPadding(storeVal.productsId.length));

                storeVal.productsId.map(function (productId) {
                    $wishlistAdd.map(function (index, wishlistVal) {
                        if (productId === $(wishlistVal).data('wishlistProductId')) {
                            $(wishlistVal).addClass(_this5._self.options.activeClass);
                        }
                    });
                });
            } else {
                $('[data-wishlist-amount]').html(this._setPadding(0));
            }
        }
    }, {
        key: '_checkUserEmail',
        value: function _checkUserEmail() {
            var storeVal = this._storage.get(CONSTANTS.STORAGE_NAME);

            if (storeVal.userEmail === null) {
                return false;
            }

            return true;
        }
    }, {
        key: '_setUserData',
        value: function _setUserData() {
            var _this6 = this;

            var storeVal = this._storage.get(CONSTANTS.STORAGE_NAME);
            var sessionVal = this._session.get(CONSTANTS.SESSION_NAME);

            if (!sessionVal.userDefined && this._globalHelpers.length(storeVal.productsId) > 0) {
                return false;
            }

            this._vtexHelpers.checkLogin().done(function (user) {
                storeVal.userEmail = user.Email;
                storeVal.userId = user.UserId;

                _this6._storage.set(CONSTANTS.STORAGE_NAME, storeVal);

                if (!sessionVal.userDefined) {
                    _this6._setWishlistUser();
                }
            });
        }
    }, {
        key: '_setWishlistUser',
        value: function _setWishlistUser() {
            var _this7 = this;

            this._checkWishlistUser().done(function (res) {
                if (res.hasUser) {
                    var storeVal = _this7._storage.get(CONSTANTS.STORAGE_NAME);
                    var sessionVal = _this7._session.get(CONSTANTS.SESSION_NAME);

                    storeVal.productsId = JSON.parse(res.userData.wishlistProducts || '[]');
                    sessionVal.userDefined = true;

                    _this7._storage.set(CONSTANTS.STORAGE_NAME, storeVal);
                    _this7._session.set(CONSTANTS.SESSION_NAME, sessionVal);

                    setTimeout(function () {
                        return _this7._storageObserve();
                    }, CONSTANTS.DELAY_TIME);
                }
            }).fail(function (err) {
                return window.console.log(err);
            });
        }
    }, {
        key: '_checkWishlistUser',
        value: function _checkWishlistUser() {
            var _this8 = this;

            var storeVal = this._storage.get(CONSTANTS.STORAGE_NAME);
            var sessionVal = this._session.get(CONSTANTS.SESSION_NAME);
            var response = { hasUser: false, userData: null };

            /* eslint-disable */
            return $.Deferred(function (def) {
                /* eslint-enable */
                if (sessionVal.userDefined) {
                    return false;
                }

                return _this8._vtexMasterdata.getUser(storeVal.userEmail, CONSTANTS.RETRIEVED_DATA).done(function (res) {
                    if (_this8._globalHelpers.length(res.result.dataResponse) > 0) {
                        response.hasUser = true;
                        response.userData = res.result.dataResponse;
                    }

                    def.resolve(response);
                }).fail(function (error) {
                    return def.reject(error);
                });
            }).promise();
        }

        /**
         * **********************************************
         * SHOW PRODUCTS
         * **********************************************
         */

    }, {
        key: '_renderProducts',
        value: function _renderProducts() {
            var _this9 = this;

            var order = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

            var $wishlistItems = $('[data-wishlist-items');
            var $wishlistOrder = $('[data-wishlist-order]');
            var $wishlistContainer = $('<ul class="vw-wishlist__items"></ul>');
            var storeVal = this._storage.get(CONSTANTS.STORAGE_NAME);
            var splitList = true;
            var params = {
                fq: storeVal.productsId,
                shelfId: this._self.options.shelfId,
                order: order || this._self.options.order
            };

            this._beforeShowItemsEvent();

            if (storeVal.productsId.length < 1) {
                $wishlistOrder.addClass(this._self.options.inactiveClass);
                $wishlistItems.empty().append(this._self.options.notFound);

                this._afterShowItemsEvent();

                return false;
            }

            this._vtexCatalog.searchPage(params, splitList).then(function (res) {
                $wishlistOrder.removeClass(_this9._self.options.inactiveClass);
                $wishlistItems.empty().append($wishlistContainer.append(res));

                _this9._storageObserve();
            }).fail(function (err) {
                return window.console.log(err);
            }).always(function () {
                return _this9._afterShowItemsEvent();
            });
        }
    }, {
        key: '_changeOrder',
        value: function _changeOrder() {
            var _this10 = this;

            var $wishlistOrder = $('[data-wishlist-order]');

            $wishlistOrder.find('input').on('change', function (ev) {
                ev.preventDefault();

                var $this = $(ev.currentTarget);
                var value = $this.val();

                _this10._renderProducts(value);
            });
        }

        /**
        * **********************************************
        * HELPERS
        * **********************************************
        */

    }, {
        key: '_setPadding',
        value: function _setPadding(qty) {
            return this._self.options.zeroPadding ? this._self.globalHelpers.pad(qty) : qty;
        }

        /**
         * **********************************************
         * CUSTOM EVENTS
         * **********************************************
         */

    }, {
        key: '_requestStartEvent',
        value: function _requestStartEvent() {
            /* eslint-disable */
            var ev = $.Event('requestStart.vtexWishlist');
            /* eslint-enable */

            $(document).trigger(ev);
        }
    }, {
        key: '_requestAddStartEvent',
        value: function _requestAddStartEvent() {
            /* eslint-disable */
            var ev = $.Event('requestAddStart.vtexWishlist');
            /* eslint-enable */

            $(document).trigger(ev);
        }
    }, {
        key: '_requestRemoveStartEvent',
        value: function _requestRemoveStartEvent() {
            /* eslint-disable */
            var ev = $.Event('requestRemoveStart.vtexWishlist');
            /* eslint-enable */

            $(document).trigger(ev);
        }
    }, {
        key: '_requestEndEvent',
        value: function _requestEndEvent(productId) {
            /* eslint-disable */
            var ev = $.Event('requestEnd.vtexWishlist');
            /* eslint-enable */

            $(document).trigger(ev, [productId]);
        }
    }, {
        key: '_requestAddEndEvent',
        value: function _requestAddEndEvent(productId) {
            /* eslint-disable */
            var ev = $.Event('requestAddEnd.vtexWishlist');
            /* eslint-enable */

            $(document).trigger(ev, [productId]);
        }
    }, {
        key: '_requestRemoveEndEvent',
        value: function _requestRemoveEndEvent(productId) {
            /* eslint-disable */
            var ev = $.Event('requestRemoveEnd.vtexWishlist');
            /* eslint-enable */

            $(document).trigger(ev, [productId]);
        }
    }, {
        key: '_beforeShowItemsEvent',
        value: function _beforeShowItemsEvent() {
            /* eslint-disable */
            var ev = $.Event('beforeShowItems.vtexWishlist');
            /* eslint-enable */

            $(document).trigger(ev);
        }
    }, {
        key: '_afterShowItemsEvent',
        value: function _afterShowItemsEvent() {
            /* eslint-disable */
            var ev = $.Event('afterShowItems.vtexWishlist');
            /* eslint-enable */

            $(document).trigger(ev);
        }
    }, {
        key: '_beforeClearItemsEvent',
        value: function _beforeClearItemsEvent() {
            /* eslint-disable */
            var ev = $.Event('beforeClearItems.vtexWishlist');
            /* eslint-enable */

            $(document).trigger(ev);
        }
    }, {
        key: '_afterClearItemsEvent',
        value: function _afterClearItemsEvent() {
            /* eslint-disable */
            var ev = $.Event('afterClearItems.vtexWishlist');
            /* eslint-enable */

            $(document).trigger(ev);
        }
    }]);
    return Private;
}();

var _private = new Private();

var vtexWishlistMethods = {
    setOptions: function setOptions() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        /**
         * Set Options Dependencies
         */
        this.options = this.globalHelpers.extend({}, DEFAULTS, this.globalHelpers.isPlainObject(options) && options);

        // Validate store name
        if (!this.options.storeName || !this.globalHelpers.isString(this.options.storeName)) {
            throw new Error(CONSTANTS.MESSAGES.storeName);
        }

        // Validate shelf id
        if (!this.options.shelfId || !this.globalHelpers.isString(this.options.shelfId)) {
            throw new Error(CONSTANTS.MESSAGES.shelfId);
        }

        if (this.options.notFound === null) {
            this.options.notFound = function () {
                return '<div class="wishlist__not-found">Nenhum produto em sua lista</div>';
            };
        } else {
            if (!this.globalHelpers.isFunction(this.options.notFound)) {
                throw new Error(CONSTANTS.MESSAGES.notFound);
            }

            this.options.notFound.call(this);
        }

        /**
         * Set Masterdata Store Name
         */
        this.vtexMasterdata.setStore(this.options.storeName);

        _private._setInstance(this);
        this._initWishlist();
    },
    _initWishlist: function _initWishlist() {
        var _this = this;

        _private._initStorage();
        _private._storageObserve();
        _private._setWishlistProduct();
        _private._changeOrder();
        _private._clearWishlist();

        $(window).on('authenticatedUser.vtexid', function (ev) {
            return setTimeout(function () {
                return _this.update();
            }, CONSTANTS.DELAY_TIME);
        });
        $(window).on('closed.vtexid', function (ev) {
            return setTimeout(function () {
                return _this.update();
            }, CONSTANTS.DELAY_TIME);
        });

        $(document).on('requestAddEnd.vtexWishlist', function (ev, productId) {
            return _private._renderProducts();
        });
        $(document).on('requestRemoveEnd.vtexWishlist', function (ev, productId) {
            return _private._renderProducts();
        });
    },
    update: function update() {
        _private._storageObserve();
        _private._renderProducts();
    },
    renderProducts: function renderProducts() {
        _private._renderProducts();
    }
};

/**
 * Create a VtexWishlist class
 * Vtex utilities methods
 */

var VtexWishlist = function VtexWishlist(vtexUtils, vtexMasterdata, VtexCatalog) {
  var catalogCache = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  classCallCheck(this, VtexWishlist);

  /**
   * Version
   * @type {String}
   */
  this.version = '0.1.0';

  /**
   * Package name
   * @type {String}
   */
  this.name = '@VtexWishlist';

  // Validate VtexUtils.js
  if (vtexUtils === undefined) {
    throw new TypeError(CONSTANTS.MESSAGES.vtexUtils);
  }

  if (vtexUtils.name !== '@VtexUtils') {
    throw new TypeError(CONSTANTS.MESSAGES.vtexUtils);
  }

  if (vtexUtils.version < CONSTANTS.MESSAGES.vtexUtilsVersion) {
    throw new Error(CONSTANTS.MESSAGES.vtexUtilsVersionMessage);
  }

  /**
   * Global Helpers instance
   * @type {GlobalHelpers}
   */
  this.globalHelpers = vtexUtils.globalHelpers;

  /**
   * Vtex Helpers instance
   * @type {VtexHelpers}
   */
  this.vtexHelpers = vtexUtils.vtexHelpers;

  // Validate VtexMasterdata.js
  if (vtexMasterdata === undefined) {
    throw new Error(CONSTANTS.MESSAGES.vtexMasterdata);
  }

  /**
   * Vtex Masterdata instance
   * @type {VtexMasterdata}
   */
  this.vtexMasterdata = vtexMasterdata;

  /**
   * Vtex Catalog instance
   * @type {VtexCatalog}
   */
  this.vtexCatalog = new VtexCatalog(vtexUtils, catalogCache);

  /**
   * Local/Session Storage
   * @type {Object}
   */
  this.storage = vtexUtils.storage;

  /**
   * Extend public methods
   * @type {Method}
   */
  this.globalHelpers.extend(VtexWishlist.prototype, vtexWishlistMethods);
};

module.exports = VtexWishlist;
