
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
                    {
                        tag: 'div',
                        className: 'virtual-os-wallpaper-title',
                        children: [
                            { tag: 'strong', text: 'AWTSMOOS OS' },
                            { tag: 'span', text: 'desktop vessel emulator' }
                        ]
                    },
                    { tag: 'div', className: 'virtual-os-desktop' },
                    { tag: 'div', className: 'virtual-os-windows' }
                ]
            },
            {
                tag: 'div',
                className: 'virtual-os-taskbar',
                children: [
                    { tag: 'button', className: 'virtual-os-start', text: 'Start', attrs: { type: 'button' } },
                    { tag: 'div', className: 'virtual-os-tasks' }
                ]
            },
            { tag: 'div', className: 'virtual-os-start-menu hidden' }
        ]
    };
}
