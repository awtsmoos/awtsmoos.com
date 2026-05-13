
// B"H
/**
 * @file WindowManager.js
 * @description
 * Window builder using JSON blueprints, never HTML strings.
 */

import { HTML } from '../../html-generator.js';
import { DesktopState } from './DesktopState.js';
import { windowBlueprint } from '../ui/windowBlueprint.js';
import { renderAppSafely } from './appRenderer.js';
import { log } from '../diagnostics/VirtualOSLog.js';

export class WindowManager {
    constructor(host, state, env) {
        this.host = host;
        this.state = state;
        this.env = env;
    }

    render() {
        const layer = this.host.querySelector('.virtual-os-windows');
        if (!layer) return;

        layer.replaceChildren();
        const sorted = [...this.state.windows].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

        log('Rendering windows', { count: sorted.length });

        for (const win of sorted) {
            if (win.isMinimized) continue;
            layer.appendChild(this.buildWindow(win));
        }

        DesktopState.save(this.state);
    }

    buildWindow(win) {
        const el = HTML(windowBlueprint(win));
        const mount = el.querySelector('.virtual-window-content');

        el.addEventListener('pointerdown', () => {
            DesktopState.focusWindow(this.state, win.id);
            DesktopState.save(this.state);
        });

        el.querySelector('.virtual-window-controls').addEventListener('click', (event) => {
            const action = event.target?.dataset?.action;
            if (!action) return;

            if (action === 'close') DesktopState.closeWindow(this.state, win.id);
            if (action === 'minimize') win.isMinimized = true;
            if (action === 'front') DesktopState.focusWindow(this.state, win.id);

            this.env.requestRender();
        });

        renderAppSafely(win, mount, this.state, this.env);
        return el;
    }
}
