
// B"H
/**
 * @file chromeBlueprint.js
 * @description
 * Pure JSON blueprint for the desktop shell.
 */

/**
 * @function chromeBlueprint
 * @returns {object} HTML-generator schema.
 */
export function chromeBlueprint() {
    return {
        tag: 'div',
        className: 'virtual-os-root',
        children: [
            { tag: 'div', className: 'virtual-os-windows' },
            {
                tag: 'div',
                className: 'virtual-os-taskbar',
                children: [
                    { tag: 'button', className: 'virtual-os-start', text: 'Start' },
                    { tag: 'div', className: 'virtual-os-tasks' }
                ]
            },
            { tag: 'div', className: 'virtual-os-start-menu hidden' }
        ]
    };
}
