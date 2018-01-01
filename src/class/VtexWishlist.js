
import Defaults from './../data/defaults.js';
import Data from './../data/data.js';
import Helpers from './../utils/helpers.js';

class VtexWishlist {
    /**
     * Create a new VtexWishlist
     */
    constructor(options = {}) {
        this.options = Helpers.extend({}, Defaults, Helpers.isPlainObject(options) && options);
        // this.masterdata = new Masterdata(options.storeName, options.wishlistEntity);
        this.validate();
        this.init();
    }

    validate() {
        // Validate Store.js
        if ( typeof (window.store) === 'undefined' ) {
            throw new Error('Store.js is required. Download it from https://www.npmjs.com/package/store');
        }

        if ( window.store.version < '2.0.12' ) {
            throw new Error('Store.js 2.0.12 is required. Download it from https://www.npmjs.com/package/store');
        }

        // Validate VtexHelpers
        if ( typeof (window.VtexHelpers) === 'undefined' ) {
            throw new Error('VtexHelpers is required. Download it from https://www.npmjs.com/package/vtex-helpers');
        }

        // Validate store name
        if ( ! this.options.storeName || ! Helpers.isString(this.options.storeName) ) {
            throw new Error('The option "storeName" is required and must be a string.');
        }

        // Validate wishlist entity
        if ( ! this.options.wishlistEntity || ! Helpers.isString(this.options.wishlistEntity) ) {
            throw new Error('The option "wishlistEntity" is required and must be a string.');
        }

        // Validate shelf id
        if ( ! this.options.shelfId || ! Helpers.isString(this.options.shelfId) ) {
            throw new Error('The option "shelfId" is required and must be a string.');
        }

        if ( this.options.notFound === null ) {
            this.options.notFound = () => '<div class="wishlist__not-found">Nenhum produto em sua lista</div>';
        } else {
            if ( ! Helpers.isFunction(this.options.notFound) ) {
                throw new Error('The option "notFound" must be a function.');
            }

            this.options.notFound.call(this);
        }
    }

    init() {
        this.storageName = Helpers.strReplace(['{storeName}', '-'], [this.options.storeName, '_'], Data.storageName);
        this.storage = window.store;
        this.vtexHelpers = new VtexHelpers();

        this.initStorage();
        this.storageObserve();
        this.setWishlistProduct();
        this.setUserEmail();

        $(document).on('ajaxStop', () => this.storageObserve());
    }

    setWishlistProduct() {
        $(document).on('click', '[data-wishlist-add]', (ev) => {
            ev.preventDefault();
            const $this = $(ev.currentTarget);
            const productId = $this.data('wishlistProductId');

            if ( ! this.checkUserEmail() ) {
                this.getUserEmail();

                return false;
            }

            $this.addClass(this.options.loaderClass);

            if ( $this.hasClass(this.options.activeClass) ) {
                setTimeout(() => {
                    $this.removeClass(this.options.activeClass);
                    $this.attr('title', this.options.linkTitle.add);
                    this.deleteWishlistProducts(productId);
                    $this.removeClass(this.options.loaderClass);
                }, 1000);

                return false;
            }

            setTimeout(() => {
                $this.addClass(this.options.activeClass);
                $this.attr('title', this.options.linkTitle.remove);
                this.saveWishlistProducts(productId);
                $this.removeClass(this.options.loaderClass);
            }, 1000);
        });
    }

    checkUserEmail() {
        const storeVal = this.storage.get(this.storageName);

        if ( storeVal.userEmail === null ) {
            return false;
        }

        return true;
    }

    getUserEmail() {
        this.vtexHelpers.checkLogin()
            .done((user) => {})
            .fail((err) => {
                if ( ! err.IsUserDefined ) {
                    this.vtexHelpers.openPopupLogin();
                }
            });
    }

    setUserEmail() {
        this.vtexHelpers.checkLogin()
            .done((user) => {
                if ( user.IsUserDefined ) {
                    const storeVal = this.storage.get(this.storageName);
                    storeVal.userEmail = user.Email;
                    this.storage.set(this.storageName, storeVal);
                }
            })
            .fail((err) => {});
    }

    saveWishlistProducts(productId) {
        const storeVal = this.storage.get(this.storageName);
        const isProductAdded = storeVal.productsId.some((elem) => elem === productId);

        if ( ! isProductAdded ) {
            storeVal.productsId.push(productId);
            this.storage.set(this.storageName, storeVal);
        }
    }

    deleteWishlistProducts(productId) {
        const storeVal = this.storage.get(this.storageName);
        const isProductAdded = storeVal.productsId.some((elem) => elem === productId);

        if ( isProductAdded ) {
            const filteredProducts = storeVal.productsId.filter((_productId) => _productId !== productId);
            storeVal.productsId = filteredProducts;

            this.storage.set(this.storageName, storeVal);
        }
    }

    initStorage() {
        if ( this.storage.get(this.storageName) === undefined ) {
            this.storage.set(this.storageName, {
                userEmail: null,
                productsId: []
            });
        }
    }

    storageObserve() {
        if ( this.storage.get(this.storageName) !== undefined ) {
            this.storage.observe(this.storageName, (storeVal, oldVal) => {
                const $wishlistAdd = $(document).find('[data-wishlist-add]');

                $('[data-wishlist-amount]').text(storeVal.productsId.length);

                storeVal.productsId.map((productId) => {
                    $wishlistAdd.map((i, wishlistVal) => {
                        if ( productId === $(wishlistVal).data('wishlistProductId') ) {
                            $(wishlistVal).addClass(this.options.activeClass);
                        }
                    });
                });
            });
        } else {
            $('[data-wishlist-amount]').text('0');
        }
    }
}

export default VtexWishlist;
