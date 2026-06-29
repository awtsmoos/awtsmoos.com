/**
 * B"H
 * @module PostsAPI
 * @description
 * Chapter 41: The browser learned to request a measured glow.
 *
 * Series post cards ask the backend for specific fields through `properties`,
 * avoiding full post bodies when the Heichel navigator only needs summaries.
 */

import { AwtsmoosRequest, BASE_API_URL } from './base.js';

export async function getPostDetails(heichelId, seriesId) {
    if (!seriesId || seriesId === 'root') return [];
    const properties = JSON.stringify({
        content: 256,
        title: true,
        postId: true,
        author: true,
        id: true,
        seriesId: true,
        parentSeriesId: true,
        indexInSeries: true
    });
    const params = new URLSearchParams({ properties });
    return AwtsmoosRequest.fetch(`${BASE_API_URL}heichelos/${heichelId}/series/${seriesId}/posts/details?${params}`);
}

export async function getBreadcrumb(heichelId, seriesId) {
    if (seriesId === 'root') return [];
    const data = await AwtsmoosRequest.fetch(`${BASE_API_URL}heichelos/${heichelId}/series/${seriesId}/breadcrumb`);
    const trail = Array.isArray(data) ? data : Array.isArray(data?.success) ? data.success : [];
    return trail[0]?.id === 'root' ? trail : trail.toReversed?.() || [...trail].reverse();
}

export async function createPost({ heichelId, seriesId = 'root', aliasId, title, content, dayuh = '' }) {
    return await AwtsmoosRequest.post(
        `${BASE_API_URL}heichelos/${encodeURIComponent(heichelId)}/series/${encodeURIComponent(seriesId)}/posts`,
        new URLSearchParams({ aliasId, title, content, dayuh })
    );
}
