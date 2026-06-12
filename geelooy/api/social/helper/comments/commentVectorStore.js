// B"H
/**
 * @file commentVectorStore.js
 * @description Compatibility guard for removed persistent packed comment-vector
 * storage. Live comment search uses only the authoritative search sidecar.
 */

const VECTOR_KIND = "commentVector";
const MIN_ENGLISH_RATIO = 0.7;

function commentText(comment) {
    const dayuh = comment?.dayuh && typeof comment.dayuh === "object" ? comment.dayuh : {};
    return String(comment?.content || comment?.text || dayuh.content || dayuh.semanticFingerprint || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function englishProfile(text) {
    const letters = Array.from(String(text || "").matchAll(/\p{L}/gu)).map(match => match[0]);
    const latin = letters.filter(ch => /[A-Za-z]/.test(ch)).length;
    const nonLatin = letters.length - latin;
    const ratio = letters.length ? latin / letters.length : 0;
    const hasEnglishWord = /[A-Za-z]{2,}/.test(text);
    return { letters: letters.length, latin, nonLatin, ratio, hasEnglishWord, isEnglish: hasEnglishWord && ratio >= MIN_ENGLISH_RATIO };
}

function coordinate(params = {}) {
    const comment = params.comment || {};
    const dayuh = comment.dayuh && typeof comment.dayuh === "object" ? comment.dayuh : {};
    const parentType = params.parentType || "post";
    const parentId = params.parentId;
    return {
        heichelId: params.heichelId,
        seriesId: params.seriesId,
        parentType,
        parentId,
        postId: params.postId || (parentType === "post" ? parentId : ""),
        aliasId: comment.author || comment.aliasId || params.aliasId || "",
        verseSection: String(comment.verseSection ?? dayuh.verseSection ?? "root"),
        commentId: comment.id || comment.commentId
    };
}

function vectorKey(c = {}) {
    return ["comments", "vectors", c.heichelId, c.seriesId, c.parentType, c.parentId, c.aliasId, c.verseSection, c.commentId].map(part => encodeURIComponent(String(part ?? ""))).join("/");
}

async function storeCommentVector() {
    return { skipped: true, disabled: true, reason: "single_comment_authority_guard", packedMirrorWritten: false };
}

function listCommentVectors() {
    return [];
}

function vectorStats() {
    return { count: 0, disabled: true, reason: "single_comment_authority_guard", packedMirrorRead: false, packedMirrorWritten: false };
}

module.exports = { VECTOR_KIND, MIN_ENGLISH_RATIO, commentText, englishProfile, coordinate, vectorKey, storeCommentVector, listCommentVectors, vectorStats };
