//B"H
import { isFirstCharacterHebrew } from "/heichelos/post/functions/utils.js";

export function sanitizeComment(cnt) {
	try {
		var p = new DOMParser();
		var dc = p.parseFromString(cnt, "text/html")
		var cl = dc.querySelector(".links_in_title");
		if(!cl) return cnt;
		return dc.body.innerHTML
	} catch(e) { return cnt; }
}

export function addImageGallery(images, parent) {
	if (images && Array.isArray(images)) {
		const imageGallery = document.createElement("div");
		imageGallery.className = "image-gallery awtsmoos-card";
		images.forEach(image => {
		    const img = document.createElement("img");
		    img.src = image.medium || image.img || image;
		    img.alt = "Comment Image";
		    img.onclick = () => window.open(image.img || "", "_blank");
		    imageGallery.appendChild(img);
		});
		parent.appendChild(imageGallery);
	}
}

export function makeTitleDiv(title) {
	var commentTitle = document.createElement("div");
	commentTitle.className="commentTitle"
	commentTitle.innerHTML = title
	if(isFirstCharacterHebrew(title)) commentTitle.classList.add("heb");
	return commentTitle
}
