
import CONSTANTS from './vtex-wishlist.constants.js';
import DEFAULTS from './vtex-wishlist.defaults.js';
import Private from './vtex-wishlist.private.js';

const _private = new Private();

export default {
    setOptions(options = {}) {
        /**
         * Set Options Dependencies
         */
        this.options = this.globalHelpers.extend({}, DEFAULTS, this.globalHelpers.isPlainObject(options) && options);

        // Validate store name
        if ( ! this.options.storeName || ! this.globalHelpers.isString(this.options.storeName) ) {
            throw new Error(CONSTANTS.MESSAGES.storeName);
        }

        // Validate shelf id
        if ( ! this.options.shelfId || ! this.globalHelpers.isString(this.options.shelfId) ) {
            throw new Error(CONSTANTS.MESSAGES.shelfId);
        }

        if ( this.options.notFound === null ) {
            this.options.notFound = () => '<div class="wishlist__not-found">Nenhum produto em sua lista</div>';
        } else {
            if ( ! this.globalHelpers.isFunction(this.options.notFound) ) {
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

    _initWishlist() {
        _private._initStorage();
        _private._storageObserve();
        _private._setWishlistProduct();
        _private._changeOrder();
        _private._clearWishlist();


        $(window).on('authenticatedUser.vtexid', (ev) => setTimeout(() => this.update(), CONSTANTS.DELAY_TIME));
        $(window).on('closed.vtexid', (ev) => setTimeout(() => this.update(), CONSTANTS.DELAY_TIME));

        $(document).on('requestAddEnd.vtexWishlist', (ev, productId) => _private._renderProducts());
        $(document).on('requestRemoveEnd.vtexWishlist', (ev, productId) => _private._renderProducts());
    },

    update() {
        _private._storageObserve();
        _private._renderProducts();
    },

    renderProducts() {
        _private._renderProducts();
    },
};
