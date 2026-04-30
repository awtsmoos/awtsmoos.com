
// B"H
/**
 * @file FirebaseHostingPathResolver.js
 * @chapter The Mapper of the Heavenly Epoch
 * @description
 * "He counts the number of the stars; He calls them all by their names."
 * 
 * The 404 error occurred because Google returns resource names like 
 * `sites/abc/versions/123` but requires you to call them as 
 * `/v1beta1/sites/abc/versions/123`. 
 * 
 * This module is the Resolver. It takes any resource name and ensures it is 
 * properly aligned with the `v1beta1` epoch. It is the bulletproof bridge 
 * between what Google says and what Google expects.
 */

const Constants = require("./FirebaseHostingApiConstants.js");

class FirebaseHostingPathResolver {
    /**
     * @method resolve
     * @description Ensures a path is prefixed with the API version.
     * @param {string} resourceName - The raw name (e.g. sites/x/versions/y)
     * @param {string} [method] - Optional custom method (e.g. :populateFiles)
     * @returns {string} The fully resolved path for the REST Chariot.
     */
    static resolve(resourceName, method = "") {
        let path = resourceName;
        
        // Remove leading slash if present to prevent double-slashing
        path = path.replace(/^\//, "");
        
        // Ensure the v1beta1 prefix exists at the start
        const prefix = `${Constants.VERSION}/`;
        if (!path.startsWith(prefix)) {
            path = prefix + path;
        }

        // Add the custom method (e.g. :populateFiles) if provided
        if (method) {
            const methodSuffix = method.startsWith(":") ? method : `:${method}`;
            path += methodSuffix;
        }

        // Ensure it starts with a single leading slash for the HTTP request
        return "/" + path;
    }
}

module.exports = FirebaseHostingPathResolver;
