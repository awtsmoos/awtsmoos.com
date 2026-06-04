// B"H
/**
 * @module CommentMedia
 * @description
 * Chapter 208: The image gate is a named vessel.
 * The parent CommentSection can now hide it until the altar is opened, while
 * uploaded images still become purified payload sparks in dayuh.images.
 */

import { ImageUploader } from "/heichelos/post/ImageUploader.js";

/** @param {object} owner CommentSection instance. */
export function createImageUploadControls(owner) {
    owner.imageUploader = new ImageUploader(createGalleryContainer(owner));
    owner.mediaTrigger = document.createElement("div");
    owner.mediaTrigger.className = "awtsmoos-media-trigger";
    const span = document.createElement("span");
    span.textContent = "📷 Add Sacred Imagery";
    owner.mediaTrigger.appendChild(span);
    owner.mediaTrigger.onclick = async () => {
        owner.imgResults = await owner.imageUploader.uploadImages();
        updateGallery(owner);
        owner.syncSubmitState();
    };
    owner.addCommentArea.appendChild(owner.mediaTrigger);
}

/** @param {object} owner CommentSection instance. */
export function createGalleryContainer(owner) {
    if (owner.galleryContainer) return owner.galleryContainer;
    owner.galleryContainer = document.createElement("div");
    owner.galleryContainer.className = "awtsmoos-comment-gallery-grid";
    owner.galleryContainer.hidden = true;
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
    owner.galleryContainer.hidden = owner.imgResults.length === 0;
}

/** @param {Array<object>} results @returns {Array<object>} */
export function imagePayload(results) {
    return results.map(q => q?.success ? {
        medium: q.data.medium?.url,
        thumbnail: q.data.thumb?.url,
        img: q.data.url
    } : null).filter(Boolean);
}
