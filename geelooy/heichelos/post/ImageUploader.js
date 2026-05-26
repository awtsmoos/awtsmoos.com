//B"H
/**
 * ImageUploader manifests an upload modal and returns ImgBB upload results.
 * Visual form lives in CSS; this vessel only coordinates DOM, events, and network.
 */
class ImageUploader {
    results = [];

    constructor(galleryContainer) {
        this.galleryContainer = galleryContainer;
        this.galleryContainer.style.display = "none";
    }

    uploadImages() {
        this.results = [];

        return new Promise((resolve) => {
            const popupOverlay = document.createElement("div");
            popupOverlay.className = "awtsmoos-modal-overlay";

            const popup = document.createElement("div");
            popup.className = "image-upload-popup awtsmoos-image-upload-popup";
            popupOverlay.appendChild(popup);

            const header = document.createElement("h3");
            header.className = "awtsmoos-image-upload-title";
            header.innerText = "MANIFEST IMAGERY";
            popup.appendChild(header);

            const closeButton = document.createElement("button");
            closeButton.className = "awtsmoos-image-upload-close";
            closeButton.type = "button";
            closeButton.innerText = "×";
            popup.appendChild(closeButton);

            const apiKeyInput = document.createElement("input");
            apiKeyInput.className = "awtsmoos-image-upload-key";
            apiKeyInput.type = "password";
            apiKeyInput.placeholder = "Enter ImgBB API Key";
            popup.appendChild(apiKeyInput);

            const savedApiKey = localStorage.getItem("imgbb-api-key");
            if (savedApiKey) apiKeyInput.value = savedApiKey;
            apiKeyInput.oninput = () => localStorage.setItem("imgbb-api-key", apiKeyInput.value);

            const dropzone = document.createElement("div");
            dropzone.className = "dropzone awtsmoos-image-dropzone";
            dropzone.innerText = "DROP FILES HERE OR CLICK TO SELECT";
            popup.appendChild(dropzone);

            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = "image/*";
            fileInput.multiple = true;
            fileInput.style.display = "none";
            dropzone.appendChild(fileInput);

            const progressArea = document.createElement("div");
            progressArea.className = "awtsmoos-image-upload-progress";
            popup.appendChild(progressArea);

            const closeWithResults = () => {
                resolve(this.results);
                popupOverlay.remove();
            };

            const handleUploadError = (fileName, message) => {
                alert(`Failed to upload ${fileName}: ${message || "Unknown error"}`);
            };

            const handleFiles = async () => {
                const key = apiKeyInput.value.trim();
                if (!key) {
                    alert("API Key Required.");
                    return;
                }

                const files = Array.from(fileInput.files || []);
                if (!files.length) return;

                progressArea.innerText = `Uploading ${files.length} image${files.length === 1 ? "" : "s"}...`;

                for (let index = 0; index < files.length; index++) {
                    const file = files[index];
                    progressArea.innerText = `Uploading ${index + 1}/${files.length}: ${file.name}...`;

                    const formData = new FormData();
                    formData.append("image", file);

                    try {
                        const response = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, {
                            method: "POST",
                            body: formData
                        });
                        const json = await response.json();

                        if (json.success) {
                            this.results.push(json);
                        } else {
                            handleUploadError(file.name, json.error?.message);
                        }
                    } catch (error) {
                        handleUploadError(file.name, error.message || "Network error");
                    }
                }

                progressArea.innerText = "Upload Complete.";
                closeWithResults();
            };

            closeButton.onclick = closeWithResults;
            dropzone.onclick = () => fileInput.click();
            dropzone.ondragover = (event) => {
                event.preventDefault();
                dropzone.classList.add("drag-over");
            };
            dropzone.ondragleave = () => dropzone.classList.remove("drag-over");
            dropzone.ondrop = (event) => {
                event.preventDefault();
                dropzone.classList.remove("drag-over");
                fileInput.files = event.dataTransfer.files;
                handleFiles();
            };
            fileInput.onchange = handleFiles;

            document.body.appendChild(popupOverlay);
        });
    }
}

export { ImageUploader };
