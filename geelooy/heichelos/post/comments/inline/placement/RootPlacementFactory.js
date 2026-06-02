/**
 * B"H
 * @module RootPlacementFactory
 * @chapter Building the Foundation Stone
 */

/**
 * @function createAndPlaceRootCommentHolder
 * @description 
 * Forges the physical DOM vessel for global post comments.
 * It is manifest from the vacuum at the top of the 'realPost' element.
 */
export function createAndPlaceRootCommentHolder(alias) {
    const stage = document.getElementById("realPost");
    if (!stage) return null;

    let existing = stage.querySelector(`.commentator.inline.root-comments-holder[data-alias='${alias}']`);
    if (existing) return existing.querySelector(".comments-holder-inline");

    const holder = document.createElement("div");
    holder.className = "commentator inline root-comments-holder inline-holder marginal-gloss-shelter";
    holder.dataset.alias = alias;
    
    const toggle = document.createElement("button");
    toggle.className = "inline-summary-btn btn";
    toggle.innerHTML = `💬 Post Comments (@${alias})`;
    
    const scrollVessel = document.createElement("div");
    scrollVessel.className = "inline-scroll-container comments-holder-inline";
    scrollVessel.style.display = "none";

    const content = document.createElement("div");
    content.className = "comments-holder-inline awtsmoos-inline-comments"; 
    
    toggle.onclick = () => {
        const isHidden = getComputedStyle(scrollVessel).display === "none";
        scrollVessel.style.display = isHidden ? "block" : "none";
        content.classList.toggle("expanded", isHidden);
        toggle.classList.toggle("active", isHidden);
    };

    scrollVessel.appendChild(content);
    holder.append(toggle, scrollVessel);

    const title = stage.querySelector(".post-title");
    if (title && title.nextSibling) stage.insertBefore(holder, title.nextSibling);
    else if (title) stage.appendChild(holder);
    else stage.prepend(holder);

    return content;
}