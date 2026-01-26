//B"H
/**
 * @file wysiwyg.js
 * @description
 * A minimal, Neo-Brutalist WYSIWYG editor factory.
 * Includes Source/Visual toggle.
 */

export function createWysiwygEditor() {
    const editorWrapper = document.createElement("div");
    editorWrapper.className = "awtsmoos-wysiwyg-container";

    const toolbar = document.createElement("div");
    toolbar.className = "awtsmoos-wysiwyg-toolbar";

    // Standard Tools
    const tools = [
        { label: "B", cmd: "bold", title: "Bold" },
        { label: "I", cmd: "italic", title: "Italic" },
        { label: "U", cmd: "underline", title: "Underline" },
        { label: "🔗", cmd: "createLink", prompt: true, title: "Link" },
        // { label: "H2", cmd: "formatBlock", val: "h2", title: "Heading" }
    ];

    tools.forEach(tool => {
        const btn = document.createElement("button");
        btn.className = "wysiwyg-btn";
        btn.textContent = tool.label;
        btn.title = tool.title || "";
        btn.onclick = (e) => {
            e.preventDefault();
            
            // Only work in visual mode
            if (contentArea.style.display === "none") return;
            
            let val = tool.val || null;
            if (tool.prompt) {
                val = prompt("Enter URL:", "https://");
                if (!val) return;
            }
            document.execCommand(tool.cmd, false, val);
            contentArea.focus();
        };
        toolbar.appendChild(btn);
    });

    // --- Toggle Source Button ---
    const toggleBtn = document.createElement("button");
    toggleBtn.className = "wysiwyg-btn toggle-source";
    toggleBtn.textContent = "</>";
    toggleBtn.title = "Toggle HTML Source";
    toggleBtn.style.marginLeft = "auto"; // Push to right
    
    toggleBtn.onclick = (e) => {
        e.preventDefault();
        const isVisual = contentArea.style.display !== "none";
        
        if (isVisual) {
            // Switch to Source
            sourceArea.value = contentArea.innerHTML;
            sourceArea.style.height = Math.max(100, contentArea.offsetHeight) + "px";
            contentArea.style.display = "none";
            sourceArea.style.display = "block";
            toggleBtn.classList.add("active");
        } else {
            // Switch to Visual
            contentArea.innerHTML = sourceArea.value;
            sourceArea.style.display = "none";
            contentArea.style.display = "block";
            toggleBtn.classList.remove("active");
        }
    };
    toolbar.appendChild(toggleBtn);

    // --- Visual Surface ---
    const contentArea = document.createElement("div");
    contentArea.className = "awtsmoos-writing-surface";
    contentArea.contentEditable = true;
    contentArea.style.outline = "none";

    // --- Source Surface ---
    const sourceArea = document.createElement("textarea");
    sourceArea.className = "awtsmoos-source-surface";
    sourceArea.style.display = "none"; // Hidden by default

    editorWrapper.appendChild(toolbar);
    editorWrapper.appendChild(contentArea);
    editorWrapper.appendChild(sourceArea);

    return { editorWrapper, contentArea, sourceArea };
}