
// B"H
/**
 * @file WindowManager.js
 * @description
 * Builds, focuses, drags, resizes, minimizes, maximizes, and closes windows.
 */

import { DesktopState } from './DesktopState.js';
import { healWindowGeometry, px } from './WindowGeometry.js';

export class WindowManager {
    constructor(host, state, renderApp) {
        this.host = host;
        this.state = state;
        this.renderApp = renderApp;
        this.rect = null;
    }

    render() {
        if (!this.host) return;

        this.rect = this.host.getBoundingClientRect();
        const layer = this.host.querySelector('.virtual-os-windows');

        if (!layer) return;

        layer.innerHTML = '';

        const windows = [...this.state.windows].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

        for (const windowState of windows) {
            layer.appendChild(this.buildWindow(windowState));
        }

        DesktopState.save(this.state);
    }

    buildWindow(windowState) {
        healWindowGeometry(windowState, this.rect);

        const section = document.createElement('section');
        section.className = `virtual-window ${windowState.isMinimized ? 'hidden' : ''}`;
        section.dataset.windowId = windowState.id;

        if (windowState.isMaximized) section.classList.add('maximized');

        section.style.left = px(windowState.x);
        section.style.top = px(windowState.y);
        section.style.width = px(windowState.width);
        section.style.height = px(windowState.height);
        section.style.zIndex = String(windowState.zIndex || 1);

        section.innerHTML = `
            <header class="virtual-window-titlebar">
                <span class="virtual-window-title">${windowState.title || 'Window'}</span>
                <div class="virtual-window-controls">
                    <button data-action="minimize">_</button>
                    <button data-action="maximize">□</button>
                    <button data-action="close">×</button>
                </div>
            </header>
            <div class="virtual-window-content"></div>
            <div class="virtual-window-resize-handle"></div>
        `;

        this.bindFocus(section, windowState);
        this.bindControls(section, windowState);
        this.bindDrag(section, windowState);
        this.bindResize(section, windowState);

        const mount = section.querySelector('.virtual-window-content');
        this.renderApp(windowState, mount, this.state);

        return section;
    }

    bindFocus(section, windowState) {
        section.addEventListener('pointerdown', () => {
            DesktopState.focusWindow(this.state, windowState.id);
        });
    }

    bindControls(section, windowState) {
        section.querySelector('.virtual-window-controls').onclick = (event) => {
            const action = event.target?.dataset?.action;
            if (!action) return;

            if (action === 'close') DesktopState.closeWindow(this.state, windowState.id);
            if (action === 'minimize') windowState.isMinimized = true;
            if (action === 'maximize') windowState.isMaximized = !windowState.isMaximized;

            this.render();
        };
    }

    bindDrag(section, windowState) {
        section.querySelector('.virtual-window-titlebar').addEventListener('pointerdown', (event) => {
            if (windowState.isMaximized) return;

            const startX = event.clientX;
            const startY = event.clientY;
            const baseX = windowState.x;
            const baseY = windowState.y;

            const move = (moveEvent) => {
                windowState.x = Math.max(0, baseX + moveEvent.clientX - startX);
                windowState.y = Math.max(0, baseY + moveEvent.clientY - startY);

                section.style.left = px(windowState.x);
                section.style.top = px(windowState.y);
            };

            const up = () => {
                window.removeEventListener('pointermove', move);
                window.removeEventListener('pointerup', up);
                DesktopState.save(this.state);
            };

            window.addEventListener('pointermove', move);
            window.addEventListener('pointerup', up);
        });
    }

    bindResize(section, windowState) {
        section.querySelector('.virtual-window-resize-handle').addEventListener('pointerdown', (event) => {
            if (windowState.isMaximized) return;

            const startX = event.clientX;
            const startY = event.clientY;
            const baseW = windowState.width;
            const baseH = windowState.height;

            const move = (moveEvent) => {
                windowState.width = Math.max(windowState.minWidth, baseW + moveEvent.clientX - startX);
                windowState.height = Math.max(windowState.minHeight, baseH + moveEvent.clientY - startY);

                section.style.width = px(windowState.width);
                section.style.height = px(windowState.height);
            };

            const up = () => {
                window.removeEventListener('pointermove', move);
                window.removeEventListener('pointerup', up);
                DesktopState.save(this.state);
            };

            window.addEventListener('pointermove', move);
            window.addEventListener('pointerup', up);
        });
    }
}
