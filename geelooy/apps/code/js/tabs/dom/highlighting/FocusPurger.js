
// B"H
/**
 * @file FocusPurger.js
 * @brief The Angel of Gevurah (Severity) for the UI.
 */

export const FocusPurger = {
    /**
     * @function clearAll
     * @description Synchronously removes the 'active' aura from every tab element.
     */
    clearAll() {
        const activeElements = document.querySelectorAll('.tab.active');
        activeElements.forEach(el => el.classList.remove('active'));
    }
};
