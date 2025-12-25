//B"H
import { markdownToHtml } from "/heichelos/post/parsing.js";
import { injectAIChatCSS } from "../../styles/aiChatStyles.js";
import { sanitizeComment } from "./utils.js";
import { updateQueryStringParameter } from "/heichelos/post/functions/utils.js";
import { openCommentsPanelToAlias } from "../panel.js";
import { handleMenuOption } from "../actions.js"; 

/**
 * B"H - Renders the interactive, branching AI thread.
 */
export function renderBranchingThread(parentElement, commentData, commentId) {
    injectAIChatCSS();
    
    const threadWrapper = document.createElement("div");
    threadWrapper.className = "ai-thread-wrapper";
    threadWrapper.dataset.commentId = commentId; 
    
    // --- Header ---
    const headerDiv = document.createElement("div");
    headerDiv.className = "ai-thread-header";
    
    const titleText = commentData.content || "Awtsmoos AI Transmission";
    const titleSpan = document.createElement("span");
    titleSpan.className = "ai-title";
    titleSpan.innerHTML = `<span class="ai-icon">✨</span> ${markdownToHtml(sanitizeComment(titleText))}`;
    
    const headerActions = document.createElement("div");
    headerActions.style.display = "flex";
    headerActions.style.gap = "5px";

    const viewFullBtn = document.createElement("button");
    viewFullBtn.className = "ai-header-btn view-full";
    viewFullBtn.innerHTML = "↗ Sidebar";
    viewFullBtn.title = "Open in Sidebar";
    viewFullBtn.onclick = async (e) => {
        e.stopPropagation();
        await openCommentsPanelToAlias(commentData.author);
        setTimeout(() => {
            const el = document.querySelector(`.comment-content[data-cid="${commentId}"]`);
            if(el) el.scrollIntoView({behavior:"smooth", block:"center"});
        }, 500);
    };

    headerActions.appendChild(viewFullBtn);
    headerDiv.appendChild(titleSpan);
    headerDiv.appendChild(headerActions);
    threadWrapper.appendChild(headerDiv);

    // --- Main Timeline Container ---
    const threadContainer = document.createElement("div");
    threadContainer.className = "ai-thread-timeline root-timeline";
    
    // Determine start index (if this is a nested view of a fork, we technically have all history,
    // but the recursive renderer below handles the slicing. For the root, start at 0.)
    const startIdx = 0;
    
    renderThreadSequence(threadContainer, commentData.dayuh.conversation, commentData, commentId, startIdx, true);

    threadWrapper.appendChild(threadContainer);
    parentElement.appendChild(threadWrapper);
}

/**
 * B"H - Renders a sequence of messages.
 * @param {HTMLElement} container - DOM element to append to
 * @param {Array} history - The full conversation history array
 * @param {Object} commentData - The comment object
 * @param {String} commentId - ID of the comment
 * @param {Number} startIndex - Where to start rendering in the history array (used for forks)
 * @param {Boolean} isInteractive - If true, adds the terminal at the end (only for owner/latest)
 */
function renderThreadSequence(container, history, commentData, commentId, startIndex = 0, isInteractive = false) {
    if (!history) return;

    for (let i = startIndex; i < history.length; i++) {
        const msg = history[i];
        const block = createMessageNode(msg, i, history, commentData, commentId);
        container.appendChild(block);
    }

    // Only the owner of the comment can continue the main linear conversation
    // And only if we are rendering the "live" end of the thread (not a past slice)
    const isOwner = window.curAlias && window.curAlias === commentData.author;
    if (isInteractive && isOwner) {
        renderInlineTerminal(container, history, commentId, commentData);
    }
}

/**
 * B"H - Creates a single message node with capabilities for nesting children.
 */
