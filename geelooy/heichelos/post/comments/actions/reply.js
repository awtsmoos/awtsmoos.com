// /BH/awtsmoos.com/geelooy/heichelos/post/comments/actions/reply.js
//B"H
import { AwtsmoosPrompt } from "/scripts/awtsmoos/api/utils.js";
import { createWysiwygEditor } from "../../logic/wysiwyg.js";

export function handleReply(originalComment, containerElement) {
    if (!window.curAlias) {
        return AwtsmoosPrompt.go({ isAlert: true, headerTxt: "Login Required", bodyTxt: "Please sign in to reply." });
    }

    if (containerElement.querySelector('.awtsmoos-reply-box')) return;

    const replyContainer = document.createElement("div");
    replyContainer.className = "awtsmoos-reply-box";
    
    const snippet = originalComment.content ? originalComment.content.substring(0, 50).replace(/\n/g, ' ') : "Media content";
    
    // Header
    const header = document.createElement("div");
    header.className = "reply-header";
    header.innerHTML = `
        <span>Replying to @${originalComment.author}</span>
        <button class="close-reply">×</button>
    `;
    replyContainer.appendChild(header);

    // WYSIWYG Editor
    const { editorWrapper, contentArea } = createWysiwygEditor();
    contentArea.dataset.placeholder = "Transmit your response...";
    replyContainer.appendChild(editorWrapper);

    // Submit Button
    const submitBtn = document.createElement("button");
    submitBtn.className = "reply-submit";
    submitBtn.innerText = "TRANSMIT REPLY";
    replyContainer.appendChild(submitBtn);

    const closeBtn = header.querySelector('.close-reply');
    closeBtn.onclick = () => replyContainer.remove();

    submitBtn.onclick = async () => {
        const text = contentArea.innerText.trim(); // Get text content
        const html = contentArea.innerHTML; // Get HTML content
        
        // Basic validation (check if empty)
        if (!text && !contentArea.querySelector('img')) return;

        submitBtn.disabled = true;
        submitBtn.innerText = "Transmitting...";

        // Construct the quote block manually for Markdown/HTML mixing
        const replyContent = `> [Reply to @${originalComment.author}](#comment-${originalComment.id}): ${snippet}...\n\n${html}`;
        
        const verseSection = originalComment.dayuh?.verseSection ?? "root";
        const subSection = originalComment.dayuh?.subSection;

        const dayuh = {
            verseSection,
            replyToId: originalComment.id 
        };
        if(subSection !== undefined && subSection !== null) dayuh.subSection = subSection;

        try {
            const endpoint = `/api/social/heichelos/${window.post.heichel.id}/post/${window.post.id}/comments/`;
            
            const response = await fetch(endpoint, {
                method: "POST",
                body: new URLSearchParams({
                    aliasId: window.curAlias,
                    seriesId: window.post.parentSeriesId,
                    content: replyContent,
                    dayuh: JSON.stringify(dayuh)
                })
            });

            const res = await response.json();

            if (res && (res.success || res.status === "success" || res.ok)) {
                replyContainer.remove();
                
                let newId = res.details?.id || res.success?.id || res.id || res.postId || res.commentId;

                if (!newId && window.reloadRoot) window.reloadRoot();

                if (newId && window.awtsmoosConductor && window.awtsmoosConductor.handleNewComment) {
                    await window.awtsmoosConductor.handleNewComment({
                        aliasId: window.curAlias,
                        verseSection: verseSection,
                        commentId: newId,
                        newCommentData: { 
                            id: newId, 
                            author: window.curAlias, 
                            content: replyContent, 
                            dayuh 
                        }
                    });
                }
            } else {
                const errMsg = res?.error?.message || res?.error || "Unknown Server Error";
                alert("Failed: " + errMsg);
                submitBtn.disabled = false;
                submitBtn.innerText = "TRANSMIT REPLY";
            }
        } catch (e) {
            console.error("B\"H - Reply Error:", e);
            alert("Network error.");
            submitBtn.disabled = false;
            submitBtn.innerText = "TRANSMIT REPLY";
        }
    };

    containerElement.appendChild(replyContainer);
    
    // Focus the editor
    setTimeout(() => contentArea.focus(), 100);
}
