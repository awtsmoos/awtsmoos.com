//B"H

import { AwtsmoosPrompt, makePost } from "/scripts/awtsmoos/api/utils.js"; // Ensure this path is correct

window.AwtsmoosPrompt = AwtsmoosPrompt;

// --- Global Variables & Initial Setup ---

let currentActiveEditor = null; // Tracks the currently focused editor
let currentToolbarTarget = null; // Tracks the contentDiv for the active toolbar

const aliasIdDiv = document.getElementById("aliasId");
const sectionsArea = document.getElementById("sectionsArea");
const mainContentEditor = document.getElementById("mainContentEditor");
const imageUploadModal = document.getElementById("imageUploadModal");
const imgbbApiKeyInput = document.getElementById("imgbbApiKey");
const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const uploadImageModalBtn = document.getElementById("uploadImageBtn"); // Renamed from uploadImageBtn to avoid conflict
const closeModalBtn = document.getElementById("closeModalBtn");

// Utility: Get Heichel ID from URL
function gh() {
    return (p => p[p.length - 2])(location.pathname.split("/"));
}

const u = new URL(location);
const parentSeriesId = u.searchParams.get("parentSeriesId") || "root";
const heichelId = gh();

const baseURL = `/heichelos/${heichelId}?${new URLSearchParams({
    view: "posts",
    series: parentSeriesId
})}`;
document.getElementById("backBtn").href = baseURL;

addEventListener("awtsmoosAliasChange", e => {
	console.log("OK!",e)
	var id = e.detail.id;
	window.curAlias = id;
		  
	aliasIdDiv
	.value = curAlias;
});
console.log("Evented",window.curAlias)
aliasIdDiv.value = curAlias;
// --- Event Listeners ---
document.addEventListener("DOMContentLoaded", () => {
    window.aliasIdDiv = aliasIdDiv; // For global access if needed elsewhere
    if (window.curAlias && window.aliasIdDiv) {
        aliasIdDiv.value = window.curAlias;
        console.log("HI",window.curAlias)
    }

    console.log(curAlias,aliasIdDiv)

    const $_GET = new URLSearchParams(location.search);
    const ru = $_GET.get("returnURL");
    window.$_GET = $_GET;
    if (ru) {
        const mt = document.querySelector("metadata");
        if (mt) {
            const b = document.createElement("a");
            b.innerText = "<- Back to previous page";
            b.href = ru;
            mt.insertBefore(b, mt.firstChild); // Corrected typo
        }
    }

    // Main content editor controls
    document.getElementById("toggleMainContentToolbarBtn").addEventListener("click", (e) => {
      toggleContextualToolbar(mainContentEditor, document.getElementById("mainContentToolbarContainer"));
    });
    document.getElementById("toggleMainContentHtmlViewBtn").addEventListener("click", () => toggleEditorHtmlView(mainContentEditor));
    document.getElementById("uploadImageMainBtn").addEventListener("click", () => initImageUploadModal(mainContentEditor));
    
    // Initial focus handler for main editor
    mainContentEditor.addEventListener('focus', () => currentActiveEditor = mainContentEditor);


    // Section generation
    document.getElementById("generateSectionsFromBulk").addEventListener("click", () => {
        const bulkText = document.getElementById("bulkText").value.trim();
        const delimiters = document.getElementById("mainSectionDelimiters").value;
        generateItems(bulkText, delimiters, sectionsArea, "sectionTemplate", false);
    });
    document.getElementById("generateSectionsFromMainEditor").addEventListener("click", () => {
        const mainEditorContent = getEditorContent(mainContentEditor); // Get text content
        const delimiters = document.getElementById("mainSectionDelimiters").value;
        generateItems(mainEditorContent.text, delimiters, sectionsArea, "sectionTemplate", false);
    });


    // Add blank section
    document.getElementById("addSection")?.addEventListener("click", () => {
        const section = createItem("sectionTemplate", "", false);
        sectionsArea.appendChild(section);
        updateSectionTitles();
    });

    // Submit post
    document.getElementById("submitPost").addEventListener("click", handleSubmitPost);

    // Image Modal Setup
    setupImageUploadModal();
});

addEventListener("awtsmoosAliasChange", e => {
    curAlias = e.detail.id;
    if (aliasIdDiv) aliasIdDiv.value = curAlias;
});


