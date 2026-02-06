// /BH/awtsmoos.com/geelooy/heichelos/post/comments/render/core.js
//B"H
import { isFirstCharacterHebrew } from "/heichelos/post/functions/utils.js";
import { handleMenuOption } from "/heichelos/post/comments/actions.js";
import { isAliasInline } from "/heichelos/post/comments/inline/state.js"; 
import { renderBranchingThread } from "/heichelos/post/comments/render/aiThread.js";
import { renderStandardComment } from "/heichelos/post/comments/render/standard.js";
import { makeTitleDiv } from "/heichelos/post/comments/render/utils.js";
import { expandPathToComment } from "/heichelos/post/comments/render/tree.js";

export function populateCommentElement(comment, parentElement) {
    parentElement.innerHTML = '';
    let data = JSON.parse(JSON.stringify(comment));
    if (data?.content?.title) data.dayuh.title = data.content.title;
    if (data?.dayuh?.title) parentElement.appendChild(makeTitleDiv(data.dayuh.title));
    if (data.dayuh?.conversation && Array.isArray(data.dayuh.conversation)) {
        renderBranchingThread(parentElement, data, comment.id);
    } else {
        renderStandardComment(parentElement, data);
    }
    const topLevel = parentElement.closest('.comment-content, .inline-comment');
    if (topLevel) {
        topLevel.classList.remove("heb", "en");
        topLevel.classList.add(isFirstCharacterHebrew(parentElement.innerText) ? "heb" : "en");
    }
}

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
            } else {
                alert("Not found inline. Check section.");
            }
        };
        toolbar.appendChild(locateBtn);
    }
    cmCont.appendChild(toolbar);
    const menuContainer = document.createElement("div");
    menuContainer.className = "menu-container";
    menuContainer.innerHTML = `<div class="menu-button">⋮</div><div class="menu-options" style="display:none;"></div>`;
    const optBox = menuContainer.querySelector('.menu-options');
    ["Copy", "Delete"].forEach(opt => {
        const item = document.createElement("div");
        item.className = "menu-item";
        item.innerText = opt;
        item.onclick = (e) => { e.stopPropagation(); handleMenuOption(opt, comment, item); optBox.style.display="none"; };
        optBox.appendChild(item);
    });
    menuContainer.querySelector('.menu-button').onclick = (e) => {
        e.stopPropagation();
        optBox.style.display = (optBox.style.display === "none") ? "block" : "none";
    };
    cmCont.appendChild(menuContainer);
    return cmCont;
}

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