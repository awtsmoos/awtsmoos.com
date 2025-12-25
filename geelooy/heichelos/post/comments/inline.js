//B"H
import { isFirstCharacterHebrew, updateQueryStringParameter } from "/heichelos/post/postFunctions.js";
import { makeInlineComment, makeInlineCommentHolder } from "./render.js";
import { loadedInlineVerses } from "./state.js";
import { getCommentsOfAlias } from "/scripts/awtsmoos/api/utils.js";
import { injectInlineThreadCSS } from "../styles/inlineThreadStyles.js";

var inlineComments = {};

// B"H - Global Access for Refresher
window.awtsmoosInline = {
    refreshSectionCommentary: async (idx, sub) => {
        const subKey = (sub !== null && sub !== undefined) ? sub : 'main';
        const threadId = `${idx}-${subKey}`;
        const container = document.querySelector(`.awtsmoos-inline-thread[data-unique-thread="${threadId}"]`);
        if (container) {
            await renderThreadContent(container, idx, sub);
        }
    }
};

/**
 * @method manifestCommentIndicators
 * @description B"H - Lights the flames. Also checks for Deep Links on load.
 */
export async function manifestCommentIndicators() {
    const post = window.post;
    if (!post) return;
    
    const { getAndSaveAliases } = await import("./panel.js");
    const sections = document.querySelectorAll('.section');
    
    // Check URL for Deep Link
    const urlParams = new URLSearchParams(window.location.search);
    const targetIdx = urlParams.get('idx');
    const targetSub = urlParams.get('sub');
    const targetCid = urlParams.get('cid'); // Comment ID

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
                    // Update URL params without wiping CID unless we are changing context
                    updateQueryStringParameter("idx", idx);
                    updateQueryStringParameter("sub", null);
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
                        updateQueryStringParameter("idx", idx);
                        updateQueryStringParameter("sub", subIdx);
                        showSectionCommentaryInline(idx, subIdx, subEl);
                    };
                }
            }
        }
    }

    // B"H - Auto-open if deep linked
    if (targetCid && targetIdx !== null) {
        const targetElSelector = targetSub !== null 
            ? `.sub-awtsmoos[data-awtsmoos-sub='${targetSub}']` 
            : `.section[data-awtsmoos-idx='${targetIdx}']`;
        
        const el = document.querySelector(targetElSelector);
        if(el) {
            // Slight delay to ensure layout
            setTimeout(() => showSectionCommentaryInline(targetIdx, targetSub, el), 500);
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

/**
 * @method renderThreadContent
 * @description B"H - Internal logic to populate the inline thread container. Reusable for refreshing.
 */
async function renderThreadContent(threadContainer, idx, sub) {
    // Show local loader
    threadContainer.innerHTML = `<div class="thread-loading">Gathering revelations...</div>`;
    
    // Add Close Button (always needed)
    const addControls = () => {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'thread-close-btn';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => {
            threadContainer.style.opacity = '0';
            setTimeout(() => threadContainer.remove(), 300);
            updateQueryStringParameter("cid", null);
            updateQueryStringParameter("mid", null);
        };
        threadContainer.appendChild(closeBtn);

        // B"H - Add "Start New Thread" Button for this section
        if(window.curAlias) {
            const newThreadBtn = document.createElement("button");
            newThreadBtn.className = "btn primary small";
            newThreadBtn.innerText = "Start New Thread";
            newThreadBtn.style.margin = "0 0 15px 15px";
            newThreadBtn.onclick = async () => {
                const { openAIChat } = await import("../ai/chat.js");
                // Set URL context first
                updateQueryStringParameter("idx", idx);
                if(sub !== null) updateQueryStringParameter("sub", sub);
                openAIChat(); 
            };
            threadContainer.appendChild(newThreadBtn);
        }
    };

    const { getAndSaveAliases } = await import("./panel.js");
    // Force fresh fetch (true) to see new comments immediately
    let aliases = await getAndSaveAliases(false, true, idx, sub, false); 

    threadContainer.innerHTML = ""; 
    addControls();

    if (!aliases || aliases.length === 0) {
        threadContainer.innerHTML += `<div class="thread-empty">No commentaries found here. Start one?</div>`;
        return;
    }

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
            `;
            threadContainer.appendChild(aliasGroup);
            foundAny = true;
            continue;
        }

        // Force fresh comments fetch
        const allVerseComments = await getCommentsOfAlias({
            seriesId: window?.post?.parentSeriesId,
            postId: window?.post?.id,
            heichelId: window?.post?.heichel.id,
            aliasId: alias,
            fromCache: false, // B"H - Important for immediate refresh
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
        threadContainer.innerHTML += `<div class="thread-empty">No commentaries specifically on this section.</div>`;
    }
}

export async function showSectionCommentaryInline(idx, sub, targetEl) {
    injectInlineThreadCSS();
    
    if (!targetEl || !targetEl.querySelector) {
        const sel = (sub !== null && sub !== undefined) 
            ? `.sub-awtsmoos[data-awtsmoos-sub='${sub}']` 
            : `.section[data-awtsmoos-idx='${idx}']`;
        targetEl = document.querySelector(sel);
        if (!targetEl) return console.error("Target element not found for candle");
    }

    const subKey = (sub !== null && sub !== undefined) ? sub : 'main';
    const threadId = `${idx}-${subKey}`;
    
    const parentContainer = targetEl.parentNode;
    const existing = parentContainer ? parentContainer.querySelector(`.awtsmoos-inline-thread[data-unique-thread="${threadId}"]`) : null;

    if (existing) {
        existing.style.opacity = '0';
        existing.style.transform = 'translateY(-10px) scale(0.98)';
        setTimeout(() => existing.remove(), 250); 
        // B"H - Clear Deep Link if closed
        updateQueryStringParameter("cid", null);
        updateQueryStringParameter("mid", null);
        return;
    }

    const threadContainer = document.createElement('div');
    threadContainer.className = 'awtsmoos-inline-thread';
    threadContainer.dataset.uniqueThread = threadId;
    
    if (sub !== null && sub !== undefined) {
        const indicatorEl = targetEl.querySelector('.awtsmoos-comment-indicator');
        if (indicatorEl) indicatorEl.after(threadContainer);
        else targetEl.appendChild(threadContainer);
    } else {
        const textContentEl = targetEl.querySelector('.toichen');
        if (textContentEl) textContentEl.after(threadContainer);
        else targetEl.appendChild(threadContainer);
    }

    await renderThreadContent(threadContainer, idx, sub);
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