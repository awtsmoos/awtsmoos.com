//B"H
/**
 * Image Uploader Component.
 * Purged of obsolete JS-based CSS injectors.
 */
class ImageUploader {
    results = [];
    constructor(galleryContainer) {
        this.galleryContainer = galleryContainer;
        this.galleryContainer.style.display = "none";
    }

    uploadImages() {
        return new Promise((resolve) => {
            const self = this;
            const popup = document.createElement("div");
            popup.classList.add("image-upload-popup");

            const closeButton = document.createElement("div");
            closeButton.classList.add("btn");
            closeButton.innerText = "x";
            popup.appendChild(closeButton);
            closeButton.onclick = () => popup.remove();

            const dropzone = document.createElement("div");
            dropzone.classList.add("dropzone");
            dropzone.innerText = "Drop your pictures here or click to select.";
            popup.appendChild(dropzone);

            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = "image/*";
            fileInput.multiple = true;
            dropzone.appendChild(fileInput);

            dropzone.addEventListener("click", () => fileInput.click());
            dropzone.addEventListener("dragover", (e) => {
                e.preventDefault();
                dropzone.classList.add("drag-over");
            });
            dropzone.addEventListener("dragleave", () => dropzone.classList.remove("drag-over"));
            dropzone.addEventListener("drop", (e) => {
                e.preventDefault();
                dropzone.classList.remove("drag-over");
                fileInput.files = e.dataTransfer.files;
            });

            const apiKeyInput = document.createElement("input");
            apiKeyInput.type = "text";
            apiKeyInput.placeholder = "Enter your ImgBB API key";
            popup.appendChild(apiKeyInput);

            const savedApiKey = localStorage.getItem("imgbb-api-key");
            if (savedApiKey) {
                apiKeyInput.value = savedApiKey;
            }

            apiKeyInput.oninput = apiKeyInput.onchange = () => {
                localStorage.setItem("imgbb-api-key", apiKeyInput.value);
            };

            const overallProgress = document.createElement("div");
            overallProgress.classList.add("progress-bar");
            const individualProgress = document.createElement("div");
            individualProgress.classList.add("radial-loader");
            popup.appendChild(overallProgress);
            popup.appendChild(individualProgress);

            const gallery = document.createElement("div");
            gallery.classList.add("gallery");
            popup.appendChild(gallery);

            const uploadBtn = document.createElement("button");
            uploadBtn.innerText = "Upload Images";
            popup.appendChild(uploadBtn);

            const doneBtn = document.createElement("button");
            doneBtn.innerText = "Done";
            doneBtn.style.display = "none";
            popup.appendChild(doneBtn);

            document.body.appendChild(popup);

            uploadBtn.onclick = async () => {
                if (!apiKeyInput.value) {
                    alert("Please enter an API key");
                    return;
                }
                const files = fileInput.files;
                if (!files.length) {
                    alert("Please select images to upload");
                    return;
                }
                overallProgress.style.width = "0%";
                let completed = 0;
                for (const file of Array.from(files)) {
                    const formData = new FormData();
                    formData.append("image", file);
                    individualProgress.classList.add("loading");
                    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKeyInput.value}`, { method: "POST", body: formData });
                    const result = await response.json();
                    individualProgress.classList.remove("loading");
                    if (result.data) {
                        const thumbnail = document.createElement("div");
                        thumbnail.classList.add("thumbnail");
                        thumbnail.style.backgroundImage = `url(${result.data.thumb.url})`;
                        thumbnail.title = file.name;
                        const removeBtn = document.createElement("div");
                        removeBtn.classList.add("remove-btn");
                        removeBtn.innerText = "x";
                        thumbnail.appendChild(removeBtn);
                        removeBtn.onclick = () => {
                            gallery.removeChild(thumbnail);
                            self.results = self.results.filter((r) => r.data.id !== result.data.id);
                        };
                        gallery.appendChild(thumbnail);
                        self.results.push(result);
                    }
                    completed++;
                    overallProgress.style.width = `${(completed / files.length) * 100}%`;
                }
                doneBtn.style.display = "block";
            };

            doneBtn.onclick = () => {
                resolve(self.results);
                popup.remove();
            };
        });
    }
}
export { ImageUploader };