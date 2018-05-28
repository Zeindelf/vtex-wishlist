
import CONSTANTS from './vtex-wishlist.constants.js';
import vtexWishlistMethods from './vtex-wishlist.methods.js';

/**
 * Create a VtexWishlist class
 * Vtex utilities methods
 */
class VtexWishlist {
    constructor(vtexUtils, vtexMasterdata, vtexCatalog) {
        /**
         * Version
         * @type {String}
         */
        this.version = '0.6.0';

        /**
         * Package name
         * @type {String}
         */
        this.name = '@VtexWishlist';

        // Validate Vtex Libs
        if ( vtexUtils === undefined ) {
            throw new TypeError(CONSTANTS.MESSAGES.vtexUtils);
        }

        if ( vtexCatalog === undefined ) {
            throw new TypeError(CONSTANTS.MESSAGES.vtexCatalog);
        }

        if ( vtexMasterdata === undefined ) {
            throw new Error(CONSTANTS.MESSAGES.vtexMasterdata);
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

        /**
         * Vtex Masterdata instance
         * @type {VtexMasterdata}
         */
        this.vtexMasterdata = vtexMasterdata;

        /**
         * Vtex Catalog instance
         * @type {VtexCatalog}
         */
        this.vtexCatalog = vtexCatalog;

        /**
         * Validate Vtex Libs instances
         */
        if ( this.vtexCatalog.name !== '@VtexCatalog' ) {
            throw new TypeError(CONSTANTS.MESSAGES.vtexCatalog);
        }

        if ( this.vtexCatalog.version < CONSTANTS.MESSAGES.vtexCatalogVersion ) {
            throw new Error(CONSTANTS.MESSAGES.vtexCatalogVersionMessage);
        }

        if ( this.vtexMasterdata.name !== '@VtexMasterdata' ) {
            throw new TypeError(CONSTANTS.MESSAGES.vtexMasterdata);
        }

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
