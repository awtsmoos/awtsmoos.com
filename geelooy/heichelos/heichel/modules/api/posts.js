
/**
 * B"H
 * @module PostsAPI
 * @description
 * Every post is a letter (Ot) in the great scroll of the Heichel. 
 * This module manages the retrieval of these letters, ensuring 
 * the seeker sees the full picture and the path (Breadcrumbs) 
 * that led to each revelation.
 */

import { AwtsmoosRequest, BASE_API_URL } from './base.js';

/**
 * @function getPostDetails
 * @description Retrieves the sparks of many posts within a series.
 */
export async function getPostDetails(heichelId, seriesId) {
    if (!seriesId || seriesId === 'root') return [];
    
    // We define which attributes of the light we wish to see
    const propertyMap = JSON.stringify({
        content: 256,
        title: true,
        postId: true,
        author: true,
        id: true,
        seriesId: true,
        indexInSeries: true
    });
    const params = new URLSearchParams({ propertyMap });
    return AwtsmoosRequest.fetch(`${BASE_API_URL}heichelos/${heichelId}/series/${seriesId}/posts/details?${params}`);
}

/**
 * @function getBreadcrumb
 * @description Maps the journey from the infinite root to the current particular point.
 */
export async function getBreadcrumb(heichelId, seriesId) {
    if (seriesId === 'root') return [];
    const data = await AwtsmoosRequest.fetch(`${BASE_API_URL}heichelos/${heichelId}/series/${seriesId}/breadcrumb`);
    // Breadcrumbs are returned from specific to general; we reverse to follow the flow of light.
    return data?.reverse() || [];
}


/**
 * @function createPost
 * @description Creates a regular post in the current heichel series.
 */
export async function createPost({ heichelId, seriesId = 'root', aliasId, title, content, dayuh = '' }) {
    return await AwtsmoosRequest.post(
        `${BASE_API_URL}heichelos/${encodeURIComponent(heichelId)}/series/${encodeURIComponent(seriesId)}/posts`,
        new URLSearchParams({
            aliasId,
            title,
            content,
            dayuh
        })
    );
}
