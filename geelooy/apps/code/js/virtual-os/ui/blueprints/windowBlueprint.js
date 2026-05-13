
// B"H
/**
 * @file windowBlueprint.js
 * @description
 * Pure JSON blueprint for a desktop window.
 */

/**
 * @function windowBlueprint
 * @param {object} win Window state.
 * @returns {object} HTML-generator schema.
 */
export function windowBlueprint(win) {
    return {
        tag: 'section',
        className: `virtual-window${win.isMinimized ? ' hidden' : ''}`,
        dataset: { windowId: win.id },
        children: [
            {
                tag: 'header',
                className: 'virtual-window-titlebar',
                children: [
                    { tag: 'span', className: 'virtual-window-title', text: win.title || win.appId || 'Window' },
                    {
                        tag: 'div',
                        className: 'virtual-window-controls',
                        children: [
                            { tag: 'button', text: '_', dataset: { action: 'minimize' } },
                            { tag: 'button', text: '□', dataset: { action: 'front' } },
                            { tag: 'button', text: '×', dataset: { action: 'close' } }
                        ]
                    }
                ]
            },
            { tag: 'div', className: 'virtual-window-content' },
            { tag: 'div', className: 'virtual-window-resize-handle' }
        ]
    };
}
