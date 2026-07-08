
import DBConnection from './DBConnection.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import DBReader from './DBReader.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import DBWriter from './DBWriter.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import DBDeleter from './DBDeleter.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

/**
 * B"H
 * @class AssetCache
 * @description
 * ==============================================================================
 * 🏰 THE TEMPLE OF ASSEMBLAGE 🏰
 * ==============================================================================
 * The outer face. Seder Hishtalshelus dictates that complexity must be 
 * wrapped in unity for the higher entities to interact with it properly.
 * 
 * By importing this `AssetCache`, other realms do not need to understand 
 * the profound sub-systems of connections, reads, or scribing—they simply 
 * request existence and existence flows back to them.
 */
export default class AssetCache {
    /** @returns {Promise<IDBDatabase|null>} */
    static init() { 
        return DBConnection.init(); 
    }
    
    /** @returns {Promise<Blob|null>} */
    static get(url) { 
        return DBReader.get(url); 
    }
    
    /** @returns {Promise<void>} */
    static put(url, blob) { 
        return DBWriter.put(url, blob); 
    }
    
    /** @returns {Promise<void>} */
    static delete(url) { 
        return DBDeleter.delete(url); 
    }
}
