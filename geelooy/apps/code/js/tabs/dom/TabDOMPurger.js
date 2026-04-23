
// B"H
/**
 * @file TabDOMPurger.js
 * @brief The Angel of Destruction for False UI States.
 */
export const TabDOMPurger = {
    /**
     * @function purgeAllActiveStates
     * @description Relentlessly obliterates the `.active` class from the Tab Bar domain.
     */
    purgeAllActiveStates() {
        const allTabs = document.querySelectorAll('.tab.active');
        Array.from(allTabs).forEach(el => el.classList.remove('active'));
    }
};
