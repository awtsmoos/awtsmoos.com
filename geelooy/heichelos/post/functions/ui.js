//B"H
import { appendHTML, getLinkHrefOfEditing, copyToClipboard, updateQueryStringParameter } from "./utils.js";

export function makeInfoHTML() {
    window.currentIndexInSeries = (sp => parseInt(sp[sp.length - 1]))(location.pathname.split("/"));
    var basePath = (d => d.slice(0, d.length - 1).join("/"))(location.pathname.split("/"));
    const post = window.post;
    const alias = window.alias;
    if (!post) return "Couldn't load";

    const container = document.createElement("div");
    container.className = "post-info-container";

    // Author
    const authorSection = document.createElement("div");
    authorSection.className = "tl post-author";
    authorSection.innerHTML = `<div class="label">Author:</div><div class="value"><a href="/@${alias.id}" class="author-link">${alias.name}</a></div>`;
    container.appendChild(authorSection);

    // Heichel
    const heichelSection = document.createElement("div");
    heichelSection.className = "tl post-heichel-name";
    const heichelLink = document.createElement("a");
    heichelLink.href = `/heichelos/${post.heichel.id}`;
    heichelLink.className = "heichel-link";
    heichelLink.textContent = post.heichel.name;
    const heichelDesc = document.createElement("div");
    heichelDesc.className = "heichelDesc";
    appendHTML(post.heichel.description || "", heichelDesc);
    heichelLink.appendChild(heichelDesc);
    
    const hl = document.createElement("div"); hl.className="label"; hl.textContent="Heichel:";
    const hv = document.createElement("div"); hv.className="value"; hv.appendChild(heichelLink);
    heichelSection.appendChild(hl);
    heichelSection.appendChild(hv);
    container.appendChild(heichelSection);

    // Series
    const seriesSection = document.createElement("div");
    seriesSection.className = "tl post-series-breadcrumb-piece";
    seriesSection.innerHTML = `<div class="label">Path:</div>`;
    const seriesValue = document.createElement("div");
    seriesValue.className = "value";
    (window.breadcrumb?.slice?.(1) || []).forEach((q, i, a) => {
        const seriesLink = document.createElement("a");
        seriesLink.href = `/heichelos/${post.heichel.id}/?series=${q.id}`;
        seriesLink.className = "series-link";
        seriesLink.textContent = q.name + (i == a.length - 1 ? "" : "/");
        seriesValue.appendChild(seriesLink);
    });
    seriesSection.appendChild(seriesValue);
    container.appendChild(seriesSection);

    // Navigation
    if (window.series && Array.isArray(window.series.posts) && window.currentIndexInSeries !== undefined) {
        const navContainer = document.createElement("div");
        navContainer.className = "post-navigation-container";
        const posts = window.series.posts;
        const totalPosts = posts.length;
        const currentIndex = window.currentIndexInSeries;

        if (currentIndex > 0) {
            const prevLink = document.createElement("a");
            prevLink.href = basePath + "/" + (currentIndex - 1);
            prevLink.className = "nav-button prev";
            prevLink.textContent = "Previous";
            navContainer.appendChild(prevLink);
        }

        const chapterSelect = document.createElement("select");
        chapterSelect.className = "series-chapter-select";
        posts.forEach((postId, index) => {
            const option = document.createElement("option");
            option.value = index;
            option.textContent = `Chapter ${index + 1} of ${totalPosts}`;
            if (index === currentIndex) option.selected = true;
            chapterSelect.appendChild(option);
        });
        chapterSelect.addEventListener('change', (e) => window.location.href = basePath + "/" + e.target.value);
        navContainer.appendChild(chapterSelect);

        if (currentIndex < totalPosts - 1) {
            const nextLink = document.createElement("a");
            nextLink.href = basePath + "/" + (currentIndex + 1);
            nextLink.className = "nav-button next";
            nextLink.textContent = "Next";
            navContainer.appendChild(nextLink);
        }
        container.appendChild(navContainer);
    }

    if (window.doesOwn) {
        const editLink = document.createElement("a");
        editLink.href = `/heichelos/${post.heichel.id}/edit?type=post&id=${post.id}${getLinkHrefOfEditing()}`;
        editLink.className = "edit-post-link";
        editLink.textContent = "Edit post";
        container.appendChild(editLink);
    }
    return container;
}

export function makeNavBars(post, seriesParent, indexInSeries) {
    var cur = parseInt(indexInSeries) || 0;
    var length = seriesParent.posts.length;
    var hasPrevious = cur > 0;
    var hasNext = cur < length - 1;
    
    var html = `<div class="nav"><div class="controls">${cur + 1} of ${length}</div>`;
    if (hasPrevious) html += `<a id="last" class="nav button primary" href="${encodeURIComponent(cur - 1)}">Previous</a>`;
    if (hasNext) html += `<a id="next" class="nav button primary" href="${encodeURIComponent(cur + 1)}">Next</a>`;
    html += `</div><script>if(window.next) next.href = next.href; if(window.last) last.href = last.href;</script>`;
    return html;
}

