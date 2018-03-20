
import CONSTANTS from './vtex-wishlist.constants.js';

// Extends private methods
import renderProducts from './vtex-wishlist.render-products.js';
import pagination from './vtex-wishlist.pagination.js';
import utils from './vtex-wishlist.utils.js';

class Private {
    _setInstance(self) {
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
    _initStorage() {
        const sessionOptions = {
            userDefined: false,
        };

        const storageOptions = {
            userEmail: null,
            userId: null,
            productsId: [],
            pagination: {
                page: 1,
                perPage: this._self.options.perPage,
                totalPages: 1,
            },
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
     * SET WISHLIST ACTIONS
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
                this._setWishlistUser();
                this._vtexHelpers.openPopupLogin(! this._self.options.reloadPage);

                return false;
            }

            if ( ! this._checkUserEmail() ) {
                this._vtexHelpers.openPopupLogin(! this._self.options.reloadPage);

                return false;
            }

            $this.addClass(this._self.options.loaderClass);
            $('[data-wishlist-add]').prop('disabled', true);

            this._removeWishlistProduct(productId, $this);
            this._addWishlistProduct(productId, $this);
        };

        $(document).on('click', '[data-wishlist-add]', this._globalHelpers.debounce(setData, 70));
    }

    _addWishlistProduct(productId, $context) {
        const storeVal = this._storage.get(CONSTANTS.STORAGE_NAME);
        const isProductAdded = storeVal.productsId.some((elem) => elem === productId);

        if ( ! isProductAdded ) {
            $(document).trigger(CONSTANTS.EVENTS.REQUEST_START);
            $(document).trigger(CONSTANTS.EVENTS.REQUEST_ADD_START);

            storeVal.productsId.push(productId);
            this._storage.set(CONSTANTS.STORAGE_NAME, storeVal);

            this._vtexMasterdata.updateUser(storeVal.userEmail, {wishlistProducts: JSON.stringify(storeVal.productsId)})
                .done((res) => {
                    $context.addClass(this._self.options.activeClass);
                    $context.attr('title', this._self.options.linkTitle.remove);
                    $context.removeClass(this._self.options.loaderClass);
                    $('[data-wishlist-add]').prop('disabled', false);

                    $(document).trigger(CONSTANTS.EVENTS.REQUEST_END, [productId]);
                    $(document).trigger(CONSTANTS.EVENTS.REQUEST_ADD_END, [productId]);
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
            $(document).trigger(CONSTANTS.EVENTS.REQUEST_START);
            $(document).trigger(CONSTANTS.EVENTS.REQUEST_REMOVE_START);

            if ( isProductAdded ) {
                this._vtexMasterdata.updateUser(storeVal.userEmail, {wishlistProducts: JSON.stringify(filteredProducts)})
                    .done((res) => {
                        $context.removeClass(this._self.options.activeClass);
                        $context.attr('title', this._self.options.linkTitle.add);

                        storeVal.productsId = filteredProducts;

                        this._storage.set(CONSTANTS.STORAGE_NAME, storeVal);

                        $context.removeClass(this._self.options.loaderClass);
                        $('[data-wishlist-add]').prop('disabled', false);

                        const $wishlistAdd = $(document).find('[data-wishlist-add]');
                        $wishlistAdd.map((index, wishlistVal) => {
                            if ( productId === $(wishlistVal).data('wishlistProductId') ) {
                                $(wishlistVal).removeClass(this._self.options.activeClass);
                            }
                        });

                        $(document).trigger(CONSTANTS.EVENTS.REQUEST_END, [productId]);
                        $(document).trigger(CONSTANTS.EVENTS.REQUEST_REMOVE_END, [productId]);

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

            $(document).trigger(CONSTANTS.EVENTS.BEFORE_CLEAR_ITEMS);

            storeVal.productsId = [];
            this._storage.set(CONSTANTS.STORAGE_NAME, storeVal);

            this._vtexMasterdata.updateUser(storeVal.userEmail, {wishlistProducts: '[]'})
                .done((res) => {
                    $wishlistAdd.map((index, wishlistVal) => $(wishlistVal).removeClass(this._self.options.activeClass));
                    this._update();
                })
                .fail((err) => window.console.log(err))
                .always(() => $(document).trigger(CONSTANTS.EVENTS.AFTER_CLEAR_ITEMS));
        });
    }

    _storageObserve() {
        const storeVal = this._storage.get(CONSTANTS.STORAGE_NAME);

        this._setUserData();
        this._setLoadMoreBtn();
        this._splitPages();

        if ( ! this._globalHelpers.isNull(storeVal) ) {
            const $wishlistAdd = $(document).find('[data-wishlist-add]');

            $('[data-wishlist-amount]').html(this._setPadding(storeVal.productsId.length));

            storeVal.productsId.map((productId) => {
                $wishlistAdd.map((index, wishlistVal) => {
                    if ( productId === $(wishlistVal).data('wishlistProductId') ) {
                        $(wishlistVal).addClass(this._self.options.activeClass);
                        $(wishlistVal).attr('title', this._self.options.linkTitle.remove);
                    }
                });
            });
        } else {
            $('[data-wishlist-amount]').html(this._setPadding(0));
        }
    }

    _update() {
        this._setUrlHash();
        this._splitPages();
        this._resetLoadMoreBtn();
        this._storageObserve();
        this._renderProducts();
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

        if ( sessionVal.userDefined && this._globalHelpers.length(storeVal.productsId) > 0 ) {
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
}

export default Private;
