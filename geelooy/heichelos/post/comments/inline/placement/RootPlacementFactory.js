// B"H
/**
 * @module RootPlacementFactory
 * @description
 * Chapter 88: Root comments become a calm vertical vessel.
 * The Awtsmoos removes nested scroll tricks and inline display mutations from
 * the post-level comment holder. A single classed container is enough.
 */

export function createAndPlaceRootCommentHolder(alias) {
    const stage = document.getElementById("realPost");
    if (!stage) return null;

    let existing = stage.querySelector(`.commentator.inline.root-comments-holder[data-alias='${alias}']`);
    if (existing) return existing.querySelector(".comments-holder-inline");

    const holder = document.createElement("section");
    holder.className = "commentator inline root-comments-holder inline-holder marginal-gloss-shelter awtsmoos-inline-shell";
    holder.dataset.alias = alias;

    const toggle = document.createElement("button");
    toggle.className = "inline-summary-btn active awtsmoos-inline-trigger";
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", "true");
    toggle.innerHTML = `<span class="awtsmoos-inline-trigger-sigil">💬</span><span class="awtsmoos-inline-trigger-copy"><strong class="awtsmoos-inline-trigger-title">Post Comments</strong><span class="awtsmoos-inline-trigger-subtitle">@${alias}</span></span>`;

    const content = document.createElement("div");
    content.className = "comments-holder-inline awtsmoos-inline-comments";

    toggle.onclick = () => {
        const nextHidden = !content.hidden;
        content.hidden = nextHidden;
        toggle.classList.toggle("active", !nextHidden);
        toggle.setAttribute("aria-expanded", String(!nextHidden));
    };

    holder.append(toggle, content);
    const title = stage.querySelector(".post-title");
    if (title?.nextSibling) stage.insertBefore(holder, title.nextSibling);
    else if (title) stage.appendChild(holder);
    else stage.prepend(holder);
    return content;
}
