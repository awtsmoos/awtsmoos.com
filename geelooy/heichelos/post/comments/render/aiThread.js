//B"H
import { markdownToHtml } from "/heichelos/post/parsing.js";
import { injectAIChatCSS } from "../../styles/aiChatStyles.js";
import { sanitizeComment } from "./utils.js";
import { openCommentsPanelToAlias } from "../panel.js";

/**
 * B"H - Renders the interactive, branching AI thread.
 */
export function renderBranchingThread(parentElement, commentData, commentId, branches = null) {
    injectAIChatCSS();
    
    const threadWrapper = document.createElement("div");
    threadWrapper.className = "ai-thread-wrapper";
    threadWrapper.dataset.commentId = commentId; 
    
    // --- Header ---
    const headerDiv = document.createElement("div");
    headerDiv.className = "ai-thread-header";
    
    const titleText = commentData.content || "AI Transmission";
    const titleSpan = document.createElement("span");
    titleSpan.className = "ai-title";
    titleSpan.innerHTML = `<span class="ai-icon">✨</span> ${markdownToHtml(sanitizeComment(titleText))}`;
    
    const viewFullBtn = document.createElement("button");
    viewFullBtn.className = "ai-header-btn";
    viewFullBtn.innerHTML = "↗ FULLSCREEN";
    viewFullBtn.onclick = async (e) => {
        e.stopPropagation();
        await openCommentsPanelToAlias(commentData.author);
        setTimeout(() => {
            const el = document.querySelector(`.comment-content[data-cid="${commentId}"]`);
            if(el) el.scrollIntoView({behavior:"smooth", block:"center"});
        }, 500);
    };

    headerDiv.appendChild(titleSpan);
    headerDiv.appendChild(viewFullBtn);
    threadWrapper.appendChild(headerDiv);

    // --- Main Timeline Container ---
    const threadContainer = document.createElement("div");
    threadContainer.className = "ai-thread-timeline root-timeline";
    
    renderThreadSequence(threadContainer, commentData.dayuh.conversation, commentData, commentId, 0, true, branches);

    threadWrapper.appendChild(threadContainer);
    parentElement.appendChild(threadWrapper);
}

/**
 * B"H - Renders a sequence of messages.
 */
function renderThreadSequence(container, history, commentData, commentId, startIndex = 0, isInteractive = false, branches = null) {
    if (!history) return;

    for (let i = startIndex; i < history.length; i++) {
        const msg = history[i];
        const block = createMessageNode(msg, i, history, commentData, commentId);
        container.appendChild(block);

        // Check for branches at this index
        if (branches && branches[i]) {
            const childComments = branches[i];
            const branchContainer = block.querySelector(".ai-branch-container");
            if (branchContainer) {
                childComments.forEach(child => {
                    renderNestedThread(branchContainer, child, child.id, child.branches);
                });
            }
        }
    }

    const isOwner = window.curAlias && window.curAlias === commentData.author;
    if (isInteractive && isOwner) {
        renderInlineTerminal(container, history, commentId, commentData);
    }
}

/**
 * B"H - Creates a clean message node.
 */
function createMessageNode(msg, index, fullHistory, commentData, commentId) {
    const block = document.createElement("div");
    block.className = `ai-thread-block ${msg.role === 'model' ? 'model' : 'user'}`;
    block.dataset.msgIndex = index;
    block.id = `msg-${commentId}-${index}`;

    // 1. Content Body (Main Visible Part)
    const mainBody = document.createElement("div");
    mainBody.className = "ai-main-body";

    // Meta Badge (Role + Actions)
    const metaHeader = document.createElement("div");
    metaHeader.className = "ai-msg-meta";
    
    const roleSpan = document.createElement("span");
    roleSpan.className = "ai-role-label";
    roleSpan.innerText = msg.role === 'user' ? 'USER' : 'AI';
    metaHeader.appendChild(roleSpan);
    
    const actionsDiv = document.createElement("div");
    actionsDiv.className = "ai-msg-actions";
    
    if (window.curAlias) {
        const replyBtn = document.createElement("button");
        replyBtn.className = "ai-action-btn";
        replyBtn.innerHTML = "[FORK]";
        replyBtn.title = "Create a new branch from here";
        replyBtn.onclick = (e) => {
            e.stopPropagation();
            toggleBranchInput(branchContainer, index, fullHistory, commentData.author, commentData, commentId);
        };
        actionsDiv.appendChild(replyBtn);
    }
    
    // Append actions *outside* the meta header to float them or keep them near?
    // Let's put actions IN the main body below the text for better visibility?
    // Or nicely inside the bubble? Let's keep them below the text.
    
    // Bubble
    const content = document.createElement("div");
    content.className = "ai-block-content";
    content.appendChild(metaHeader); // Put label inside bubble
    
    const textDiv = document.createElement("div");
    textDiv.className = "ai-content-text";
    textDiv.innerHTML = msg.role === "user" 
        ? msg.text.replace(/\n/g, "<br>") 
        : markdownToHtml(msg.text);
    
    content.appendChild(textDiv);
    
    // Add actions below content text inside bubble
    content.appendChild(actionsDiv);

    mainBody.appendChild(content);
    block.appendChild(mainBody);

    // 2. Branch Container (Nested below)
    const branchContainer = document.createElement("div");
    branchContainer.className = "ai-branch-container";
    block.appendChild(branchContainer);

    return block;
}

