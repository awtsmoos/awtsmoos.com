
// B"H
/**
 * @file uiRefresher.js
 * @brief THE AWAKENING PULSE.
 * Guarantees that any action modifying physical reality forces the visual reality to catch up.
 */

export function refreshExplorerUI(targetFolderItem) {
    // 1. Send out generic spiritual events that different subsystems might listen for
    window.dispatchEvent(new Event('fs-update'));
    window.dispatchEvent(new CustomEvent('awtsmoos-workspace-refresh'));
    
    // 2. Physical DOM Button clicker (The nuclear approach ensuring existing simple UI responds)
    const genericButtons = document.querySelectorAll('.refresh-btn, .explorer-refresh,[title*="Refresh"], [aria-label*="Refresh"]');
    genericButtons.forEach(btn => btn.click());

    // 3. Precise Local Pulsing (Targeted node collapse and re-expand forces children rebuild)
    if (targetFolderItem && targetFolderItem.path) {
        const paths =[
            targetFolderItem.path,
            targetFolderItem.path.endsWith('/') ? targetFolderItem.path.slice(0, -1) : targetFolderItem.path
        ];
        
        paths.forEach(p => {
            const folderNodes = document.querySelectorAll(`[data-path="${p}"], [data-id="${p}"]`);
            folderNodes.forEach(node => {
                const toggle = node.querySelector('.chevron, .toggle, .folder-icon, .row') || node;
                const isExpanded = node.classList.contains('expanded') || node.getAttribute('aria-expanded') === 'true';
                
                // Holy Respiration: Breathe out (Collapse), Breathe in (Expand fresh)
                if (isExpanded) {
                    toggle.click(); 
                    setTimeout(() => toggle.click(), 50); 
                } else {
                    toggle.click(); 
                }
            });
        });
    }
}
