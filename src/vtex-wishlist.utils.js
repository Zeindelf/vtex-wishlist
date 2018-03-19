
import CONSTANTS from './vtex-wishlist.constants.js';

export default {
    _setPadding(qty) {
        return ( this._self.options.zeroPadding ) ? this._self.globalHelpers.pad(qty) : qty;
    },

    _addEmptyClass() {
        CONSTANTS.BODY.addClass(this._self.options.emptyClass);
    },

    _removeEmptyClass() {
        CONSTANTS.BODY.removeClass(this._self.options.emptyClass);
    },

    _addLoadMoreClass() {
        CONSTANTS.BODY.addClass(this._self.options.loadMoreBodyClass);
    },

    _removeLoadMoreClass() {
        CONSTANTS.BODY.removeClass(this._self.options.loadMoreBodyClass);
    },

    _addOrderByClass() {
        CONSTANTS.BODY.addClass(this._self.options.orderByBodyClass);
    },

    _removeOrderByClass() {
        CONSTANTS.BODY.removeClass(this._self.options.orderByBodyClass);
    },
};
