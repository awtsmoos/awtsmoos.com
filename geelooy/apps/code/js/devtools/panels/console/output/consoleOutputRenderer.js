
// B"H
/**
 * @file consoleOutputRenderer.js
 * @brief Interprets log data and manifests it into the UI.
 */

import { HTML } from '../../../../html-generator.js';
import { LogRowSchema } from './consoleOutputSchema.js';

export const ConsoleOutputRenderer = {
    /**
     * B"H - Perfects paths for display, stripping the system's root noise.
     * @param {string} text - The raw text potentially containing full paths.
     */
    formatLogText(text) {
        if (typeof text !== 'string') return text;
        
        // B"H - The list of system roots to strip.
        const knownRoots = [
            "/BH/programs/Awtsmoos Procedural Worlds Creator/", 
            "/BH/programs/Awtsmoos/",
            "/BH/programs/"
        ];

        let processed = text;
        for (const root of knownRoots) {
            const index = processed.indexOf(root);
            if (index !== -1) {
                // Return the part AFTER the root, ensuring it looks like a relative path
                const relative = processed.substring(index + root.length);
                return relative.startsWith('/') ? relative : '/' + relative;
            }
        }
        return processed;
    },

    escapeHTML(str) {
        if (!str) return "";
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag])
        );
    },

    /**
     * B"H - Renders a single log entry into the container.
     */
    render(logObj, container) {
        if (!container) return;
        
        const logRow = HTML(LogRowSchema);

        if (logObj.level === 'input') {
            logRow.style.color = '#fff';
            const escaped = this.escapeHTML(logObj.args[0].value);
            logRow.innerHTML = `<span style="color:var(--neon-cyan); margin-right:8px;">></span>${escaped}`;
        } else {
            let color = '#ccc';
            if (logObj.level === 'error') color = '#f66';
            if (logObj.level === 'warn') color = '#fc0';
            logRow.style.color = color;
            
            // Format each argument, ensuring paths are relative
            logRow.textContent = logObj.args.map(a => {
                const rawVal = (typeof a === 'object' && a !== null) ? JSON.stringify(a) : String(a);
                return this.formatLogText(rawVal);
            }).join(' ');
        }

        container.appendChild(logRow);
    }
};
