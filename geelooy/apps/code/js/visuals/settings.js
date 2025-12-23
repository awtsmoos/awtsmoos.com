// B"H
// FILE: js/visuals/settings.js

export const VisualSettings = {
    config: {
        nebulaMap: true,
        scopeLaser: true,
        particles: true, 
        hud: false,        // B"H - Defaulted to OFF
        zenRain: false,   
        caretRadar: true,
        neonBrackets: true,
        colorOrbs: true,
        graphNav: true,
        intelligence: true, // B"H - Hover Summaries
        folding: true       // B"H - AST Scope Folding
    },

    init() {
        const stored = localStorage.getItem('awtsmoos_visual_config');
        if (stored) {
            this.config = { ...this.config, ...JSON.parse(stored) };
        }
    },

    save() {
        localStorage.setItem('awtsmoos_visual_config', JSON.stringify(this.config));
    },

    get(key) {
        return this.config[key];
    },

    set(key, value) {
        this.config[key] = value;
        this.save(); // B"H - Automatically saves on adjustment
    },

    getSettingsPanelHTML() {
        const toggles = Object.keys(this.config).map(key => {
            const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            const checked = this.config[key] ? 'checked' : '';
            return `
                <div class="setting-row" style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.1);">
                    <label for="vs-${key}" style="color:var(--color-text-secondary); cursor:pointer;">${label}</label>
                    <div class="toggle-switch">
                        <input type="checkbox" id="vs-${key}" data-key="${key}" ${checked}>
                        <label for="vs-${key}" class="toggle-slider"></label>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="visual-settings-panel">
                <h4 style="color:var(--neon-lime); margin-top:0; border-bottom:1px solid var(--neon-lime); padding-bottom:5px;">Visual Engine Configuration</h4>
                <div class="settings-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    ${toggles}
                </div>
                <p style="font-size:0.8em; color:gray; margin-top:10px;">
                    Intelligence enables AST-powered hover summaries. Folding allows minimizing code blocks.
                </p>
                <style>
                    .toggle-switch { position: relative; width: 40px; height: 20px; }
                    .toggle-switch input { opacity: 0; width: 0; height: 0; }
                    .toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #333; transition: .4s; border-radius: 20px; }
                    .toggle-slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 2px; bottom: 2px; background-color: white; transition: .4s; border-radius: 50%; }
                    input:checked + .toggle-slider { background-color: var(--neon-cyan); }
                    input:checked + .toggle-slider:before { transform: translateX(20px); }
                </style>
            </div>
        `;
    },

    bindEvents(container) {
        container.querySelectorAll('input[type="checkbox"][data-key]').forEach(input => {
            input.onchange = (e) => {
                this.set(e.target.dataset.key, e.target.checked);
            };
        });
    }
};