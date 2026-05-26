
/**
 * B"H
 * @module BaseFetcher
 * @description
 * In the beginning, the Awtsmoos created a vacuum (Tzimtzum) so that 
 * existence could be manifest. Into this vacuum, a single line of 
 * light—the Kav—was projected. This module is that Kav. It carries 
 * the requests into the dark void of the network and returns with 
 * the sparks of data (Reshimu). 
 * 
 * Without the Fetcher, the Library would be an empty vessel, 
 * disconnected from the Source of its content.
 */

export const BASE_API_URL = "/api/social/";

/**
 * @class AwtsmoosRequest
 * @description The holy vessel for network interactions.
 */
export class AwtsmoosRequest {
    /**
     * @method fetch
     * @description Retrieves the hidden sparks from a specific coordinates (URL).
     * @param {string} url - The celestial path to the data.
     * @returns {Promise<Object|null>} - The manifest data or null if the void resisted.
     */
    static async fetch(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Kav Interrupted: ${response.status} ${response.statusText}`);
            }
            return await response.json();
        } catch (e) {
            console.error("B\"H - A rupture occurred in the retrieval of light:", url, e);
            return null;
        }
    }

    /**
     * @method post
     * @description Sends a vessel of intent (data) to be processed in the higher realms.
     * @param {string} url - The destination of the intent.
     * @param {URLSearchParams|FormData} body - The letters of intent.
     * @returns {Promise<Object|null>} - The response from the server's wisdom.
     */
    static async post(url, body) {
        return await this.send(url, "POST", body);
    }

    /**
     * @method delete
     * @description Removes a vessel through a guarded request.
     */
    static async delete(url, body) {
        return await this.send(url, "DELETE", body);
    }

    /**
     * @method send
     * @description Carries a mutation request and returns structured JSON.
     */
    static async send(url, method, body) {
        try {
            const response = await fetch(url, { method, body });
            if (!response.ok) {
                throw new Error(`Submission Denied: ${response.status} ${response.statusText}`);
            }
            return await response.json();
        } catch (e) {
            console.error("B\"H - The intent failed to manifest at path:", url, e);
            return null;
        }
    }
}
