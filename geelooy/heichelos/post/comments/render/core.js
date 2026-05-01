
/**
 * B"H
 * @module CommentCoreRenderer
 * @chapter The Architecture of the Gateway
 * @description
 * Just as the Temple had many chambers and gateways, each for a specific level of holiness,
 * this module defines the core HTML vessels for insights. 
 * We manifest 'makeInlineCommentHolder'—the bridge (Gesher) that spans 
 * the gap between the hidden (sidebar) and the revealed (scroll).
 */

import { isFirstCharacterHebrew } from "/heichelos/post/functions/utils.js";
import { handleMenuOption } from "/heichelos/post/comments/actions.js";
import { isAliasInline } from "/heichelos/post/comments/inline/state.js"; 
import { renderBranchingThread } from "/heichelos/post/comments/render/aiThread.js";
import { renderStandardComment } from "/heichelos/post/comments/render/standard.js";
import { makeTitleDiv } from "/heichelos/post/comments/render/utils.js";
import { expandPathToComment } from "/heichelos/post/comments/render/tree.js";

/**
 * @function populateCommentElement
 * @description 
 * Fills a dry vessel with the living water of a comment. 
 * It deciphers complex content and promotes titles to the surface.
 * 
 * @param {Object} comment - The raw data from the server.
 * @param {HTMLElement} parentElement - The physical DOM vessel.
 */
export function populateCommentElement(comment, parentElement) {
    if (!comment || !parentElement) return;
    parentElement.innerHTML = '';
    
    let data = JSON.parse(JSON.stringify(comment));

    if (data?.content?.title) {
        if (!data.dayuh) data.dayuh = {};
        data.dayuh.title = data.content.title;
    }

    if (data?.dayuh?.title) {
        parentElement.appendChild(makeTitleDiv(data.dayuh.title));
    }

    if (data.dayuh && data.dayuh.conversation && Array.isArray(data.dayuh.conversation)) {
        renderBranchingThread(parentElement, data, comment.id);
    } else {
        renderStandardComment(parentElement, data);
    }

    const topLevel = parentElement.closest('.comment-content, .inline-comment');
    if (topLevel) {
        topLevel.classList.remove("heb", "en");
        const containsHolyLetters = isFirstCharacterHebrew(parentElement.innerText);
        topLevel.classList.add(containsHolyLetters ? "heb" : "en");
    }
}

/**
 * @function makeHTMLFromComment
 * @description Creates the main Sidebar Card.
 * @param {Object} comment 
 * @returns {HTMLElement}
 */
export function makeHTMLFromComment(comment) {
    const cmCont = document.createElement("div");
    cmCont.className = "comment-content";
    cmCont.dataset.cid = comment.id;

    const textDiv = document.createElement("div");
    textDiv.className = "comment-text";
    cmCont.appendChild(textDiv);

    populateCommentElement(comment, textDiv);

    const toolbar = document.createElement("div");
    toolbar.className = "comment-toolbar";
    
    if (isAliasInline(comment.author)) {
        const locateBtn = document.createElement("button");
        locateBtn.className = "btn small";
        locateBtn.innerHTML = "📍 Locate";
        locateBtn.onclick = (e) => {
            e.stopPropagation();
            const inlineEl = document.querySelector(`.inline-comment[data-cid="${comment.id}"]`);
            if (inlineEl) {
                expandPathToComment(inlineEl);
                setTimeout(() => {
                    inlineEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    inlineEl.classList.add('signal-active');
                    setTimeout(() => inlineEl.classList.remove('signal-active'), 1500);
                }, 300);
            }
        };
        toolbar.appendChild(locateBtn);
    }
    cmCont.appendChild(toolbar);

    const menuContainer = document.createElement("div");
    menuContainer.className = "menu-container";
    menuContainer.innerHTML = '<div class="menu-button">⋮</div><div class="menu-options" style="display:none;"></div>';
    
    const optBox = menuContainer.querySelector('.menu-options');
    ["Copy", "Delete"].forEach(opt => {
        const item = document.createElement("div");
        item.className = "menu-item";
        item.innerText = opt;
        item.onclick = (e) => { 
            e.stopPropagation(); 
            handleMenuOption(opt, comment, item); 
            optBox.style.display = "none"; 
        };
        optBox.appendChild(item);
    });

    menuContainer.querySelector('.menu-button').onclick = (e) => {
        e.stopPropagation();
        optBox.style.display = (optBox.style.display === "none") ? "block" : "none";
    };
    cmCont.appendChild(menuContainer);

    return cmCont;
}

/**
 * @function makeInlineComment
 * @description Creates the Marginal Gloss entry.
 * @param {Object} comment 
 * @returns {HTMLElement}
 */
export function makeInlineComment(comment) {
    const incom = document.createElement("div");
    incom.className = "inline-comment intense-marginalia";
    incom.dataset.cid = comment.id;

    const focusBtn = document.createElement("div");
    focusBtn.className = "focus-trigger";
    focusBtn.innerHTML = "↗";
    focusBtn.onclick = async (e) => {
        e.stopPropagation();
        if(window.openCommentsPanelToAlias) {
            const cTab = await window.openCommentsPanelToAlias(comment.author);
            if (cTab) {
                setTimeout(() => {
                    const target = cTab.querySelector(`.comment-content[data-cid="${comment.id}"]`);
                    if(target) {
                        expandPathToComment(target);
                        setTimeout(() => {
                            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            target.classList.add('highlight-flash');
                            setTimeout(() => target.classList.remove('highlight-flash'), 1000);
                        }, 300);
                    }
                }, 300);
            }
        }
    };
    incom.appendChild(focusBtn);

    const body = document.createElement("div");
    incom.appendChild(body);
    populateCommentElement(comment, body);
    return incom;
}

/**
 * @function makeInlineCommentHolder
 * @description 
 * B"H - THE SACRED HOLDER.
 * Creates the collapsible interface that allows insights to dwell 
 * in the borders of the text without overwhelming the seeker.
 * 
 * @param {string} alias - The voice speaking.
 * @param {HTMLElement} parent - The text section coordinate.
 * @param {number|string} idx - The index of the Sefirah.
 * @returns {HTMLElement} - The Gateway vessel.
 */
export function makeInlineCommentHolder(alias, parent, idx) {
    const holder = document.createElement("div");
    holder.className = "commentator inline";
    holder.dataset.alias = alias;
    holder.dataset.idx = idx;

    const toggleBtn = document.createElement("button");
    toggleBtn.className = "inline-summary-btn";
    toggleBtn.innerHTML = `💬 Insights (@${alias})`;
    
    const list = document.createElement("div");
    list.className = "comments-holder-inline"; 
    list.style.display = "none";
    
    toggleBtn.onclick = () => {
        const isHidden = list.style.display === "none";
        list.style.display = isHidden ? "block" : "none";
        list.classList.toggle("expanded", isHidden);
        toggleBtn.classList.toggle("active", isHidden);
    };
    
    holder.append(toggleBtn, list);
    return holder;
}