export function makeToast(message) {
    const toast = document.createElement('div');
    toast.classList.add('ohr-ein-sof-toast');
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('ohr-ein-sof-toast-revealed'));
    setTimeout(() => {
        toast.classList.remove('ohr-ein-sof-toast-revealed');
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, 3000);
}

// Fullscreen toggle function
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            // Safari
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
            // IE11
            document.documentElement.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            // Safari
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            // IE11
            document.msExitFullscreen();
        }
    }
}

/**
 * B"H - Polished Custom Context Menu
 * Now includes Section and Paragraph specific actions for commenting and inline viewing.
 * Forces URL update before executing context actions.
 */
export async function showCustomContextMenu(x, y, e) {
    const getSelectedText = () => window.getSelection().toString();
    
    const subSection = e.target.closest('.sub-awtsmoos');
    const mainSection = e.target.closest('.section');
    
    const idx = mainSection ? mainSection.dataset.awtsmoosIdx : null;
    const sub = subSection ? subSection.dataset.awtsmoosSub : null;

    const menuActions = {
        "Fullscreen": () => toggleFullscreen(),
        "Copy": (txt) => copyToClipboard({ text: txt || window.activePar?.textContent }, makeToast),
    };

    if (idx !== null) {
        const sectionType = sub !== null ? "Paragraph" : "Verse";
        
        menuActions[`Comment on this ${sectionType}`] = async () => {
            // Sync URL first so adding a comment picks up the correct context
            updateQueryStringParameter("idx", idx);
            if (sub !== null) updateQueryStringParameter("sub", sub);
            else updateQueryStringParameter("sub", null);

            if (window.openPanelToComments) {
                await window.openPanelToComments();
                if (window.commentLogic?.reloadRoot) {
                    await window.commentLogic.reloadRoot();
                }
            }
        };
        
        menuActions[`Show Commentary here`] = async () => {
            const inlineModule = await import("../comments/inline.js");
            const targetEl = subSection || mainSection;
            await inlineModule.showSectionCommentaryInline(idx, sub, targetEl);
        };

        menuActions[`Copy ${sectionType}`] = () => {
             var sec = window.sectionDayuh[idx];
             let textToCopy = Array.isArray(sec) ? sec.join(" ") : sec;
             if (sub !== null && Array.isArray(sec)) {
                 textToCopy = sec[sub] || textToCopy;
             }
             copyToClipboard({ text: textToCopy, successMsg: `Copied ${sectionType}!` }, makeToast);
        };
    }

    menuActions["Copy Entire Post"] = () => {
        var txt = `<h4>${window?.post?.title}</h4>` + window.sectionDayuh.map((d, i) => 
            `<p>${(i + 1) + ". " + (Array.isArray(d) ? d.join(" ") : d)}</p><br><br>`).join("");
        copyToClipboard({ text: txt, successMsg: "Copied Entire Post!" }, makeToast);
    };

    if (e.target.tagName == "A") {
        menuActions["Open in new tab"] = () => open(e.target.href, "_blank").focus();
    }

    const existingMenu = document.getElementById("custom-context-menu");
    if (existingMenu) existingMenu.remove();
    
    const menu = document.createElement("div");
    menu.id = "custom-context-menu";
    Object.assign(menu.style, { 
        position: "absolute", 
        left: `${x}px`, 
        top: `${y}px`, 
        backgroundColor: "#222", 
        color: "white", 
        borderRadius: "10px", 
        boxShadow: "0px 10px 30px rgba(0,0,0,0.5)", 
        padding: "8px 0", 
        zIndex: "100000", 
        cursor: "pointer",
        minWidth: "200px",
        fontSize: "14px",
        fontFamily: "'Segoe UI', sans-serif"
    });
    
    for (const [label, action] of Object.entries(menuActions)) {
        const item = document.createElement("div");
        item.innerText = label;
        item.style.padding = "10px 20px";
        item.style.transition = "background 0.2s";
        item.onclick = (event) => { 
            event.stopPropagation();
            action(getSelectedText()); 
            menu.remove(); 
        };
        item.onmouseover = () => item.style.backgroundColor = "#444";
        item.onmouseout = () => item.style.backgroundColor = "transparent";
        menu.appendChild(item);
    }
    
    document.body.appendChild(menu);
    
    const clickHandler = () => {
        menu.remove();
        document.removeEventListener('click', clickHandler);
    };
    setTimeout(() => document.addEventListener('click', clickHandler), 10);
}
