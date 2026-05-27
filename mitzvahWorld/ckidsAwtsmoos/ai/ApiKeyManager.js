
// B"H
/**
 * ApiKeyManager.js
 * Manages Google Gemini API keys, handles rotation on quota limits, and persistence.
 */

export default class ApiKeyManager {
    static STORAGE_KEY = "AWTSMOOS_GEMINI_KEYS";
    
    static getKeys() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            return [];
        }
    }

    static saveKeys(keys) {
        // Filter empty strings and duplicates
        const unique = [...new Set(keys.filter(k => k && k.trim().length > 0))];
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(unique));
    }

    static addKey(key) {
        const keys = this.getKeys();
        keys.push(key);
        this.saveKeys(keys);
    }

    static async getActiveKey() {
        const keys = this.getKeys();
        if (keys.length === 0) return null;
        
        // Simple rotation strategy: pick the first one. 
        // If it fails, the adapter calls rotateKey which moves it to the end.
        return keys[0];
    }

    static rotateKey() {
        const keys = this.getKeys();
        if (keys.length > 1) {
            const first = keys.shift();
            keys.push(first); // Move to back
            this.saveKeys(keys);
            console.log("B\"H - API Quota hit. Rotating to next key.");
            return keys[0];
        }
        return keys[0];
    }
    
    static hasKeys() {
        return this.getKeys().length > 0;
    }
}
