
const vtexUtilsVersion = '1.2.0';

export default {
    DELAY_TIME: 150, // Miliseconds
    STORAGE_NAME: '__vtexWishlist.attributes__',
    SESSION_NAME: '__vtexWishlist.session__',
    RETRIEVED_DATA: [
        'wishlistProducts',
    ],
    MESSAGES: {
        vtexUtils: 'VtexUtils.js is required and must be an instance. Download it from https://www.npmjs.com/package/vtex-utils',
        vtexUtilsVersion: vtexUtilsVersion,
        vtexUtilsVersionMessage: `VtexUtils version must be higher than ${vtexUtilsVersion}. Download last version on https://www.npmjs.com/package/vtex-utils`,
        vtexMasterdata: 'VtexMasterdata.js is required. Download it from https://www.npmjs.com/package/vtex-masterdata',
        storeName: `The option 'storeName' is required and must be a string.`,
        shelfId: `The option 'shelfId' is required and must be a string.`,
        notFound: `The option 'notFound' must be a function.`,
    },
};
