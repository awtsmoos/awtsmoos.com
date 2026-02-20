//B"H
import { copyToClipboard, updateQueryStringParameter } from "/heichelos/post/functions/utils.js";
import { makeToast } from "/heichelos/post/functions/ui.js";

function compilePostText() {
    if (!window.sectionDayuh || !Array.isArray(window.sectionDayuh)) {
        console.warn("B\"H - sectionDayuh data not found for copying.");
        const postElement = document.getElementById("realPost");
        return postElement ? postElement.innerText : "";
    }

    const postTitle = window.post?.title || "";
    const seriesName = window.series?.prateem?.name || "";
    
    let header = "";
    if (seriesName) header += `${seriesName}\n`;
    if (postTitle) header += `${postTitle}\n`;
    if (header) header += "\n---\n\n";

    const compiledText = window.sectionDayuh.map(section => {
        if (Array.isArray(section)) {
            return section.flat(Infinity).join("\n");
        }
        return section;
    }).join("\n\n");

    return header + compiledText;
}

export async function showCustomContextMenu(x, y, e) {
    const getSelectedText = () => window.getSelection().toString();
    
    const subSection = e.target.closest('.sub-awtsmoos');
    const mainSection = e.target.closest('.section');
    
    const idx = mainSection ? mainSection.dataset.awtsmoosIdx : null;
    const sub = subSection ? subSection.dataset.awtsmoosSub : null;

    const menuActions = {
        "Fullscreen": () => toggleFullscreen(),
        "Copy Selected": (txt) => copyToClipboard({ text: txt || getSelectedText() }, makeToast),
        "Copy Entire Post": () => {
            const fullPostText = compilePostText();
            if (fullPostText) {
                copyToClipboard({ text: fullPostText, successMsg: "Entire Revelation Copied!" }, makeToast);
            } else {
                makeToast("Could not retrieve post data to copy.");
            }
        },
    };

    if (idx !== null) {
        const sectionType = sub !== null ? "Paragraph" : "Verse";
        
        menuActions[`Comment on ${sectionType}`] = async () => {
            updateQueryStringParameter("idx", idx);
            updateQueryStringParameter("sub", sub !== null ? sub : null);

            if (window.openPanelToComments) {
                await window.openPanelToComments();
                if (window.commentLogic?.reloadRoot) await window.commentLogic.reloadRoot();
            }
        };
        
        menuActions[`View Commentary`] = async () => {
            const inlineModule = await import("/heichelos/post/comments/inline.js");
            const targetEl = subSection || mainSection;
            await inlineModule.showSectionCommentaryInline(idx, sub, targetEl);
        };

        menuActions[`Copy ${sectionType} Content`] = () => {
             var sec = window.sectionDayuh[idx];
             let textToCopy = Array.isArray(sec) ? sec.join(" ") : sec;
             if (sub !== null && Array.isArray(sec)) textToCopy = sec[sub] || textToCopy;
             copyToClipboard({ text: textToCopy, successMsg: `Copied ${sectionType}!` }, makeToast);
        };
    }

    if (e.target.tagName == "A") {
        menuActions["Open Link in New Tab"] = () => open(e.target.href, "_blank").focus();
    }

    renderMenu(x, y, menuActions);
}

function renderMenu(x, y, actions) {
    const existingMenu = document.getElementById("custom-context-menu");
    if (existingMenu) existingMenu.remove();
    
    const menu = document.createElement("div");
    menu.id = "custom-context-menu";
    Object.assign(menu.style, { 
        position: "absolute", left: `${x}px`, top: `${y}px`, 
        backgroundColor: "#000", border: "2px solid #fff",
        color: "white", padding: "0", zIndex: "100000", 
        boxShadow: "5px 5px 0px rgba(0,0,0,0.5)", minWidth: "220px",
        fontFamily: "'Space Grotesk', monospace"
    });
    
    for (const [label, action] of Object.entries(actions)) {
        const item = document.createElement("div");
        item.innerText = label;
        item.style.padding = "12px 20px";
        item.style.cursor = "pointer";
        item.style.borderBottom = "1px solid #333";
        item.style.transition = "background 0.1s";
        
        item.onclick = (event) => { 
            event.stopPropagation();
            action(); 
            menu.remove(); 
        };
        item.onmouseover = () => { item.style.backgroundColor = "#ccff00"; item.style.color = "black"; };
        item.onmouseout = () => { item.style.backgroundColor = "black"; item.style.color = "white"; };
        
        menu.appendChild(item);
    }
    
    document.body.appendChild(menu);
    const clickHandler = () => { menu.remove(); document.removeEventListener('click', clickHandler); };
    setTimeout(() => document.addEventListener('click', clickHandler), 10);
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
    }
}