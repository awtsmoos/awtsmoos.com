//B"H
/**
 * @module TabTransitions
 * @description
 * Chapter 12: The Awtsmoos moves chambers without ripping layout from the
 * browser. No forced reflow. No offsetWidth tax. Only compositor-friendly class
 * changes scheduled on the next frame, so opening students feels immediate.
 */

function nextPaint(ritual) {
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(ritual);
    else setTimeout(ritual, 0);
}

function attachOnce(viewport, tab) {
    if (viewport && tab?.dom && !viewport.contains(tab.dom)) viewport.appendChild(tab.dom);
}

/**
 * Transitions a new chamber into manifest focus without forced reflow.
 * @param {object} newTab Tab entering focus.
 * @param {object|null} currentTab Current tab leaving focus.
 * @param {Element} viewport Sidebar viewport.
 */
export function slideIn(newTab, currentTab, viewport) {
    if (!newTab?.dom || !viewport) return;
    if (currentTab?.dom) {
        currentTab.dom.classList.add("slide-out-left");
        currentTab.dom.classList.remove("active-view");
    }

    attachOnce(viewport, newTab);
    newTab.dom.style.willChange = "transform, opacity";
    nextPaint(() => newTab.dom.classList.add("active-view"));
}

/**
 * Retreats from the current chamber and restores the previous chamber.
 * @param {object|null} leavingTab Tab leaving focus.
 * @param {object|null} returningTab Tab returning focus.
 * @param {Element} viewport Sidebar viewport.
 */
export function slideOut(leavingTab, returningTab, viewport) {
    if (leavingTab?.dom) {
        leavingTab.dom.classList.remove("active-view");
        leavingTab.dom.style.willChange = "transform, opacity";
        setTimeout(() => {
            if (leavingTab.dom.parentNode === viewport) viewport.removeChild(leavingTab.dom);
            leavingTab.dom.style.willChange = "";
        }, 260);
    }

    if (returningTab?.dom) {
        returningTab.dom.classList.remove("slide-out-left");
        returningTab.dom.style.willChange = "transform, opacity";
        nextPaint(() => returningTab.dom.classList.add("active-view"));
        setTimeout(() => { returningTab.dom.style.willChange = ""; }, 320);
    }
}
