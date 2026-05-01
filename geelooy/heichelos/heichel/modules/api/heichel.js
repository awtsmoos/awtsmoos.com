
/**
 * B"H
 * @module HeichelAPI
 * @description
 * "Every Heichel (Chamber) has its own gate." This module provides 
 * the keys to unlock the identity of the library itself. It 
 * queries the static attributes and the ownership authority, 
 * ensuring the seeker knows where they stand in the Divine geography.
 */

import { AwtsmoosRequest, BASE_API_URL } from './base.js';

/**
 * @function getHeichelDetails
 * @description Retrieves the name, description, and metadata of the chamber.
 * @param {string} heichelId - The ID of the Realm.
 */
export async function getHeichelDetails(heichelId) {
    return AwtsmoosRequest.fetch(`${BASE_API_URL}heichelos/${heichelId}`);
}

/**
 * @function checkOwnership
 * @description Verifies if a specific spark (alias) holds the keys to the chamber.
 * @param {string} aliasId - The ID of the seeker.
 * @param {string} heichelId - The ID of the Realm.
 */
export async function checkOwnership(aliasId, heichelId) {
    if (!aliasId || !heichelId) return false;
    const res = await AwtsmoosRequest.fetch(`${BASE_API_URL}alias/${aliasId}/heichelos/${heichelId}/ownership`);
    return !!res?.yes;
}

/**
 * @function getEditors
 * @description Retrieves the assembly of guardians who watch over this chamber.
 * @param {string} heichelId - The ID of the Realm.
 */
export async function getEditors(heichelId) {
    return AwtsmoosRequest.fetch(`${BASE_API_URL}heichelos/${heichelId}/editors`);
}
