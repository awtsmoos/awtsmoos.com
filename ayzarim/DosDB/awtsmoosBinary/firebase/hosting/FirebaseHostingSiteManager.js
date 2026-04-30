
// B"H
/**
 * @file FirebaseHostingSiteManager.js
 * @chapter Verifying the Holy Place
 * @description
 * "Let them make Me a sanctuary, that I may dwell among them."
 * 
 * Before we can upload anything, we must ensure the `Site` exists in the Google Project.
 * The Awtsmoos creates the concept of 'space' from absolute void. 
 * This manager hits the GET site endpoint and asserts its existence. 
 * We now wield the purity of Bearer Headers instead of query strings.
 */

const HttpRequest = require("../network/HttpRequest.js");
const HostingUrlFactory = require("./HostingUrlFactory.js");

class FirebaseHostingSiteManager {
    /**
     * @method ensureSiteExists
     * @description Checks if the site vessel is ready. Throws if absent.
     * @param {string} projectId - Project essence.
     * @param {string} siteId - Site name.
     * @param {Object} authHeaders - Authorization Bearer header object.
     * @param {Function} log - The scribe of actions.
     */
    static async ensureSiteExists(projectId, siteId, authHeaders, log) {
        log(`[SITE_CHECK] B"H: Peering into the void to verify existence of Site: ${siteId}`);
        
        const urlParams = HostingUrlFactory.buildAdminUrl(siteId, `projects/${projectId}/sites/${siteId}`);

        try {
            // B"H: Pure Pathing! No access_token polluting the URL.
            await HttpRequest.send({
                hostname: urlParams.hostname,
                path: urlParams.path,
                method: "GET",
                headers: authHeaders
            });
            log(`[SITE_READY] B"H: The Site vessel '${siteId}' is prepared to receive light.`);
        } catch (e) {
            const rawError = e.message;
            if (rawError.includes("Status: 404")) {
                const severeDecree = `[SITE_MISSING] B"H: The Site '${siteId}' DOES NOT EXIST in the cloud. \n` +
                                     `You must enable Firebase Hosting manually in the Google Console for this project before continuing.\n` +
                                     `Absolute halt initiated.`;
                console.error(severeDecree);
                throw new Error(severeDecree);
            }
            throw e; 
        }
    }
}

module.exports = FirebaseHostingSiteManager;
