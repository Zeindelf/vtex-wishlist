
/*!!
 * VtexWishlist.js v0.6.1
 * https://github.com/zeindelf/vtex-wishlist
 *
 * Copyright (c) 2017-2018 Zeindelf
 * Released under the MIT license
 *
 * Date: 2018-10-02T23:07:39.195Z
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.VTEX = global.VTEX || {}, global.VTEX.VtexWishlist = factory());
}(this, (function () { 'use strict';

var vtexCatalogVersion = '1.0.0';

var CONSTANTS = {
    DELAY_TIME: 100, // Miliseconds
    EXPIRE_TIME: 60 * 60 * 4, // Seconds * Minutes * Hours (default: 4h)
    STORAGE_NAME: '_vw_attributes',
    SESSION_NAME: '_vw_session',
    RETRIEVED_DATA: ['wishlistProducts'],
    MESSAGES: {
        vtexUtils: 'VtexUtils.js is required. Download it from https://www.npmjs.com/package/vtex-utils',
        vtexMasterdata: 'VtexMasterdata.js is required. Download it from https://www.npmjs.com/package/vtex-masterdata',
        vtexCatalog: 'VtexCatalog.js is required. Download it from https://www.npmjs.com/package/vtex-catalog',
        vtexCatalogVersion: vtexCatalogVersion,
        vtexCatalogVersionMessage: 'VtexCatalog version must be higher than ' + vtexCatalogVersion + '. Download last version on https://www.npmjs.com/package/vtex-catalog',

        shelfId: 'The option \'shelfId\' is required and must be a string.',
        notFound: 'The option \'notFound\' must be a function.',
        wishlistItems: 'You\'ll need declare an container with data attribute \'<div data-wishlist-items=""></div>\' to append your list.'
    },
    EVENTS: {
        REQUEST_START: 'requestStart.vtexWishlist',
        REQUEST_ADD_START: 'requestAddStart.vtexWishlist',
        REQUEST_REMOVE_START: 'requestRemoveStart.vtexWishlist',
        REQUEST_END: 'requestEnd.vtexWishlist',
        REQUEST_ADD_END: 'requestAddEnd.vtexWishlist',
        REQUEST_REMOVE_END: 'requestRemoveEnd.vtexWishlist',
        BEFORE_SHOW_ITEMS: 'beforeShowItems.vtexWishlist',
        AFTER_SHOW_ITEMS: 'afterShowItems.vtexWishlist',
        BEFORE_ORDER_BY_ITEMS: 'beforeOrderByItems.vtexWishlist',
        AFTER_ORDER_BY_ITEMS: 'afterOrderByItems.vtexWishlist',
        BEFORE_CLEAR_ITEMS: 'beforeClearItems.vtexWishlist',
        AFTER_CLEAR_ITEMS: 'afterClearItems.vtexWishlist'
    },
    BODY: $('body')
};

var DEFAULTS = {
    orderBy: 'OrderByPriceASC',
    notFound: null,
    zeroPadding: false,
    reloadPage: true,

    perPage: 12,

    linkTitle: {
        add: 'Adicionar a wishlist',
        remove: 'Remover da wishlist'
    },

    wishlistPage: 'is--wishlist-page',
    activeClass: 'is--active',
    emptyClass: 'is--wishlist-empty',
    loaderClass: 'has--wishlist-loader',
    addLoaderClass: 'has--wishlist-add-loader',
    removeLoaderClass: 'has--wishlist-remove-loader',
    clearLoaderClass: 'has--wishlist-clear-loader',
    itemsClass: 'wishlist__items',
    itemClass: 'wishlist__item',

    orderByBodyClass: 'has--wishlist-order-by',

    loadMoreBodyClass: 'has--wishlist-load-more',
    loadMoreWrapperClass: 'wishlist__load-more-wrapper',
    loadMoreBtnClass: 'wishlist__load-more-btn',
    loadMoreText: 'Carregar mais'
};

var renderProducts = {
    /**
     * Render Wishlist products
     * @param  {Number} page Get specific page
     *
     * @example
     *     // The element to receive data may be a empty list with data attribute 'data-wishlist-items'
     *     <ul class="wishlist__items" data-wishlist-items="data-wishlist-items"></ul>
     */
    _renderProducts: function _renderProducts() {
        var _this = this;

        var page = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

        var $wishlistItems = $('[data-wishlist-items]');
        var storeVal = this._storage.get(CONSTANTS.STORAGE_NAME);
        var splitList = true;
        var params = {
            quantity: this._self.options.perPage * page,
            fq: storeVal.productsId,
            shelfId: this._self.options.shelfId,
            order: this._self.options.orderBy
        };

        if ($wishlistItems.length < 1) {
            // Container doesn't exists
            return false;
        }

        $(document).trigger(CONSTANTS.EVENTS.BEFORE_SHOW_ITEMS);

        if (storeVal.productsId.length < 1) {
            this._setEmptyAttr($wishlistItems);
            return false;
        }

        this._vtexCatalog.searchPage(params, splitList).then(function ($item) {
            if ($item.length < 1) {
                _this._setEmptyAttr($wishlistItems);
                return false;
            }

            $item.removeClass('first last').addClass(_this._self.options.itemClass);

            _this._removeEmptyClass();

            $wishlistItems.empty().append($item);

            _this._storageObserve();
        }).fail(function (err) {
            return window.console.log(err);
        }).always(function () {
            _this._removeLoadMoreClass();

            $(document).trigger(CONSTANTS.EVENTS.AFTER_SHOW_ITEMS);
        });
    },


    /**
     * Change order
     *
     * @example
     *     <nav class="wishlist__order" data-wishlist-order="data-wishlist-order-by">
     *         <label><span>Menor Preço</span>
     *             <input name="orderby" type="radio" value="OrderByPriceASC"/>
     *         </label>
     *         <!-- More Options... -->
     *     </nav>
     */
    _changeOrder: function _changeOrder() {
        var _this2 = this;

        var $wishlistOrderBy = $('[data-wishlist-order-by]');

        $wishlistOrderBy.find('input').on('change', function (ev) {
            ev.preventDefault();
            ev.stopPropagation();

            var $this = $(ev.target);
            var value = $this.val();

            $(document).trigger(CONSTANTS.EVENTS.BEFORE_ORDER_BY_ITEMS);

            _this2._addOrderByClass();
            _this2._resetLoadMoreBtn();
            _this2._setUrlHash();

            $this.parent('label').addClass(_this2._self.options.activeClass);
            $this.parent('label').siblings().removeClass(_this2._self.options.activeClass);
            _this2._self.options.orderBy = value;
            _this2._renderProducts();

            $(document).one('afterShowItems.vtexWishlist', function (ev) {
                $(document).trigger(CONSTANTS.EVENTS.AFTER_ORDER_BY_ITEMS);
                _this2._removeOrderByClass();
            });
        });
    },
    _setEmptyAttr: function _setEmptyAttr($wishlistItems) {
        this._addEmptyClass();
        $wishlistItems.empty().append(this._self.options.notFound);

        $(document).trigger(CONSTANTS.EVENTS.AFTER_SHOW_ITEMS);
    }
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





