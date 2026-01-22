// /BH/awtsmoos.com/geelooy/heichelos/post/CommentSection.js
//B"H
import { AwtsmoosPrompt } from "/scripts/awtsmoos/api/utils.js";
import { ImageUploader } from "./ImageUploader.js";

export class CommentSection {
    imgResults = [];
    constructor(container) {
        this.container = container;
        this.init();
    }

    init() {
        this.addCommentArea = document.createElement("div");
        this.addCommentArea.classList.add("awtsmoos-comment-entry-monolith");
        this.container.appendChild(this.addCommentArea);
        this.createInitialButton();
        this.createCommentBox();
        this.createImageUploadControls();
        this.createGalleryContainer();
        this.createButtons();
    }

    createInitialButton() {
        this.btn = document.createElement("button");
        this.btn.classList.add("btn", "awtsmoos-add-comment-btn");
        this.btn.innerHTML = "<span>✍️ Transcribe your Insight...</span>";
        this.btn.onclick = async () => {
            if (!window.curAlias) {
                await AwtsmoosPrompt.go({ isAlert: true, headerTxt: "Authentication Required", bodyTxt: "You must choose an Alias to contribute." });
                return;
            }
            this.btn.style.display = "none";
            this.commentBox.style.display = "block";
            this.commentBox.focus();
            this.buttonContainer.classList.add("revealed");
        };
        this.addCommentArea.appendChild(this.btn);
    }

    createCommentBox() {
        this.commentBox = document.createElement("div");
        this.commentBox.className = "awtsmoos-writing-surface";
        this.commentBox.contentEditable = true;
        this.commentBox.dataset.placeholder = "Channel the Infinite...";
        this.commentBox.style.display = "none";
        this.commentBox.oninput = () => {
            this.submitBtn.disabled = !this.commentBox.innerText.trim() && this.imgResults.length === 0;
        };
        this.addCommentArea.appendChild(this.commentBox);
    }

    createImageUploadControls() {
        this.imageUploader = new ImageUploader(this.createGalleryContainer());
        const trigger = document.createElement("div");
        trigger.className = "awtsmoos-media-trigger";
        trigger.innerHTML = `<span>📷 Add Sacred Imagery</span>`;
        trigger.onclick = async () => {
            const res = await this.imageUploader.uploadImages();
            this.imgResults = res;
            this.galleryContainer.innerHTML = "";
            res.forEach(r => {
                if(r?.success) {
                    const img = document.createElement("img");
                    img.src = r.data?.thumb?.url;
                    img.className = "awtsmoos-creation-thumbnail";
                    this.galleryContainer.appendChild(img);
                }
            });
            this.galleryContainer.style.display = res.length > 0 ? "flex" : "none";
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
        this.commentBox.innerText = "";
        this.imgResults = [];
        this.galleryContainer.innerHTML = "";
        this.galleryContainer.style.display = "none";
        this.commentBox.style.display = "none";
        this.buttonContainer.classList.remove("revealed");
        this.btn.style.display = "flex";
        this.submitBtn.disabled = true;
    }

    async submitComment() {
        const content = this.commentBox.innerText.trim();
        const images = this.imgResults.map(q => q?.success ? { medium: q.data.medium?.url, thumbnail: q.data.thumb?.url, img: q.data.url } : null).filter(Boolean);
        if (!content && images.length === 0) return;

        this.submitBtn.innerText = "...Transmitting...";
        this.submitBtn.disabled = true;

        try {
            const sParams = new URLSearchParams(location.search);
            const idx = sParams.get("idx");
            const sub = sParams.get("sub");
            const verseSection = idx !== null ? parseInt(idx) : "root";

            let dayuhObject = { images };
            if (idx !== null) dayuhObject.verseSection = verseSection;
            if (sub !== null && sub !== "null") dayuhObject.subSection = parseInt(sub);
            
            const response = await fetch(`/api/social/heichelos/${window.post?.heichel?.id}/post/${window.post?.id}/comments/`, {
                method: "POST",
                body: new URLSearchParams({
                    aliasId: window.curAlias,
                    content: content,
                    seriesId: window?.post?.parentSeriesId,
                    dayuh: JSON.stringify(dayuhObject),
                }),
            });

            const json = await response.json();
            if (!json.success) throw new Error(json.error || "Void response.");

            // B"H - SAFE ID SCANNER (Same as actions.js)
            let newId = null;
            if (json.details?.id) newId = json.details.id;
            else if (json.success?.id) newId = json.success.id;
            else if (json.id) newId = json.id;

            if (newId && window.awtsmoosConductor?.handleNewComment) {
                const newCommentData = { id: newId, author: window.curAlias, content, dayuh: dayuhObject };
                await window.awtsmoosConductor.handleNewComment({
                    aliasId: window.curAlias,
                    verseSection: verseSection,
                    commentId: newId,
                    newCommentData: newCommentData
                });
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