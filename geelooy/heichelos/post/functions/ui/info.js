//B"H
import { appendHTML, getLinkHrefOfEditing } from "../utils.js";

export function makeInfoHTML() {
    const post = window.post;
    const alias = window.alias;
    if (!post) return "Couldn't load";

    const container = document.createElement("div");
    container.className = "post-info-container";

    // 1. Author
    const authorSection = createSection("Author:", 
        `<a href="/@${alias.id}" class="author-link">${alias.name}</a>`
    );
    container.appendChild(authorSection);

    // 2. Heichel
    const heichelLink = `<a href="/heichelos/${post.heichel.id}" class="heichel-link">${post.heichel.name}</a>`;
    const heichelDesc = `<div class="heichelDesc">${post.heichel.description || ""}</div>`;
    const heichelSection = createSection("Heichel:", heichelLink + heichelDesc);
    container.appendChild(heichelSection);

    // 3. Series Path
    const pathValue = document.createElement("div");
    pathValue.className = "value";
    (window.breadcrumb?.slice?.(1) || []).forEach((q, i, a) => {
        const seriesLink = document.createElement("a");
        seriesLink.href = `/heichelos/${post.heichel.id}/?series=${q.id}`;
        seriesLink.className = "series-link";
        seriesLink.textContent = q.name + (i == a.length - 1 ? "" : " / ");
        pathValue.appendChild(seriesLink);
    });
    const seriesSection = document.createElement("div");
    seriesSection.className = "tl post-series-breadcrumb-piece";
    seriesSection.innerHTML = `<div class="label">Path:</div>`;
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
        editLink.className = "awtsmoos-hero-btn";
        editLink.style.textAlign = "center";
        editLink.style.display = "block";
        editLink.style.textDecoration = "none";
        editLink.textContent = "EDIT POST";
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
    const posts = window.series.posts;
    const totalPosts = posts.length;
    const currentIndex = window.currentIndexInSeries;

    if (currentIndex > 0) {
        const prevLink = document.createElement("a");
        prevLink.href = basePath + "/" + (currentIndex - 1);
        prevLink.className = "nav-button prev";
        prevLink.textContent = "← Prev";
        navContainer.appendChild(prevLink);
    }

    const chapterSelect = document.createElement("select");
    chapterSelect.className = "series-chapter-select";
    posts.forEach((postId, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = `Ch ${index + 1}/${totalPosts}`;
        if (index === currentIndex) option.selected = true;
        chapterSelect.appendChild(option);
    });
    chapterSelect.addEventListener('change', (e) => window.location.href = basePath + "/" + e.target.value);
    navContainer.appendChild(chapterSelect);

    if (currentIndex < totalPosts - 1) {
        const nextLink = document.createElement("a");
        nextLink.href = basePath + "/" + (currentIndex + 1);
        nextLink.className = "nav-button next";
        nextLink.textContent = "Next →";
        navContainer.appendChild(nextLink);
    }
    return navContainer;
}
