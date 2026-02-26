
// B"H
/**
 * @file tags.js
 * @brief The Taxonomy of Tags.
 */

export const TagLogic = {
    voidElements: new Set([
        'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 
        'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'
    ]),

    isVoid(tagName) {
        return this.voidElements.has(tagName.toLowerCase());
    },

    isAutoOpen(tagName) {
        return ['html', 'body', 'head', 'div', 'main', 'section'].includes(tagName.toLowerCase());
    },

    renderOpen(tagName, attributes = []) {
        return [
            { tag: 'span', style: { color: '#569cd6', fontWeight: 'bold' }, text: `<${tagName}` },
            ...attributes,
            { tag: 'span', style: { color: '#569cd6', fontWeight: 'bold' }, text: `>` }
        ];
    },

    renderClose(tagName) {
        return { 
            tag: 'span', 
            style: { color: '#569cd6', fontWeight: 'bold' }, 
            text: `</${tagName}>` 
        };
    }
};
