//B"H
import { isFirstCharacterHebrew, updateQueryStringParameter } from "/heichelos/post/postFunctions.js";
import { makeInlineComment, makeInlineCommentHolder } from "./render.js";
import { loadedInlineVerses } from "./state.js";
import { getCommentsOfAlias } from "/scripts/awtsmoos/api/utils.js";
import { injectInlineThreadCSS } from "../styles/inlineThreadStyles.js";

var inlineComments = {};

/**
 * @method manifestCommentIndicators
 * @description B"H - Lights the flames. Note: Currently, backend aliases are verse-level.
 * We manifest indicators, but strict filtering happens on click to save bandwidth.
 */
export async function manifestCommentIndicators() {
    const post = window.post;
    if (!post) return;
    
    const { getAndSaveAliases } = await import("./panel.js");
    const sections = document.querySelectorAll('.section');
    
    for (const section of sections) {
        const idx = section.dataset.awtsmoosIdx;
        
        // 1. Verse Level
        const mainAliases = await getAndSaveAliases(false, true, idx, null, false);
        if (mainAliases && mainAliases.length > 0) {
            const indicatorSlot = section.querySelector('.awtsmoos-comment-indicator:not(.sub-indicator)');
            if (indicatorSlot) {
                indicatorSlot.innerHTML = `<span class="awtsmoos-flame" title="Verse commentators">🕯️</span>`;
                indicatorSlot.classList.add('visible');
                indicatorSlot.onclick = (e) => {
                    e.stopPropagation();
                    showSectionCommentaryInline(idx, null, section);
                };
            }
        }

        // 2. Paragraph Level
        const subs = section.querySelectorAll('.sub-awtsmoos');
        for (const subEl of subs) {
            const subIdx = subEl.dataset.awtsmoosSub;
            const subAliases = await getAndSaveAliases(false, true, idx, subIdx, false);
            if (subAliases && subAliases.length > 0) {
                const subIndicator = subEl.querySelector('.awtsmoos-comment-indicator.sub-indicator');
                if (subIndicator) {
                    subIndicator.innerHTML = `<span class="awtsmoos-flame small" title="Paragraph commentators">🕯️</span>`;
                    subIndicator.classList.add('visible');
                    subIndicator.onclick = (e) => {
                        e.stopPropagation();
                        showSectionCommentaryInline(idx, subIdx, subEl);
                    };
                }
            }
        }
    }
}

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
            const subIdx = c?.dayuh?.subSection;
            let parentElement = targetSectionElement;
            let isParagraph = false;
            
            // B"H - Enhanced check: ensure '0' is captured as valid.
            // Also coerce to string for selector compatibility.
            if (subIdx !== undefined && subIdx !== null && subIdx !== 'main' && subIdx !== 'root') {
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
                         // Verse level fallback
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

export async function showSectionCommentaryInline(idx, sub, targetEl) {
    injectInlineThreadCSS();
    
    // Fallback: If targetEl isn't passed or invalid, try to find it.
    if (!targetEl || !targetEl.querySelector) {
        const sel = (sub !== null && sub !== undefined) 
            ? `.sub-awtsmoos[data-awtsmoos-sub='${sub}']` 
            : `.section[data-awtsmoos-idx='${idx}']`;
        targetEl = document.querySelector(sel);
        if (!targetEl) return console.error("Target element not found for candle");
    }

    const subKey = (sub !== null && sub !== undefined) ? sub : 'main';
    
    // Check if thread exists near this target (sibling check)
    // We check parent's children to see if our thread is already there
    const parent = targetEl.parentNode; // Usually .toichen or .section
    let existing = null;
    if(parent) {
        // We look for a thread that follows our target
        // This is a heuristic. A robust way is to query by ID or data attr globally within the section
        const sectionContainer = targetEl.closest('.section');
        if(sectionContainer) {
             existing = sectionContainer.querySelector(`.awtsmoos-inline-thread[data-unique-thread="${idx}-${subKey}"]`);
        }
    }

    if (existing) {
        existing.remove();
        return;
    }

    const threadContainer = document.createElement('div');
    threadContainer.className = 'awtsmoos-inline-thread';
    threadContainer.dataset.uniqueThread = `${idx}-${subKey}`;
    const label = (sub !== null && sub !== undefined) ? `Paragraph ${parseInt(sub) + 1}` : `Verse ${parseInt(idx) + 1}`;
    threadContainer.innerHTML = `<div class="thread-loading">Gathering revelations for ${label}...</div>`;
    
    // B"H - Placement Logic
    if (sub !== null && sub !== undefined) {
        // Paragraph level: Place after the flame inside the sub-awtsmoos div
        const indicatorEl = targetEl.querySelector('.awtsmoos-comment-indicator');
        if (indicatorEl) indicatorEl.after(threadContainer);
        else targetEl.appendChild(threadContainer);
    } else {
        // Verse level: Place after .toichen content inside .section
        const textContentEl = targetEl.querySelector('.toichen');
        if (textContentEl) textContentEl.after(threadContainer);
        else targetEl.appendChild(threadContainer);
    }

    const { getAndSaveAliases } = await import("./panel.js");
    // Strict fetch: false fallback
    let aliases = await getAndSaveAliases(false, true, idx, sub, false); 

    if (!aliases || aliases.length === 0) {
        threadContainer.innerHTML = `<div class="thread-empty">No commentaries found here. B"H.</div>`;
        setTimeout(() => { if(threadContainer.parentNode) threadContainer.remove(); }, 3000);
        return;
    }

    threadContainer.innerHTML = ""; 
    const closeBtn = document.createElement('button');
    closeBtn.className = 'thread-close-btn';
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = () => threadContainer.remove();
    threadContainer.appendChild(closeBtn);

    let foundAny = false;
    for (const alias of aliases) {
        if (isAliasInline(alias)) {
            const aliasGroup = document.createElement('div');
            aliasGroup.className = 'thread-alias-group';
            aliasGroup.innerHTML = `
                <div class="thread-alias-header">@${alias}</div>
                <div style="font-size:12px; color:#666; padding: 5px; font-style:italic;">
                    (Currently reading inline below)
                </div>
                <button class="btn secondary" style="font-size:11px; padding:2px 6px;" onclick="
                    var el = document.querySelector('.commentator.inline[data-alias=\\'${alias}\\']');
                    if(el) el.scrollIntoView({behavior:'smooth', block:'center'});
                ">Go to comments</button>
            `;
            threadContainer.appendChild(aliasGroup);
            foundAny = true;
            continue;
        }

        const allVerseComments = await getCommentsOfAlias({
            seriesId: window?.post?.parentSeriesId,
            postId: window?.post?.id,
            heichelId: window?.post?.heichel.id,
            aliasId: alias,
            get: { verseSection: idx, map: true } 
        });
        
        let relevant = [];
        if (Array.isArray(allVerseComments)) {
            relevant = allVerseComments.filter(c => {
                const cSub = c?.dayuh?.subSection;
                if (sub === null || sub === undefined) {
                    return cSub === undefined || cSub === null || cSub === 'main' || cSub === 'root';
                } else {
                    return String(cSub) === String(sub);
                }
            });
        }

        if (relevant.length > 0) {
            foundAny = true;
            const aliasGroup = document.createElement('div');
            aliasGroup.className = 'thread-alias-group';
            aliasGroup.innerHTML = `<div class="thread-alias-header">@${alias}</div>`;
            relevant.forEach(c => {
                const incom = makeInlineComment(alias, c);
                aliasGroup.appendChild(incom);
            });
            threadContainer.appendChild(aliasGroup);
        }
    }
    
    if (!foundAny) {
        threadContainer.innerHTML = `<div class="thread-empty">No commentaries specifically on this section.</div>`;
    }
}

export function getInlineAliases() {
  var url = new URL(window.location);
  var inlineParam = url.searchParams.get("inline");
  try {
    var p = JSON.parse(inlineParam);
    if(p && Array.isArray(p)) return p;
    else return [];
  } catch(e) { return []; }
}

export function hideCommentsInline(comments, alias) {
    if(inlineComments[alias]) inlineComments[alias] = null;
    document.querySelectorAll(".commentator.inline[data-alias='" + alias + "']").forEach(w=>w.parentNode.removeChild(w));
    var p = getInlineAliases();
    if(!p.length) updateQueryStringParameter("inline", null);
    else {
        var idx = p.indexOf(alias);
        if(idx > -1) {
            p.splice(idx, 1);
            updateQueryStringParameter("inline", JSON.stringify(p));
        }
    }
    const verseKeyPrefix = `${alias}-`;
    Object.keys(loadedInlineVerses).forEach(k => { if(k.startsWith(verseKeyPrefix)) delete loadedInlineVerses[k]; });
}

export function isAliasInline(alias) {
    return getInlineAliases().includes(alias);
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
    hideCommentsInline(comments, alias);
  }
}
