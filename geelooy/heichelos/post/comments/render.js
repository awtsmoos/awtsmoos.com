//B"H
import { isFirstCharacterHebrew } from "../functions/utils.js";
import { handleMenuOption } from "./actions.js";

// Import from new modules
import { renderBranchingThread } from "./render/aiThread.js";
import { renderStandardComment } from "./render/standard.js";
import { makeTitleDiv } from "./render/utils.js";

// Re-export utils for compatibility if needed elsewhere
export { sanitizeComment, addImageGallery, makeTitleDiv } from "./render/utils.js";

/**
 * @method populateCommentElement
 * @description B"H - Route to AI renderer or Standard renderer.
 */
export function populateCommentElement(comment, parentElement) {
    parentElement.innerHTML = '';
    let normalizedComment = JSON.parse(JSON.stringify(comment));
    
    // Normalization logic
    if (normalizedComment?.content?.title) normalizedComment.dayuh.title = normalizedComment.content.title;
    if (Array.isArray(normalizedComment?.content?.text)) normalizedComment.content = normalizedComment.content.text;
    if (Array.isArray(normalizedComment.content)) {
        if (!Array.isArray(normalizedComment.dayuh.sections)) normalizedComment.dayuh.sections = [];
        normalizedComment.dayuh.sections.push(...normalizedComment.content);
        normalizedComment.content = null;
    }

    if (normalizedComment?.dayuh?.title) parentElement.appendChild(makeTitleDiv(normalizedComment.dayuh.title));
    
    // Branch Logic
    if (normalizedComment.dayuh?.conversation && Array.isArray(normalizedComment.dayuh.conversation)) {
        renderBranchingThread(parentElement, normalizedComment, comment.id, comment.branches);
    } else {
        renderStandardComment(parentElement, normalizedComment);
    }

    // Language Direction
    const topLevelContainer = parentElement.closest('.comment-content, .inline-comment');
    if (topLevelContainer) {
        topLevelContainer.classList.remove("heb", "en");
        if (isFirstCharacterHebrew(parentElement.innerText)) topLevelContainer.classList.add("heb");
        else topLevelContainer.classList.add("en");
    }
}

export async function makeHTMLFromComment({ comment, aliasId, tab }) {
    try {
        var cmCont = document.createElement("div");
        cmCont.className = "comment-content";
        cmCont.dataset.cid = comment.id;
        cmCont.style.position = "relative"; 
        tab.appendChild(cmCont);

        // B"H - Main Text
        var commentText = document.createElement("div");
        commentText.className = "comment-text";
        cmCont.appendChild(commentText);
        populateCommentElement(comment, commentText);
        
        // B"H - Standard Comment Toolbar (Visible Actions)
        var standardToolbar = document.createElement("div");
        standardToolbar.className = "comment-toolbar";
        
        // 1. Reply Button (Visible)
        var replyBtn = document.createElement("button");
        replyBtn.className = "btn secondary small";
        replyBtn.innerHTML = "↩ Reply";
        replyBtn.onclick = (e) => {
            e.stopPropagation();
            handleMenuOption("Reply", comment, cmCont);
        };
        standardToolbar.appendChild(replyBtn);

        // 2. Collapse Below Button (Visible)
        var collapseBelowBtn = document.createElement("button");
        collapseBelowBtn.className = "btn small";
        collapseBelowBtn.innerHTML = "▼";
        
        let isBelowCollapsed = false;
        collapseBelowBtn.onclick = (e) => {
            e.stopPropagation();
            isBelowCollapsed = !isBelowCollapsed;
            let sibling = cmCont.nextElementSibling;
            while(sibling) {
                if(sibling.classList.contains('comment-content')) {
                    sibling.style.display = isBelowCollapsed ? 'none' : 'block'; 
                }
                sibling = sibling.nextElementSibling;
            }
            collapseBelowBtn.innerHTML = isBelowCollapsed ? "▲" : "▼";
        };
        standardToolbar.appendChild(collapseBelowBtn);

        cmCont.appendChild(standardToolbar);

        // B"H - Hidden Menu
        var menuContainer = document.createElement("div");
        menuContainer.className = "menu-container";
        cmCont.appendChild(menuContainer);

        var menuButton = document.createElement("div");
        menuButton.className = "menu-button";
        menuButton.innerText = "⋮";
        menuContainer.appendChild(menuButton);

        var menuOptions = document.createElement("div");
        menuOptions.className = "menu-options";
        menuOptions.style.display = "none";
        menuContainer.appendChild(menuOptions);

        var opts = ["Copy"];
        if(window?.curAlias == comment.author) opts = opts.concat(["Edit", "Add Audio", "Delete"]);
        if(comment?.dayuh?.transcripted) {
            if(window?.curAlias == comment.author) opts.push("Add Timesheet");
            opts.push("Play");
            var audio = document.createElement("audio");
            audio.controls = true; 
            audio.src = `https://${comment.dayuh.transcripted.bucket}.awtsmoos.com/${comment.dayuh.transcripted.path}`;
            audio.style.display = "none"; 
            audio.dataset.awtsmoosAudio = comment.id;
            cmCont.appendChild(audio);
        }
        
        opts.forEach(option => {
            var menuItem = document.createElement("div");
            menuItem.className = "menu-item";
            menuItem.innerText = option;
            menuItem.onclick = (e) => {
                e.stopPropagation();
                handleMenuOption(option, comment, menuItem);
                menuOptions.style.display = "none";
            };
            menuOptions.appendChild(menuItem);
        });

        menuButton.onclick = (e) => {
            e.stopPropagation(); 
            const isHidden = menuOptions.style.display === "none";
            document.querySelectorAll('.menu-options').forEach(el => el.style.display = 'none');
            menuOptions.style.display = isHidden ? "block" : "none";
        };

        // Children Slot for Threading
        var childrenSlot = document.createElement("div");
        childrenSlot.className = "children-slot";
        childrenSlot.style.marginLeft = "25px";
        childrenSlot.style.borderLeft = "4px solid #f0f0f0";
        childrenSlot.style.paddingLeft = "15px";
        cmCont.appendChild(childrenSlot);

    } catch(e) {
        console.error("B\"H Error in makeHTMLFromComment:", e);
    }

    return comment;
}