// --- Core Item Creation (Sections/Sub-sections) ---
function createItem(templateId, content = "", isSubSection = false) {
    const template = document.getElementById(templateId);
    if (!template) {
        console.error(`Template with ID ${templateId} not found.`);
        return null;
    }
    const newItem = template.content.cloneNode(true).firstElementChild;

    const contentDiv = newItem.querySelector(".section-content");
    contentDiv.innerHTML = content; // Use innerHTML to allow pre-filled HTML

    // Focus tracking for context-aware toolbars/actions
    contentDiv.addEventListener('focus', () => currentActiveEditor = contentDiv);

    // Controls setup
    newItem.querySelector(".toggle-toolbar-btn").addEventListener("click", () => {
        toggleContextualToolbar(contentDiv, newItem.querySelector(".editor-toolbar-container"));
    });
    newItem.querySelector(".toggle-html-view-btn").addEventListener("click", () => toggleEditorHtmlView(contentDiv));
    newItem.querySelector(".upload-image-section-btn").addEventListener("click", () => initImageUploadModal(contentDiv));
    newItem.querySelector(".remove-section-btn").addEventListener("click", () => {
        newItem.remove();
        if (!isSubSection) updateSectionTitles(); else updateSubSectionTitles(newItem.closest('.section'));
    });

    const addBeforeBtn = newItem.querySelector(".add-before-btn");
    const addAfterBtn = newItem.querySelector(".add-after-btn");

    addBeforeBtn.onclick = () => {
        const newSibling = createItem(templateId, "", isSubSection);
        newItem.before(newSibling);
        if (!isSubSection) updateSectionTitles(); else updateSubSectionTitles(newItem.closest('.section'));
    };
    addAfterBtn.onclick = () => {
        const newSibling = createItem(templateId, "", isSubSection);
        newItem.after(newSibling);
        if (!isSubSection) updateSectionTitles(); else updateSubSectionTitles(newItem.closest('.section'));
    };

    if (!isSubSection) { // Section-specific: Sub-section handling
        const subSectionCreator = newItem.querySelector(".subsection-manager");
        const generateSubSectionsBtn = subSectionCreator.querySelector(".generate-subsections-btn");
        const subSectionsContainer = newItem.querySelector(".sub-sections-area");
        const addSubSectionBtn = subSectionCreator.querySelector(".add-subsection-btn");

        generateSubSectionsBtn.addEventListener("click", () => {
            const bulkText = subSectionCreator.querySelector(".subsection-bulk-text").value.trim();
            const delimiters = subSectionCreator.querySelector(".subsection-delimiters").value;
            generateItems(bulkText, delimiters, subSectionsContainer, "subSectionTemplate", true, newItem);
        });
        
        addSubSectionBtn.addEventListener("click", () => {
            const subSection = createItem("subSectionTemplate", "", true);
            subSectionsContainer.appendChild(subSection);
            updateSubSectionTitles(newItem);
        });
    }
    return newItem;
}

function updateSectionTitles() {
    const allSections = sectionsArea.querySelectorAll(":scope > .section");
    allSections.forEach((sec, index) => {
        const titleEl = sec.querySelector(".section-title-dynamic");
        if (titleEl) titleEl.textContent = `Section ${index + 1}`;
    });
}

function updateSubSectionTitles(parentSectionElement) {
    if (!parentSectionElement) return;
    const allSubSections = parentSectionElement.querySelectorAll(":scope .sub-sections-area > .sub-section");
    allSubSections.forEach((subSec, index) => {
        const titleEl = subSec.querySelector(".section-title-dynamic");
        if (titleEl) titleEl.textContent = `Sub-Section ${index + 1}`;
    });
}


// --- Text Parsing and Item Generation ---
function parseTextToItems(bulkText, delimitersString) {
    if (!bulkText || !bulkText.trim()) return [];
    
    let delimiters = [];
    if (delimitersString && delimitersString.trim() !== "") {
        delimiters = delimitersString.split(',').map(d => d.trim()).filter(d => d);
    }

    if (delimiters.length === 0) {
        // Default to splitting by one or more newlines if no custom delimiters
        return bulkText.split(/\n+/).map(p => p.trim()).filter(p => p);
    }
    
    const regexPattern = delimiters.map(d => 
        d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape special regex characters
    ).join('|');
    
    const regex = new RegExp(regexPattern, 'g');
    return bulkText.split(regex).map(p => p.trim()).filter(p => p);
}

function generateItems(bulkText, delimiters, targetContainer, templateId, isSubSection, parentSectionElement = null) {
    // targetContainer.innerHTML = ""; // Optional: Clear existing items. Decided against for now.
    if (bulkText) {
        const items = parseTextToItems(bulkText, delimiters);
        items.forEach((text) => {
            const item = createItem(templateId, text, isSubSection);
            if (item) targetContainer.appendChild(item);
        });
        if (!isSubSection) updateSectionTitles();
        else if (parentSectionElement) updateSubSectionTitles(parentSectionElement);
    }
}


