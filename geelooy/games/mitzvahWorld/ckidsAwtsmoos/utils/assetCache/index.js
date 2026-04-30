
import DBConnection from './DBConnection.js';
import DBReader from './DBReader.js';
import DBWriter from './DBWriter.js';
import DBDeleter from './DBDeleter.js';

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
