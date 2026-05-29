// B"H
/**
 * @module CommentMedia
 * @description
 * Chapter 5: Images enter as purified sparks. The trigger and gallery live here
 * so the main CommentSection remains a conductor, not a warehouse.
 */

import { ImageUploader } from "/heichelos/post/ImageUploader.js";

/** @param {object} owner CommentSection instance. */
export function createImageUploadControls(owner) {
    owner.imageUploader = new ImageUploader(createGalleryContainer(owner));
    const trigger = document.createElement("div");
    trigger.className = "awtsmoos-media-trigger";
    const span = document.createElement("span");
    span.textContent = "📷 Add Sacred Imagery";
    trigger.appendChild(span);
    trigger.onclick = async () => {
        owner.imgResults = await owner.imageUploader.uploadImages();
        updateGallery(owner);
        owner.syncSubmitState();
    };
    owner.addCommentArea.appendChild(trigger);
}

/** @param {object} owner CommentSection instance. */
export function createGalleryContainer(owner) {
    if (owner.galleryContainer) return owner.galleryContainer;
    owner.galleryContainer = document.createElement("div");
    owner.galleryContainer.className = "awtsmoos-comment-gallery-grid";
    owner.galleryContainer.style.display = "none";
    owner.addCommentArea.appendChild(owner.galleryContainer);
    return owner.galleryContainer;
}

/** @param {object} owner CommentSection instance. */
export function updateGallery(owner) {
    owner.galleryContainer.replaceChildren();
    owner.imgResults.forEach(result => {
        if (!result?.success) return;
        const img = document.createElement("img");
        img.src = result.data?.thumb?.url;
        img.className = "awtsmoos-creation-thumbnail";
        owner.galleryContainer.appendChild(img);
    });
    owner.galleryContainer.style.display = owner.imgResults.length > 0 ? "flex" : "none";
}

/** @param {Array<object>} results @returns {Array<object>} */
export function imagePayload(results) {
    return results.map(q => q?.success ? {
        medium: q.data.medium?.url,
        thumbnail: q.data.thumb?.url,
        img: q.data.url
    } : null).filter(Boolean);
}
