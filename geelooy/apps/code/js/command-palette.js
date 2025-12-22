
// B"H
// FILE: js/command-palette.js

import { State } from './state.js';
// B"H - Rectified Import Path: Explicitly pointing to index.js
import { Actions } from './actions/index.js'; 
import { Tabs } from './tabs/index.js';
import { UI } from './ui.js';
import { VisualEngine } from './visuals/index.js'; // B"H

export const CommandPalette = {
    overlay: null,
    input: null,
    list: null,
    isOpen: false,
    
    // Command Definitions
    commands: [
        // HELP
        { id: 'docs', label: 'Help: Documentation', action: 'show-docs', icon: 'brain' },
        
        // FILE
        { id: 'save', label: 'File: Save', action: 'save', icon: 'save' },
        { id: 'new-file', label: 'File: New File', action: 'new-temp-file', icon: 'file' },
        { id: 'open-file', label: 'File: Open Local File', action: 'open-file', icon: 'folder' },
        
        // VIEW
        { id: 'graph-nav', label: 'View: Graph Navigator', action: 'show-graph-nav', icon: 'brain-circuit' },
        { id: 'close-tab', label: 'View: Close Tab', action: 'close-tab-direct', icon: 'x' },
        { id: 'close-all', label: 'View: Close All Tabs', action: 'close-all-tabs', icon: 'x-circle' },
        { id: 'reopen-tab', label: 'View: Reopen Closed Tab', action: 'reopen-closed-tab', icon: 'arrow-left' },
        { id: 'zen', label: 'View: Toggle Zen Mode', action: 'zen-mode', icon: 'eye' },
        { id: 'theme', label: 'View: Switch Theme', action: 'toggle-theme', icon: 'eye' },
        { id: 'word-wrap', label: 'View: Toggle Word Wrap', action: 'toggle-word-wrap', icon: 'list' },
        { id: 'fullscreen', label: 'View: Toggle Fullscreen', action: 'toggle-fullscreen', icon: 'fullscreen' },
        
        // EXTREME FEATURES
        { id: 'matrix', label: 'FX: Toggle Matrix Mode', action: 'toggle-matrix', icon: 'brain-circuit' },
        { id: 'power', label: 'FX: Toggle Power Mode', action: 'toggle-power', icon: 'play' },
        { id: 'sonic', label: 'FX: Toggle Sonic Typing', action: 'toggle-sonic', icon: 'play' },
        { id: 'entropy', label: 'FX: Toggle Entropy Mode', action: 'toggle-entropy', icon: 'brain' },
        { id: 'spotlight', label: 'FX: Toggle Focus Spotlight', action: 'toggle-spotlight', icon: 'eye' },
        { id: 'voice', label: 'FX: Start Voice Command', action: 'voice-command', icon: 'brain' },
        { id: 'read', label: 'FX: Read Selection (TTS)', action: 'read-selection', icon: 'play' },
        { id: 'timetravel', label: 'FX: Time Travel (History)', action: 'show-time-travel', icon: 'brain-circuit' },
        
        // EDITING
        { id: 'find', label: 'Edit: Find/Replace', action: 'find-replace', icon: 'search' },
        { id: 'comment', label: 'Edit: Toggle Line Comment', action: 'toggle-line-comment', icon: 'list' },
        { id: 'ipsum', label: 'Edit: Insert Cyber Ipsum', action: 'insert-cyber-ipsum', icon: 'list' },
        { id: 'zalgo', label: 'Edit: Zalgoify Selection', action: 'zalgo-text', icon: 'brain' },
        { id: 'date', label: 'Edit: Insert Date/Time', action: 'insert-date', icon: 'list' },
        { id: 'uuid', label: 'Edit: Insert UUID', action: 'insert-uuid', icon: 'list' },
        
        // CODE
        { id: 'beautify', label: 'Code: Beautify', action: 'beautify', icon: 'brain' },
        { id: 'upper', label: 'Code: Transform to Uppercase', action: 'transform-upper', icon: 'brain' },
        { id: 'lower', label: 'Code: Transform to Lowercase', action: 'transform-lower', icon: 'brain' },
        { id: 'title', label: 'Code: Transform to Title Case', action: 'transform-title', icon: 'brain' },
        { id: 'reverse', label: 'Code: Reverse Selection', action: 'text-reverse', icon: 'brain' },
        { id: 'binary', label: 'Code: Binary Encode', action: 'text-binary', icon: 'brain' },
        { id: 'b64enc', label: 'Code: Base64 Encode', action: 'transform-base64-encode', icon: 'brain' },
        { id: 'b64dec', label: 'Code: Base64 Decode', action: 'transform-base64-decode', icon: 'brain' },
        { id: 'urlenc', label: 'Code: URL Encode', action: 'transform-url-encode', icon: 'brain' },
        { id: 'urldec', label: 'Code: URL Decode', action: 'transform-url-decode', icon: 'brain' },
        { id: 'sort', label: 'Code: Sort Selected Lines', action: 'sort-lines', icon: 'list' },
        { id: 'eval', label: 'Code: Evaluate Selection', action: 'eval-selection', icon: 'play' },
        { id: 'json', label: 'Code: Transmute Object to JSON', action: 'transmute-json', icon: 'brain-circuit' },
        
        // TOOLS
        { id: 'ast', label: 'Tool: Show AST Explorer', action: 'show-ast', icon: 'brain' },
        { id: 'outline', label: 'Tool: Show Symbol Outline', action: 'show-outline', icon: 'list' },
        { id: 'vibe', label: 'Tool: Open Vibe Coding', action: 'open-vibe-context', icon: 'brain-circuit' },
        
        // APP
        { id: 'settings', label: 'App: Settings', action: 'settings', icon: 'settings' },
        { id: 'refresh', label: 'App: Reload Window', action: 'reload-window', icon: 'refresh' },
    ],

    init() {
        // Create DOM
        const overlay = document.createElement('div');
        overlay.id = 'command-palette-overlay';
        overlay.className = 'search-overlay hidden'; // Reuse search overlay styles for consistency
        overlay.innerHTML = `
            <div class="search-window command-palette-window">
                <div class="search-header">
                    <h2>Command Palette</h2>
                </div>
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

        // Bind Events
        this.input.addEventListener('input', () => this.render());
        this.input.addEventListener('keydown', (e) => this.handleKey(e));
        
        // Close on click outside
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.hide();
        });
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

    toggle() {
        this.isOpen ? this.hide() : this.show();
    },

    render() {
        const query = this.input.value.toLowerCase();
        this.list.innerHTML = '';

        // 1. Filter Commands
        const matchedCommands = this.commands.filter(cmd => 
            cmd.label.toLowerCase().includes(query)
        );

        // 2. Render
        if (matchedCommands.length === 0) {
            this.list.innerHTML = '<div class="search-empty">No matching commands.</div>';
            return;
        }

        matchedCommands.forEach((cmd, index) => {
            const item = document.createElement('div');
            item.className = 'search-result-item';
            if (index === 0) item.classList.add('selected'); // Auto-select first
            item.innerHTML = `
                <div class="result-header">
                    <svg class="svg-icon"><use href="#icon-${cmd.icon}"></use></svg>
                    <span class="result-name">${cmd.label}</span>
                </div>
            `;
            item.onclick = () => this.execute(cmd);
            this.list.appendChild(item);
        });
    },

    handleKey(e) {
        if (e.key === 'Escape') {
            this.hide();
            return;
        }
        
        const selected = this.list.querySelector('.search-result-item.selected');
        const items = Array.from(this.list.querySelectorAll('.search-result-item'));
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!selected) return;
            const next = selected.nextElementSibling || items[0];
            selected.classList.remove('selected');
            next.classList.add('selected');
            next.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (!selected) return;
            const prev = selected.previousElementSibling || items[items.length - 1];
            selected.classList.remove('selected');
            prev.classList.add('selected');
            prev.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selected) selected.click();
        }
    },

    execute(cmd) {
        this.hide();
        if (cmd.action === 'reload-window') {
            location.reload();
        } else if (cmd.action === 'close-tab-direct') {
            if (State.activeTabId) Tabs.close(State.activeTabId);
        } else if (cmd.action === 'open-vibe-context') {
             const tab = State.tabs.find(t => t.id === State.activeTabId);
             if (tab && tab.item) {
                 import('./vibe/vibe-controller.js').then(m => {
                     const parentPath = tab.item.path.substring(0, tab.item.path.lastIndexOf('/')) || '/';
                     const parentItem = { ...tab.item, path: parentPath, kind: 'directory' };
                     m.VibeController.open(parentItem);
                 });
             } else {
                 UI.showToast("No active file to infer Vibe context.", "warning");
             }
        } else if (cmd.action === 'show-graph-nav') {
            VisualEngine.triggerGraphNav();
        } else {
            Actions.handle(cmd.action);
        }
    }
};
