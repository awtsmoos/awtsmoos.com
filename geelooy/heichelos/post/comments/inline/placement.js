// /BH/awtsmoos.com/geelooy/heichelos/post/comments/inline/placement.js
//B"H
import { isFirstCharacterHebrew, updateQueryStringParameter } from "/heichelos/post/functions/utils.js";
import { makeInlineComment, makeInlineCommentHolder, renderTreeItem } from "/heichelos/post/comments/render.js";
import { hideCommentsInline, getInlineAliases, isAliasInline } from "/heichelos/post/comments/inline/state.js";

function buildCommentTree(comments) {
    const map = {};
    const roots = [];
    comments.forEach(c => { map[c.id] = { comment: c, children: [] }; });
    comments.forEach(c => {
        const node = map[c.id];
        const dayuh = c.dayuh || {};
        const parentId = dayuh.replyToId || dayuh.forkedFrom?.commentId;
        if (parentId && map[parentId]) map[parentId].children.push(node);
        else roots.push(node);
    });
    roots.sort((a, b) => parseInt(a.comment.id.split('_')[1]) - parseInt(b.comment.id.split('_')[1]));
    return roots;
}

export function createAndPlaceRootCommentHolder(alias) {
    const postContent = document.getElementById("realPost");
    if (!postContent) return null;
    let inlineHolder = postContent.querySelector(".commentator.inline.root-comments-holder[data-alias='" + alias + "']");
    if (inlineHolder) return inlineHolder.querySelector(".comments-holder-inline");

    inlineHolder = document.createElement("div");
    inlineHolder.className = "commentator inline root-comments-holder";
    inlineHolder.dataset.alias = alias;
    
    // B"H - Toggle Button (The ONLY Header)
    const toggleBtn = document.createElement("button");
    toggleBtn.className = "inline-summary-btn";
    toggleBtn.innerHTML = `💬 Post Comments (@${alias})`;
    
    // B"H - The Scroll Lock Container
    const scrollContainer = document.createElement("div");
    scrollContainer.className = "inline-scroll-container"; // New Class for containment

    const commentHolder = document.createElement("div");
    commentHolder.className = "comments-holder-inline"; 
    
    toggleBtn.onclick = () => {
        const isHidden = getComputedStyle(scrollContainer).display === "none";
        scrollContainer.style.display = isHidden ? "block" : "none";
        commentHolder.classList.toggle("expanded", isHidden);
        toggleBtn.classList.toggle("active", isHidden);
    };

    // Default state: Hidden
    scrollContainer.style.display = "none";
    scrollContainer.appendChild(commentHolder);

    inlineHolder.append(toggleBtn, scrollContainer);

    const postTitle = postContent.querySelector(".post-title");
    if (postTitle && postTitle.nextSibling) postTitle.parentNode.insertBefore(inlineHolder, postTitle.nextSibling);
    else if (postTitle) postTitle.parentNode.appendChild(inlineHolder);
    else postContent.prepend(inlineHolder);

    return commentHolder;
}

