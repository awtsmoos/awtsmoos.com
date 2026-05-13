
// B"H
/**
 * @file chromeBlueprint.js
 * @description
 * Pure JSON blueprint for the desktop shell.
 */

export function chromeBlueprint() {
    return {
        tag: 'div',
        className: 'virtual-os-root',
        children: [
            {
                tag: 'div',
                className: 'virtual-os-stage',
                children: [
                    { tag: 'div', className: 'virtual-os-wallpaper-title' },
                    { tag: 'div', className: 'virtual-os-desktop' },
                    { tag: 'div', className: 'virtual-os-windows' }
                ]
            },
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