function createMessageNode(msg, index, fullHistory, commentData, commentId) {
    const block = document.createElement("div");
    block.className = `ai-thread-block ${msg.role === 'model' ? 'model' : 'user'}`;
    block.dataset.msgIndex = index;
    block.id = `msg-${commentId}-${index}`;

    // 1. Controls Header (Sticky)
    const controlsHeader = document.createElement("div");
    controlsHeader.className = "ai-msg-controls";
    
    const roleLabel = document.createElement("span");
    roleLabel.className = "ai-role-label";
    roleLabel.innerText = msg.role === 'user' ? 'USER' : 'AI';
    
    const branchBtn = document.createElement("button");
    branchBtn.className = "ai-msg-branch";
    branchBtn.innerHTML = "↳ Reply Here";
    branchBtn.title = "Start a sub-thread from this point";
    
    const toggleSelfBtn = document.createElement("button");
    toggleSelfBtn.className = "ai-msg-toggle";
    toggleSelfBtn.innerText = "-"; 
    toggleSelfBtn.title = "Collapse content";

    controlsHeader.appendChild(roleLabel);
    if (window.curAlias) controlsHeader.appendChild(branchBtn);
    controlsHeader.appendChild(toggleSelfBtn);
    
    block.appendChild(controlsHeader);

    // 2. Content Body
    const content = document.createElement("div");
    content.className = "ai-block-content";
    content.innerHTML = msg.role === "user" 
        ? msg.text.replace(/\n/g, "<br>") 
        : markdownToHtml(msg.text);
    
    block.appendChild(content);

    // 3. Branches Container (The "Nest")
    // Hidden by default until populated
    const branchContainer = document.createElement("div");
    branchContainer.className = "ai-branch-container";
    block.appendChild(branchContainer);

    // --- Actions ---

    toggleSelfBtn.onclick = (e) => {
        e.stopPropagation();
        content.classList.toggle("collapsed");
        toggleSelfBtn.innerText = content.classList.contains("collapsed") ? "+" : "-";
    };

    branchBtn.onclick = (e) => {
        e.stopPropagation();
        // Toggle input box visibility in the branch container
        toggleBranchInput(branchContainer, index, fullHistory, commentData.author, commentData, commentId);
    };

    return block;
}

/**
 * B"H - Opens an input box NESTED inside the message's branch container.
 * When submitted, it renders the new thread inside this container.
 */
function toggleBranchInput(container, index, historySnapshot, originalAuthor, parentCommentData, parentCommentId) {
    // Check if input already exists
    let existingInput = container.querySelector(":scope > .ai-branch-input-area");
    if (existingInput) {
        existingInput.remove(); // Toggle off
        return;
    }

    const branchArea = document.createElement("div");
    branchArea.className = "ai-branch-input-area";
    
    const input = document.createElement("textarea");
    input.placeholder = `Reply to this point in the conversation...`;
    
    const actionsRow = document.createElement("div");
    actionsRow.style.display = "flex";
    actionsRow.style.gap = "10px";
    
    const goBtn = document.createElement("button");
    goBtn.innerText = "FORK REALITY";
    goBtn.className = "fork-btn";

    const cancelBtn = document.createElement("button");
    cancelBtn.innerText = "Cancel";
    cancelBtn.className = "cancel-btn";
    cancelBtn.onclick = () => branchArea.remove();

    actionsRow.appendChild(goBtn);
    actionsRow.appendChild(cancelBtn);

    goBtn.onclick = async () => {
        const text = input.value.trim();
        if (!text) return;
        
        goBtn.innerText = "Forking...";
        goBtn.disabled = true;

        // Create new history context: Slice up to this message + new user msg
        const newHistory = historySnapshot.slice(0, index + 1);
        newHistory.push({ role: "user", text: text });

        try {
            // Generate AI Response
            const contextPrompt = newHistory.map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.text}`).join("\n");
            const prompt = `B"H\nContext:\n${contextPrompt}\n\nAI:`;
            
            const aiResponse = await window.awtsmoosAi({ prompt }); 
            newHistory.push({ role: "model", text: aiResponse });

            // Prepare Payload
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
                // Success!
                branchArea.remove(); // Remove input
                
                const newId = json.details?.id;
                const newCommentData = {
                    id: newId,
                    author: window.curAlias,
                    content: newCommentPayload.content,
                    dayuh: JSON.parse(newCommentPayload.dayuh)
                };

                // B"H - Render the new thread NESTED right here immediately
                renderNestedThread(container, newCommentData, newId);

                // Notify global state
                if (window.commentLogic?.handleNewComment) {
                    await window.commentLogic.handleNewComment({
                        aliasId: window.curAlias,
                        verseSection: verseSection,
                        commentId: newId,
                        newCommentData: newCommentData
                    });
                }
            } else {
                alert("Failed to branch.");
                goBtn.disabled = false;
            }

        } catch (e) {
            console.error(e);
            alert("Error contacting AI.");
            goBtn.disabled = false;
        } 
    };

    branchArea.appendChild(input);
    branchArea.appendChild(actionsRow);
    
    // Insert at top of branch container (most recent reply first?) 
    container.insertBefore(branchArea, container.firstChild);
    input.focus();
}

