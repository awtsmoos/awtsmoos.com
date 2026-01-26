//B"H
/**
 * Image Uploader Component.
 * Flawless execution. Neo-Brutalist UI.
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
            const popupOverlay = document.createElement("div");
            popupOverlay.className = "awtsmoos-modal-overlay";
            popupOverlay.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                background: rgba(0,0,0,0.8); z-index: 20000;
                display: flex; align-items: center; justify-content: center;
                backdrop-filter: blur(5px);
            `;

            const popup = document.createElement("div");
            popup.className = "image-upload-popup";
            popup.style.cssText = `
                background: #fff; border: 4px solid #000; padding: 30px;
                box-shadow: 10px 10px 0 #2b00ff; max-width: 500px; width: 90%;
                display: flex; flex-direction: column; gap: 20px;
                font-family: 'Space Grotesk', monospace; position: relative;
            `;

            popupOverlay.appendChild(popup);

            const header = document.createElement("h3");
            header.innerText = "MANIFEST IMAGERY";
            header.style.cssText = "margin: 0; font-weight: 900; font-size: 24px; text-transform: uppercase;";
            popup.appendChild(header);

            const closeButton = document.createElement("button");
            closeButton.innerText = "×";
            closeButton.style.cssText = `
                position: absolute; top: 10px; right: 10px;
                background: transparent; border: none; font-size: 28px; font-weight: 900;
                cursor: pointer; color: #000;
            `;
            closeButton.onclick = () => popupOverlay.remove();
            popup.appendChild(closeButton);

            const apiKeyInput = document.createElement("input");
            apiKeyInput.type = "password"; // Secure visibility
            apiKeyInput.placeholder = "Enter ImgBB API Key";
            apiKeyInput.style.cssText = `
                padding: 12px; border: 2px solid #000; font-family: inherit; width: 100%;
                box-sizing: border-box; font-size: 14px;
            `;
            popup.appendChild(apiKeyInput);

            const savedApiKey = localStorage.getItem("imgbb-api-key");
            if (savedApiKey) apiKeyInput.value = savedApiKey;

            apiKeyInput.oninput = () => localStorage.setItem("imgbb-api-key", apiKeyInput.value);

            const dropzone = document.createElement("div");
            dropzone.className = "dropzone";
            dropzone.innerText = "DROP FILES HERE OR CLICK TO SELECT";
            dropzone.style.cssText = `
                border: 4px dashed #000; padding: 40px; text-align: center;
                font-weight: 800; cursor: pointer; background: #f0f0f0;
                transition: all 0.2s;
            `;
            popup.appendChild(dropzone);

            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = "image/*";
            fileInput.multiple = true;
            fileInput.style.display = "none";
            dropzone.appendChild(fileInput);

            dropzone.onclick = () => fileInput.click();
            dropzone.ondragover = (e) => { e.preventDefault(); dropzone.style.background = "#d9933d"; };
            dropzone.ondragleave = () => { dropzone.style.background = "#f0f0f0"; };
            dropzone.ondrop = (e) => {
                e.preventDefault();
                dropzone.style.background = "#f0f0f0";
                fileInput.files = e.dataTransfer.files;
                handleFiles();
            };
            fileInput.onchange = handleFiles;

            const progressArea = document.createElement("div");
            progressArea.style.cssText = "font-size: 12px; font-weight: 700; min-height: 20px;";
            popup.appendChild(progressArea);

            async function handleFiles() {
                const key = apiKeyInput.value.trim();
                if (!key) {
                    alert("API Key Required.");
                    return;
                }
                const files = Array.from(fileInput.files);
                if (!files.length) return;

                progressArea.innerText = `Uploading ${files.length} images...`;
                
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    progressArea.innerText = `Uploading ${i + 1}/${files.length}: ${file.name}...`;
                    
                    const formData = new FormData();
                    formData.append("image", file);
                    
                    try {
                        const res = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, { 
                            method: "POST", body: formData 
                        });
                        const json = await res.json();
                        
                        if (json.success) {
                            self.results.push(json);
                        } else {
                            console.error("Upload failed", json);
                            alert(`Failed to upload ${file.name}: ${json.error?.message}`);
                        }
                    } catch(e) {
                        alert(`Network error uploading ${file.name}`);
                    }
                }
                
                progressArea.innerText = "Upload Complete.";
                resolve(self.results);
                popupOverlay.remove();
            }

            document.body.appendChild(popupOverlay);
        });
    }
}
export { ImageUploader };