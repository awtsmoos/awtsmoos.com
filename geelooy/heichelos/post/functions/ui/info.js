
//B"H
/**
 * @file info.js
 * @description 
 * The Info Panel Renderer.
 * Transmuted from `innerHTML` string interpolation into pure JSON Blueprints 
 * using the Scribe of Manifestation (GenesisEngine).
 */
import { GenesisEngine } from "../dom/GenesisEngine.js";
import { getLinkHrefOfEditing } from "../interaction/CoordinateInteraction.js";

/**
 * @method makeInfoHTML
 * @description Creates the structural info cards for the sidebar as a DOM Node.
 * @returns {HTMLElement}
 */
export function makeInfoHTML() {
    const post = window.post || {};
    const alias = window.alias || { id: "Anonymous", name: "Hidden One" };
    const heichel = post.heichel || { id: "unknown", name: "Unknown Realm", description: "A sacred expanse." };

    const authorIdStr = alias.name || alias.id;

    const blueprint = {
        tag: 'div',
        attr: { class: 'post-info-container awtsmoos-card' },
        children:[]
    };

    // 1. Author Section
    blueprint.children.push(createSectionPlan("Transmitted By", {
        tag: 'a',
        attr: { href: `/@${alias.id}`, class: 'author-link awtsmoos-hero-btn' },
        text: `@${authorIdStr}`
    }));

    // 2. Heichel Section
    blueprint.children.push(createSectionPlan("Sacred Heichel",[
        {
            tag: 'a',
            attr: { href: `/heichelos/${heichel.id}`, class: 'heichel-link awtsmoos-hero-btn' },
            text: heichel.name
        },
        {
            tag: 'div',
            attr: { class: 'heichelDesc comment-content', style: 'font-size:12px; margin-top:8px; opacity:0.7; font-style:italic;' },
            text: heichel.description
        }
    ]));

    // 3. Series Path
    if (window.breadcrumb && Array.isArray(window.breadcrumb)) {
        const pathChildren = window.breadcrumb.slice(1).map((q, i, a) => ({
            tag: 'a',
            attr: { href: `/heichelos/${heichel.id}/?series=${q.id}`, class: 'series-link awtsmoos-hero-btn' },
            text: q.name + (i === a.length - 1 ? "" : " / ")
        }));

        blueprint.children.push({
            tag: 'div',
            attr: { class: 'tl' },
            children:[
                { tag: 'div', attr: { class: 'label' }, text: 'Revelation Path' },
                { tag: 'div', attr: { class: 'value path-value' }, children: pathChildren }
            ]
        });
    }

    // 4. Chapter Navigation
    if (window.series && Array.isArray(window.series.posts)) {
        blueprint.children.push(makeChapterNavPlan(window.series.posts));
    }

    // 5. Edit Link
    if (window.doesOwn) {
        blueprint.children.push({
            tag: 'a',
            attr: { 
                href: `/heichelos/${heichel.id}/edit?type=post&id=${post.id}${getLinkHrefOfEditing()}`, 
                class: 'btn danger full-width',
                style: 'margin-top: 2rem;'
            },
            children:[
                { tag: 'span', text: '⚙️ EDIT POST' }
            ]
        });
    }

    return GenesisEngine.manifest(blueprint);
}

/**
 * @private
 * @function createSectionPlan
 */
function createSectionPlan(label, valuePlan) {
    return {
        tag: 'div',
        attr: { class: 'tl' },
        children:[
            { tag: 'div', attr: { class: 'label' }, text: label },
            { 
                tag: 'div', 
                attr: { class: 'value' }, 
                children: Array.isArray(valuePlan) ? valuePlan : [valuePlan] 
            }
        ]
    };
}

/**
 * @private
 * @function makeChapterNavPlan
 */
function makeChapterNavPlan(posts) {
    let currentIndex = window.currentIndexInSeries;
    if (currentIndex === undefined || currentIndex === null) {
        if (posts && window.post?.id) {
            currentIndex = posts.indexOf(window.post.id);
        } else {
            currentIndex = 0;
        }
    }

    const basePath = (d => d.slice(0, d.length - 1).join("/"))(location.pathname.split("/"));
    const totalPosts = posts.length;

    const rowChildren =[];

    if (currentIndex > 0) {
        rowChildren.push({
            tag: 'a',
            attr: { href: `${basePath}/${currentIndex - 1}`, class: 'btn small secondary' },
            text: '← Prev'
        });
    }

    const options = posts.map((postId, index) => ({
        tag: 'option',
        attr: { value: index, ...(index === currentIndex ? { selected: true } : {}) },
        text: `Ch. ${index + 1} / ${totalPosts}`
    }));

    rowChildren.push({
        tag: 'select',
        attr: { class: 'series-chapter-select font-selector' },
        children: options,
        events: {
            change: (e) => window.location.href = `${basePath}/${e.target.value}`
        }
    });

    if (currentIndex < totalPosts - 1) {
        rowChildren.push({
            tag: 'a',
            attr: { href: `${basePath}/${currentIndex + 1}`, class: 'btn small secondary' },
            text: 'Next →'
        });
    }

    return {
        tag: 'div',
        attr: { class: 'post-navigation-container awtsmoos-card' },
        children:[{ tag: 'div', attr: { class: 'nav-row awtsmoos-sidebar-actions' }, children: rowChildren }]
    };
}
