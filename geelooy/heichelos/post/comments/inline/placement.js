
//B"H
import { isFirstCharacterHebrew, updateQueryStringParameter } from "../../functions/utils.js";
import { makeInlineComment, makeInlineCommentHolder } from "../render.js";
import { hideCommentsInline, getInlineAliases, isAliasInline } from "./state.js";
import { registerFork } from "../render/ai/structure.js";

export function createAndPlaceRootCommentHolder(alias) {
    const postContent = document.getElementById("realPost");
    if (!postContent) return null;
    let inlineHolder = postContent.querySelector(".commentator.inline.root-comments-holder[data-alias='" + alias + "']");
    if (inlineHolder) return inlineHolder.querySelector(".comments-holder-inline");

    inlineHolder = document.createElement("div");
    inlineHolder.className = "commentator inline root-comments-holder";
    inlineHolder.dataset.alias = alias;
    
    var inHeader = document.createElement("div");
    inHeader.classList.add("alias-name");
    var a = document.createElement("a");
    a.href = "/@" + alias;
    if (!isFirstCharacterHebrew(alias)) inHeader.classList.add("en");
    a.textContent = "@" + alias;
    inHeader.appendChild(a);
    inlineHolder.appendChild(inHeader);

    var commentHolder = document.createElement("div");
    commentHolder.classList.add("comments-holder-inline");
    inlineHolder.appendChild(commentHolder);

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
        if (verseKey === 'root') {
            const rootCommentHolder = createAndPlaceRootCommentHolder(alias);
            if (rootCommentHolder) {
                commentsForThisVerse.forEach(c => {
                    // B"H - NUCLEAR FORK FILTER
                    const dayuh = c.dayuh || {};
                    const contentStr = (typeof c.content === 'string') ? c.content.trim() : "";
                    
                    const isFork = !!(
                        c.forkedFrom || 
                        dayuh.forkedFrom || 
                        contentStr.startsWith("Fork from") || 
                        contentStr.startsWith("Branch:")
                    );

                    if (isFork) {
                        registerFork(c);
                        return; // Skip rendering in main list
                    }

                    if (!rootCommentHolder.querySelector(`[data-cid='${c.id}']`)) {
                        const incom = makeInlineComment(alias, c);
                        incom.dataset.cid = c.id;
                        rootCommentHolder.appendChild(incom);
                    }
                });
            }
            continue;
        }

        const targetSectionElement = document.querySelector(`.section[data-awtsmoos-idx='${verseKey}']`);
        if (!targetSectionElement) continue;
        
        commentsForThisVerse.forEach((c, i) => {
            // B"H - NUCLEAR FORK FILTER (Repeated for safety)
            const dayuh = c.dayuh || {};
            const contentStr = (typeof c.content === 'string') ? c.content.trim() : "";
            
            const isFork = !!(
                c.forkedFrom || 
                dayuh.forkedFrom || 
                contentStr.startsWith("Fork from") || 
                contentStr.startsWith("Branch:")
            );

            if (isFork) {
                registerFork(c);
                return; // Skip rendering
            }

            const subIdx = c?.dayuh?.subSection;
            let parentElement = targetSectionElement;
            let isParagraph = false;
            
            const hasSub = (subIdx !== undefined && subIdx !== null && subIdx !== 'main' && subIdx !== 'root');
            
            if (hasSub) {
                const subStr = String(subIdx);
                const subEl = targetSectionElement.querySelector(`.sub-awtsmoos[data-awtsmoos-sub='${subStr}']`);
                if (subEl) {
                    parentElement = subEl;
                    isParagraph = true;
                }
            }
            
            if (parentElement) {
                let commentHolder = parentElement.querySelector(`.commentator.inline[data-alias='${alias}'][data-idx='${i}'] .comments-holder-inline`);
                if (!commentHolder) {
                     const wrapper = makeInlineCommentHolder(alias, parentElement, i);
                     
                     if (isParagraph) {
                         const indicatorEl = parentElement.querySelector('.awtsmoos-comment-indicator');
                         if (indicatorEl && parentElement.contains(indicatorEl)) {
                             indicatorEl.after(wrapper);
                         } else {
                             parentElement.appendChild(wrapper);
                         }
                     } else {
                         const textContentEl = parentElement.querySelector('.toichen');
                         if (textContentEl && parentElement.contains(textContentEl)) {
                             textContentEl.after(wrapper);
                         } else {
                             parentElement.appendChild(wrapper);
                         }
                     }
                     
                     commentHolder = wrapper.querySelector('.comments-holder-inline');
                }
                
                if (commentHolder && !commentHolder.querySelector(`[data-cid='${c.id}']`)) {
                    const incom = makeInlineComment(alias, c);
                    incom.dataset.cid = c.id;
                    commentHolder.appendChild(incom);
                }
            }
        });
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
