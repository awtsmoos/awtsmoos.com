/**
 * B"H
 * @module PostsAPI
 * @description
 * The ikar root reader returns to the old gate: `/posts/details`. New nested
 * series still use `/series/:id/posts/details`, so both old and new APIs walk
 * together without erasing either path.
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
    indexInSeries: true,
    createdAt: true,
    dayuh: true
};

function encoded(value, fallback = 'root') {
    return encodeURIComponent(value || fallback);
}
function query() {
    return new URLSearchParams({ properties: JSON.stringify(SUMMARY_FIELDS), propertyMap: JSON.stringify(SUMMARY_FIELDS) });
}
function postsDetailsUrl(heichelId, seriesId = 'root') {
    const base = `${BASE_API_URL}heichelos/${encoded(heichelId, '')}`;
    if (!seriesId || seriesId === 'root') return `${base}/posts/details?${query()}`;
    return `${base}/series/${encoded(seriesId)}/posts/details?${query()}`;
}

export async function getPostDetails(heichelId, seriesId = 'root') {
    return AwtsmoosRequest.fetch(postsDetailsUrl(heichelId, seriesId));
}

export async function getBreadcrumb(heichelId, seriesId) {
    if (!seriesId || seriesId === 'root') return [];
    const data = await AwtsmoosRequest.fetch(`${BASE_API_URL}heichelos/${encoded(heichelId, '')}/series/${encoded(seriesId)}/breadcrumb`);
    const trail = Array.isArray(data) ? data : Array.isArray(data?.success) ? data.success : [];
    return trail[0]?.id === 'root' ? trail : trail.toReversed?.() || [...trail].reverse();
}

export async function createPost({ heichelId, seriesId = 'root', aliasId, title, content, dayuh = '' }) {
    return await AwtsmoosRequest.post(
        `${BASE_API_URL}heichelos/${encoded(heichelId, '')}/series/${encoded(seriesId)}/posts`,
        new URLSearchParams({ aliasId, title, content, dayuh })
    );
}
