
/**
 * B"H
 * @module APICore
 * @description
 * In the beginning, there was only the Infinite. Then, the Kav (Line) 
 * of light was projected to allow communication. This module 
 * contains the core logic for fetching and posting data, the 
 * essential lifeblood (Dam) of the library.
 */

export const BASE_API_URL = "/api/social/";

/**
 * @function fetchData
 * @description Retrieves sparks of data from a divine endpoint.
 */
export async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API Gateway Rupture: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (e) {
        console.error("B\"H - Fetch failure at path:", url, e);
        return null;
    }
}

/**
 * @function postData
 * @description Sends a vessel of data outward to be processed.
 */
export async function postData(url, body) {
    try {
        const response = await fetch(url, {
            method: "POST",
            body
        });
        if (!response.ok) {
            throw new Error(`API Submission Rupture: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (e) {
        console.error("B\"H - Posting failure at path:", url, e);
        return null;
    }
}