// --- Editor Functionality (Toolbar, HTML View) ---
function toggleContextualToolbar(contentDiv, toolbarContainer) {
    let toolbar = toolbarContainer.querySelector(".editor-toolbar");
    
    // If trying to toggle toolbar for a different editor, remove previous active one
    if (currentToolbarTarget && currentToolbarTarget !== contentDiv && toolbarContainer.parentNode.contains(currentToolbarTarget.closest('.editor-wrapper').querySelector('.editor-toolbar.active'))) {
        currentToolbarTarget.closest('.editor-wrapper').querySelector('.editor-toolbar.active')?.remove();
    }

    currentToolbarTarget = contentDiv; // Set current target

    if (toolbar && toolbar.classList.contains("active")) {
        toolbar.remove();
    } else {
        if(toolbar) toolbar.remove(); // Remove any previous inactive one in this container

        toolbar = document.getElementById("toolbarTemplate").cloneNode(true);
        toolbar.style.display = "flex";
        toolbar.className = "editor-toolbar active";

        toolbar.querySelectorAll("button[data-command]").forEach(button => {
            button.onclick = (e) => {
                e.preventDefault();
                contentDiv.focus(); // IMPORTANT: Ensure editor has focus
                const command = button.dataset.command;
                let value = button.dataset.value || null;
                if (command === "createLink") {
                    value = prompt("Enter URL:", "https://");
                    if (!value) return; 
                }
                document.execCommand(command, false, value);
            };
        });
        toolbarContainer.appendChild(toolbar);
    }
}

function toggleEditorHtmlView(editorDiv) {
    const parentWrapper = editorDiv.closest('.editor-wrapper') || editorDiv.parentElement;
    let textarea = parentWrapper.querySelector(".html-code-view");

    if (editorDiv.style.display !== "none") { // Rich Text -> HTML
        if (!textarea) {
            textarea = document.createElement("textarea");
            textarea.className = "html-code-view content-editor"; // Inherit styles
            editorDiv.after(textarea);
        }
        textarea.value = editorDiv.innerHTML;
        // Try to match height, might need adjustment
        textarea.style.height = Math.max(150, editorDiv.offsetHeight) + 'px'; 
        editorDiv.style.display = "none";
        textarea.style.display = "block";
        textarea.focus();
    } else { // HTML -> Rich Text
        editorDiv.innerHTML = textarea.value;
        textarea.style.display = "none";
        editorDiv.style.display = "block";
        editorDiv.focus();
    }
}

function getEditorContent(editorDiv) {
    const parentWrapper = editorDiv.closest('.editor-wrapper') || editorDiv.parentElement;
    const textarea = parentWrapper.querySelector(".html-code-view");
    let html = "";
    let text = "";

    if (editorDiv.style.display !== "none") { // Rich text view is active
        html = editorDiv.innerHTML;
        text = editorDiv.textContent;
    } else if (textarea && textarea.style.display !== "none") { // HTML view is active
        html = textarea.value;
        // Create a temporary div to get textContent from HTML string
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        text = tempDiv.textContent;
    }
    const images = Array.from(editorDiv.querySelectorAll("img")).map(img => img.src);
    return { html, text, images };
}


// --- Image Upload ---
function setupImageUploadModal() {
    const savedApiKey = localStorage.getItem("imgbbApiKey");
    if (savedApiKey) imgbbApiKeyInput.value = savedApiKey;

    imgbbApiKeyInput.onchange = () => {
        localStorage.setItem("imgbbApiKey", imgbbApiKeyInput.value);
    };

    dropZone.addEventListener("dragover", e => {
        e.preventDefault();
        dropZone.classList.add("dragging");
    });
    dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragging"));
    dropZone.addEventListener("drop", e => {
        e.preventDefault();
        dropZone.classList.remove("dragging");
        if (e.dataTransfer.files.length && currentActiveEditor) {
            handleImageUpload(e.dataTransfer.files[0], currentActiveEditor);
        }
    });
    dropZone.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", () => {
        if (fileInput.files.length && currentActiveEditor) {
            handleImageUpload(fileInput.files[0], currentActiveEditor);
        }
    });
    uploadImageModalBtn.addEventListener("click", () => {
        const apiKey = imgbbApiKeyInput.value.trim();
        if (!apiKey) {
            alert("ImgBB API key is required.");
            return;
        }
        localStorage.setItem("imgbbApiKey", apiKey);
        if (fileInput.files.length && currentActiveEditor) {
            handleImageUpload(fileInput.files[0], currentActiveEditor, apiKey);
        } else {
            alert("No file selected or no active editor to insert image into.");
        }
    });
    closeModalBtn.addEventListener("click", () => {
        imageUploadModal.style.display = "none";
    });
}

