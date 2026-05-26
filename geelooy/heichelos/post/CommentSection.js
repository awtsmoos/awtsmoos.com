// /BH/awtsmoos.com/geelooy/heichelos/post/CommentSection.js
//B"H
import { AwtsmoosPrompt } from "/scripts/awtsmoos/api/utils.js";
import { ImageUploader } from "/heichelos/post/ImageUploader.js";
import { createWysiwygEditor } from "/heichelos/post/logic/wysiwyg.js";
import { markdownToHtml } from "/heichelos/post/parsing.js";
import { normalizeCommentCoordinate, coordinateToDayuh } from "/heichelos/post/comments/state/commentCoordinate.js";
import { emitAwtsmoosEvent } from "/heichelos/post/comments/state/eventBus.js";

function getActiveAlias() {
    const alias = window.curAlias || localStorage.getItem("lastAliasUsed") || localStorage.getItem("awtsmoos-alias") || "";
    if (alias) window.curAlias = alias;
    return alias;
}

export class CommentSection {
    imgResults = [];
    
    constructor(container, options = {}) {
        this.container = container;
        this.options = options;
        this.init();
    }

    init() {
        // Main wrapper
        this.addCommentArea = document.createElement("div");
        this.addCommentArea.classList.add("awtsmoos-comment-entry-monolith");
        this.container.appendChild(this.addCommentArea);

        // 1. Initial "Write" Button (The Trigger)
        this.createInitialButton();

        // 2. The Editor (Hidden initially)
        this.createEditorInterface();

        // 3. Image Upload Logic
        this.createImageUploadControls();
        this.createGalleryContainer();

        // 4. Action Buttons (Submit/Cancel)
        this.createButtons();

        // B"H - Auto Reveal if requested (for Inline threads)
        if (this.options.autoReveal && window.curAlias) {
            this.revealEditor();
        }
    }

    createInitialButton() {
        this.btn = document.createElement("button");
        this.btn.classList.add("btn", "awtsmoos-add-comment-btn");
        this.btn.innerHTML = "<span>✍️ Transcribe your Insight...</span>";
        this.btn.onclick = async () => {
            if (!getActiveAlias()) {
                await AwtsmoosPrompt.go({
                    isAlert: true,
                    headerTxt: "Choose an Alias",
                    bodyTxt: "Pick an alias from the top selector first, then your insight can be posted."
                });
                return;
            }
            this.revealEditor();
        };
        this.addCommentArea.appendChild(this.btn);
    }

    createEditorInterface() {
        // Ensure factory exists before calling
        if (typeof createWysiwygEditor !== 'function') {
            console.error("B\"H - WYSIWYG Factory missing!");
            this.commentBox = document.createElement("div"); // Fallback
            this.editorWrapper = document.createElement("div");
            this.editorWrapper.appendChild(this.commentBox);
        } else {
            const { editorWrapper, contentArea, sourceArea } = createWysiwygEditor();
            this.editorWrapper = editorWrapper;
            this.commentBox = contentArea;
            this.sourceArea = sourceArea; // Keep ref to source for syncing
        }
        
        this.commentBox.dataset.placeholder = "Channel the Infinite...";
        
        // Hide initially
        this.editorWrapper.style.display = "none";
        
        // Input listener to enable submit button
        this.commentBox.oninput = () => {
            const hasText = this.commentBox.innerText.trim().length > 0;
            const hasImages = this.imgResults.length > 0;
            this.submitBtn.disabled = !(hasText || hasImages);
        };

        this.addCommentArea.appendChild(this.editorWrapper);

        // B"H - ADD AI BAR AT THE BOTTOM OF THE EDITOR
        this.aiDraftBar = document.createElement("div");
        this.aiDraftBar.className = "ai-draft-bar";
        this.aiDraftBar.innerHTML = `
            <div class="ai-label">Awtsmoos AI Assistant</div>
            <button class="btn-ai-draft">✨ Draft Insight</button>
        `;
        this.aiDraftBar.querySelector("button").onclick = () => this.openAiDraftModal();
        
        // Append inside wrapper, at the end (below text area)
        this.editorWrapper.appendChild(this.aiDraftBar);
    }

    async openAiDraftModal() {
        const userIntent = prompt("Describe what you want to say:");
        if (!userIntent) return;

        // Visual feedback
        this.commentBox.innerHTML = "<p><i>AI is weaving letters...</i></p>";
        
        // Context Gathering
        const s = new URLSearchParams(location.search);
        const idx = s.get("idx");
        let contextText = "";
        if (idx !== null && window.sectionDayuh && window.sectionDayuh[idx]) {
            let sec = window.sectionDayuh[idx];
            contextText = Array.isArray(sec) ? sec.flat(Infinity).join("\n") : sec;
        } else {
            contextText = document.getElementById("realPost")?.innerText.substring(0, 1000) || "";
        }
        
        const strip = (html) => {
            let tmp = document.createElement("DIV");
            tmp.innerHTML = html;
            return tmp.textContent || tmp.innerText || "";
        };
        contextText = strip(contextText);

        const promptText = `B"H\nUser intent: "${userIntent}"\nContext: "${contextText.substring(0, 500)}..."\nDraft a short, relevant comment in Markdown format.`;

        try {
            const draftMarkdown = await window.awtsmoosAi({ prompt: promptText });
            
            // B"H - PARSE MARKDOWN TO HTML
            const draftHtml = markdownToHtml(draftMarkdown);
            
            this.commentBox.innerHTML = draftHtml; 
            
            // Sync source view if it exists
            if(this.sourceArea) this.sourceArea.value = draftHtml;
            
            this.submitBtn.disabled = false;
        } catch (e) {
            alert("AI Error: " + e.message);
            this.commentBox.innerHTML = "";
        }
    }