var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var pagination = {
    _splitPages: function _splitPages() {
        var storeVal = this._storage.get(CONSTANTS.STORAGE_NAME);
        var chunkItems = this._globalHelpers.chunk(storeVal.productsId, this._self.options.perPage);

        storeVal.pagination.totalPages = chunkItems.length;
        storeVal.pagination.perPage = this._self.options.perPage;

        this._storage.set(CONSTANTS.STORAGE_NAME, storeVal);
    },


    // TODO: Create Pagination

    _createLoadMore: function _createLoadMore() {
        var _$;

        if (!CONSTANTS.BODY.hasClass(this._self.options.wishlistPage)) {
            return false;
        }

        var $loadMoreWrapper = $('<div />', { class: this._self.options.loadMoreWrapperClass });
        var $loadMoreBtn = $('<button />', (_$ = {
            class: this._self.options.loadMoreBtnClass
        }, defineProperty(_$, 'data-wishlist-page', 2), defineProperty(_$, 'data-wishlist-load-more-btn', 'data-wishlist-load-more-btn'), _$)).text(this._self.options.loadMoreText);

        $loadMoreWrapper.append($loadMoreBtn);
        $loadMoreWrapper.insertAfter('[data-wishlist-items]');
    },
    _loadMoreActions: function _loadMoreActions() {
        var _this = this;

        if (!CONSTANTS.BODY.hasClass(this._self.options.wishlistPage)) {
            return false;
        }

        $(document).on('click', '[data-wishlist-load-more-btn]', function (ev) {
            ev.preventDefault();
            ev.stopPropagation();

            var storeVal = _this._storage.get(CONSTANTS.STORAGE_NAME);
            var $this = $(ev.target);
            var page = $this.data('wishlistPage');
            var newPage = page + 1;

            _this._addLoadMoreClass();

            if (page >= storeVal.pagination.totalPages) {
                $this.hide();
            }

            _this._setUrlHash(page);
            _this._renderProducts(page);
            $this.data('wishlistPage', newPage);
        });
    },
    _setLoadMoreBtn: function _setLoadMoreBtn() {
        if (!CONSTANTS.BODY.hasClass(this._self.options.wishlistPage)) {
            return false;
        }

        var storeVal = this._storage.get(CONSTANTS.STORAGE_NAME);
        var $loadMoreBtn = $(document).find('[data-wishlist-load-more-btn]');

        if (storeVal.pagination.page >= storeVal.pagination.totalPages) {
            $loadMoreBtn.hide();
        } else {
            $loadMoreBtn.show();
        }
    },
    _resetLoadMoreBtn: function _resetLoadMoreBtn() {
        if (!CONSTANTS.BODY.hasClass(this._self.options.wishlistPage)) {
            return false;
        }

        var $loadMoreBtn = $(document).find('[data-wishlist-load-more-btn]');
        $loadMoreBtn.data('wishlistPage', 2);
    },
    _setUrlHash: function _setUrlHash(page) {
        if (!CONSTANTS.BODY.hasClass(this._self.options.wishlistPage)) {
            return false;
        }

        var storeVal = this._storage.get(CONSTANTS.STORAGE_NAME);
        var pageNumber = typeof page !== 'undefined' ? page : 1;

        storeVal.pagination.page = pageNumber;
        window.location.hash = pageNumber;
        this._storage.set(CONSTANTS.STORAGE_NAME, storeVal);
    }
};

