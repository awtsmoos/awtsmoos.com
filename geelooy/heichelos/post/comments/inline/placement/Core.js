/**
 * B"H
 * @module CorePlacementLogic
 * @chapter Distributing the Sparks
 */

import { buildCommentTree } from "../../logic/treeBuilder.js";
import { processRootPlacement } from "./RootAssembly.js";
import { processVersePlacement } from "./VerseAssembly.js";

/**
 * @function distributeCommentsByCoordinates
 * @description 
 * Categorizes a bundle of comments into 'Root' or 'Verse' buckets 
 * and triggers their individual physical placement.
 */
export function distributeCommentsByCoordinates(comments, alias) {
    if (!comments || comments.length === 0) return;
    
    const coordinationMap = comments.reduce((acc, c) => {
        const key = c?.dayuh?.verseSection ?? 'root';
        if (!acc[key]) acc[key] = [];
        acc[key].push(c);
        return acc;
    }, {});

    for (const coordinate in coordinationMap) {
        const group = coordinationMap[coordinate];
        const tree = buildCommentTree(group);

        if (coordinate === 'root') {
            processRootPlacement(tree, alias, group.length);
        } else {
            processVersePlacement(tree, alias, coordinate);
        }
    }
}