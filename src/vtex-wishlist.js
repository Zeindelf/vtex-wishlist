
import CONSTANTS from './vtex-wishlist.constants.js';
import vtexWishlistMethods from './vtex-wishlist.methods.js';

/**
 * Create a VtexWishlist class
 * Vtex utilities methods
 */
class VtexWishlist {
    constructor(vtexUtils, vtexMasterdata, VtexCatalog, catalogCache = false) {
        /**
         * Version
         * @type {String}
         */
        this.version = '0.0.1';

        /**
         * Package name
         * @type {String}
         */
        this.name = '@VtexWishlist';

        // Validate VtexUtils.js
        if ( vtexUtils === undefined ) {
            throw new TypeError(CONSTANTS.MESSAGES.vtexUtils);
        }

        if ( vtexUtils.name !== '@VtexUtils' ) {
            throw new TypeError(CONSTANTS.MESSAGES.vtexUtils);
        }

        if ( vtexUtils.version < CONSTANTS.MESSAGES.vtexUtilsVersion ) {
            throw new Error(CONSTANTS.MESSAGES.vtexUtilsVersionMessage);
        }

        /**
         * Global Helpers instance
         * @type {GlobalHelpers}
         */
        this.globalHelpers = vtexUtils.globalHelpers;

        /**
         * Vtex Helpers instance
         * @type {VtexHelpers}
         */
        this.vtexHelpers = vtexUtils.vtexHelpers;

        // Validate VtexMasterdata.js
        if ( vtexMasterdata === undefined ) {
            throw new Error(CONSTANTS.MESSAGES.vtexMasterdata);
        }

        /**
         * Vtex Masterdata instance
         * @type {VtexMasterdata}
         */
        this.vtexMasterdata = vtexMasterdata;

        /**
         * Vtex Catalog instance
         * @type {VtexCatalog}
         */
        this.vtexCatalog = new VtexCatalog(vtexUtils, catalogCache);

        /**
         * Local/Session Storage
         * @type {Object}
         */
        this.storage = vtexUtils.storage;

        /**
         * Extend public methods
         * @type {Method}
         */
        this.globalHelpers.extend(VtexWishlist.prototype, vtexWishlistMethods);
    }
}

export default VtexWishlist;
