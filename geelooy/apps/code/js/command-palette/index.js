
// B"H
import { PALETTE_COMMANDS } from './commands.js';
import { PaletteExecutor } from './executor.js';

export const CommandPalette = {
    overlay: null, input: null, list: null, isOpen: false,

    init() {
        const overlay = document.createElement('div');
        overlay.id = 'command-palette-overlay';
        overlay.className = 'search-overlay hidden'; 
        overlay.innerHTML = `
            <div class="search-window command-palette-window">
                <div class="search-header"><h2>Command Palette</h2></div>
                <div class="search-controls" style="padding-bottom: 10px;">
                    <div class="search-input-group">
                        <input type="text" id="cp-input" placeholder="Type a command...">
                    </div>
                </div>
                <div id="cp-results" class="search-results"></div>
            </div>
        `;
        document.body.appendChild(overlay);

        this.overlay = overlay;
        this.input = overlay.querySelector('#cp-input');
        this.list = overlay.querySelector('#cp-results');

        this.input.addEventListener('input', () => this.render());
        this.input.addEventListener('keydown', (e) => this.handleKey(e));
        this.overlay.addEventListener('click', (e) => { if (e.target === this.overlay) this.hide(); });
    },

    show() {
        if (!this.overlay) this.init();
        this.isOpen = true;
        this.input.value = '';
        this.render();
        this.overlay.classList.remove('hidden');
        void this.overlay.offsetWidth;
        this.overlay.classList.add('visible');
        this.input.focus();
    },

    hide() {
        if (!this.isOpen) return;
        this.isOpen = false;
        this.overlay.classList.remove('visible');
        setTimeout(() => this.overlay.classList.add('hidden'), 200);
    },

    toggle() { this.isOpen ? this.hide() : this.show(); },

    render() {
        const query = this.input.value.toLowerCase();
        this.list.innerHTML = '';
        const matchedCommands = PALETTE_COMMANDS.filter(cmd => cmd.label.toLowerCase().includes(query));

        if (matchedCommands.length === 0) {
            this.list.innerHTML = '<div class="search-empty">No matching commands.</div>';
            return;
        }

        matchedCommands.forEach((cmd, index) => {
            const item = document.createElement('div');
            item.className = 'search-result-item';
            if (index === 0) item.classList.add('selected'); 
            item.innerHTML = `<div class="result-header"><svg class="svg-icon"><use href="#icon-${cmd.icon}"></use></svg><span class="result-name">${cmd.label}</span></div>`;
            item.onclick = () => PaletteExecutor.execute(cmd, this);
            this.list.appendChild(item);
        });
    },

    handleKey(e) {
        if (e.key === 'Escape') { this.hide(); return; }
        const selected = this.list.querySelector('.search-result-item.selected');
        const items = Array.from(this.list.querySelectorAll('.search-result-item'));
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!selected) return;
            const next = selected.nextElementSibling || items[0];
            selected.classList.remove('selected'); next.classList.add('selected');
            next.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (!selected) return;
            const prev = selected.previousElementSibling || items[items.length - 1];
            selected.classList.remove('selected'); prev.classList.add('selected');
            prev.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selected) selected.click();
        }
    }
};
