
import CONSTANTS from './vtex-wishlist.constants.js';

export default {
    /**
     * Render Wishlist products
     * @param  {Number} page Get specific page
     *
     * @example
     *     // The element to receive data may be a empty list with data attribute 'data-wishlist-items'
     *     <ul class="wishlist__items" data-wishlist-items="data-wishlist-items"></ul>
     */
    _renderProducts(page = 1) {
        const $wishlistItems = $('[data-wishlist-items]');
        const storeVal = this._storage.get(CONSTANTS.STORAGE_NAME);
        const splitList = true;
        const params = {
            quantity: this._self.options.perPage * page,
            fq: storeVal.productsId,
            shelfId: this._self.options.shelfId,
            order: this._self.options.orderBy,
        };

        if ( $wishlistItems.length < 1 ) {
            // Container doesn't exists
            return false;
        }

        $(document).trigger(CONSTANTS.EVENTS.BEFORE_SHOW_ITEMS);

        if ( storeVal.productsId.length < 1 ) {
            this._setEmptyAttr($wishlistItems);
            return false;
        }

        this._vtexCatalog.searchPage(params, splitList).then(($item) => {
            if ( $item.length < 1 ) {
                this._setEmptyAttr($wishlistItems);
                return false;
            }

            $item.removeClass('first last')
                .addClass(this._self.options.itemClass);

            this._removeEmptyClass();

            $wishlistItems.empty().append($item);

            this._storageObserve();
        })
        .fail((err) => window.console.log(err))
        .always(() => {
            this._removeLoadMoreClass();

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
    _changeOrder() {
        const $wishlistOrderBy = $('[data-wishlist-order-by]');

        $wishlistOrderBy.find('input').on('change', (ev) => {
            ev.preventDefault();

            const $this = $(ev.currentTarget);
            const value = $this.val();

            $(document).trigger(CONSTANTS.EVENTS.BEFORE_ORDER_BY_ITEMS);

            this._addOrderByClass();
            this._resetLoadMoreBtn();
            this._setUrlHash();

            $this.parent('label').addClass(this._self.options.activeClass);
            $this.parent('label').siblings().removeClass(this._self.options.activeClass);
            this._self.options.orderBy = value;
            this._renderProducts();

            $(document).one('afterShowItems.vtexWishlist', (ev) => {
                $(document).trigger(CONSTANTS.EVENTS.AFTER_ORDER_BY_ITEMS);
                this._removeOrderByClass();
            });
        });
    },

    _setEmptyAttr($wishlistItems) {
        this._addEmptyClass();
        $wishlistItems.empty().append(this._self.options.notFound);

        $(document).trigger(CONSTANTS.EVENTS.AFTER_SHOW_ITEMS);
    },
};
