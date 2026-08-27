
// B"H
/**
 * @file bootBlueprint.js
 * @description
 * JSON blueprint for the immediate boot screen.
 */

/**
 * @function bootBlueprint
 * @param {string} message Boot message.
 * @returns {object} HTML-generator schema.
 */
export function bootBlueprint(message) {
    return {
        tag: 'div',
        className: 'vos-boot-screen',
        children: [{
            tag: 'div',
            className: 'vos-boot-card',
            children: [
                { tag: 'div', className: 'vos-boot-title', text: 'B"H — Virtual OS' },
                { tag: 'div', className: 'vos-boot-message', text: message }
            ]
        }]
    };
}
