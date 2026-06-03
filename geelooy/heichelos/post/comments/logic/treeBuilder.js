// B"H
/**
 * @module TreeBuilder
 * @description
 * Chapter 106: One spark may not become two branches.
 * The Awtsmoos lets every comment ID appear once, then arranges replies beneath
 * parents. Sidebar and inline receive the same purified forest.
 */

function stableId(comment, index) {
    if (comment?.id !== undefined && comment?.id !== null && comment.id !== "") return String(comment.id);
    const alias = comment?.author || comment?.aliasId || "unknown";
    const body = typeof comment?.content === "string" ? comment.content : JSON.stringify(comment?.content || {});
    return `synthetic-${alias}-${index}-${body.slice(0, 64)}`;
}

export function uniqueComments(comments) {
    if (!Array.isArray(comments)) return [];
    const seen = new Set();
    const out = [];
    comments.forEach((comment, index) => {
        if (!comment) return;
        const id = stableId(comment, index);
        if (seen.has(id)) return;
        seen.add(id);
        if (!comment.id) comment.id = id;
        out.push(comment);
    });
    return out;
}

function parentIdOf(comment) {
    const dayuh = comment?.dayuh || {};
    return dayuh.replyToId || dayuh.forkedFrom?.commentId || comment?.replyToId || null;
}

function sortRoots(roots) {
    roots.sort((a, b) => {
        const idA = String(a.comment.id || "");
        const idB = String(b.comment.id || "");
        const valA = idA.includes("_") ? parseInt(idA.split("_")[1]) : parseInt(idA);
        const valB = idB.includes("_") ? parseInt(idB.split("_")[1]) : parseInt(idB);
        if (!Number.isNaN(valA) && !Number.isNaN(valB)) return valA - valB;
        return idA.localeCompare(idB);
    });
    return roots;
}

export function buildCommentTree(comments) {
    const clean = uniqueComments(comments);
    const map = new Map();
    const roots = [];
    clean.forEach(comment => map.set(String(comment.id), { comment, children: [] }));
    clean.forEach(comment => {
        const node = map.get(String(comment.id));
        const parentId = parentIdOf(comment);
        const parent = parentId ? map.get(String(parentId)) : null;
        if (parent && parent !== node) parent.children.push(node);
        else roots.push(node);
    });
    return sortRoots(roots);
}
