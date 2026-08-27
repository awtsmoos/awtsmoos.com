
// B"H
/**
 * @file TabShieldPurger.js
 * @brief The Angel of Destruction for False Highlights.
 */

export const TabShieldPurger = {
    /**
     * @function purge
     * @description Synchronously removes the 'active' aura from every tab element in the DOM.
     */
    purge() {
        const activeTabs = document.querySelectorAll('.tab.active');
        activeTabs.forEach(tab => {
            tab.classList.remove('active');
        });
    }
};
