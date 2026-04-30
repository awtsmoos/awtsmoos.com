
/**
 * B"H
 * @module DomPath
 * @description
 * * Chapter 12: The Coordinate of the Body
 * To find a part of the body, we must count the steps from the head.
 * This module provides the logic to generate a unique coordinate array
 * for any DOM element, and to resolve that array back to a node.
 */

export const DomPathLogic = `
    function getElementPath(el) {
        const path = [];
        while (el && el !== document.documentElement) {
            const parent = el.parentNode;
            if (!parent) break;
            const index = Array.prototype.indexOf.call(parent.childNodes, el);
            path.unshift(index);
            el = parent;
        }
        return path;
    }

    function resolvePath(path) {
        if (!path || !Array.isArray(path)) return null;
        return path.reduce((curr, idx) => (curr && curr.childNodes) ? curr.childNodes[idx] : null, document.documentElement);
    }
`;
