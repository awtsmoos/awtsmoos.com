
// B"H
import { DesktopState } from './DesktopState.js';

const EDGE = 10;

function px(number) {
    return `${Math.round(Number(number) || 0)}px`;
}

export class WindowManager {
    constructor(host, state, renderApp) {
        this.host = host;
        this.state = state;
        this.renderApp = renderApp;
        this.desktopRect = null;
    }

    render() {
        if (!this.host) return;

        this.desktopRect = this.host.getBoundingClientRect();
        const windowsLayer = this.host.querySelector('.virtual-os-windows');
        if (!windowsLayer) return;

        windowsLayer.innerHTML = '';

        const sorted = [...this.state.windows].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
        for (const windowState of sorted) {
            windowsLayer.appendChild(this._buildWindow(windowState));
        }

        DesktopState.save(this.state);
    }

    _buildWindow(windowState) {
        this._healGeometry(windowState);

        const windowEl = document.createElement('section');
        windowEl.className = `virtual-window ${windowState.isMinimized ? 'hidden' : ''}`;
        windowEl.dataset.windowId = windowState.id;

        if (windowState.isMaximized) windowEl.classList.add('maximized');

        windowEl.style.left = px(windowState.x);
        windowEl.style.top = px(windowState.y);
        windowEl.style.width = px(windowState.width);
        windowEl.style.height = px(windowState.height);
        windowEl.style.zIndex = String(windowState.zIndex || 1);

        windowEl.innerHTML = `
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

        this._bindFocus(windowEl, windowState);
        this._bindControls(windowEl, windowState);
        this._bindDrag(windowEl, windowState);
        this._bindResize(windowEl, windowState);

        const body = windowEl.querySelector('.virtual-window-content');
        this.renderApp(windowState, body, this.state);

        return windowEl;
    }

    _healGeometry(windowState) {
        windowState.width = Math.max(Number(windowState.width) || 760, Number(windowState.minWidth) || 260);
        windowState.height = Math.max(Number(windowState.height) || 420, Number(windowState.minHeight) || 180);
        windowState.x = Math.max(0, Number(windowState.x) || 24);
        windowState.y = Math.max(0, Number(windowState.y) || 24);
        windowState.zIndex = Number(windowState.zIndex) || 1;
        windowState.minWidth = Number(windowState.minWidth) || 260;
        windowState.minHeight = Number(windowState.minHeight) || 180;
    }

    _bindFocus(el, windowState) {
        el.addEventListener('pointerdown', () => {
            DesktopState.focusWindow(this.state, windowState.id);
            this.render();
        });
    }

    _bindControls(el, windowState) {
        const controls = el.querySelector('.virtual-window-controls');

        controls.addEventListener('click', (event) => {
            const action = event.target?.dataset?.action;
            if (!action) return;

            if (action === 'close') DesktopState.closeWindow(this.state, windowState.id);
            if (action === 'minimize') windowState.isMinimized = true;
            if (action === 'maximize') windowState.isMaximized = !windowState.isMaximized;

            this.render();
        });
    }

    _bindDrag(el, windowState) {
        const titlebar = el.querySelector('.virtual-window-titlebar');

        titlebar.addEventListener('pointerdown', (event) => {
            if (windowState.isMaximized) return;

            const startX = event.clientX;
            const startY = event.clientY;
            const baseX = windowState.x;
            const baseY = windowState.y;

            const move = (moveEvent) => {
                const nextX = baseX + (moveEvent.clientX - startX);
                const nextY = baseY + (moveEvent.clientY - startY);
                windowState.x = Math.max(0, Math.min(nextX, this.desktopRect.width - EDGE));
                windowState.y = Math.max(0, Math.min(nextY, this.desktopRect.height - EDGE - 42));
                el.style.left = px(windowState.x);
                el.style.top = px(windowState.y);
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

    _bindResize(el, windowState) {
        const handle = el.querySelector('.virtual-window-resize-handle');

        handle.addEventListener('pointerdown', (event) => {
            if (windowState.isMaximized) return;

            const startX = event.clientX;
            const startY = event.clientY;
            const baseW = windowState.width;
            const baseH = windowState.height;

            const move = (moveEvent) => {
                windowState.width = Math.max(windowState.minWidth, baseW + (moveEvent.clientX - startX));
                windowState.height = Math.max(windowState.minHeight, baseH + (moveEvent.clientY - startY));
                el.style.width = px(windowState.width);
                el.style.height = px(windowState.height);
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
