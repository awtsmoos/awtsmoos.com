
// B"H
/**
 * @file AutoRefineConfigUI.js
 * @brief Config modal generator (Pure string-joined JSON).
 */

import { UI } from '../../../../ui.js';
import { HTML } from '../../../../html-generator.js';

export const AutoRefineConfigUI = {
    async show(tab, controller) {
        if (!tab.vibeSession.recursiveConfig) {
            tab.vibeSession.recursiveConfig = {
                enabled: false, maxLoops: 3, currentLoop: 0,
                prompt: "Please review your previous changes. If there is UI code, run a `run_ui_test` to verify it. Then, think of ways to optimize, refactor, or expand the codebase and execute those improvements."
            };
        }

        const cfg = tab.vibeSession.recursiveConfig;
        
        // B"H - Construct the form blueprint with pure objects
        const configSchema = {
            style: { fontFamily: 'var(--font-ui)', color: 'white', display: 'flex', flexDirection: 'column', gap: '15px' },
            children: [
                { tag: 'p', style: { fontSize: '0.9em', color: 'var(--color-text-secondary)', lineHeight: '1.5', margin: '0' }, text: 'Recursive Refinement forces the AI to iterate upon itself automatically until reaching the loop limit.' },
                {
                    style: { display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' },
                    children:[
                        { tag: 'input', type: 'checkbox', id: 'refine-enable', attributes: cfg.enabled ? { checked: 'true' } : {}, style: { width: '18px', height: '18px' } },
                        { tag: 'label', style: { fontWeight: 'bold' }, text: 'Enable Recursive Loop' }
                    ]
                },
                { tag: 'label', style: { fontSize: '0.85em', fontWeight: 'bold' }, text: 'Max Recursive Steps' },
                { tag: 'input', type: 'number', id: 'refine-limit', value: String(cfg.maxLoops), style: { background: '#000', color: 'var(--neon-cyan)', border: '1px solid #333', padding: '8px', borderRadius: '4px' } },
                { tag: 'label', style: { fontSize: '0.85em', fontWeight: 'bold' }, text: 'Automated Hidden Command' },
                { tag: 'textarea', id: 'refine-prompt', style: { background: '#000', color: 'var(--neon-lime)', border: '1px solid #333', padding: '10px', height: '120px' }, text: cfg.prompt }
            ]
        };

        const result = await UI.showDialog({
            title: "Autonomous Configuration",
            contentHTML: "", // Placeholder, will append
            okText: "Anchor Ritual",
            cancelText: "Silence"
        });

        // Manual DOM append into UI context for pure JSON HTML stability
        const diagContent = document.querySelector('.dialog-content');
        if (diagContent) diagContent.insertBefore(HTML(configSchema), diagContent.querySelector('.dialog-button-bar'));

        if (result) {
            cfg.enabled = document.getElementById('refine-enable').checked;
            cfg.maxLoops = parseInt(document.getElementById('refine-limit').value) || 3;
            cfg.prompt = document.getElementById('refine-prompt').value;
            cfg.currentLoop = 0;
            import('../../../db.js').then(m => m.VibeDB.saveSession(tab.vibeSession.id, tab.vibeSession));
        }
    }
};