/**
 * B"H - Renders a nested thread (a comment that is a fork) inside a container.
 * This looks like a sub-tree.
 */
function renderNestedThread(container, commentData, commentId) {
    const wrapper = document.createElement("div");
    wrapper.className = "ai-nested-thread";
    wrapper.dataset.nestedId = commentId;

    // Determine where the fork started
    let startIdx = 0;
    if (commentData.dayuh.forkedFrom && typeof commentData.dayuh.forkedFrom.msgIndex === 'number') {
        // We want to render everything AFTER the fork point.
        // The forkedFrom.msgIndex is the index of the PARENT message we replied to.
        // So the new conversation has [0...msgIndex, NewUserMsg, NewAiMsg...]
        // We want to show from msgIndex + 1 onwards.
        startIdx = commentData.dayuh.forkedFrom.msgIndex + 1;
    }

    // Header for the nested thread
    const header = document.createElement("div");
    header.className = "ai-nested-header";
    header.innerHTML = `
        <span class="nested-icon">↳</span> 
        <strong>@${commentData.author}</strong> branched off here:
    `;
    
    // Collapse toggle for the entire branch
    const toggleBranch = document.createElement("button");
    toggleBranch.className = "ai-branch-toggle";
    toggleBranch.innerText = "[-]";
    
    const timelineContainer = document.createElement("div");
    timelineContainer.className = "ai-thread-timeline nested-timeline";
    
    toggleBranch.onclick = () => {
        if (timelineContainer.style.display === "none") {
            timelineContainer.style.display = "block";
            toggleBranch.innerText = "[-]";
        } else {
            timelineContainer.style.display = "none";
            toggleBranch.innerText = "[+]";
        }
    };
    
    header.appendChild(toggleBranch);
    wrapper.appendChild(header);

    // Render the messages of the new thread (starting from where it diverged)
    renderThreadSequence(timelineContainer, commentData.dayuh.conversation, commentData, commentId, startIdx, true);
    
    wrapper.appendChild(timelineContainer);
    
    // Append to container
    container.appendChild(wrapper);
}

// ... (renderInlineTerminal remains largely the same, but uses createMessageNode)
function renderInlineTerminal(container, history, commentId, fullCommentData) {
    const term = document.createElement("div");
    term.className = "ai-inline-terminal";
    
    const input = document.createElement("textarea");
    input.placeholder = "Continue transmission...";
    input.rows = 1;
    
    input.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    const sendBtn = document.createElement("button");
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
        
        // Loading Node
        const loadingBlock = document.createElement("div");
        loadingBlock.className = "ai-thread-block model loading";
        loadingBlock.innerHTML = `<div class="ai-block-content">Thinking...</div>`;
        container.insertBefore(loadingBlock, term);

        try {
            const contextPrompt = history.map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.text}`).join("\n");
            const prompt = `B"H\nContext:\n${contextPrompt}\n\nAI:`;
            
            const aiResponse = await window.awtsmoosAi({ prompt });
            
            const aiMsg = { role: "model", text: aiResponse };
            history.push(aiMsg);
            
            loadingBlock.remove();
            
            // Add AI Node
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
            loadingBlock.innerHTML = `<div class="ai-block-content error">Transmission Failed</div>`;
        }
    };

    term.appendChild(input);
    term.appendChild(sendBtn);
    container.appendChild(term);
}