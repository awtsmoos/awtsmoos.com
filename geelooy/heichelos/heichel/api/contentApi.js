
/**
 * B"H
 * @module ContentAPI
 */

import { fetchData, postData, BASE_API_URL } from './core.js';

export async function getPostDetails(heichelId, seriesId) {
    if (!seriesId || seriesId === 'root') return [];
    
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
    return fetchData(`${BASE_API_URL}heichelos/${heichelId}/series/${seriesId}/posts/details?${params}`);
}

export async function getBreadcrumb(heichelId, seriesId) {
    if (seriesId === 'root') return [];
    const data = await fetchData(`${BASE_API_URL}heichelos/${heichelId}/series/${seriesId}/breadcrumb`);
    return data?.reverse() || [];
}

export async function deleteContent(data) {
    const { heichelId, aliasId, itemsToDelete } = data;
    const results = [];
    for (const item of itemsToDelete) {
        let reqUrl = item.type === 'post' 
            ? `${BASE_API_URL}heichelos/${heichelId}/series/${item.parentId}/post/${item.id}/delete` 
            : `${BASE_API_URL}heichelos/${heichelId}/series/${item.parentId}/deleteSubSeries/${item.id}`;

        const res = await postData(reqUrl, new URLSearchParams({ aliasId }));
        results.push({
            success: (res && (res.success || typeof res.deletedCount !== 'undefined' || res.ok)),
            item
        });
    }
    return results;
}

export function generateInputId(title) {
    if (!title) return `item-${Date.now()}`;
    const cleaned = title.replace(/[^a-zA-Z0-9\u0590-\u05FF\s-]/g, ' ').trim();
    const words = cleaned.split(/[\s-]+/).filter(Boolean);
    if (words.length === 0) return `item-${Date.now()}`;
    return words[0].toLowerCase() + words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
}