    revealEditor() {
        this.btn.style.display = "none";
        this.editorWrapper.style.display = "flex"; 
        this.buttonContainer.classList.add("revealed");
        this.commentBox.focus();
    }

    createImageUploadControls() {
        this.imageUploader = new ImageUploader(this.createGalleryContainer());
        
        const trigger = document.createElement("div");
        trigger.className = "awtsmoos-media-trigger";
        trigger.innerHTML = `<span>📷 Add Sacred Imagery</span>`;
        
        trigger.onclick = async () => {
            const res = await this.imageUploader.uploadImages();
            this.imgResults = res;
            this.updateGallery();
            this.submitBtn.disabled = false;
        };
        
        this.addCommentArea.appendChild(trigger);
    }

    createGalleryContainer() {
        if(this.galleryContainer) return this.galleryContainer;
        this.galleryContainer = document.createElement("div");
        this.galleryContainer.className = "awtsmoos-comment-gallery-grid";
        this.galleryContainer.style.display = "none";
        this.addCommentArea.appendChild(this.galleryContainer);
        return this.galleryContainer;
    }

    updateGallery() {
        this.galleryContainer.innerHTML = "";
        this.imgResults.forEach(r => {
            if(r?.success) {
                const img = document.createElement("img");
                img.src = r.data?.thumb?.url;
                img.className = "awtsmoos-creation-thumbnail";
                this.galleryContainer.appendChild(img);
            }
        });
        this.galleryContainer.style.display = this.imgResults.length > 0 ? "flex" : "none";
    }

    createButtons() {
        this.buttonContainer = document.createElement("div");
        this.buttonContainer.className = "awtsmoos-comment-actions-bar";
        this.addCommentArea.appendChild(this.buttonContainer);

        const cancelBtn = document.createElement("button");
        cancelBtn.className = "btn awtsmoos-action-cancel";
        cancelBtn.innerText = "Cancel";
        cancelBtn.onclick = () => this.resetForm();

        this.submitBtn = document.createElement("button");
        this.submitBtn.className = "btn awtsmoos-action-submit";
        this.submitBtn.innerHTML = "<span>Transmit</span>";
        this.submitBtn.disabled = true;
        this.submitBtn.onclick = this.submitComment.bind(this);

        this.buttonContainer.append(cancelBtn, this.submitBtn);
    }

    resetForm() {
        this.commentBox.innerHTML = ""; 
        if(this.sourceArea) this.sourceArea.value = "";
        
        this.imgResults = [];
        this.updateGallery();
        
        this.editorWrapper.style.display = "none";
        this.buttonContainer.classList.remove("revealed");
        this.btn.style.display = "flex"; 
        this.submitBtn.disabled = true;
    }

    async submitComment() {
        // B"H - Ensure we grab from whichever view is active/latest
        let content = this.commentBox.innerHTML; 
        if (this.sourceArea && this.sourceArea.style.display !== 'none') {
            content = this.sourceArea.value;
        }
        
        const plainText = this.commentBox.innerText.trim();
        
        const images = this.imgResults.map(q => q?.success ? { medium: q.data.medium?.url, thumbnail: q.data.thumb?.url, img: q.data.url } : null).filter(Boolean);
        
        // Strip HTML to check meaningful content
        const stripped = content.replace(/<[^>]*>?/gm, '').trim();
        
        if (!stripped && images.length === 0 && !content.includes('img')) return;

        this.submitBtn.innerText = "...Transmitting...";
        this.submitBtn.disabled = true;

        try {
            const activeAlias = getActiveAlias();
            if (!activeAlias) throw new Error("Choose an alias before transmitting.");

            const sParams = new URLSearchParams(location.search);
            const idx = sParams.get("idx");
            const sub = sParams.get("sub");
            
            const coordinate = normalizeCommentCoordinate({
                heichelId: window.post?.heichel?.id,
                seriesId: window?.post?.parentSeriesId,
                postId: window.post?.id,
                parentType: "post",
                parentId: window.post?.id,
                idx,
                sub
            });
            const verseSection = coordinate.verseSection;

            let dayuhObject = coordinateToDayuh(coordinate, { images });
            
            const response = await fetch(`/api/social/heichelos/${window.post?.heichel?.id}/post/${window.post?.id}/comments/`, {
                method: "POST",
                body: new URLSearchParams({
                    aliasId: activeAlias,
                    content: content, 
                    seriesId: window?.post?.parentSeriesId,
                    dayuh: JSON.stringify(dayuhObject),
                }),
            });

            const json = await response.json();
            if (!json.success) throw new Error(json.error || "Void response.");

            let newId = json.details?.id || json.success?.id || json.id;

            if (newId) {
                const newCommentData = { id: newId, author: activeAlias, content, dayuh: dayuhObject };
                const payload = {
                    aliasId: activeAlias,
                    verseSection,
                    commentId: newId,
                    newCommentData,
                    coordinate
                };

                emitAwtsmoosEvent("comment:submitted", {
                    aliasId: activeAlias,
                    commentId: newId,
                    coordinate,
                    content
                });

                if (window.commentLogic?.handleNewComment) {
                    await window.commentLogic.handleNewComment(payload);
                } else if (window.awtsmoosConductor?.handleNewComment) {
                    await window.awtsmoosConductor.handleNewComment(payload);
                }

                const inline = await import("/heichelos/post/comments/logic/inlineManifest.js");
                await inline.manifestAliasInline(activeAlias);
            }
            this.resetForm();

        } catch (e) {
            console.error("B\"H - Transmission failed:", e);
            await AwtsmoosPrompt.go({ isAlert: true, headerTxt: "Error", bodyTxt: e.message });
        } finally {
            this.submitBtn.innerText = "Transmit";
            this.submitBtn.disabled = false;
        }
    }
}
