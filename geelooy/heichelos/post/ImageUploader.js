//B"H
import { injectImageUploaderCSS } from "./styles/imageUploaderStyles.js";

class ImageUploader {
    results = [];
    constructor(galleryContainer) {
        this.galleryContainer = galleryContainer;
        this.galleryContainer.style.display = "none";
        this.injectCSS();
    }

    uploadImages() {
        return new Promise((resolve) => {
            const self = this;
            const popup = document.createElement("div");
            popup.classList.add("image-upload-popup");

            // Close button
            const closeButton = document.createElement("div");
            closeButton.classList.add("btn");
            closeButton.innerText = "x";
            popup.appendChild(closeButton);
            closeButton.onclick = () => popup.remove();

            // Dropzone
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

            // API Key input
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

            // Progress bars
            const overallProgress = document.createElement("div");
            overallProgress.classList.add("progress-bar");
            const individualProgress = document.createElement("div");
            individualProgress.classList.add("radial-loader");
            popup.appendChild(overallProgress);
            popup.appendChild(individualProgress);

            // Gallery
            const gallery = document.createElement("div");
            gallery.classList.add("gallery");
            popup.appendChild(gallery);

            // Upload button
            const uploadBtn = document.createElement("button");
            uploadBtn.innerText = "Upload Images";
            popup.appendChild(uploadBtn);

            // Done button
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

                for (const [index, file] of Array.from(files).entries()) {
                    const formData = new FormData();
                    formData.append("image", file);

                    individualProgress.classList.add("loading");

                    const response = await fetch(
                        `https://api.imgbb.com/1/upload?key=${apiKeyInput.value}`,
                        { method: "POST", body: formData }
                    );

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

                        thumbnail.onclick = () => {
                            const fullPopup = document.createElement("div");
                            fullPopup.classList.add("full-popup");
                            const fullImage = document.createElement("img");
                            fullImage.src = result.data.url;
                            fullPopup.appendChild(fullImage);

                            const closeFullPopup = document.createElement("div");
                            closeFullPopup.classList.add("close-btn");
                            closeFullPopup.innerText = "x";
                            closeFullPopup.onclick = () => fullPopup.remove();
                            fullPopup.appendChild(closeFullPopup);

                            document.body.appendChild(fullPopup);
                        };

                        gallery.appendChild(thumbnail);
                        self.results.push(result);
                    }
                    completed++;
                    const overallPercentage = (completed / files.length) * 100;
                    overallProgress.style.width = `${overallPercentage}%`;
                }
                doneBtn.style.display = "block";
            };

            doneBtn.onclick = () => {
                resolve(self.results);
                popup.remove();
            };
        });
    }

    injectCSS() {
        injectImageUploaderCSS();
    }
}

export { ImageUploader };
