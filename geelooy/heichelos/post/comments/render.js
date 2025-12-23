//B"H
import { isFirstCharacterHebrew } from "/heichelos/post/postFunctions.js";
import { markdownToHtml } from "/heichelos/post/parsing.js";
import { openCommentsPanelToAlias } from "./panel.js";
import { handleMenuOption } from "./actions.js";
import { injectAIChatCSS } from "../styles/aiChatStyles.js";

export function sanitizeComment(cnt) {
	try {
		var p = new DOMParser();
		var dc = p.parseFromString(cnt, "text/html")
		var cl = dc.querySelector(".links_in_title");
		if(!cl) return cnt;
		return dc.body.innerHTML
	} catch(e) { return cnt; }
}

export function addImageGallery(images, parent) {
	if (images && Array.isArray(images)) {
		const imageGallery = document.createElement("div");
		imageGallery.className = "image-gallery";
		images.forEach(image => {
		    const img = document.createElement("img");
		    img.src = image.medium || image.img || image;
		    img.alt = "Comment Image";
		    img.onclick = () => window.open(image.img || "", "_blank");
		    imageGallery.appendChild(img);
		});
		parent.appendChild(imageGallery);
	}
}

export function makeTitleDiv(title) {
	var commentTitle = document.createElement("div");
	commentTitle.className="commentTitle"
	commentTitle.innerHTML = title
	if(isFirstCharacterHebrew(title)) commentTitle.classList.add("heb");
	return commentTitle
}

export function makeTooltip(msg=null) {
	var toolTip = document.createElement("div")
	toolTip.classList.add("awtsmoosTooltip")
	var icon = document.createElement("div")
	icon.textContent = "i"
	toolTip.appendChild(icon)
	icon.classList.add("tooltipIcon")
	if(msg) {
		var m = document.createElement("div")
		m.textContent = msg
		toolTip.appendChild(m)
		m.classList.add("tooltipContent")
	}
	return toolTip;
}

export function populateCommentElement(comment, parentElement) {
    parentElement.innerHTML = '';
    let normalizedComment = JSON.parse(JSON.stringify(comment));
    if (normalizedComment?.content?.title) normalizedComment.dayuh.title = normalizedComment.content.title;
    if (Array.isArray(normalizedComment?.content?.text)) normalizedComment.content = normalizedComment.content.text;
    if (Array.isArray(normalizedComment.content)) {
        if (!Array.isArray(normalizedComment.dayuh.sections)) normalizedComment.dayuh.sections = [];
        normalizedComment.dayuh.sections.push(...normalizedComment.content);
        normalizedComment.content = null;
    }

    if (normalizedComment?.dayuh?.title) parentElement.appendChild(makeTitleDiv(normalizedComment.dayuh.title));
    
    // Check for Saved Chat Conversation
    if (normalizedComment.dayuh?.conversation && Array.isArray(normalizedComment.dayuh.conversation)) {
        injectAIChatCSS();
        
        // Use content as title/summary if present
        if (normalizedComment.content && normalizedComment.content !== "Chat with Awtsmoos AI") {
             const textDiv = document.createElement("div");
             textDiv.innerHTML = markdownToHtml(sanitizeComment(normalizedComment.content));
             textDiv.style.fontWeight = "bold";
             textDiv.style.marginBottom = "10px";
             parentElement.appendChild(textDiv);
        } else {
             // Default header if none provided
             const header = document.createElement("div");
             header.innerHTML = "<em>Saved Chat with Awtsmoos AI</em>";
             header.style.color = "#666";
             header.style.marginBottom = "8px";
             parentElement.appendChild(header);
        }

        const chatContainer = document.createElement("div");
        chatContainer.className = "ai-chat-embedded";
        
        const messagesDiv = document.createElement("div");
        messagesDiv.className = "ai-messages";
        
        normalizedComment.dayuh.conversation.forEach(msg => {
            const msgDiv = document.createElement("div");
            msgDiv.className = `ai-message ${msg.role === 'model' ? 'model' : msg.role}`;
            
            const content = document.createElement("div");
            content.className = "content";
            content.innerHTML = msg.role === "user" 
                ? msg.text.replace(/\n/g, "<br>") 
                : markdownToHtml(msg.text);
            
            msgDiv.appendChild(content);
            messagesDiv.appendChild(msgDiv);
        });
        
        chatContainer.appendChild(messagesDiv);
        parentElement.appendChild(chatContainer);
        
    } else {
        // Standard Text Content
        if (normalizedComment.content) {
            const textDiv = document.createElement("div");
            textDiv.innerHTML = markdownToHtml(sanitizeComment(normalizedComment.content));
            parentElement.appendChild(textDiv);
        }
    }

    if (Array.isArray(normalizedComment.dayuh?.sections)) {
        normalizedComment.dayuh.sections.forEach(sectionData => {
            const txt = sectionData?.text || (typeof sectionData === 'string' ? sectionData : "");
            if (!txt && !sectionData?.title) return;
            const sec = document.createElement("div");
            sec.className = "awtsmoos-comment-section";
            if (sectionData?.title) sec.appendChild(makeTitleDiv(sectionData.title));
            if (txt) {
                const textDiv = document.createElement('div');
                textDiv.innerHTML = markdownToHtml(sanitizeComment(txt));
                sec.appendChild(textDiv);
            }
            parentElement.appendChild(sec);
        });
    }
    addImageGallery(normalizedComment?.dayuh?.images, parentElement);

    const topLevelContainer = parentElement.closest('.comment-content, .inline-comment');
    if (topLevelContainer) {
        topLevelContainer.classList.remove("heb", "en");
        if (isFirstCharacterHebrew(parentElement.innerText)) topLevelContainer.classList.add("heb");
        else topLevelContainer.classList.add("en");
    }
}

export async function makeHTMLFromComment({ comment, aliasId, tab }) {
    var cmCont = document.createElement("div");
    cmCont.className = "comment-content";
    cmCont.dataset.cid = comment.id;
    tab.appendChild(cmCont);

    var commentText = document.createElement("div");
    commentText.className = "comment-text";
    cmCont.appendChild(commentText);
    populateCommentElement(comment, commentText);
	
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

	var opts = ["Reply", "Copy"];
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
		menuItem.onclick = () => handleMenuOption(option, comment, menuItem);
		menuOptions.appendChild(menuItem);
	});

	menuButton.onclick = (e) => {
		e.stopPropagation(); 
		menuOptions.style.display = menuOptions.style.display === "none" ? "block" : "none";
	};
	document.addEventListener("click", (e) => {
		if (!menuContainer.contains(e.target)) menuOptions.style.display = "none";
	});
	return comment;
}

export function makeInlineComment(alias, comment) {
    var incom = document.createElement("div");
    incom.className = "inline-comment";
    var tool = makeTooltip("Open Comment");
    tool.addEventListener("click", async () => {
        var c = await openCommentsPanelToAlias(alias);
        if (!c) return;
        var con = c.querySelector(`.comment-content[data-cid="${comment.id}"]`);
        if (con) con.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    incom.appendChild(tool);
    var comContent = document.createElement("div");
    incom.appendChild(comContent);
    populateCommentElement(comment, comContent);
    return incom;
}

export function makeInlineCommentHolder(alias, parent, idx) {
	var inlineHolder = document.createElement("div")
	inlineHolder.classList.add("commentator","inline");
	inlineHolder.dataset.alias = alias;
	inlineHolder.dataset.idx = idx;
	parent.appendChild(inlineHolder);

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
	return commentHolder;
}
