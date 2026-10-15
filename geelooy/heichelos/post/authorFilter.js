//B"H
/**
 * @file authorFilter.js
 * @description
 * Author filter panel for the post reader.
 * Shows all commentators with:
 * - Clickable names that open profile in new tab
 * - Toggle switches to show/hide each author's comments
 * - Organized by category
 */

let hiddenAuthors = new Set();
let authorData = {};

/**
 * Initialize the author filter panel
 * @param {Array} aliases - List of alias IDs
 * @param {HTMLElement} parentEl - Parent element to render into
 */
export async function initAuthorFilter(aliases, parentEl) {
    const panel = document.createElement('div');
    panel.className = 'awtsmoos-author-filter-panel';
    panel.innerHTML = `
        <div class="awtsmoos-author-filter-header">
            <h3>Commentators</h3>
            <span class="awtsmoos-author-count">${aliases.length} authors</span>
        </div>
        <div class="awtsmoos-author-list"></div>
    `;
    
    const listEl = panel.querySelector('.awtsmoos-author-list');
    
    // Fetch alias info for each
    for (const aliasId of aliases) {
        try {
            const info = await fetchAliasInfo(aliasId);
            authorData[aliasId] = info;
            
            const item = document.createElement('div');
            item.className = 'awtsmoos-author-item';
            item.dataset.aliasId = aliasId;
            
            item.innerHTML = `
                <button class="awtsmoos-author-toggle" data-alias="${aliasId}" title="Show/hide comments">
                    <span class="awtsmoos-toggle-eye">👁</span>
                </button>
                <a href="/aliases/${aliasId}" target="_blank" class="awtsmoos-author-name" data-alias="${aliasId}">
                    @${aliasId}
                </a>
                <span class="awtsmoos-author-fullname">${info.name || ''}</span>
            `;
            
            // Toggle handler
            const toggleBtn = item.querySelector('.awtsmoos-author-toggle');
            toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                toggleAuthor(aliasId, item);
            });
            
            // Profile link - opens in new tab (default behavior with target="_blank")
            // No need for custom handler
            
            listEl.appendChild(item);
        } catch (e) {
            console.warn('Failed to load alias info for', aliasId, e);
        }
    }
    
    parentEl.appendChild(panel);
    return panel;
}

/**
 * Fetch alias info from API
 */
async function fetchAliasInfo(aliasId) {
    const res = await fetch(`/api/social/aliases/${aliasId}`);
    if (!res.ok) return { aliasId, name: aliasId };
    return await res.json();
}

/**
 * Toggle an author's visibility
 */
function toggleAuthor(aliasId, itemEl) {
    if (hiddenAuthors.has(aliasId)) {
        hiddenAuthors.delete(aliasId);
        itemEl.classList.remove('awtsmoos-author-hidden');
    } else {
        hiddenAuthors.add(aliasId);
        itemEl.classList.add('awtsmoos-author-hidden');
    }
    
    // Dispatch event for comment system to react
    window.dispatchEvent(new CustomEvent('awtsmoos:author-toggle', {
        detail: { aliasId, hidden: hiddenAuthors.has(aliasId) }
    }));
}

/**
 * Check if an author is hidden
 */
export function isAuthorHidden(aliasId) {
    return hiddenAuthors.has(aliasId);
}

/**
 * Get all hidden authors
 */
export function getHiddenAuthors() {
    return Array.from(hiddenAuthors);
}
