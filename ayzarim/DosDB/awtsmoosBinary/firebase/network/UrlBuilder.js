
// B"H
/**
 * @file UrlBuilder.js
 * @description
 * Every space is a void. Every special character is a permutation. 
 * The "unescaped characters" error you saw is a sign that the "lower worlds" 
 * (your file names) were trying to enter the "upper worlds" (HTTP requests) 
 * without the proper ritual garments.
 * 
 * We use a data-driven approach to weave the URL. We split the path into its constituent 
 * Sefirot (segments), clothe each one using `encodeURIComponent`, and then rejoin 
 * them with the sacred slash. This ensures that a filename like "tanya chabad.org" 
 * becomes "tanya%20chabad%2Eorg", which the heavenly servers can digest.
 */

class UrlBuilder {
    /**
     * @method build
     * @description Constructs a fully encoded URL, safe for the digital heavens.
     * @param {string} baseUrl - The foundation URL (e.g., https://firestore.googleapis.com).
     * @param {string} rawPath - The raw, earthly path (e.g., users/yosef/my file.json).
     * @param {string} authString - Authentication query parameter.
     * @param {string} [extraQuery=""] - Additional params.
     * @param {Object} [options={}] - Options like addJsonExtension.
     * @returns {Object} { hostname, path }
     */
    static build(baseUrl, rawPath, authString, extraQuery = "", options = {}) {
        // 1. Clothe the path segments
        const encodedPath = rawPath
            .split('/')
            .filter(Boolean) // Remove empty emanations
            .map(segment => UrlBuilder._clotheSegment(segment))
            .join('/');

        // 2. Handle extensions (Required for Realtime Database)
        let finalPath = encodedPath;
        if (options.addJsonExtension) {
            finalPath = finalPath ? `${finalPath}.json` : ".json";
        } else if (finalPath) {
            // For Firestore, we don't add .json, but we ensure no leading slash for URL constructor
        }

        // 3. Assemble the query string
        const queries = [];
        if (authString) queries.push(authString);
        if (extraQuery) queries.push(extraQuery);
        const queryPart = queries.length > 0 ? `?${queries.join('&')}` : "";

        // 4. Combine into a full URL string for the native parser
        const cleanBase = baseUrl.replace(/\/+$/, "");
        const fullUrlString = `${cleanBase}/${finalPath}${queryPart}`;
        
        try {
            const urlObj = new URL(fullUrlString);
            return {
                hostname: urlObj.hostname,
                path: urlObj.pathname + urlObj.search
            };
        } catch (e) {
            throw new Error(`B"H: The URL could not be formed. The path was too distorted: ${fullUrlString}`);
        }
    }

    /**
     * @method _clotheSegment
     * @private
     * @description Applies the URI garments to a single segment of the path.
     */
    static _clotheSegment(segment) {
        // encodeURIComponent handles spaces, emoji, and most special chars.
        let clothed = encodeURIComponent(segment);
        
        // We manually encode dots if they aren't encoded, 
        // as some servers treat leading/trailing dots strangely.
        return clothed.replace(/\./g, '%2E');
    }
}

module.exports = UrlBuilder;
