// B"H
import { State } from '../state.js';
import { Tabs } from '../tabs/index.js';

function iconFor(tab) {
    const map = {
        text: 'file', image: 'eye', zip: 'save', 'html-preview': 'eye',
        console: 'laptop', commander: 'folder', vibe: 'brain', terminal: 'laptop', browser: 'globe'
    };
    return map[tab.fileType] || map[tab.item?.type] || 'file';
}

function escapeHtml(value = '') {
    return String(value).replace(/[&<>"']/g, ch => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
}

export const TMController = {
    element: null,
    isOpen: false,

    init() {
        this.element = document.getElementById('tab-manager-overlay');
        if (!this.element) return;
        this.element.addEventListener('click', e => {
            if (e.target === this.element || e.target.closest('[data-tm-close-overlay]')) this.hide();
        });
        const btn = document.getElementById('tab-manager-btn');
        if (btn) btn.onclick = e => {
            e.preventDefault();
            e.stopPropagation();
            this.toggle();
        };
    },

    show() {
        if (!this.element) this.init();
        if (!this.element) return;
        this.isOpen = true;
        this.element.classList.remove('hidden');
        this.element.style.display = 'block';
        this.renderGrid();
    },

    hide() {
        if (!this.element) return;
        this.isOpen = false;
        this.element.classList.add('hidden');
        this.element.style.display = 'none';
    },

    toggle() {
        this.isOpen ? this.hide() : this.show();
    },

    renderGrid() {
        if (!this.element) return;
        const tabs = State.tabs || [];
        const cards = tabs.map(tab => `
            <div class="tm-card ${tab.id === State.activeTabId ? 'active-tab' : ''}" data-tab-id="${tab.id}" style="cursor:pointer;">
                <div class="tm-card-header">
                    <div class="tm-icon"><svg class="svg-icon"><use href="#icon-${iconFor(tab)}"></use></svg></div>
                    <div class="tm-info">
                        <span class="tm-name">${tab.isDirty ? '<span class="tm-status-dot dirty"></span>' : ''}${escapeHtml(tab.item?.name || tab.title || 'Untitled')}</span>
                        <span class="tm-path" title="${escapeHtml(tab.item?.path || '')}">${escapeHtml(tab.item?.path || '/')}</span>
                    </div>
                    <button class="tm-close-btn" data-close-tab="${tab.id}" title="Close tab">×</button>
                </div>
            </div>
        `).join('') || '<div style="opacity:.75;padding:20px;">No open tabs.</div>';

        this.element.innerHTML = `
            <div class="tm-shell" style="max-width:880px;margin:40px auto;background:var(--color-bg-secondary,#111827);border:1px solid var(--color-border,#26314a);border-radius:14px;box-shadow:0 20px 70px rgba(0,0,0,.45);padding:14px;color:var(--color-text-primary,#fff);">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px;">
                    <div>
                        <div style="font-weight:700;color:var(--neon-cyan,#00f6ff);">Open Tabs</div>
                        <div style="font-size:.85em;opacity:.75;">Click a card to activate it.</div>
                    </div>
                    <button data-tm-close-overlay class="icon-button" title="Close">×</button>
                </div>
                <div class="tm-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;max-height:65vh;overflow:auto;">${cards}</div>
            </div>
        `;

        this.element.querySelectorAll('[data-tab-id]').forEach(card => {
            card.onclick = async e => {
                if (e.target.closest('[data-close-tab]')) return;
                await Tabs.activate(Number(card.dataset.tabId));
                this.hide();
            };
        });
        this.element.querySelectorAll('[data-close-tab]').forEach(btn => {
            btn.onclick = async e => {
                e.preventDefault();
                e.stopPropagation();
                await Tabs.close(Number(btn.dataset.closeTab));
                this.renderGrid();
            };
        });
    },

    handleContextAction() {}
};
