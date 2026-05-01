
/**
 * B"H
 * @module TreeBuilder
 * @chapter The Branches of the Great Oak
 * @description
 * Just as the light descends from the general to the particular, 
 * this module organizes comments into a family tree. 
 * Every reply is a branch reaching out from its parent. 
 */

/**
 * @function buildCommentTree
 * @description 
 * Transforms a flat list of sparks into a living, nested hierarchy.
 * HEALED: Now handles diverse ID formats and prevents 'split' errors.
 * 
 * @param {Array} comments - The unrolled sparks from the API.
 * @returns {Array} - The roots of the tree, each containing its children.
 */
export function buildCommentTree(comments) {
    if (!Array.isArray(comments)) return [];

    const map = {};
    const roots = [];

    // 1. Anchor every spark in the map of existence
    comments.forEach(c => {
        if (!c.id) c.id = "spark-" + Math.random(); // Defensive anchoring
        map[c.id] = { comment: c, children: [] };
    });

    // 2. Identify the Father and the Son (Parent and Child)
    comments.forEach(c => {
        const node = map[c.id];
        const dayuh = c.dayuh || {};
        
        // Find the parent's identity
        const parentId = dayuh.replyToId || dayuh.forkedFrom?.commentId;

        if (parentId && map[parentId]) {
            map[parentId].children.push(node);
        } else {
            roots.push(node);
        }
    });

    // 3. The Ritual of Ordering (Sorting)
    // HEALED: Safer sorting that doesn't rely on 'split' existence.
    roots.sort((a, b) => {
        const idA = String(a.comment.id || "");
        const idB = String(b.comment.id || "");
        
        // Extract numerical parts if present, or use raw string comparison
        const valA = idA.includes('_') ? parseInt(idA.split('_')[1]) : parseInt(idA);
        const valB = idB.includes('_') ? parseInt(idB.split('_')[1]) : parseInt(idB);

        if (!isNaN(valA) && !isNaN(valB)) return valA - valB;
        return idA.localeCompare(idB);
    });

    return roots;
}
