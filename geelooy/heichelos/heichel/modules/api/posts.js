/**
 * B"H
 * @module PostsAPI
 * @description
 * Root is not emptiness. The ikar series is also a series, and its posts must
 * be requested like every other chamber so the first Heichel screen can breathe.
 */
import { AwtsmoosRequest, BASE_API_URL } from './base.js';

const SUMMARY_FIELDS = {
    content: 256,
    title: true,
    postId: true,
    author: true,
    id: true,
    seriesId: true,
    parentSeriesId: true,
    indexInSeries: true
};

function encoded(value, fallback = 'root') {
    return encodeURIComponent(value || fallback);
}

export async function getPostDetails(heichelId, seriesId = 'root') {
    const properties = JSON.stringify(SUMMARY_FIELDS);
    const params = new URLSearchParams({ properties });
    return AwtsmoosRequest.fetch(
        `${BASE_API_URL}heichelos/${encoded(heichelId, '')}/series/${encoded(seriesId)}/posts/details?${params}`
    );
}

export async function getBreadcrumb(heichelId, seriesId) {
    if (!seriesId || seriesId === 'root') return [];
    const data = await AwtsmoosRequest.fetch(
        `${BASE_API_URL}heichelos/${encoded(heichelId, '')}/series/${encoded(seriesId)}/breadcrumb`
    );
    const trail = Array.isArray(data) ? data : Array.isArray(data?.success) ? data.success : [];
    return trail[0]?.id === 'root' ? trail : trail.toReversed?.() || [...trail].reverse();
}

export async function createPost({ heichelId, seriesId = 'root', aliasId, title, content, dayuh = '' }) {
    return await AwtsmoosRequest.post(
        `${BASE_API_URL}heichelos/${encoded(heichelId, '')}/series/${encoded(seriesId)}/posts`,
        new URLSearchParams({ aliasId, title, content, dayuh })
    );
}
