//B"H
let activeEditor = null;

export function setupImageUploader(editorInterface) {
    const modal = document.getElementById("imageUploadModal");
    const dropZone = document.getElementById("dropZone");
    const fileInput = document.getElementById("fileInput");
    const keyInput = document.getElementById("imgbbApiKey");
    
    // Init key
    const saved = localStorage.getItem("imgbbApiKey");
    if(saved) keyInput.value = saved;
    keyInput.onchange = () => localStorage.setItem("imgbbApiKey", keyInput.value);

    // Modal Controls
    document.getElementById("closeModalBtn").onclick = () => modal.style.display = "none";
    
    document.getElementById("uploadImageMainBtn")?.addEventListener("click", () => {
        // Need to find main editor from interface
        const main = document.getElementById("mainContentEditor");
        if(main) initImageUploadModal(main);
    });

    // Drop Zone Logic
    dropZone.ondragover = (e) => { e.preventDefault(); dropZone.classList.add("dragging"); };
    dropZone.ondragleave = () => dropZone.classList.remove("dragging");
    dropZone.ondrop = (e) => {
        e.preventDefault();
        dropZone.classList.remove("dragging");
        if(e.dataTransfer.files.length) handleUpload(e.dataTransfer.files[0]);
    };
    dropZone.onclick = () => fileInput.click();
    
    fileInput.onchange = () => {
        if(fileInput.files.length) handleUpload(fileInput.files[0]);
    };
    
    // Button Upload
    document.getElementById("uploadImageBtn").onclick = () => {
        const k = keyInput.value.trim();
        if(!k) return alert("API Key required");
        localStorage.setItem("imgbbApiKey", k);
        
        if(fileInput.files.length) handleUpload(fileInput.files[0], k);
        else alert("Select a file first");
    };
}

export function initImageUploadModal(targetEditor) {
    activeEditor = targetEditor;
    document.getElementById("imageUploadModal").style.display = "flex";
}

function handleUpload(file, key) {
    if(!activeEditor) return alert("No editor selected");
    if(!key) key = localStorage.getItem("imgbbApiKey");
    if(!key) return alert("Missing API Key");

    const formData = new FormData();
    formData.append("image", file);
    
    // Placeholder
    const id = "img-" + Date.now();
    activeEditor.innerHTML += `<p id="${id}" style="color:blue; font-style:italic;">Uploading image...</p>`;
    
    fetch(`https://api.imgbb.com/1/upload?key=${key}`, {
        method: "POST",
        body: formData
    })
    .then(r => r.json())
    .then(d => {
        const p = document.getElementById(id);
        if(p) p.remove();
        
        if(d.success) {
            const img = document.createElement("img");
            img.src = d.data.url;
            img.style.maxWidth = "100%";
            img.style.border = "2px solid #000";
            img.style.boxShadow = "4px 4px 0 #000";
            activeEditor.appendChild(img);
            document.getElementById("imageUploadModal").style.display = "none";
        } else {
            alert("Upload failed: " + (d.error?.message || "Unknown"));
        }
    })
    .catch(e => {
        const p = document.getElementById(id);
        if(p) p.remove();
        alert("Error: " + e.message);
    });
}
