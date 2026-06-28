/**
 * B"H
 * @module ContentAPI
 * @description Legacy Heichel reader with the root-ikar silence removed.
 */
import { fetchData, postData, BASE_API_URL } from './core.js';

const SUMMARY_FIELDS = {
    content: 256,
    title: true,
    postId: true,
    author: true,
    id: true,
    seriesId: true,
    indexInSeries: true
};

function encoded(value, fallback = 'root') {
    return encodeURIComponent(value || fallback);
}

export async function getPostDetails(heichelId, seriesId = 'root') {
    const propertyMap = JSON.stringify(SUMMARY_FIELDS);
    const params = new URLSearchParams({ propertyMap });
    return fetchData(`${BASE_API_URL}heichelos/${encoded(heichelId, '')}/series/${encoded(seriesId)}/posts/details?${params}`);
}

export async function getBreadcrumb(heichelId, seriesId) {
    if (!seriesId || seriesId === 'root') return [];
    const data = await fetchData(`${BASE_API_URL}heichelos/${encoded(heichelId, '')}/series/${encoded(seriesId)}/breadcrumb`);
    return Array.isArray(data) ? data.reverse() : [];
}

export async function deleteContent(data) {
    const { heichelId, aliasId, itemsToDelete } = data;
    const results = [];
    for (const item of itemsToDelete) {
        const reqUrl = item.type === 'post'
            ? `${BASE_API_URL}heichelos/${encoded(heichelId, '')}/series/${encoded(item.parentId)}/post/${encoded(item.id, '')}/delete`
            : `${BASE_API_URL}heichelos/${encoded(heichelId, '')}/series/${encoded(item.parentId)}/deleteSubSeries/${encoded(item.id, '')}`;
        const res = await postData(reqUrl, new URLSearchParams({ aliasId }));
        results.push({ success: Boolean(res && (res.success || typeof res.deletedCount !== 'undefined' || res.ok)), item });
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
