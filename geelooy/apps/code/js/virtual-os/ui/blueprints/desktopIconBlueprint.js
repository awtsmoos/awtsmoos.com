
// B"H
/**
 * @file desktopIconBlueprint.js
 * @description
 * JSON blueprint for desktop launch icons.
 */

export function desktopIconBlueprint(app, selected) {
    return {
        tag: 'button',
        className: `virtual-desktop-icon${selected ? ' is-selected' : ''}`,
        dataset: { appId: app.id },
        attrs: { type: 'button', title: app.description || app.title },
        children: [
            { tag: 'span', className: 'virtual-desktop-icon-symbol', text: app.icon || '◈' },
            { tag: 'span', className: 'virtual-desktop-icon-label', text: app.title }
        ]
    };
}
