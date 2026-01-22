//B"H
/**
 * @file info.js
 * @description 
 * The Info Panel Renderer.
 * SAFEGUARDED: Now checks for the existence of souls (Alias) before naming them.
 */
import { appendHTML, getLinkHrefOfEditing } from "../utils.js";

/**
 * @method makeInfoHTML
 * @description Creates the structural info cards for the sidebar.
 */
export function makeInfoHTML() {
    const post = window.post || {};
    const alias = window.alias || { id: "Anonymous", name: "Hidden One" };
    const heichel = post.heichel || { id: "unknown", name: "Unknown Realm" };

    const container = document.createElement("div");
    container.className = "post-info-container";

    // 1. Author
    const authorSection = createSection("Transmitted By", 
        `<a href="/@${alias.id}" class="author-link">@${alias.name || alias.id}</a>`
    );
    container.appendChild(authorSection);

    // 2. Heichel
    const heichelLink = `<a href="/heichelos/${heichel.id}" class="heichel-link">${heichel.name}</a>`;
    const heichelDesc = `<div class="heichelDesc" style="font-size:12px; margin-top:8px; opacity:0.7; font-style:italic;">${heichel.description || "A sacred expanse."}</div>`;
    const heichelSection = createSection("Sacred Heichel", heichelLink + heichelDesc);
    container.appendChild(heichelSection);

    // 3. Series Path
    if (window.breadcrumb && Array.isArray(window.breadcrumb)) {
        const pathValue = document.createElement("div");
        pathValue.className = "value path-value";
        
        window.breadcrumb.slice(1).forEach((q, i, a) => {
            const seriesLink = document.createElement("a");
            seriesLink.href = `/heichelos/${heichel.id}/?series=${q.id}`;
            seriesLink.className = "series-link";
            seriesLink.textContent = q.name + (i == a.length - 1 ? "" : " / ");
            pathValue.appendChild(seriesLink);
        });
        
        const seriesSection = document.createElement("div");
        seriesSection.className = "tl";
        seriesSection.innerHTML = `<div class="label">Revelation Path</div>`;
        seriesSection.appendChild(pathValue);
        container.appendChild(seriesSection);
    }

    // 4. Chapter Navigation
    if (window.series && Array.isArray(window.series.posts)) {
        container.appendChild(makeChapterNav());
    }

    // 5. Edit Link
    if (window.doesOwn) {
        const editLink = document.createElement("a");
        editLink.href = `/heichelos/${heichel.id}/edit?type=post&id=${post.id}${getLinkHrefOfEditing()}`;
        editLink.className = "btn danger full-width";
        editLink.style.marginTop = "2rem";
        editLink.innerHTML = "<span>⚙️ EDIT POST</span>";
        container.appendChild(editLink);
    }
    return container;
}

function createSection(label, valueHtml) {
    const div = document.createElement("div");
    div.className = "tl";
    div.innerHTML = `<div class="label">${label}</div><div class="value">${valueHtml}</div>`;
    return div;
}

function makeChapterNav() {
    // Safety check for index
    let currentIndex = window.currentIndexInSeries;
    if (currentIndex === undefined || currentIndex === null) {
        // Try to find index from post ID in series
        if (window.series?.posts && window.post?.id) {
            currentIndex = window.series.posts.indexOf(window.post.id);
        } else {
            currentIndex = 0;
        }
    }

    const basePath = (d => d.slice(0, d.length - 1).join("/"))(location.pathname.split("/"));
    
    const navContainer = document.createElement("div");
    navContainer.className = "post-navigation-container";

    const posts = window.series.posts;
    const totalPosts = posts.length;

    const row = document.createElement("div");
    row.className = "nav-row";

    if (currentIndex > 0) {
        const prevLink = document.createElement("a");
        prevLink.href = basePath + "/" + (currentIndex - 1);
        prevLink.className = "btn small secondary";
        prevLink.innerHTML = "← Prev";
        row.appendChild(prevLink);
    }

    const chapterSelect = document.createElement("select");
    chapterSelect.className = "series-chapter-select";
    posts.forEach((postId, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = `Ch. ${index + 1} / ${totalPosts}`;
        if (index === currentIndex) option.selected = true;
        chapterSelect.appendChild(option);
    });
    chapterSelect.addEventListener('change', (e) => window.location.href = basePath + "/" + e.target.value);
    row.appendChild(chapterSelect);

    if (currentIndex < totalPosts - 1) {
        const nextLink = document.createElement("a");
        nextLink.href = basePath + "/" + (currentIndex + 1);
        nextLink.className = "btn small secondary";
        nextLink.innerHTML = "Next →";
        row.appendChild(nextLink);
    }
    
    navContainer.appendChild(row);
    return navContainer;
}