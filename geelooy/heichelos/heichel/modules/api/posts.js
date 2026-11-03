/**
 * B"H
 * @module PostsAPI
 * @description
 * Chapter 902: Hebrew gates no longer walk naked through the URL storm.
 *
 * Series post cards ask the backend for specific fields through `properties`,
 * avoiding full post bodies when the Heichel navigator only needs summaries.
 * Every heichel and series identifier is encoded as a path segment so chambers
 * like `מנחם אב_meluket` and old Awtsmoos IDs arrive whole at the API gate.
 */

import { AwtsmoosRequest, BASE_API_URL } from './base.js';

function seg(value) {
    return encodeURIComponent(String(value || ''));
}

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
        indexInSeries: true,
        dayuh: { sections: true, footnotes: true }
    });
    const params = new URLSearchParams({ properties });
    return AwtsmoosRequest.fetch(`${BASE_API_URL}heichelos/${seg(heichelId)}/series/${seg(seriesId)}/posts/details?${params}`);
}

export async function getBreadcrumb(heichelId, seriesId) {
    if (seriesId === 'root') return [];
    const data = await AwtsmoosRequest.fetch(`${BASE_API_URL}heichelos/${seg(heichelId)}/series/${seg(seriesId)}/breadcrumb`);
    const trail = Array.isArray(data) ? data : Array.isArray(data?.success) ? data.success : [];
    return trail[0]?.id === 'root' ? trail : trail.toReversed?.() || [...trail].reverse();
}

export async function createPost({ heichelId, seriesId = 'root', aliasId, title, content, dayuh = '' }) {
    return await AwtsmoosRequest.post(
        `${BASE_API_URL}heichelos/${seg(heichelId)}/series/${seg(seriesId)}/posts`,
        new URLSearchParams({ aliasId, title, content, dayuh })
    );
}

/** Fetches one full post record (the summaries endpoint truncates bodies). */
export async function getPost(heichelId, seriesId, postId) {
    return AwtsmoosRequest.fetch(
        `${BASE_API_URL}heichelos/${seg(heichelId)}/series/${seg(seriesId)}/post/${seg(postId)}`
    );
}

/**
 * Edits one post through the canonical series-scoped PUT. The server only
 * applies non-empty fields, and callers pass content only when it was
 * genuinely seeded from the stored body and actually changed.
 */
export async function editPost({ heichelId, seriesId = 'root', postId, aliasId, title, content }) {
    const body = { aliasId };
    if (title) body.newTitle = title;
    if (content) body.newContent = content;
    return AwtsmoosRequest.send(
        `${BASE_API_URL}heichelos/${seg(heichelId)}/series/${seg(seriesId)}/post/${seg(postId)}`,
        'PUT',
        new URLSearchParams(body)
    );
}