function initImageUploadModal(contentDivForImage) {
    currentActiveEditor = contentDivForImage; // Set context for where image should go
    imageUploadModal.style.display = "flex";
}

function handleImageUpload(file, contentDiv, apiKey = null) {
    if (!contentDiv) {
        alert("No active editor to insert the image into!");
        return;
    }
    if (!apiKey) apiKey = localStorage.getItem("imgbbApiKey");
    if (!apiKey) {
        alert("ImgBB API key is missing. Please set it in the modal.");
        imageUploadModal.style.display = "flex"; // Re-open modal if key missing
        return;
    }

    const formData = new FormData();
    formData.append("image", file);

    // Basic loading indicator (can be improved)
    const originalContent = contentDiv.innerHTML;
    contentDiv.innerHTML += "<p><i>Uploading image...</i></p>";


    fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        // Remove loading indicator
        contentDiv.innerHTML = originalContent;

        if (data.success) {
            const img = document.createElement("img");
            img.src = data.data.url;
            img.alt = data.data.title || "Uploaded Image";
            img.style.maxWidth = "100%"; // Basic styling

            // Insert image at cursor or end
            contentDiv.focus(); // Ensure focus
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.deleteContents(); // Remove selected text if any
                range.insertNode(img);
                // Move cursor after image
                range.setStartAfter(img);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);

            } else {
                 contentDiv.appendChild(img); // Fallback to append
            }
            imageUploadModal.style.display = "none"; // Close modal on success
        } else {
            alert("Image upload failed: " + (data.error?.message || "Unknown error"));
        }
    })
    .catch(err => {
        contentDiv.innerHTML = originalContent; // Remove loading indicator
        alert("An error occurred during upload: " + err.message);
    });
}


// --- Post Submission ---
async function handleSubmitPost() {
    const title = document.getElementById("title").value;
    const currentAliasId = aliasIdDiv.value;

    if (!title.trim()) {
        alert("Title is required!");
        return;
    }
    if (!currentAliasId) {
        alert("Alias ID is missing. Please ensure you are logged in or it's set.");
        return;
    }

    const mainContentData = getEditorContent(mainContentEditor);

    const sectionsData = Array.from(sectionsArea.querySelectorAll(":scope > .section")).map(sectionEl => {
        const sectionContentData = getEditorContent(sectionEl.querySelector(".section-content"));
        
        const subSectionsData = Array.from(sectionEl.querySelectorAll(":scope .sub-sections-area > .sub-section")).map(subSectionEl => {
            const subSectionContentData = getEditorContent(subSectionEl.querySelector(".section-content"));
            return {
                html: subSectionContentData.html,
                images: subSectionContentData.images
            };
        });

        return {
            html: sectionContentData.html,
            images: sectionContentData.images,
            subSections: subSectionsData.length > 0 ? subSectionsData : undefined
        };
    });

    const postPayload = {
        aliasId: currentAliasId,
        heichelId: heichelId,
        parentSeriesId: parentSeriesId,
        title: title,
        mainContent: { // Main content as a separate field
            html: mainContentData.html,
            images: mainContentData.images
        },
        dayuh: {
            sections: sectionsData
        }
    };

    console.log("Submitting Post:", JSON.stringify(postPayload, null, 2)); // For debugging

    try {
        const response = await makePost(postPayload);
        if (response.success) {
            await AwtsmoosPrompt.go({
                isAlert: true,
                headerTxt: "SUCCESS!",
                bodyTxt: "Your insane post has been launched into the Awtsmoos!"
            });
            location.href = baseURL;
        } else {
            AwtsmoosPrompt.go({
                isAlert: true,
                headerTxt: "Submission Failed",
                bodyTxt: `The server responded with an error: ${response.error || 'Unknown error. Check console.'}`
            });
            console.error("Submission error from server:", response);
        }
    } catch (err) {
        AwtsmoosPrompt.go({
            isAlert: true,
            headerTxt: "Submission Error",
            bodyTxt: `A client-side error occurred: ${err.message}. Check console.`
        });
        console.error("Error submitting post:", err);
    }
}