var utils = {
    _getProducts: function _getProducts() {
        var storeVal = this._storage.get(CONSTANTS.STORAGE_NAME);

        return storeVal.productsId;
    },
    _setPadding: function _setPadding(qty) {
        return this._self.options.zeroPadding ? this._self.globalHelpers.pad(qty) : qty;
    },
    _addEmptyClass: function _addEmptyClass() {
        CONSTANTS.BODY.addClass(this._self.options.emptyClass);
    },
    _removeEmptyClass: function _removeEmptyClass() {
        CONSTANTS.BODY.removeClass(this._self.options.emptyClass);
    },
    _addLoadMoreClass: function _addLoadMoreClass() {
        CONSTANTS.BODY.addClass(this._self.options.loadMoreBodyClass);
    },
    _removeLoadMoreClass: function _removeLoadMoreClass() {
        CONSTANTS.BODY.removeClass(this._self.options.loadMoreBodyClass);
    },
    _addOrderByClass: function _addOrderByClass() {
        CONSTANTS.BODY.addClass(this._self.options.orderByBodyClass);
    },
    _removeOrderByClass: function _removeOrderByClass() {
        CONSTANTS.BODY.removeClass(this._self.options.orderByBodyClass);
    }
};

// Extends private methods
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

            this._globalHelpers.extend(Private.prototype, utils, renderProducts, pagination);
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
                productsId: [],
                pagination: {
                    page: 1,
                    perPage: this._self.options.perPage,
                    totalPages: 1
                }
            };

            if (this._globalHelpers.isNull(this._storage.get(CONSTANTS.STORAGE_NAME))) {
                this._storage.set(CONSTANTS.STORAGE_NAME, storageOptions);
            }

            if (this._globalHelpers.isNull(this._session.get(CONSTANTS.SESSION_NAME))) {
                this._session.set(CONSTANTS.SESSION_NAME, sessionOptions, CONSTANTS.EXPIRE_TIME);
            }
        }

        /**
         * **********************************************
         * SET WISHLIST ACTIONS
         * **********************************************
         */

    }, {
        key: '_setWishlistProduct',
        value: function _setWishlistProduct() {
            var _this = this;

            var setData = function setData(ev) {
                ev.preventDefault();
                ev.stopPropagation();

                if (!_this._validateUser()) {
                    return false;
                }

                var $this = $(ev.target);
                var productId = $this.data('wishlistProductId');

                $this.addClass(_this._self.options.loaderClass);
                $('[data-wishlist-add]').prop('disabled', true);

                _this._removeWishlistProduct(productId, $this);
                _this._addWishlistProduct(productId, $this);
            };

            $(document).on('click', '[data-wishlist-add]', this._globalHelpers.debounce(setData, 70));
        }
    }, {
        key: '_addWishlistProduct',
        value: function _addWishlistProduct(productId, $context) {
            this._addProduct(productId, $context);
        }
    }, {
        key: '_removeWishlistProduct',
        value: function _removeWishlistProduct(productId, $context) {
            if ($context.hasClass(this._self.options.activeClass)) {
                this._removeProduct(productId, $context);
            }
        }
    }, {
        key: '_addProduct',
        value: function _addProduct(productId) {
            var _this2 = this;

            var $context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            var storeVal = this._storage.get(CONSTANTS.STORAGE_NAME);
            var isProductAdded = storeVal.productsId.some(function (elem) {
                return elem === productId;
            });

            if (!isProductAdded) {
                CONSTANTS.BODY.addClass(this._self.options.addLoaderClass);

                $(document).trigger(CONSTANTS.EVENTS.REQUEST_START, [productId]);
                $(document).trigger(CONSTANTS.EVENTS.REQUEST_ADD_START, [productId]);

                storeVal.productsId.push(productId);
                this._storage.set(CONSTANTS.STORAGE_NAME, storeVal, CONSTANTS.EXPIRE_TIME);

                this._vtexMasterdata.updateUser(storeVal.userEmail, { wishlistProducts: JSON.stringify(storeVal.productsId) }).done(function (res) {
                    if (!_this2._globalHelpers.isNull($context)) {
                        $context.addClass(_this2._self.options.activeClass);
                        $context.attr('title', _this2._self.options.linkTitle.remove);
                        $context.removeClass(_this2._self.options.loaderClass);
                    }

                    $('[data-wishlist-add]').prop('disabled', false);

                    $(document).trigger(CONSTANTS.EVENTS.REQUEST_END, [productId]);
                    $(document).trigger(CONSTANTS.EVENTS.REQUEST_ADD_END, [productId]);
                    _this2._storageObserve();
                }).fail(function (err) {
                    return window.console.log(err);
                }).always(function () {
                    return CONSTANTS.BODY.removeClass(_this2._self.options.addLoaderClass);
                });
            }
        }
    }, {
        key: '_removeProduct',
        value: function _removeProduct(productId) {
            var _this3 = this;

            var $context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            CONSTANTS.BODY.addClass(this._self.options.removeLoaderClass);

            var storeVal = this._storage.get(CONSTANTS.STORAGE_NAME);
            var isProductAdded = storeVal.productsId.some(function (elem) {
                return elem === productId;
            });
            var filteredProducts = storeVal.productsId.filter(function (_productId) {
                return _productId !== productId;
            });

            $(document).trigger(CONSTANTS.EVENTS.REQUEST_START, [productId]);
            $(document).trigger(CONSTANTS.EVENTS.REQUEST_REMOVE_START, [productId]);

            if (isProductAdded) {
                this._vtexMasterdata.updateUser(storeVal.userEmail, { wishlistProducts: JSON.stringify(filteredProducts) }).done(function (res) {
                    if (!_this3._globalHelpers.isNull($context)) {
                        $context.removeClass(_this3._self.options.activeClass);
                        $context.attr('title', _this3._self.options.linkTitle.add);
                        $context.removeClass(_this3._self.options.loaderClass);
                    }

                    storeVal.productsId = filteredProducts;

                    _this3._storage.set(CONSTANTS.STORAGE_NAME, storeVal, CONSTANTS.EXPIRE_TIME);

                    $('[data-wishlist-add]').prop('disabled', false);

                    var $wishlistAdd = $(document).find('[data-wishlist-add]');
                    $wishlistAdd.map(function (index, wishlistVal) {
                        if (productId === $(wishlistVal).data('wishlistProductId')) {
                            $(wishlistVal).removeClass(_this3._self.options.activeClass);
                        }
                    });

                    $(document).trigger(CONSTANTS.EVENTS.REQUEST_END, [productId]);
                    $(document).trigger(CONSTANTS.EVENTS.REQUEST_REMOVE_END, [productId]);

                    _this3._storageObserve();
                }).fail(function (err) {
                    return window.console.log(err);
                }).always(function () {
                    return CONSTANTS.BODY.removeClass(_this3._self.options.removeLoaderClass);
                });
            }
        }
    }, {
        key: '_clearWishlist',
        value: function _clearWishlist() {
            var _this4 = this;

            $(document).on('click', '[data-wishlist-clear]', function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                _this4._clear();
            });
        }
    }, {
        key: '_clear',
        value: function _clear() {
            var _this5 = this;

            var $wishlistAdd = $(document).find('[data-wishlist-add]');
            var storeVal = this._storage.get(CONSTANTS.STORAGE_NAME);

            if (storeVal.productsId.length < 1) {
                return false;
            }

            CONSTANTS.BODY.addClass(this._self.options.clearLoaderClass);
            $(document).trigger(CONSTANTS.EVENTS.BEFORE_CLEAR_ITEMS);

            storeVal.productsId = [];
            this._storage.set(CONSTANTS.STORAGE_NAME, storeVal, CONSTANTS.EXPIRE_TIME);

            this._vtexMasterdata.updateUser(storeVal.userEmail, { wishlistProducts: '[]' }).done(function (res) {
                $wishlistAdd.map(function (index, wishlistVal) {
                    return $(wishlistVal).removeClass(_this5._self.options.activeClass);
                });
                _this5._update();
            }).fail(function (err) {
                return window.console.log(err);
            }).always(function () {
                CONSTANTS.BODY.removeClass(_this5._self.options.clearLoaderClass);
                $(document).trigger(CONSTANTS.EVENTS.AFTER_CLEAR_ITEMS);
            });
        }
    }, {
        key: '_validateUser',
        value: function _validateUser() {
            // Validate Session Ended / Local persisted
            var storeVal = this._storage.get(CONSTANTS.STORAGE_NAME);
            var sessionVal = this._session.get(CONSTANTS.SESSION_NAME);

            if (!sessionVal.userDefined && this._globalHelpers.length(storeVal.productsId) > 0) {
                this._setWishlistUser();
                this._vtexHelpers.openPopupLogin(!this._self.options.reloadPage);

                return false;
            }

            if (!this._checkUserEmail()) {
                this._vtexHelpers.openPopupLogin(!this._self.options.reloadPage);

                return false;
            }

            return true;
        }
    }, {
        key: '_storageObserve',
        value: function _storageObserve() {
            var _this6 = this;

            var storeVal = this._storage.get(CONSTANTS.STORAGE_NAME);

            this._setUserData();
            this._setLoadMoreBtn();
            this._splitPages();

            this._removeUnavailableProducts(storeVal.productsId).then(function (response) {
                storeVal.productsId = response;

                _this6._storage.set(CONSTANTS.STORAGE_NAME, storeVal, CONSTANTS.EXPIRE_TIME);

                if (!_this6._globalHelpers.isEmpty(storeVal.productsId)) {
                    var $wishlistAdd = $(document).find('[data-wishlist-add]');

                    $('[data-wishlist-amount]').html(_this6._setPadding(storeVal.productsId.length));

                    storeVal.productsId.map(function (productId) {
                        $wishlistAdd.map(function (index, wishlistVal) {
                            if (productId === $(wishlistVal).data('wishlistProductId')) {
                                $(wishlistVal).addClass(_this6._self.options.activeClass);
                                $(wishlistVal).attr('title', _this6._self.options.linkTitle.remove);
                            }
                        });
                    });
                } else {
                    $('[data-wishlist-amount]').html(_this6._setPadding(0));
                    _this6._addEmptyClass();
                }
            });
        }
    }, {
        key: '_update',
        value: function _update() {
            this._setUrlHash();
            this._splitPages();
            this._resetLoadMoreBtn();
            this._storageObserve();
            this._renderProducts();
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
            var _this7 = this;

            var storeVal = this._storage.get(CONSTANTS.STORAGE_NAME);
            var sessionVal = this._session.get(CONSTANTS.SESSION_NAME);

            if (sessionVal.userDefined && this._globalHelpers.length(storeVal.productsId) > 0) {
                return false;
            }

            this._vtexHelpers.checkLogin().done(function (user) {
                storeVal.userEmail = user.Email;
                storeVal.userId = user.UserId;

                _this7._storage.set(CONSTANTS.STORAGE_NAME, storeVal);

                if (!sessionVal.userDefined) {
                    _this7._setWishlistUser();
                }
            });
        }
    }, {
        key: '_setWishlistUser',
        value: function _setWishlistUser() {
            var _this8 = this;

            this._checkWishlistUser().done(function (res) {
                if (res.hasUser) {
                    var storeVal = _this8._storage.get(CONSTANTS.STORAGE_NAME);
                    var sessionVal = _this8._session.get(CONSTANTS.SESSION_NAME);

                    storeVal.productsId = JSON.parse(res.userData.wishlistProducts || '[]');
                    sessionVal.userDefined = true;

                    _this8._removeUnavailableProducts(storeVal.productsId).then(function (response) {
                        storeVal.productsId = response;

                        _this8._storage.set(CONSTANTS.STORAGE_NAME, storeVal, CONSTANTS.EXPIRE_TIME);
                        _this8._session.set(CONSTANTS.SESSION_NAME, sessionVal, CONSTANTS.EXPIRE_TIME);

                        setTimeout(function () {
                            return _this8._storageObserve();
                        }, CONSTANTS.DELAY_TIME);
                    });
                }
            }).fail(function (err) {
                return window.console.log(err);
            });
        }
    }, {
        key: '_checkWishlistUser',
        value: function _checkWishlistUser() {
            var _this9 = this;

            var storeVal = this._storage.get(CONSTANTS.STORAGE_NAME);
            var sessionVal = this._session.get(CONSTANTS.SESSION_NAME);
            var response = { hasUser: false, userData: null };

            /* eslint-disable */
            return $.Deferred(function (def) {
                /* eslint-enable */
                if (sessionVal.userDefined) {
                    return false;
                }

                return _this9._vtexMasterdata.getUser(storeVal.userEmail, CONSTANTS.RETRIEVED_DATA).done(function (res) {
                    if (_this9._globalHelpers.length(res.result.dataResponse) > 0) {
                        response.hasUser = true;
                        response.userData = res.result.dataResponse;
                    }

                    def.resolve(response);
                }).fail(function (error) {
                    return def.reject(error);
                });
            }).promise();
        }
    }, {
        key: '_removeUnavailableProducts',
        value: function _removeUnavailableProducts(productsId) {
            var _this10 = this;

            /* eslint-disable */
            return $.Deferred(function (def) {
                /* eslint-enable */
                return _this10._vtexCatalog.searchProductArray(productsId).then(function (response) {
                    if (_this10._globalHelpers.length(response) < 1) {
                        productsId = [];
                    }

                    def.resolve(productsId);
                });
            }).promise();
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

        _private._setUrlHash();
        _private._splitPages();
        _private._createLoadMore();
        _private._setLoadMoreBtn();
        _private._loadMoreActions();

        _private._renderProducts();

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
            return _this.update();
        });
        $(document).on('requestRemoveEnd.vtexWishlist', function (ev, productId) {
            return _this.update();
        });
    },
    update: function update() {
        _private._update();
    },
    addProduct: function addProduct(productId, $context) {
        _private._addProduct(productId, $context);
    },
    removeProduct: function removeProduct(productId, $context) {
        _private._removeProduct(productId, $context);
    },
    clearWishlist: function clearWishlist() {
        _private._clear();
    },
    getProducts: function getProducts() {
        return _private._getProducts();
    },
    renderProducts: function renderProducts() {
        _private._renderProducts();
    },
    validateUser: function validateUser() {
        _private._validateUser();
    }
};