/**
 * B"H - Opens an input box to create a fork.
 */
function toggleBranchInput(container, index, historySnapshot, originalAuthor, parentCommentData, parentCommentId) {
    let existingInput = container.querySelector(":scope > .ai-branch-input-area");
    if (existingInput) {
        existingInput.remove();
        return;
    }

    const branchArea = document.createElement("div");
    branchArea.className = "ai-branch-input-area";
    
    const input = document.createElement("textarea");
    input.placeholder = "Enter a new reality to branch off...";
    input.focus();
    
    const actionsRow = document.createElement("div");
    actionsRow.className = "ai-input-actions";
    
    const goBtn = document.createElement("button");
    goBtn.innerText = "FORK REALITY";
    goBtn.className = "ai-btn ai-btn-primary";

    const cancelBtn = document.createElement("button");
    cancelBtn.innerText = "CANCEL";
    cancelBtn.className = "ai-btn ai-btn-secondary";
    cancelBtn.onclick = () => branchArea.remove();

    actionsRow.appendChild(cancelBtn);
    actionsRow.appendChild(goBtn);

    goBtn.onclick = async () => {
        const text = input.value.trim();
        if (!text) return;
        
        goBtn.innerText = "FORKING...";
        goBtn.disabled = true;

        const newHistory = historySnapshot.slice(0, index + 1);
        newHistory.push({ role: "user", text: text });

        try {
            const contextPrompt = newHistory.map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.text}`).join("\n");
            const prompt = `B"H\nContext:\n${contextPrompt}\n\nAI:`;
            
            const aiResponse = await window.awtsmoosAi({ prompt }); 
            newHistory.push({ role: "model", text: aiResponse });

            const verseSection = parentCommentData.dayuh.verseSection ?? "root";
            const subSection = parentCommentData.dayuh.subSection;

            const newCommentPayload = {
                aliasId: window.curAlias,
                content: `Fork from @${originalAuthor} (msg #${index + 1})`, 
                seriesId: window?.post?.parentSeriesId,
                dayuh: JSON.stringify({
                    conversation: newHistory,
                    verseSection: verseSection,
                    subSection: subSection,
                    forkedFrom: {
                        author: originalAuthor,
                        msgIndex: index,
                        commentId: parentCommentId
                    }
                })
            };

            const heichelId = window.post?.heichel?.id;
            const postId = window.post?.id;

            const res = await fetch(`/api/social/heichelos/${heichelId}/post/${postId}/comments/`, {
                method: "POST",
                body: new URLSearchParams(newCommentPayload)
            });
            
            const json = await res.json();
            if (json.success) {
                branchArea.remove();
                const newId = json.details?.id;
                const newCommentData = {
                    id: newId,
                    author: window.curAlias,
                    content: newCommentPayload.content,
                    dayuh: JSON.parse(newCommentPayload.dayuh)
                };
                renderNestedThread(container, newCommentData, newId);
                
                if (window.commentLogic?.handleNewComment) {
                    await window.commentLogic.handleNewComment({
                        aliasId: window.curAlias,
                        verseSection: verseSection,
                        commentId: newId,
                        newCommentData: newCommentData
                    });
                }
            } else {
                alert("Fork Failed.");
                goBtn.disabled = false;
            }
        } catch (e) {
            console.error(e);
            alert("Error Contacting AI.");
            goBtn.disabled = false;
        } 
    };

    branchArea.appendChild(input);
    branchArea.appendChild(actionsRow);
    
    container.insertBefore(branchArea, container.firstChild);
}

