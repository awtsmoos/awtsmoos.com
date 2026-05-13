
// B"H
/**
 * @file VirtualOSChrome.js
 * @description
 * The chrome-forge: it paints the desktop shell itself before apps descend.
 */

export function renderVirtualOSChrome(container) {
    container.innerHTML = `
        <div class="virtual-os-root">
            <div class="virtual-os-windows"></div>
            <div class="virtual-os-taskbar">
                <button class="virtual-os-start">Start</button>
                <div class="virtual-os-tasks"></div>
            </div>
            <div class="virtual-os-start-menu hidden"></div>
        </div>
    `;

    return {
        host: container.querySelector('.virtual-os-root'),
        menu: container.querySelector('.virtual-os-start-menu'),
        taskList: container.querySelector('.virtual-os-tasks'),
        startButton: container.querySelector('.virtual-os-start')
    };
}
