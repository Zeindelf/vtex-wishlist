
import CONSTANTS from './vtex-wishlist.constants.js';

export default {
    _splitPages() {
        if ( ! CONSTANTS.BODY.hasClass(this._self.options.wishlistPage) ) {
            return false;
        }

        const storeVal = this._storage.get(CONSTANTS.STORAGE_NAME);
        const chunkItems = this._globalHelpers.chunk(storeVal.productsId, this._self.options.perPage);

        storeVal.pagination.totalPages = chunkItems.length;
        storeVal.pagination.perPage = this._self.options.perPage;

        this._storage.set(CONSTANTS.STORAGE_NAME, storeVal);
    },

    // TODO: Create Pagination

    _createLoadMore() {
        if ( ! CONSTANTS.BODY.hasClass(this._self.options.wishlistPage) ) {
            return false;
        }

        const $loadMoreWrapper = $('<div />', {class: this._self.options.loadMoreWrapperClass});
        const $loadMoreBtn = $('<button />', {
            class: this._self.options.loadMoreBtnClass,
            ['data-wishlist-page']: 2,
            ['data-wishlist-load-more-btn']: 'data-wishlist-load-more-btn',
        }).text(this._self.options.loadMoreText);

        $loadMoreWrapper.append($loadMoreBtn);
        $loadMoreWrapper.insertAfter('[data-wishlist-items]');
    },

    _loadMoreActions() {
        if ( ! CONSTANTS.BODY.hasClass(this._self.options.wishlistPage) ) {
            return false;
        }

        $(document).on('click', '[data-wishlist-load-more-btn]', (ev) => {
            ev.preventDefault();

            const storeVal = this._storage.get(CONSTANTS.STORAGE_NAME);
            const $this = $(ev.currentTarget);
            const page = $this.data('wishlistPage');
            const newPage = page + 1;

            this._addLoadMoreClass();

            if ( page >= storeVal.pagination.totalPages ) {
                $this.hide();
            }

            this._setUrlHash(page);
            this._renderProducts(page);
            $this.data('wishlistPage', newPage);
        });
    },

    _setLoadMoreBtn() {
        if ( ! CONSTANTS.BODY.hasClass(this._self.options.wishlistPage) ) {
            return false;
        }

        const storeVal = this._storage.get(CONSTANTS.STORAGE_NAME);
        const $loadMoreBtn = $(document).find('[data-wishlist-load-more-btn]');

        if ( storeVal.pagination.page >= storeVal.pagination.totalPages ) {
            $loadMoreBtn.hide();
        } else {
            $loadMoreBtn.show();
        }
    },

    _resetLoadMoreBtn() {
        if ( ! CONSTANTS.BODY.hasClass(this._self.options.wishlistPage) ) {
            return false;
        }

        const $loadMoreBtn = $(document).find('[data-wishlist-load-more-btn]');
        $loadMoreBtn.data('wishlistPage', 2);
    },

    _setUrlHash(page) {
        if ( ! CONSTANTS.BODY.hasClass(this._self.options.wishlistPage) ) {
            return false;
        }

        const storeVal = this._storage.get(CONSTANTS.STORAGE_NAME);
        const pageNumber = typeof page !== 'undefined' ? page : 1;

        storeVal.pagination.page = pageNumber;
        window.location.hash = pageNumber;
        this._storage.set(CONSTANTS.STORAGE_NAME, storeVal);
    },
};