export function addCommentsInline(comments, alias) {
    if (!comments || comments.length === 0) return;
    
    const commentsByVerse = comments.reduce((acc, comment) => {
        const verseKey = comment?.dayuh?.verseSection ?? 'root';
        if (!acc[verseKey]) acc[verseKey] = [];
        acc[verseKey].push(comment);
        return acc;
    }, {});

    for (const verseKey in commentsByVerse) {
        const commentsForThisVerse = commentsByVerse[verseKey];
        const treeRoots = buildCommentTree(commentsForThisVerse);

        if (verseKey === 'root') {
            const rootHolderDiv = document.querySelector(".commentator.inline.root-comments-holder[data-alias='" + alias + "']");
            let wasExpanded = false;
            let expandedReplies = new Set();
            if (rootHolderDiv) {
                const scrollContainer = rootHolderDiv.querySelector('.inline-scroll-container');
                if (scrollContainer && getComputedStyle(scrollContainer).display !== "none") {
                    wasExpanded = true;
                }
                scrollContainer.querySelectorAll('.reply-toggle-btn[data-expanded="true"]').forEach(btn => {
                    const card = btn.closest('.comment-wrapper')?.querySelector('[data-cid]');
                    if (card) expandedReplies.add(card.dataset.cid);
                });
            }

            const rootCommentHolder = createAndPlaceRootCommentHolder(alias);
            if (rootCommentHolder) {
                rootCommentHolder.innerHTML = "";
                treeRoots.forEach(node => renderTreeItem(node, rootCommentHolder, (c) => makeInlineComment(c), 'inline', expandedReplies));
                
                const btn = rootCommentHolder.closest('.commentator').querySelector('.inline-summary-btn');
                if(btn) btn.innerHTML = `💬 ${commentsForThisVerse.length} Post Insights (@${alias})`;
                
                if (wasExpanded) {
                    const scrollContainer = rootCommentHolder.closest('.inline-scroll-container');
                    if (scrollContainer) scrollContainer.style.display = "block";
                    rootCommentHolder.classList.add("expanded");
                    if(btn) btn.classList.add("active");
                }
            }
            continue;
        }

        const targetSectionElement = document.querySelector(`.section[data-awtsmoos-idx='${verseKey}']`);
        if (!targetSectionElement) continue;
        
        const rootsBySub = treeRoots.reduce((acc, node) => {
            const sub = (node.comment.dayuh?.subSection !== undefined && node.comment.dayuh?.subSection !== null) ? node.comment.dayuh.subSection : 'main';
            if(!acc[sub]) acc[sub] = [];
            acc[sub].push(node);
            return acc;
        }, {});

        for (const subKey in rootsBySub) {
            const subRoots = rootsBySub[subKey];
            let parentElement = targetSectionElement;
            let isParagraph = false;

            if (subKey !== 'main') {
                const subEl = targetSectionElement.querySelector(`.sub-awtsmoos[data-awtsmoos-sub='${subKey}']`);
                if (subEl) {
                    parentElement = subEl;
                    isParagraph = true;
                }
            }

            if (parentElement) {
                let wrapper = parentElement.querySelector(`.commentator.inline[data-alias='${alias}']`);
                let commentHolder;

                let wasExpanded = false;
                let expandedReplies = new Set();
                if (wrapper) {
                    const holder = wrapper.querySelector('.comments-holder-inline');
                    if (holder && holder.style.display !== 'none') {
                        wasExpanded = true;
                    }
                    holder.querySelectorAll('.reply-toggle-btn[data-expanded="true"]').forEach(btn => {
                        const card = btn.closest('.comment-wrapper')?.querySelector('[data-cid]');
                        if(card) expandedReplies.add(card.dataset.cid);
                    });
                }

                if (!wrapper) {
                     wrapper = makeInlineCommentHolder(alias, parentElement, 0);
                     if (isParagraph) {
                         const indicatorEl = parentElement.querySelector('.awtsmoos-comment-indicator');
                         if (indicatorEl) indicatorEl.after(wrapper); else parentElement.appendChild(wrapper);
                     } else {
                         const textContentEl = parentElement.querySelector('.toichen');
                         if (textContentEl) textContentEl.after(wrapper); else parentElement.appendChild(wrapper);
                     }
                }
                commentHolder = wrapper.querySelector('.comments-holder-inline');
                
                commentHolder.innerHTML = "";
                subRoots.forEach(node => renderTreeItem(node, commentHolder, (c) => makeInlineComment(c), 'inline', expandedReplies));
                
                const totalCount = subRoots.reduce((sum, node) => {
                    const countChildren = (n) => 1 + n.children.reduce((s, c) => s + countChildren(c), 0);
                    return sum + countChildren(node);
                }, 0);

                const btn = wrapper.querySelector('.inline-summary-btn');
                if(btn) btn.innerHTML = `💬 ${totalCount} Insight${totalCount > 1 ? 's' : ''} (@${alias})`;

                if (wasExpanded) {
                    commentHolder.style.display = "block";
                    commentHolder.classList.add("expanded");
                    if(btn) btn.classList.add("active");
                }
            }
        }
    }
}

export function toggleInlineForComments(comments, alias) {
  if(!isAliasInline(alias)) {
    addCommentsInline(comments, alias);
    let p = getInlineAliases();
    if (!p.includes(alias)) {
        p.push(alias);
        updateQueryStringParameter("inline", JSON.stringify(p));
    }
  } else {
    hideCommentsInline(alias);
  }
}
