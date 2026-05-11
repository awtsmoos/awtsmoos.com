
// B"H
/**
 * @file ErrorVessel.js
 * @brief Handles locked handle UI and access requests.
 * 
 * THE HYMN OF THE UNVEILED MESSAGE:
 * No longer shall the variable hide inside a quoted line,
 * We call it forth directly, for the purpose is divine.
 * With strings joined in sequence, the message is made clear,
 * Banishing the "Fragmented" text and every shadow of fear.
 */

import { Workspaces } from '../index.js';
import { State } from '../../state.js';

export const ErrorVessel = {
    /**
     * B"H - Renders a "Grant Access" node into a parent element.
     */
    manifestLockedUI: function(parentEl, ws) {
        if (!parentEl) return;
        
        const li = document.createElement('li');
        li.className = 'tree-item error-node';
        li.style.paddingLeft = '15px';
        li.style.display = 'flex';
        li.style.alignItems = 'center';
        li.style.gap = '8px';

        const btn = document.createElement('button');
        btn.className = 'primary-btn';
        btn.style.minHeight = '20px';
        btn.style.fontSize = '11px';
        btn.style.padding = '2px 8px';
        btn.style.borderRadius = '4px';
        btn.textContent = '🔑 Grant Access';

        btn.onclick = async function() {
            btn.textContent = "Negotiating...";
            try {
                if (ws && ws.handle) {
                    const res = await ws.handle.requestPermission({ mode: 'readwrite' });
                    if (res === 'granted') {
                        ws.isLocked = false;
                        Workspaces.render();
                        return;
                    }
                }
            } catch (e) {
                console.warn("B\"H - Permission ritual failed.", e);
            }
            btn.textContent = "Refused";
        };

        li.appendChild(btn);
        parentEl.appendChild(li);
    },

    /**
     * B"H - Manifests a generic error string.
     * RECTIFIED: Pure concatenation. No literal variable markers.
     */
    manifestGeneric: function(parentEl, msg) {
        if (!parentEl) return;
        
        const li = document.createElement('li');
        li.className = 'tree-item';
        li.style.color = 'var(--color-accent-danger)';
        li.style.fontSize = '0.8em';
        li.style.paddingLeft = '15px';
        
        // PURE CONCATENATION: The only way to ensure the message is correctly revealed.
        li.textContent = 'Fragmented: ' + msg;
        
        parentEl.appendChild(li);
    }
};
