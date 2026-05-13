
// B"H
/**
 * @file VirtualOSChrome.js
 * @description
 * Paints the desktop frame: windows layer, taskbar, and start menu.
 */

/**
 * @function renderVirtualOSChrome
 * @param {HTMLElement} container Virtual OS wrapper.
 * @returns {object} Important DOM anchors.
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

/**
 * @function renderVirtualOSError
 * @param {HTMLElement} container Virtual OS wrapper.
 * @param {string} message Error message.
 * @returns {void}
 */
export function renderVirtualOSError(container, message) {
    container.innerHTML = `
        <div class="virtual-os-root">
            <div class="virtual-os-empty">
                <strong>B"H</strong>
                <div>${message}</div>
            </div>
        </div>
    `;
}
