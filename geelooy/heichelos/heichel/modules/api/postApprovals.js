//B"H
/**
 * @module postApprovals
 * @description Browser vessels for the submitted-post queue. Moderators and
 * editors can inspect, approve, or deny offerings before they enter a series.
 */

import { AwtsmoosRequest, BASE_API_URL } from './base.js';

function submittedUrl(heichelId, action = '') {
    const suffix = action ? `/${action}` : '';
    return `${BASE_API_URL}heichelos/${encodeURIComponent(heichelId)}/submittedPosts${suffix}`;
}

export async function getSubmittedPosts({ heichelId }) {
    return await AwtsmoosRequest.fetch(submittedUrl(heichelId));
}

export async function approveSubmittedPost({ heichelId, aliasId, postId }) {
    return await AwtsmoosRequest.post(submittedUrl(heichelId, 'approve'), new URLSearchParams({
        aliasId,
        postId
    }));
}

export async function denySubmittedPost({ heichelId, aliasId, postId }) {
    return await AwtsmoosRequest.post(submittedUrl(heichelId, 'deny'), new URLSearchParams({
        aliasId,
        postId
    }));
}
