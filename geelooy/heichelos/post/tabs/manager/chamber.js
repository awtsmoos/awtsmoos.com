// B"H
/**
 * @module SidebarChamberDOM
 * @description
 * Chapter 120: The back gate hides by attribute, not inline decree.
 * The CSS and hidden attribute own visibility. JavaScript names the state; it
 * does not paint the body with direct style mutations.
 */

import { appendHTML } from "../../functions/utils.js";

export function createChamberDOM(options, onPop) {
    console.log(`B"H - [Chamber] Manifesting DOM for ${options.header}.`);
    const dom = document.createElement("div");
    dom.className = "awtsmoos-slide-view";

    const subHeader = document.createElement("div");
    subHeader.className = "awtsmoos-view-header";

    const backBtn = document.createElement("button");
    backBtn.className = "awtsmoos-back-btn";
    backBtn.type = "button";
    backBtn.innerHTML = "← Back";
    backBtn.hidden = true;
    backBtn.onclick = event => {
        event.stopPropagation();
        onPop?.();
    };

    const subTitle = document.createElement("span");
    subTitle.className = "awtsmoos-view-title-text";
    subTitle.innerText = options.header;

    subHeader.append(backBtn, subTitle);
    dom.appendChild(subHeader);

    const scrollArea = document.createElement("div");
    scrollArea.className = "awtsmoos-view-content";
    dom.appendChild(scrollArea);

    if (options.content) appendHTML(options.content, scrollArea);
    return { dom, scrollArea, backBtn, subTitle };
}
