//B"H
/**
 * API key routes for Node and script access.
 */

const {
    createApiKey,
    listApiKeys,
    revokeApiKey,
    verifyApiKey
} = require('./helper/apiKeys.js');

const { er } = require('./helper/general.js');

module.exports = ({ $i, userid } = {}) => ({
    "/keys": async () => {
        if ($i.request.method === 'GET') return await listApiKeys({ $i, userid });
        if ($i.request.method === 'POST') return await createApiKey({ $i, userid });
        return er({ code: 'BAD_METHOD', message: 'Use GET or POST.' });
    },

    "/keys/verify": async () => {
        if ($i.request.method !== 'GET' && $i.request.method !== 'POST') {
            return er({ code: 'BAD_METHOD', message: 'Use GET or POST.' });
        }
        return await verifyApiKey({ $i });
    },

    "/keys/:key/revoke": async vars => {
        if ($i.request.method !== 'POST' && $i.request.method !== 'DELETE') {
            return er({ code: 'BAD_METHOD', message: 'Use POST or DELETE.' });
        }
        return await revokeApiKey({ $i, userid, keyId: vars.key });
    }
});
