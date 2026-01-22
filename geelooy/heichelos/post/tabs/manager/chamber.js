//B"H
/**
 * @file chamber.js
 * @description 
 * Forges the individual Chambers (Tabs). 
 * Each is a world with its own header and scroll area.
 */
import { appendHTML } from "../../postFunctions.js";

/**
 * @method createChamberDOM
 * @param {Object} options - { header, content }
 * @param {Function} onPop - Ritual to perform when Back is clicked.
 */
export function createChamberDOM(options, onPop) {
    console.log(`B"H - [Chamber] Manifesting DOM for ${options.header}.`);
    
    const dom = document.createElement("div");
    dom.className = "awtsmoos-slide-view";
    
    const subHeader = document.createElement("div");
    subHeader.className = "awtsmoos-view-header";
    
    const backBtn = document.createElement("button");
    backBtn.className = "awtsmoos-back-btn";
    backBtn.innerHTML = "← Back";
    
    // B"H - ABSOLUTE HIDING ON CREATION
    // This button is only manifest by the Core if the stack depth warrants it.
    backBtn.style.display = "none"; 
    
    backBtn.onclick = (e) => {
        e.stopPropagation();
        if(onPop) onPop();
    };
    
    const subTitle = document.createElement("span");
    subTitle.className = "awtsmoos-view-title-text";
    subTitle.innerText = options.header;
    
    subHeader.append(backBtn, subTitle);
    dom.appendChild(subHeader);

    const scrollArea = document.createElement("div");
    scrollArea.className = "awtsmoos-view-content";
    dom.appendChild(scrollArea);

    if (options.content) {
        appendHTML(options.content, scrollArea);
    }

    return { dom, scrollArea, backBtn, subTitle };
}