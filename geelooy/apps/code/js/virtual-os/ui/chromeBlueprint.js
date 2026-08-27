
// B"H
/**
 * @file chromeBlueprint.js
 * @description
 * Pure JSON blueprint for the Virtual OS desktop chrome.
 */

/**
 * @function chromeBlueprint
 * @returns {object} HTML-generator blueprint.
 */
export function chromeBlueprint() {
    return {
        tag: 'div',
        className: 'virtual-os-root',
        style: {
            position: 'relative',
            width: '100%',
            height: '100%',
            minHeight: '420px',
            background: '#070b12',
            color: '#e8f7ff',
            overflow: 'hidden',
            borderTop: '1px solid rgba(0,246,255,.35)'
        },
        children: [
            {
                tag: 'div',
                className: 'virtual-os-windows',
                style: {
                    position: 'absolute',
                    inset: '0 0 36px 0',
                    overflow: 'hidden'
                }
            },
            {
                tag: 'div',
                className: 'virtual-os-taskbar',
                style: {
                    position: 'absolute',
                    left: '0',
                    right: '0',
                    bottom: '0',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '0 8px',
                    background: 'linear-gradient(90deg,#00c8ff,#e000ff)',
                    zIndex: '9000'
                },
                children: [
                    { tag: 'button', className: 'virtual-os-start', text: 'Start' },
                    { tag: 'div', className: 'virtual-os-tasks' }
                ]
            },
            { tag: 'div', className: 'virtual-os-start-menu hidden' }
        ]
    };
}
