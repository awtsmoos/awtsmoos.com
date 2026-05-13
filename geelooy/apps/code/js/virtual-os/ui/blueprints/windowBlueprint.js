
// B"H
/**
 * @file windowBlueprint.js
 * @description
 * Pure JSON blueprint for a desktop window.
 */

export function windowBlueprint(win, focusedId) {
    const focused = String(win.id) === String(focusedId);

    return {
        tag: 'section',
        className: `virtual-window${win.isMinimized ? ' is-minimized' : ''}${focused ? ' is-focused' : ''}`,
        dataset: { windowId: win.id },
        children: [
            {
                tag: 'header',
                className: 'virtual-window-titlebar',
                dataset: { dragHandle: 'true' },
                children: [
                    { tag: 'span', className: 'virtual-window-title', text: win.title || win.appId || 'Window' },
                    {
                        tag: 'div',
                        className: 'virtual-window-controls',
                        children: [
                            { tag: 'button', text: '–', dataset: { action: 'minimize' }, attrs: { type: 'button', title: 'Minimize' } },
                            { tag: 'button', text: '□', dataset: { action: 'maximize' }, attrs: { type: 'button', title: 'Maximize' } },
                            { tag: 'button', className: 'virtual-window-control-close', text: '×', dataset: { action: 'close' }, attrs: { type: 'button', title: 'Close' } }
                        ]
                    }
                ]
            },
            { tag: 'div', className: 'virtual-window-content' },
            { tag: 'div', className: 'virtual-window-resize-handle', dataset: { resizeHandle: 'true' } }
        ]
    };
}
