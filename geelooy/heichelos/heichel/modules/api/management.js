
/**
 * B"H
 * @module ManagementAPI
 * @description
 * Power (Gevurah) is required to manage the library. This module 
 * contains the rituals for Contraction—Deleting that which is 
 * no longer needed, Clearing chambers, and assigning new Guardians 
 * (Editors) to the Realm.
 */

import { AwtsmoosRequest, BASE_API_URL } from './base.js';

/**
 * @function deleteContent
 * @description Dismantles discrete sparks of data, returning them to the void.
 */
export async function deleteContent(data) {
    const { heichelId, aliasId, itemsToDelete } = data;
    const results = [];

    for (const item of itemsToDelete) {
        let reqUrl = item.type === 'post' 
            ? `${BASE_API_URL}heichelos/${heichelId}/series/${item.parentId}/post/${item.id}/delete` 
            : `${BASE_API_URL}heichelos/${heichelId}/series/${item.parentId}/deleteSubSeries/${item.id}`;

        const result = await AwtsmoosRequest.post(reqUrl, new URLSearchParams({ aliasId }));
        
        results.push({
            success: !!(result && (result.success || typeof result.deletedCount !== 'undefined' || result.ok)),
            item
        });
    }
    return results;
}

/**
 * @function clearSeries
 * @description Removes all children from a series without destroying the series itself.
 */
export async function clearSeries(data) {
    const { heichelId, aliasId, itemsToDelete } = data;
    const results = [];
    for (const item of itemsToDelete) {
        if (item.type !== 'series') continue;

        let reqUrl = `${BASE_API_URL}heichelos/${heichelId}/series/${item.parentId}/clearSubSeries/${item.id}`;
        const result = await AwtsmoosRequest.post(reqUrl, new URLSearchParams({ aliasId }));
        
        results.push({
            success: !!(result && (result.success || result.ok)),
            item
        });
    }
    return results;
}

/**
 * @function addEditor
 * @description Invites a new Guardian to watch over the Realm.
 */
export async function addEditor({ heichelId, aliasId, editorAliasId }) {
    return await AwtsmoosRequest.post(`${BASE_API_URL}heichelos/${encodeURIComponent(heichelId)}/editors`, new URLSearchParams({
        aliasId,
        editorAliasId
    }));
}


/**
 * @function removeEditor
 * @description Releases a Guardian from the Realm authority list.
 */
export async function removeEditor({ heichelId, aliasId, editorAliasId }) {
    return await AwtsmoosRequest.delete(`${BASE_API_URL}heichelos/${encodeURIComponent(heichelId)}/editors`, new URLSearchParams({
        aliasId,
        editorAliasId
    }));
}
