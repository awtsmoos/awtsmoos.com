
// B"H
/**
 * @file windowBlueprint.js
 * @description
 * Data blueprint for one Virtual OS window.
 */

/**
 * @function windowBlueprint
 * @param {object} win Window state.
 * @returns {object} HTML-generator blueprint.
 */
export function windowBlueprint(win) {
    return {
        tag: 'section',
        className: `virtual-window ${win.isMinimized ? 'hidden' : ''}`,
        dataset: { windowId: win.id },
        style: {
            position: 'absolute',
            left: `${Math.max(0, Number(win.x) || 24)}px`,
            top: `${Math.max(0, Number(win.y) || 24)}px`,
            width: `${Math.max(280, Number(win.width) || 640)}px`,
            height: `${Math.max(180, Number(win.height) || 380)}px`,
            zIndex: String(Number(win.zIndex) || 20),
            display: win.isMinimized ? 'none' : 'flex',
            flexDirection: 'column',
            background: '#05070c',
            border: '1px solid rgba(0,246,255,.65)',
            boxShadow: '0 0 28px rgba(0,246,255,.22)',
            borderRadius: '8px',
            overflow: 'hidden'
        },
        children: [
            {
                tag: 'header',
                className: 'virtual-window-titlebar',
                style: {
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#10172a',
                    color: '#00f6ff',
                    padding: '0 8px',
                    fontFamily: 'var(--font-code, monospace)',
                    fontWeight: '800'
                },
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
            {
                tag: 'div',
                className: 'virtual-window-content',
                style: {
                    flex: '1',
                    minHeight: '0',
                    overflow: 'auto',
                    background: '#000'
                }
            }
        ]
    };
}
