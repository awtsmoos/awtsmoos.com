// B"H
/**
 * @module CommentAPI
 * @description Browser vessels for post comments and reply comments.
 */

import { AwtsmoosRequest, BASE_API_URL } from './base.js';

export async function createComment({
    heichelId,
    postId,
    aliasId,
    seriesId = 'root',
    content,
    verseSection = 'root'
}) {
    return await AwtsmoosRequest.post(
        `${BASE_API_URL}heichelos/${encodeURIComponent(heichelId)}/post/${encodeURIComponent(postId)}/comments/`,
        new URLSearchParams({
            aliasId,
            seriesId,
            content,
            dayuh: JSON.stringify({ verseSection })
        })
    );
}

export async function replyToComment({
    heichelId,
    postId,
    commentId,
    aliasId,
    seriesId = 'root',
    content,
    verseSection = 'root'
}) {
    return await AwtsmoosRequest.post(
        `${BASE_API_URL}heichelos/${encodeURIComponent(heichelId)}/comment/${encodeURIComponent(commentId)}`,
        new URLSearchParams({
            aliasId,
            postId,
            seriesId,
            content,
            dayuh: JSON.stringify({ verseSection })
        })
    );
}

export async function listCommentAuthors({
    heichelId,
    postId,
    seriesId = 'root',
    verseSection = 'root'
}) {
    return await AwtsmoosRequest.fetch(
        `${BASE_API_URL}heichelos/${encodeURIComponent(heichelId)}/post/${encodeURIComponent(postId)}/comments/aliases?${new URLSearchParams({
            seriesId,
            verseSection
        })}`
    );
}

export async function listCommentsByAlias({
    heichelId,
    postId,
    aliasId,
    seriesId = 'root',
    verseSection = 'root'
}) {
    return await AwtsmoosRequest.fetch(
        `${BASE_API_URL}heichelos/${encodeURIComponent(heichelId)}/comments/inSeries/${encodeURIComponent(seriesId)}/atPost/${encodeURIComponent(postId)}/atAlias/${encodeURIComponent(aliasId)}?${new URLSearchParams({
            verseSection
        })}`
    );
}
