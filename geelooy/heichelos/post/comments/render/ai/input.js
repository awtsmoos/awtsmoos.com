
//B"H
import { createMessageNode } from "./components.js";

function parseGeminiError(e) {
    let raw = e;
    try {
        if (e.message && (e.message.startsWith('{') || e.message.startsWith('['))) {
             raw = JSON.parse(e.message);
        } else if (typeof e === 'string' && (e.startsWith('{') || e.startsWith('['))) {
             raw = JSON.parse(e);
        }
    } catch(x) {}

    // Handle array wrapper [{error: ...}]
    if (Array.isArray(raw) && raw.length > 0) raw = raw[0];
    
    // Handle { error: { ... } } structure
    const errObj = raw?.error || raw;
    
    if (errObj) {
        // Check for specific violations
        if(Array.isArray(errObj.violations)) {
            const quota = errObj.violations.find(v => v.quotaMetric && v.quotaMetric.includes("free_tier"));
            if(quota) return "Free Tier Quota Exceeded. Please try again later.";
        }

        // Extract Retry Delay
        if (Array.isArray(errObj.details)) {
            const retryInfo = errObj.details.find(d => d.retryDelay || d['@type']?.includes('RetryInfo'));
            if (retryInfo && retryInfo.retryDelay) {
                return `Quota Exceeded. Please retry in ${retryInfo.retryDelay}.`;
            }
        }
        
        if (errObj.message) return errObj.message;
    }
    
    return e.message || "Unknown error occurred.";
}

/**
 * Handles the Fork Input logic.
 * @param {HTMLElement} container - The .ai-forks-slot to append the input to.
 * @param {Object} context - { index, historySnapshot, originalAuthor, parentData, parentId }
 * @param {Object} callbacks - { renderNewThread(container, newCommentData, id) }
 */
