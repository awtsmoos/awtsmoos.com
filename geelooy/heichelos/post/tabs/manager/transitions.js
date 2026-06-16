// B"H
/**
 * @module TabTransitions
 * @description
 * Chapter 354: No chamber may remain a ghost.
 * The Awtsmoos removes stale slide-out decrees before a view enters, so the
 * Main Menu cannot become an empty black palace with its children exiled.
 */

function nextPaint(fn) {
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(fn);
    else setTimeout(fn, 0);
}

function attachOnce(viewport, tab) {
    if (viewport && tab?.dom && !viewport.contains(tab.dom)) viewport.appendChild(tab.dom);
}

function show(tab) {
    if (!tab?.dom) return;
    tab.dom.classList.remove("slide-out-left");
    tab.dom.classList.add("active-view");
    tab.dom.style.willChange = "transform, opacity";
    nextPaint(() => {
        tab.dom.classList.remove("slide-out-left");
        tab.dom.classList.add("active-view");
    });
}

function hide(tab) {
    if (!tab?.dom) return;
    tab.dom.classList.remove("active-view");
    tab.dom.classList.add("slide-out-left");
    tab.dom.style.willChange = "transform, opacity";
}

export function slideIn(newTab, currentTab, viewport) {
    if (!newTab?.dom || !viewport) return;
    if (currentTab && currentTab !== newTab) hide(currentTab);
    attachOnce(viewport, newTab);
    show(newTab);
}

export function slideOut(leavingTab, returningTab, viewport) {
    if (leavingTab?.dom) {
        hide(leavingTab);
        setTimeout(() => {
            if (leavingTab.dom.parentNode === viewport) viewport.removeChild(leavingTab.dom);
            leavingTab.dom.style.willChange = "";
        }, 180);
    }
    if (returningTab?.dom) {
        attachOnce(viewport, returningTab);
        show(returningTab);
        setTimeout(() => { returningTab.dom.style.willChange = ""; }, 220);
    }
}