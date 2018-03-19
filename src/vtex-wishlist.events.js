
import CONSTANTS from './vtex-wishlist.constants.js';

export default {
    _requestStartEvent() {
        $(document).trigger(CONSTANTS.EVENTS.REQUEST_START);
    },

    _requestAddStartEvent() {
        $(document).trigger(CONSTANTS.EVENTS.REQUEST_ADD_START);
    },

    _requestRemoveStartEvent() {
        $(document).trigger(CONSTANTS.EVENTS.REQUEST_REMOVE_START);
    },

    _requestEndEvent(productId) {
        $(document).trigger(CONSTANTS.EVENTS.REQUEST_END, [productId]);
    },

    _requestAddEndEvent(productId) {
        $(document).trigger(CONSTANTS.EVENTS.REQUEST_ADD_END, [productId]);
    },

    _requestRemoveEndEvent(productId) {
        $(document).trigger(CONSTANTS.EVENTS.REQUEST_REMOVE_END, [productId]);
    },

    _beforeShowItemsEvent() {
        $(document).trigger(CONSTANTS.EVENTS.BEFORE_SHOW_ITEMS);
    },

    _afterShowItemsEvent() {
        $(document).trigger(CONSTANTS.EVENTS.AFTER_SHOW_ITEMS);
    },

    _beforeClearItemsEvent() {
        $(document).trigger(CONSTANTS.EVENTS.BEFORE_CLEAR_ITEMS);
    },

    _afterClearItemsEvent() {
        $(document).trigger(CONSTANTS.EVENTS.AFTER_CLEAR_ITEMS);
    },
};
