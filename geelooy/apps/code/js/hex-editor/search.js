// B"H
// FILE: js/hex-editor/search.js

import { UI } from '../ui.js';
import { HexView } from './view.js';

export const HexSearch = {
    onSearchClick(e, editor) {
        const button = e.target.closest('button[data-action]');
        if (!button) return;
        if (editor.searchResults.length === 0) this.performSearch(editor);
        else {
            if (button.dataset.action === 'next') editor.searchIndex = (editor.searchIndex + 1) % editor.searchResults.length;
            else editor.searchIndex = (editor.searchIndex - 1 + editor.searchResults.length) % editor.searchResults.length;
            editor.selectedIndex = editor.searchResults[editor.searchIndex];
            HexView.render(editor);
            HexView.ensureVisible(editor);
        }
    },

    performSearch(editor) {
        const query = editor.searchInput.value;
        const type = editor.searchBar.querySelector('.hex-search-type').value;
        if (!query) { editor.searchResults = []; HexView.render(editor); return; }

        let queryBytes;
        if (type === 'hex') {
            queryBytes = query.trim().split(/\s+/).map(h => parseInt(h, 16)).filter(n => !isNaN(n));
        } else {
            queryBytes = Array.from(new TextEncoder().encode(query));
        }
        if (queryBytes.length === 0) { editor.searchResults = []; HexView.render(editor); return; }
        
        editor.searchResults = [];
        for (let i = 0; i <= editor.data.length - queryBytes.length; i++) {
            let match = true;
            for (let j = 0; j < queryBytes.length; j++) {
                if (editor.data[i + j] !== queryBytes[j]) { match = false; break; }
            }
            if (match) editor.searchResults.push(i);
        }
        
        UI.showToast(`${editor.searchResults.length} match(es) found.`, 'info');
        if (editor.searchResults.length > 0) {
            editor.searchIndex = 0;
            editor.selectedIndex = editor.searchResults[0];
            HexView.ensureVisible(editor);
        }
        HexView.render(editor);
    }
};