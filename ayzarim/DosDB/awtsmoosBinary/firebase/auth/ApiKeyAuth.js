
// B"H
/**
 * @file ApiKeyAuth.js
 * @description
 * A simpler path. A direct name. Like invoking a lesser name of the Divine, 
 * the API key opens specific doors without the complex dance of the Tzaddik (OAuth).
 */

class ApiKeyAuth {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    async getAuthQueryString() {
        return `auth=${encodeURIComponent(this.apiKey)}`;
    }
}

module.exports = ApiKeyAuth;
