//B"H
/**
 * @method slideIn
 * @description Transitions a new world into manifest focus.
 */
export function slideIn(newTab, currentTab, viewport) {
    if (currentTab) {
        console.log(`B"H - [Transitions] Sliding ${currentTab.header} into the shadows.`);
        currentTab.dom.classList.add('slide-out-left');
        currentTab.dom.classList.remove('active-view');
    }

    if (!viewport.contains(newTab.dom)) {
        viewport.appendChild(newTab.dom);
    }

    // Force reflow for the browser to acknowledge the Kav
    void newTab.dom.offsetWidth;
    
    console.log(`B"H - [Transitions] Sliding ${newTab.header} into focus.`);
    newTab.dom.classList.add('active-view');
}

/**
 * @method slideOut
 * @description Retreats from the current world.
 */
export function slideOut(leavingTab, returningTab, viewport) {
    if (leavingTab) {
        console.log(`B"H - [Transitions] Dismissing manifest presence: ${leavingTab.header}.`);
        leavingTab.dom.classList.remove('active-view');
        // Wait for the slide animation before removing from the physical DOM
        setTimeout(() => {
            if (leavingTab.dom.parentNode === viewport) {
                viewport.removeChild(leavingTab.dom);
            }
        }, 400);
    }

    if (returningTab) {
        console.log(`B"H - [Transitions] Resurrecting focus: ${returningTab.header}.`);
        returningTab.dom.classList.remove('slide-out-left');
        returningTab.dom.classList.add('active-view');
    }
}