/**
 * B"H - Renders a nested thread.
 */
function renderNestedThread(container, commentData, commentId, branches = null) {
    const wrapper = document.createElement("div");
    wrapper.className = "ai-nested-thread";
    wrapper.dataset.nestedId = commentId;

    // Distinct Header for the Branch
    const header = document.createElement("div");
    header.className = "ai-nested-header";
    header.innerHTML = `<span class="branch-icon">⑂</span> Fork by @${commentData.author}`;
    
    // Collapse toggle
    const toggle = document.createElement("button");
    toggle.innerText = "[-]";
    toggle.className = "ai-action-btn";
    toggle.style.marginLeft = "10px";
    toggle.onclick = (e) => {
        e.stopPropagation();
        const timeline = wrapper.querySelector(".nested-timeline");
        if(timeline) {
            if(timeline.style.display === "none") {
                timeline.style.display = "block";
                toggle.innerText = "[-]";
            } else {
                timeline.style.display = "none";
                toggle.innerText = "[+]";
            }
        }
    };
    header.appendChild(toggle);
    wrapper.appendChild(header);

    const timelineContainer = document.createElement("div");
    timelineContainer.className = "ai-thread-timeline nested-timeline";

    let startIdx = 0;
    if (commentData.dayuh.forkedFrom && typeof commentData.dayuh.forkedFrom.msgIndex === 'number') {
        startIdx = commentData.dayuh.forkedFrom.msgIndex + 1;
    }
    
    renderThreadSequence(timelineContainer, commentData.dayuh.conversation, commentData, commentId, startIdx, true, branches);
    
    wrapper.appendChild(timelineContainer);
    container.appendChild(wrapper);
}

function renderInlineTerminal(container, history, commentId, fullCommentData) {
    const term = document.createElement("div");
    term.className = "ai-inline-terminal";
    
    const input = document.createElement("textarea");
    input.placeholder = "Continue the conversation...";
    input.rows = 1;
    
    input.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
    
    input.addEventListener('keydown', (e) => {
        if(e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendBtn.click();
        }
    });

    const sendBtn = document.createElement("button");
    sendBtn.className = "ai-send-icon-btn";
    sendBtn.innerText = "➤";
    
    sendBtn.onclick = async () => {
        const text = input.value.trim();
        if (!text) return;
        
        const userMsg = { role: "user", text };
        history.push(userMsg);
        
        // Add User Node
        const userBlock = createMessageNode(userMsg, history.length - 1, history, fullCommentData, commentId);
        container.insertBefore(userBlock, term); 
        
        input.value = "";
        input.style.height = 'auto';
        
        const loadingBlock = document.createElement("div");
        loadingBlock.className = "ai-thread-block model loading";
        loadingBlock.innerHTML = `<div class="ai-main-body"><div class="ai-block-content" style="color:#888; font-style:italic;">Thinking...</div></div>`;
        container.insertBefore(loadingBlock, term);

        try {
            const contextPrompt = history.map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.text}`).join("\n");
            const prompt = `B"H\nContext:\n${contextPrompt}\n\nAI:`;
            
            const aiResponse = await window.awtsmoosAi({ prompt });
            
            const aiMsg = { role: "model", text: aiResponse };
            history.push(aiMsg);
            
            loadingBlock.remove();
            
            const aiBlock = createMessageNode(aiMsg, history.length - 1, history, fullCommentData, commentId);
            container.insertBefore(aiBlock, term);

            fullCommentData.dayuh.conversation = history;
            const heichelId = window.post?.heichel?.id;
            const postId = window.post?.id;
            
            await fetch(`/api/social/heichelos/${heichelId}/post/${postId}/comments/`, {
                method: "PUT",
                body: new URLSearchParams({
                    commentId: commentId,
                    aliasId: fullCommentData.author,
                    seriesId: window?.post?.parentSeriesId,
                    verseSection: fullCommentData.dayuh.verseSection || "root",
                    dayuh: JSON.stringify(fullCommentData.dayuh)
                })
            });

        } catch (e) {
            console.error(e);
            loadingBlock.innerHTML = "Error.";
        }
    };

    term.appendChild(input);
    term.appendChild(sendBtn);
    container.appendChild(term);
}