
// B"H
/**
 * @file git-ritual.js
 * @brief The detection and manifestation of Git-related menu items.
 * 
 * THE HYMN OF THE TIMELINE:
 * Deep in the root where the anchor is cast,
 * We find the connection to all that has passed.
 * The Git Ritual searches, it sees and it knows,
 * From where the first seed of the repository grows.
 * It offers the user the power to choose,
 * To branch or to commit, with nothing to lose.
 */

import { GitMetaProvider } from '../../git/meta.js';

/**
 * @class GitRitual
 * @description Analyzes a target item to determine its Git status and 
 * provides the appropriate interactive menu items.
 */
export const GitRitual = {
    /**
     * @async
     * @function getItems
     * @description Identifies if an item is within a Git repository and 
     * returns the menu items for Git Control and Branch Switching.
     * @param {object} item - The target filesystem vessel.
     * @returns {Promise<Array>} List of menu items.
     */
    async getItems(item) {
        const menuItems = [];
        try {
            // Peer into the spiritual ancestry of the item
            const gitInfo = await GitMetaProvider.getGitInfoForFolder(item);
            
            if (gitInfo) {
                menuItems.push({ 
                    label: "Git Control", 
                    action: "git-actions", 
                    icon: "git-branch" 
                });
                menuItems.push({ 
                    label: "Switch Branch", 
                    action: "switch-branch", 
                    icon: "git-branch" 
                });
            }
        } catch (e) {
            console.warn("B\"H: Git metadata remains obscured for this item.", e);
        }
        return menuItems;
    }
};