/**
 * @method makeInlineComment
 * @description B"H - Creates a compact inline comment wrapper.
 */
export function makeInlineComment(alias, comment) {
    var incom = document.createElement("div");
    incom.className = "inline-comment";
    incom.style.position = "relative";
    incom.style.borderLeft = "8px solid #000";
    incom.style.paddingLeft = "20px";
    incom.style.marginBottom = "3rem";
    
    // Action Button (Expand to sidebar)
    var actionBtn = document.createElement("div");
    actionBtn.className = "btn small secondary";
    actionBtn.innerHTML = "↗";
    actionBtn.style.position = "absolute";
    actionBtn.style.top = "0";
    actionBtn.style.right = "0";
    actionBtn.style.width = "35px";
    actionBtn.style.height = "35px";
    actionBtn.style.padding = "0";
    actionBtn.title = "Focus in Sidebar";
    
    actionBtn.onclick = async (e) => {
        e.stopPropagation();
        if(window.openCommentsPanelToAlias) {
            var c = await window.openCommentsPanelToAlias(alias);
            if (!c) return;
            setTimeout(() => {
                var con = c.querySelector(`.comment-content[data-cid="${comment.id}"]`);
                if (con) {
                    con.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    con.classList.add('highlight-flash'); 
                    setTimeout(()=>con.classList.remove('highlight-flash'), 1000);
                }
            }, 400);
        }
    };
    
    incom.appendChild(actionBtn); 
    
    var comContent = document.createElement("div");
    incom.appendChild(comContent);
    populateCommentElement(comment, comContent);
    
    // B"H - Inline Reply Capability
    var inlineReply = document.createElement("button");
    inlineReply.className = "btn secondary small";
    inlineReply.innerHTML = "Reply +";
    inlineReply.style.marginTop = "1rem";
    inlineReply.onclick = (e) => {
        e.stopPropagation();
        handleMenuOption("Reply", comment, incom);
    };
    incom.appendChild(inlineReply);

    return incom;
}

export function makeInlineCommentHolder(alias, parent, idx) {
	var inlineHolder = document.createElement("div")
	inlineHolder.classList.add("commentator","inline");
	inlineHolder.dataset.alias = alias;
	inlineHolder.dataset.idx = idx;
    
	var inHeader = document.createElement("div")
	var a = document.createElement("a")
	a.href = "/@"+alias;
	if(!isFirstCharacterHebrew(alias)) inHeader.classList.add("en");
	a.textContent = "@" + alias;
	inHeader.appendChild(a);
	inHeader.classList.add("alias-name");
	inlineHolder.appendChild(inHeader);

	var commentHolder = document.createElement("div")
	commentHolder.classList.add("comments-holder-inline");
	inlineHolder.appendChild(commentHolder);
	
    return inlineHolder; 
}
