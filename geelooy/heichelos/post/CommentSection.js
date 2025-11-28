//B"H
import {
    AwtsmoosPrompt
} from "/scripts/awtsmoos/api/utils.js";
 
import { ImageUploader } from "./ImageUploader.js";

class CommentSection {
    imgResults = [];
    constructor(container) {
        this.container = container;
        this.init();
        window.commentSection = this;
    }

    init() {
        this.addCommentArea = document.createElement("div");
        this.addCommentArea.classList.add("add-comment-area");
        this.container.appendChild(this.addCommentArea);

        this.createInitialButton();
        this.createCommentBox();
        this.createImageUploadIcon();
        this.createGalleryContainer();
        this.createButtons();
        this.injectCSS();
    }

    createInitialButton() {
        this.btn = document.createElement("div");
        this.btn.classList.add("btn", "add-comment");
        this.btn.innerText = "Add a comment...";
        this.btn.onclick = async () => {
            const currentAlias = window.curAlias;
            if (!currentAlias) {
                await AwtsmoosPrompt.go({
                    isAlert: true,
                    headerTxt: "You need to be logged in with an alias to comment!",
                });
                return;
            }
            const hasPermission = await (
                await fetch(`/api/social/alias/${currentAlias}/heichelos/ikar/ownership`)
            ).json();
            if (!hasPermission.yes) {
                await AwtsmoosPrompt.go({
                    isAlert: true,
                    headerTxt: `That alias, ${currentAlias}, doesn't have permission to post here.`,
                });
                return;
            }

            this.btn.style.display = "none";
            this.commentBox.style.display = "block";
        };
        this.addCommentArea.appendChild(this.btn);
    }

    createCommentBox() {
        this.commentBox = document.createElement("div");
        this.commentBox.classList.add("comment-box");
        this.commentBox.contentEditable = true;
        this.commentBox.placeholder = "Add a comment...";
        this.commentBox.style.display = "none";

        this.commentBox.oninput = () => {
            this.buttonContainer.style.display = "flex";
            this.submitBtn.disabled = false;
        };

        this.addCommentArea.appendChild(this.commentBox);
    }

    createImageUploadIcon() {
        this.imageUploader = new ImageUploader(this.createGalleryContainer());
        const imageUploadIcon = document.createElement("div");
        imageUploadIcon.classList.add("image-upload-icon");
        imageUploadIcon.innerText = "📷";
        imageUploadIcon.onclick = async () => {
            var res = await this.imageUploader.uploadImages();
            this.imgResults = res;
            res.forEach(r => {
                var img = document.createElement("img");
                img.src = r?.data?.thumb?.url;
                this.galleryContainer.appendChild(img)
            })
            this.galleryContainer.style.display = "";
            console.log("Results?",res);
        };
        this.addCommentArea.appendChild(imageUploadIcon);
    }

    createGalleryContainer() {
        this.galleryContainer = document.createElement("div");
        this.galleryContainer.classList.add("image-gallery");
        this.galleryContainer.style.display = "none";
        this.addCommentArea.appendChild(this.galleryContainer);
        return this.galleryContainer;
    }

    createButtons() {
        this.buttonContainer = document.createElement("div");
        this.buttonContainer.classList.add("button-container");
        this.addCommentArea.appendChild(this.buttonContainer);

        const cancelBtn = document.createElement("button");
        cancelBtn.classList.add("btn", "cancel-comment");
        cancelBtn.innerText = "Cancel";
        cancelBtn.onclick = () => {
            this.commentBox.innerText = "";
            this.galleryContainer.innerHTML = "";
            this.galleryContainer.style.display = "none";
            this.commentBox.style.display = "none";
            this.buttonContainer.style.display = "none";
            this.btn.style.display = "block";
            this.submitBtn.disabled = true;
        };

        this.submitBtn = document.createElement("button");
        this.submitBtn.classList.add("btn", "submit-comment");
        this.submitBtn.innerText = "Comment";
        this.submitBtn.disabled = true;
        this.submitBtn.onclick = this.submitComment.bind(this);

        this.buttonContainer.appendChild(cancelBtn);
        this.buttonContainer.appendChild(this.submitBtn);
    }

    // B"H
    async submitComment() {
        const content = this.commentBox.innerText.trim();
        const images = this.imgResults.map(q=>q?.success ? ({
            medium: q?.data?.medium?.url,
            thumbnail: q?.data?.thumb?.url,
            img: q?.data?.url,
            height: q?.data?.height,
            width: q?.data?.width,
            size: q.data?.size
        }) : null).filter(Boolean);

        if (!content && images.length === 0) {
            alert("Comment cannot be empty.");
            return;
        }

        this.submitBtn.innerText = "Submitting...";
        this.submitBtn.disabled = true;

        try {
            const currentAlias = window.currentAlias || window.curAlias;
            if (!currentAlias) {
                await AwtsmoosPrompt.go({ isAlert: true, headerTxt: "Current alias is not set. Please log in." });
                return;
            }

            const s = new URLSearchParams(location.search);
            const idx = s.get("idx");
            const sub = s.get("sub");
            const verseSection = idx !== null ? parseInt(idx) : "root";

            let dayuhObject = { images };
            if (idx !== null) dayuhObject.verseSection = parseInt(idx);
            if (sub !== null) dayuhObject.subSection = parseInt(sub);
            
            const response = await fetch(location.origin + `/api/social/heichelos/${window.post?.heichel?.id}/post/${window.post?.id}/comments/`, {
                method: "POST",
                body: new URLSearchParams({
                    aliasId: currentAlias,
                    content: content,
                    seriesId: window?.post?.parentSeriesId,
                    dayuh: JSON.stringify(dayuhObject),
                }),
            });

            const json = await response.json();

            
            
            // The server response contains the new comment's ID in `details.id`.
            if (json.success && json.details?.id) {
                const newCommentId = json.details.id;
		    const newCommentData = { id: newCommentId, author: currentAlias, content: content, dayuh: dayuhObject };
		
		    // Hand off ALL UI work to the conductor.
		    await window.commentLogic.handleNewComment({
		        aliasId: currentAlias,
		        verseSection: verseSection,
		        commentId: newCommentId,
		        newCommentData: newCommentData
		    });
            } else {
                const errorMessage = json.error || "An unknown error occurred on the server.";
                await AwtsmoosPrompt.go({ isAlert: true, headerTxt: "Submission failed: " + errorMessage });
            }
        } catch (e) {
            console.error(e);
            await AwtsmoosPrompt.go({ isAlert: true, headerTxt: "A network or script error occurred." });
        } finally {
            this.submitBtn.innerText = "Comment";
            this.submitBtn.disabled = false;
        }
    }



    // Dynamically inject enhanced CSS
    injectCSS() {
        var g = document.querySelector(".BH-awtsmooStylification")
        if(g) return;
        const style = document.createElement("style");
        style.classList.add("BH-awtsmooStylification");
        style.textContent = `
           
    
            
        `;
        document.head.appendChild(style);
    }

}

export { CommentSection };


