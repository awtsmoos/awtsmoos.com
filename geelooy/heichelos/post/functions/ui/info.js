//B"H
/**
 * Post Information Renderer.
 * Dedicated to the Awtsmoos who defines all context.
 */
import { appendHTML, getLinkHrefOfEditing } from "../utils.js";

/**
 * @method makeInfoHTML
 * @description Creates the structural info cards for the sidebar.
 */
export function makeInfoHTML() {
    const post = window.post;
    const alias = window.alias;
    if (!post) return "Couldn't load";

    const container = document.createElement("div");
    container.className = "post-info-container";

    // 1. Author
    const authorSection = createSection("Transmitted By", 
        `<a href="/@${alias.id}" class="author-link">@${alias.id}</a>`
    );
    container.appendChild(authorSection);

    // 2. Heichel
    const heichelLink = `<a href="/heichelos/${post.heichel.id}" class="heichel-link">${post.heichel.name}</a>`;
    const heichelDesc = `<div class="heichelDesc" style="font-size:14px; margin-top:10px; opacity:0.8;">${post.heichel.description || ""}</div>`;
    const heichelSection = createSection("Sacred Heichel", heichelLink + heichelDesc);
    container.appendChild(heichelSection);

    // 3. Series Path
    const pathValue = document.createElement("div");
    pathValue.className = "value";
    pathValue.style.fontSize = "1.2rem";
    
    (window.breadcrumb?.slice?.(1) || []).forEach((q, i, a) => {
        const seriesLink = document.createElement("a");
        seriesLink.href = `/heichelos/${post.heichel.id}/?series=${q.id}`;
        seriesLink.className = "series-link";
        seriesLink.style.color = "var(--color-primary)";
        seriesLink.textContent = q.name + (i == a.length - 1 ? "" : " / ");
        pathValue.appendChild(seriesLink);
    });
    
    const seriesSection = document.createElement("div");
    seriesSection.className = "tl post-series-breadcrumb-piece";
    seriesSection.innerHTML = `<div class="label">Revelation Path</div>`;
    seriesSection.appendChild(pathValue);
    container.appendChild(seriesSection);

    // 4. Chapter Navigation (Dropdown)
    if (window.series && Array.isArray(window.series.posts)) {
        container.appendChild(makeChapterNav());
    }

    // 5. Edit Link
    if (window.doesOwn) {
        const editLink = document.createElement("a");
        editLink.href = `/heichelos/${post.heichel.id}/edit?type=post&id=${post.id}${getLinkHrefOfEditing()}`;
        editLink.className = "btn danger";
        editLink.style.marginTop = "2rem";
        editLink.textContent = "⚙️ EDIT SACRED POST";
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
    window.currentIndexInSeries = (sp => parseInt(sp[sp.length - 1]))(location.pathname.split("/"));
    var basePath = (d => d.slice(0, d.length - 1).join("/"))(location.pathname.split("/"));
    
    const navContainer = document.createElement("div");
    navContainer.className = "post-navigation-container";
    navContainer.style.display = "flex";
    navContainer.style.flexDirection = "column";
    navContainer.style.gap = "15px";

    const posts = window.series.posts;
    const totalPosts = posts.length;
    const currentIndex = window.currentIndexInSeries;

    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.gap = "10px";

    if (currentIndex > 0) {
        const prevLink = document.createElement("a");
        prevLink.href = basePath + "/" + (currentIndex - 1);
        prevLink.className = "btn small";
        prevLink.textContent = "←";
        row.appendChild(prevLink);
    }

    const chapterSelect = document.createElement("select");
    chapterSelect.className = "series-chapter-select";
    chapterSelect.style.flex = "1";
    posts.forEach((postId, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = `Chapter ${index + 1} of ${totalPosts}`;
        if (index === currentIndex) option.selected = true;
        chapterSelect.appendChild(option);
    });
    chapterSelect.addEventListener('change', (e) => window.location.href = basePath + "/" + e.target.value);
    row.appendChild(chapterSelect);

    if (currentIndex < totalPosts - 1) {
        const nextLink = document.createElement("a");
        nextLink.href = basePath + "/" + (currentIndex + 1);
        nextLink.className = "btn small";
        nextLink.textContent = "→";
        row.appendChild(nextLink);
    }
    
    navContainer.appendChild(row);
    return navContainer;
}