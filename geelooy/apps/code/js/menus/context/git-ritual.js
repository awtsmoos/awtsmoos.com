// B"H
/**
 * @file git-ritual.js
 * @brief The detection and manifestation of Git-related menu items.
 */

import { GitMetaProvider } from '../../git/meta.js';

export const GitRitual = {
    async getItems(item) {
        const menuItems = [];
        try {
            // Peer into the spiritual ancestry of the item
            let gitInfo = await GitMetaProvider.getGitInfoForFolder(item);
            
            // B"H - Clean Fallback: If deep scan missed it, trust the superficial mark
            // We do NOT force a dummy path lookup anymore.
            if (!gitInfo && item.isGitClone) {
                // If it's marked as a clone, we allow the menu.
                // The GitStatusUI will perform a re-validation when clicked anyway.
                gitInfo = true; 
            }
            
            if (gitInfo) {
                menuItems.push({ 
                    label: "Git Control", 
                    action: "git-actions", 
                    icon: "git-branch" 
                });

                if (item.kind === 'directory') {
                    menuItems.push({
                        label: "Scan This Git Folder",
                        action: "scan-git-folder",
                        icon: "refresh-cw"
                    });
                }

                menuItems.push({ 
                    label: "Switch Branch", 
                    action: "switch-branch", 
                    icon: "git-branch" 
                });
            }
        } catch (e) {
            // Silent absorb
        }
        return menuItems;
    }
};
