
// B"H
/**
 * @file attributes.js
 * @brief The Adornments of the Element.
 */

export const AttributeRenderer = {
    /**
     * Transforms a NamedNodeMap of attributes into a visual array.
     * @param {NamedNodeMap} attributes 
     * @returns {Array<object>} HTML config objects for the attributes.
     */
    render(attributes) {
        const children = [];
        for (const attr of attributes) {
            children.push({ 
                tag: 'span', 
                style: { color: '#9cdcfe', marginLeft: '6px' }, 
                text: attr.name 
            });
            children.push({ tag: 'span', text: '="' });
            children.push({ 
                tag: 'span', 
                style: { color: '#ce9178' }, 
                text: attr.value.replace(/"/g, '&quot;') 
            });
            children.push({ tag: 'span', text: '"' });
        }
        return children;
    }
};
