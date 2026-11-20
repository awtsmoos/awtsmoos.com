
/**
 * B"H
 * @module HeichelAPI
 * @description 
 * Logic specific to the retrieval and verification of realms (Heichelos).
 */

import { fetchData, postData, BASE_API_URL } from './core.js';

export async function getHeichelDetails(heichelId) {
    return fetchData(`${BASE_API_URL}heichelos/${heichelId}`);
}

export async function checkOwnership(aliasId, heichelId) {
    if (!aliasId || !heichelId) return false;
    const res = await fetchData(`${BASE_API_URL}alias/${aliasId}/heichelos/${heichelId}/ownership`);
    // fetchData resolves null when the request itself failed; that is not
    // an ownership answer. Throw so the caller can retry instead of
    // mistaking a transient rupture for "not the owner" and hiding every
    // owner surface for the rest of the page view.
    if (res == null) throw new Error('Ownership check could not reach the server.');
    return !!res?.yes;
}

export async function getEditors(heichelId) {
    return fetchData(`${BASE_API_URL}heichelos/${heichelId}/editors`);
}

export async function addEditor({ heichelId, aliasId, editorAliasId }) {
    return postData(`${BASE_API_URL}heichelos/${heichelId}/editors`, new URLSearchParams({
        aliasId,
        editorAliasId
    }));
}
