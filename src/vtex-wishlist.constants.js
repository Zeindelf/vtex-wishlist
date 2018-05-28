
const vtexCatalogVersion = '1.0.0';

export default {
    DELAY_TIME: 100, // Miliseconds
    EXPIRE_TIME: 60 * 60 * 4, // Seconds * Minutes * Hours (default: 4h)
    STORAGE_NAME: '_vw_attributes',
    SESSION_NAME: '_vw_session',
    RETRIEVED_DATA: [
        'wishlistProducts',
    ],
    MESSAGES: {
        vtexUtils: 'VtexUtils.js is required. Download it from https://www.npmjs.com/package/vtex-utils',
        vtexMasterdata: 'VtexMasterdata.js is required. Download it from https://www.npmjs.com/package/vtex-masterdata',
        vtexCatalog: 'VtexCatalog.js is required. Download it from https://www.npmjs.com/package/vtex-catalog',
        vtexCatalogVersion: vtexCatalogVersion,
        vtexCatalogVersionMessage: `VtexCatalog version must be higher than ${vtexCatalogVersion}. Download last version on https://www.npmjs.com/package/vtex-catalog`,

        shelfId: `The option 'shelfId' is required and must be a string.`,
        notFound: `The option 'notFound' must be a function.`,
        wishlistItems: `You'll need declare an container with data attribute '<div data-wishlist-items=""></div>' to append your list.`,
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
        AFTER_CLEAR_ITEMS: 'afterClearItems.vtexWishlist',
    },
    BODY: $('body'),
};
