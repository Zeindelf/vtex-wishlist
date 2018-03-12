
import CONSTANTS from './vtex-wishlist.constants.js';

class Private {
    _setInstance(self) {
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
    _initStorage() {
        const sessionOptions = {
            userDefined: false,
        };

        const storageOptions = {
            userEmail: null,
            userId: null,
            productsId: [],
        };

        if ( this._globalHelpers.isNull(this._storage.get(CONSTANTS.STORAGE_NAME)) ) {
            this._storage.set(CONSTANTS.STORAGE_NAME, storageOptions);
        }

        if ( this._globalHelpers.isNull(this._session.get(CONSTANTS.SESSION_NAME)) ) {
            this._session.set(CONSTANTS.SESSION_NAME, sessionOptions);
        }
    }

    /**
     * **********************************************
     * SET PRODUCTS ACTIONS
     * **********************************************
     */
    _setWishlistProduct() {
        const setData = (ev) => {
            ev.preventDefault();

            const $this = $(ev.currentTarget);
            const productId = $this.data('wishlistProductId');

            // Validate Session Ended / Local persisted
            const storeVal = this._storage.get(CONSTANTS.STORAGE_NAME);
            const sessionVal = this._session.get(CONSTANTS.SESSION_NAME);
            if ( ! sessionVal.userDefined && this._globalHelpers.length(storeVal.productsId) > 0 ) {
                // Buscar produtos do masterdata
                this._setWishlistUser();
                this._vtexHelpers.openPopupLogin(true);

                return false;
            }

            if ( ! this._checkUserEmail() ) {
                this._vtexHelpers.openPopupLogin(true);

                return false;
            }

            $this.addClass(this._self.options.loaderClass);
            $(':button').prop('disabled', true);

            this._removeWishlistProduct(productId, $this);
            this._addWishlistProduct(productId, $this);
        };

        $(document).on('click', '[data-wishlist-add]', this._globalHelpers.debounce(setData, 70));
    }

    _addWishlistProduct(productId, $context) {
        const storeVal = this._storage.get(CONSTANTS.STORAGE_NAME);
        const isProductAdded = storeVal.productsId.some((elem) => elem === productId);

        if ( ! isProductAdded ) {
            this._requestStartEvent();
            this._requestAddStartEvent();

            storeVal.productsId.push(productId);
            this._storage.set(CONSTANTS.STORAGE_NAME, storeVal);

            this._vtexMasterdata.updateUser(storeVal.userEmail, {wishlistProducts: JSON.stringify(storeVal.productsId)})
                .done((res) => {
                    $context.addClass(this._self.options.activeClass);
                    $context.attr('title', this._self.options.linkTitle.remove);
                    $context.removeClass(this._self.options.loaderClass);
                    $(':button').prop('disabled', false);

                    this._requestEndEvent(productId);
                    this._requestAddEndEvent(productId);
                    this._storageObserve();
                })
                .fail((err) => window.console.log(err));
        }
    }

    _removeWishlistProduct(productId, $context) {
        const storeVal = this._storage.get(CONSTANTS.STORAGE_NAME);
        const isProductAdded = storeVal.productsId.some((elem) => elem === productId);
        const filteredProducts = storeVal.productsId.filter((_productId) => _productId !== productId);

        if ( $context.hasClass(this._self.options.activeClass) ) {
            this._requestStartEvent();
            this._requestRemoveStartEvent();

            if ( isProductAdded ) {
                this._vtexMasterdata.updateUser(storeVal.userEmail, {wishlistProducts: JSON.stringify(filteredProducts)})
                    .done((res) => {
                        $context.removeClass(this._self.options.activeClass);
                        $context.attr('title', this._self.options.linkTitle.add);

                        storeVal.productsId = filteredProducts;

                        this._storage.set(CONSTANTS.STORAGE_NAME, storeVal);

                        $context.removeClass(this._self.options.loaderClass);
                        $(':button').prop('disabled', false);

                        // Remove class of all products
                        const $wishlistAdd = $(document).find('[data-wishlist-add]');
                        $wishlistAdd.map((index, wishlistVal) => {
                            if ( productId === $(wishlistVal).data('wishlistProductId') ) {
                                $(wishlistVal).removeClass(this._self.options.activeClass);
                            }
                        });

                        this._requestEndEvent(productId);
                        this._requestRemoveEndEvent(productId);
                        this._storageObserve();
                    })
                    .fail((err) => window.console.log(err));
            }

            return false;
        }
    }

    _clearWishlist() {
        $(document).on('click', '[data-wishlist-clear]', (ev) => {
            ev.preventDefault();
            const $wishlistAdd = $(document).find('[data-wishlist-add]');
            const storeVal = this._storage.get(CONSTANTS.STORAGE_NAME);

            if ( storeVal.productsId.length < 1 ) {
                return false;
            }

            this._beforeClearItemsEvent();
            storeVal.productsId = [];
            this._storage.set(CONSTANTS.STORAGE_NAME, storeVal);

            this._vtexMasterdata.updateUser(storeVal.userEmail, {wishlistProducts: '[]'})
                .done((res) => {
                    $wishlistAdd.map((index, wishlistVal) => $(wishlistVal).removeClass(this._self.options.activeClass));
                    this._storageObserve();
                    this._renderProducts();
                })
                .fail((err) => window.console.log(err))
                .always(() => this._afterClearItemsEvent());
        });
    }

    _storageObserve() {
        const storeVal = this._storage.get(CONSTANTS.STORAGE_NAME);

        this._setUserData();

        if ( ! this._globalHelpers.isNull(storeVal) ) {
            const $wishlistAdd = $(document).find('[data-wishlist-add]');

            $('[data-wishlist-amount]').html(this._setPadding(storeVal.productsId.length));

            storeVal.productsId.map((productId) => {
                $wishlistAdd.map((index, wishlistVal) => {
                    if ( productId === $(wishlistVal).data('wishlistProductId') ) {
                        $(wishlistVal).addClass(this._self.options.activeClass);
                    }
                });
            });
        } else {
            $('[data-wishlist-amount]').html(this._setPadding(0));
        }
    }

    _checkUserEmail() {
        const storeVal = this._storage.get(CONSTANTS.STORAGE_NAME);

        if ( storeVal.userEmail === null ) {
            return false;
        }

        return true;
    }

    _setUserData() {
        const storeVal = this._storage.get(CONSTANTS.STORAGE_NAME);
        const sessionVal = this._session.get(CONSTANTS.SESSION_NAME);

        if ( ! sessionVal.userDefined && this._globalHelpers.length(storeVal.productsId) > 0 ) {
            return false;
        }

        this._vtexHelpers.checkLogin().done((user) => {
            storeVal.userEmail = user.Email;
            storeVal.userId = user.UserId;

            this._storage.set(CONSTANTS.STORAGE_NAME, storeVal);

            if ( ! sessionVal.userDefined ) {
                this._setWishlistUser();
            }
        });
    }

    _setWishlistUser() {
        this._checkWishlistUser().done((res) => {
            if ( res.hasUser ) {
                const storeVal = this._storage.get(CONSTANTS.STORAGE_NAME);
                const sessionVal = this._session.get(CONSTANTS.SESSION_NAME);

                storeVal.productsId = JSON.parse(res.userData.wishlistProducts || '[]');
                sessionVal.userDefined = true;

                this._storage.set(CONSTANTS.STORAGE_NAME, storeVal);
                this._session.set(CONSTANTS.SESSION_NAME, sessionVal);

                setTimeout(() => this._storageObserve(), CONSTANTS.DELAY_TIME);
            }
        })
        .fail((err) => window.console.log(err));
    }

    _checkWishlistUser() {
        const storeVal = this._storage.get(CONSTANTS.STORAGE_NAME);
        const sessionVal = this._session.get(CONSTANTS.SESSION_NAME);
        const response = {hasUser: false, userData: null};

        /* eslint-disable */
        return $.Deferred((def) => {
            /* eslint-enable */
            if ( sessionVal.userDefined ) {
                return false;
            }

            return this._vtexMasterdata.getUser(storeVal.userEmail, CONSTANTS.RETRIEVED_DATA)
                .done((res) => {
                    if ( this._globalHelpers.length(res.result.dataResponse) > 0 ) {
                        response.hasUser = true;
                        response.userData = res.result.dataResponse;
                    }

                    def.resolve(response);
                })
                .fail((error) => def.reject(error));
        }).promise();
    }

    /**
     * **********************************************
     * SHOW PRODUCTS
     * **********************************************
     */
    _renderProducts(order = null) {
        const $wishlistItems = $('[data-wishlist-items');
        const $wishlistOrder = $('[data-wishlist-order]');
        const $wishlistContainer = $('<ul class="vw-wishlist__items"></ul>');
        const storeVal = this._storage.get(CONSTANTS.STORAGE_NAME);
        const splitList = true;
        const params = {
            fq: storeVal.productsId,
            shelfId: this._self.options.shelfId,
            order: order || this._self.options.order,
        };

        this._beforeShowItemsEvent();

        if ( storeVal.productsId.length < 1 ) {
            $('body').addClass(this._self.options.inactiveClass);
            $wishlistItems.empty().append(this._self.options.notFound);

            this._afterShowItemsEvent();

            return false;
        }

        this._vtexCatalog.searchPage(params, splitList).then((res) => {
            $('body').removeClass(this._self.options.inactiveClass);
            $wishlistItems.empty().append($wishlistContainer.append(res));

            this._storageObserve();
        })
        .fail((err) => window.console.log(err))
        .always(() => this._afterShowItemsEvent());
    }

    _changeOrder() {
        const $wishlistOrder = $('[data-wishlist-order]');

        $wishlistOrder.find('input').on('change', (ev) => {
            ev.preventDefault();

            const $this = $(ev.currentTarget);
            const value = $this.val();

            this._renderProducts(value);
        });
    }

     /**
     * **********************************************
     * HELPERS
     * **********************************************
     */
    _setPadding(qty) {
        return ( this._self.options.zeroPadding ) ? this._self.globalHelpers.pad(qty) : qty;
    }

    /**
     * **********************************************
     * CUSTOM EVENTS
     * **********************************************
     */
    _requestStartEvent() {
        /* eslint-disable */
        const ev = $.Event('requestStart.vtexWishlist');
        /* eslint-enable */

        $(document).trigger(ev);
    }

    _requestAddStartEvent() {
        /* eslint-disable */
        const ev = $.Event('requestAddStart.vtexWishlist');
        /* eslint-enable */

        $(document).trigger(ev);
    }

    _requestRemoveStartEvent() {
        /* eslint-disable */
        const ev = $.Event('requestRemoveStart.vtexWishlist');
        /* eslint-enable */

        $(document).trigger(ev);
    }

    _requestEndEvent(productId) {
        /* eslint-disable */
        const ev = $.Event('requestEnd.vtexWishlist');
        /* eslint-enable */

        $(document).trigger(ev, [productId]);
    }

    _requestAddEndEvent(productId) {
        /* eslint-disable */
        const ev = $.Event('requestAddEnd.vtexWishlist');
        /* eslint-enable */

        $(document).trigger(ev, [productId]);
    }

    _requestRemoveEndEvent(productId) {
        /* eslint-disable */
        const ev = $.Event('requestRemoveEnd.vtexWishlist');
        /* eslint-enable */

        $(document).trigger(ev, [productId]);
    }

    _beforeShowItemsEvent() {
        /* eslint-disable */
        const ev = $.Event('beforeShowItems.vtexWishlist');
        /* eslint-enable */

        $(document).trigger(ev);
    }

    _afterShowItemsEvent() {
        /* eslint-disable */
        const ev = $.Event('afterShowItems.vtexWishlist');
        /* eslint-enable */

        $(document).trigger(ev);
    }

    _beforeClearItemsEvent() {
        /* eslint-disable */
        const ev = $.Event('beforeClearItems.vtexWishlist');
        /* eslint-enable */

        $(document).trigger(ev);
    }

    _afterClearItemsEvent() {
        /* eslint-disable */
        const ev = $.Event('afterClearItems.vtexWishlist');
        /* eslint-enable */

        $(document).trigger(ev);
    }
}

export default Private;