/**
 * Create a VtexWishlist class
 * Vtex utilities methods
 */

var VtexWishlist = function VtexWishlist(vtexUtils, vtexMasterdata, vtexCatalog) {
  classCallCheck(this, VtexWishlist);

  /**
   * Version
   * @type {String}
   */
  this.version = '0.6.1';

  /**
   * Package name
   * @type {String}
   */
  this.name = '@VtexWishlist';

  // Validate Vtex Libs
  if (vtexUtils === undefined) {
    throw new TypeError(CONSTANTS.MESSAGES.vtexUtils);
  }

  if (vtexCatalog === undefined) {
    throw new TypeError(CONSTANTS.MESSAGES.vtexCatalog);
  }

  if (vtexMasterdata === undefined) {
    throw new Error(CONSTANTS.MESSAGES.vtexMasterdata);
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

  /**
   * Vtex Masterdata instance
   * @type {VtexMasterdata}
   */
  this.vtexMasterdata = vtexMasterdata;

  /**
   * Vtex Catalog instance
   * @type {VtexCatalog}
   */
  this.vtexCatalog = vtexCatalog;

  /**
   * Validate Vtex Libs instances
   */
  if (this.vtexCatalog.name !== '@VtexCatalog') {
    throw new TypeError(CONSTANTS.MESSAGES.vtexCatalog);
  }

  if (this.vtexCatalog.version < CONSTANTS.MESSAGES.vtexCatalogVersion) {
    throw new Error(CONSTANTS.MESSAGES.vtexCatalogVersionMessage);
  }

  if (this.vtexMasterdata.name !== '@VtexMasterdata') {
    throw new TypeError(CONSTANTS.MESSAGES.vtexMasterdata);
  }

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

return VtexWishlist;

})));