export function toggleBranchInput(container, context, callbacks) {
    // Check if input is already open
    let existingInput = container.querySelector(":scope > .ai-branch-input-area");
    if (existingInput) {
        existingInput.remove();
        return;
    }

    const branchArea = document.createElement("div");
    branchArea.className = "ai-branch-input-area";
    
    const input = document.createElement("textarea");
    const authorName = context.originalAuthor || 'User';
    input.placeholder = `Reply / Branch from @${authorName} (Msg #${context.index + 1})...`;
    input.focus();
    
    const actionsRow = document.createElement("div");
    actionsRow.className = "ai-input-actions";
    
    const goBtn = document.createElement("button");
    goBtn.innerText = "SEND REPLY";
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
        
        // Remove input area immediately to start the visual transition
        branchArea.remove();

        // 1. Prepare optimistic data
        const newHistory = context.historySnapshot.slice(0, context.index + 1);
        
        // Add User Message with Attribution
        newHistory.push({ 
            role: "user", 
            text: text,
            name: window.curAlias || "Guest" 
        });
        
        const verseSection = context.parentData.dayuh.verseSection ?? "root";
        const subSection = context.parentData.dayuh.subSection;
        const tempId = "temp-" + Date.now();
        
        const optimisticCommentData = {
            id: tempId,
            author: window.curAlias,
            content: `Branch: "${text.substring(0,20)}..."`, 
            dayuh: {
                conversation: newHistory, // Only user msg so far for display
                verseSection: verseSection,
                subSection: subSection,
                forkedFrom: {
                    author: context.originalAuthor,
                    msgIndex: context.index,
                    commentId: context.parentId
                }
            }
        };

        // 2. Render the branch immediately (Optimistic UI)
        if (callbacks && callbacks.renderNewThread) {
            callbacks.renderNewThread(container, optimisticCommentData, tempId);
        }

        // 3. Find the newly created timeline to append "Thinking"
        // We look inside the container for the nested thread with our tempId
        const newThreadWrapper = container.querySelector(`.ai-nested-thread[data-nested-id="${tempId}"]`);
        const timeline = newThreadWrapper ? newThreadWrapper.querySelector('.ai-thread-timeline') : null;
        
        let loadingBlock = null;
        if (timeline) {
            loadingBlock = document.createElement("div");
            loadingBlock.className = "ai-thread-block model loading";
            loadingBlock.innerHTML = `<div class="ai-block-content" style="padding:10px;">Thinking...</div>`;
            timeline.appendChild(loadingBlock);
        }

        try {
            const contextPrompt = newHistory.map(m => {
                const speaker = m.role === 'model' ? 'AI' : (m.name ? `@${m.name}` : 'User');
                return `${speaker}: ${m.text}`;
            }).join("\n");
            
            const prompt = `B"H\nContext of conversation:\n${contextPrompt}\n\n(Respond to the last message as the AI)`;
            
            // 4. Call AI
            let aiResponse;
            try {
                aiResponse = await window.awtsmoosAi({ prompt });
            } catch(e) {
                // Parse specific error
                const friendlyMsg = parseGeminiError(e);
                throw new Error(friendlyMsg);
            }

            if (!aiResponse) throw new Error("AI returned empty response.");
            
            // 5. Update History
            newHistory.push({ role: "model", text: aiResponse });

            // 6. Save to Server
            const newCommentPayload = {
                aliasId: window.curAlias,
                content: `Branch: "${text.substring(0,20)}..."`, 
                seriesId: window?.post?.parentSeriesId,
                dayuh: JSON.stringify({
                    conversation: newHistory,
                    verseSection: verseSection,
                    subSection: subSection,
                    forkedFrom: {
                        author: context.originalAuthor,
                        msgIndex: context.index,
                        commentId: context.parentId
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
                const realId = json.details?.id;
                
                // 7. Finalize UI
                if(timeline) {
                    if(loadingBlock) loadingBlock.remove();
                    // Append the AI message node
                    const aiBlock = createMessageNode({ role: "model", text: aiResponse }, newHistory.length - 1, {
                        isOwner: true, // They own this new branch
                        canInteract: true,
                        // Recursion: enable forking on this new message too!
                        onFork: (forkSlot) => {
                             toggleBranchInput(forkSlot, {
                                index: newHistory.length - 1,
                                historySnapshot: newHistory,
                                originalAuthor: window.curAlias,
                                parentData: { ...optimisticCommentData, id: realId, dayuh: { ...optimisticCommentData.dayuh, conversation: newHistory } },
                                parentId: realId
                            }, callbacks);
                        }
                    });
                    timeline.appendChild(aiBlock);
                }
                
                // Update the wrapper ID to the real server ID
                if(newThreadWrapper) {
                    newThreadWrapper.dataset.nestedId = realId;
                }
                
                // Update global state
                const finalCommentData = {
                    id: realId,
                    author: window.curAlias,
                    content: newCommentPayload.content,
                    dayuh: JSON.parse(newCommentPayload.dayuh)
                };

                if (window.commentLogic?.handleNewComment) {
                    await window.commentLogic.handleNewComment({
                        aliasId: window.curAlias,
                        verseSection: verseSection,
                        commentId: realId,
                        newCommentData: finalCommentData
                    });
                }
            } else {
                throw new Error("Server Error: " + json.error);
            }
        } catch (e) {
            console.error(e);
            const errMsg = parseGeminiError(e); // Use parser here too
            if(loadingBlock) {
                loadingBlock.classList.remove("loading");
                loadingBlock.innerHTML = `<div class="ai-block-content error" style="padding:10px; color:red;">
                    <b>Error:</b> ${errMsg}
                    <br><button onclick="this.closest('.ai-thread-block').remove()" style="margin-top:5px; cursor:pointer;">Dismiss</button>
                </div>`;
            } else {
                alert(errMsg);
            }
        } 
    };

    branchArea.appendChild(input);
    branchArea.appendChild(actionsRow);
    
    container.insertBefore(branchArea, container.firstChild);
}

export function renderInlineTerminal(container, history, commentId, fullCommentData) {
    const term = document.createElement("div");
    term.className = "ai-inline-terminal";
    
    const input = document.createElement("textarea");
    input.placeholder = "Continue conversation...";
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
        
        // Lock UI
        input.disabled = true;
        sendBtn.disabled = true;
        
        const userMsg = { 
            role: "user", 
            text,
            name: window.curAlias || "User"
        };
        
        // Render user message speculatively
        const userBlock = createMessageNode(userMsg, history.length, { isOwner: true, canInteract: true });
        container.insertBefore(userBlock, term); 
        
        const loadingBlock = document.createElement("div");
        loadingBlock.className = "ai-thread-block model loading";
        loadingBlock.innerHTML = `<div class="ai-block-content" style="padding:10px;">Thinking...</div>`;
        container.insertBefore(loadingBlock, term);

        try {
            const contextPrompt = history.map(m => {
                const speaker = m.role === 'model' ? 'AI' : (m.name ? `@${m.name}` : 'User');
                return `${speaker}: ${m.text}`;
            }).join("\n");
            
            const prompt = `B"H\nContext:\n${contextPrompt}\n\n(Respond to the last message)`;
            
            // Safe AI Call
            let aiResponse;
            try {
                aiResponse = await window.awtsmoosAi({ prompt });
            } catch(e) {
                const friendlyMsg = parseGeminiError(e);
                throw new Error(friendlyMsg);
            }

            if (!aiResponse) throw new Error("Empty response from AI");
            
            // Success Logic
            history.push(userMsg);
            const aiMsg = { role: "model", text: aiResponse };
            history.push(aiMsg);
            
            loadingBlock.remove();
            
            // Fix User Block Index
            userBlock.dataset.msgIndex = history.length - 2;

            const aiBlock = createMessageNode(aiMsg, history.length - 1, { 
                isOwner: true,
                canInteract: true,
                onFork: (slot) => {
                     // Pass context for future forks
                     toggleBranchInput(slot, {
                        index: history.length - 1,
                        historySnapshot: history,
                        originalAuthor: fullCommentData.author,
                        parentData: fullCommentData,
                        parentId: commentId
                    }, {
                         renderNewThread: (s, d, i) => { 
                             import("./structure.js").then(m => m.renderNestedThread(s, d, i, true));
                         }
                    });
                }
            });
            container.insertBefore(aiBlock, term);
            
            // Clear input only on success
            input.value = "";
            input.style.height = 'auto';

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
            console.error("Terminal Error:", e);
            const errMsg = parseGeminiError(e);
            
            // Show error in place of loading
            loadingBlock.innerHTML = `<div class="ai-block-content error" style="padding:10px; color:red; border-left:4px solid red;">
                <b>Error:</b> ${errMsg}
                <br><button onclick="this.closest('.ai-thread-block').remove()" style="margin-top:5px; cursor:pointer;">Dismiss</button>
            </div>`;
            loadingBlock.classList.remove("loading");
            
            // Remove the speculative user block so they can try again
            userBlock.remove();
        } finally {
            // Unlock UI
            input.disabled = false;
            sendBtn.disabled = false;
            input.focus();
        }
    };

    term.appendChild(input);
    term.appendChild(sendBtn);
    container.appendChild(term);
}
