//B"H
let currentToolbarTarget = null;
let currentActiveEditor = null;

export function setupEditor() {
    const mainEditor = document.getElementById("mainContentEditor");
    if (mainEditor) {
        mainEditor.addEventListener('focus', () => currentActiveEditor = mainEditor);
        
        document.getElementById("toggleMainContentToolbarBtn")?.addEventListener("click", () => {
            toggleContextualToolbar(mainEditor, document.getElementById("mainContentToolbarContainer"));
        });
        
        document.getElementById("toggleMainContentHtmlViewBtn")?.addEventListener("click", () => {
            toggleEditorHtmlView(mainEditor);
        });
    }
    
    return {
        getActiveEditor: () => currentActiveEditor || mainEditor,
        setActiveEditor: (el) => currentActiveEditor = el,
        toggleToolbar: toggleContextualToolbar,
        toggleHtml: toggleEditorHtmlView,
        getContent: getEditorContent
    };
}

export function toggleContextualToolbar(contentDiv, toolbarContainer) {
    let toolbar = toolbarContainer.querySelector(".editor-toolbar");
    
    // Cleanup other toolbars
    if (currentToolbarTarget && currentToolbarTarget !== contentDiv) {
        const oldContainer = currentToolbarTarget.closest('.editor-wrapper')?.querySelector('.editor-toolbar.active');
        if(oldContainer) oldContainer.remove();
    }
    currentToolbarTarget = contentDiv;

    if (toolbar && toolbar.classList.contains("active")) {
        toolbar.remove();
    } else {
        if(toolbar) toolbar.remove();
        
        const template = document.getElementById("toolbarTemplate");
        if (!template) return;
        
        toolbar = template.cloneNode(true);
        toolbar.removeAttribute("id");
        toolbar.style.display = "flex";
        toolbar.className = "editor-toolbar active";

        toolbar.querySelectorAll("button[data-command]").forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                contentDiv.focus();
                const cmd = btn.dataset.command;
                let val = btn.dataset.value || null;
                
                if (cmd === "createLink") {
                    val = prompt("Enter URL:", "https://");
                    if (!val) return;
                }
                document.execCommand(cmd, false, val);
            };
        });
        toolbarContainer.appendChild(toolbar);
    }
}

export function toggleEditorHtmlView(editorDiv) {
    const wrapper = editorDiv.closest('.editor-wrapper') || editorDiv.parentElement;
    let textarea = wrapper.querySelector(".html-code-view");

    if (editorDiv.style.display !== "none") {
        // Switch to HTML
        if (!textarea) {
            textarea = document.createElement("textarea");
            textarea.className = "html-code-view content-editor";
            editorDiv.after(textarea);
        }
        textarea.value = editorDiv.innerHTML;
        textarea.style.height = Math.max(150, editorDiv.offsetHeight) + "px";
        editorDiv.style.display = "none";
        textarea.style.display = "block";
        textarea.focus();
    } else {
        // Switch to Visual
        editorDiv.innerHTML = textarea.value;
        textarea.style.display = "none";
        editorDiv.style.display = "block";
        editorDiv.focus();
    }
}

export function getEditorContent(editorDiv) {
    const wrapper = editorDiv.closest('.editor-wrapper') || editorDiv.parentElement;
    const textarea = wrapper.querySelector(".html-code-view");
    let html = "", text = "";

    if (editorDiv.style.display !== "none") {
        html = editorDiv.innerHTML;
        text = editorDiv.textContent;
    } else if (textarea && textarea.style.display !== "none") {
        html = textarea.value;
        const temp = document.createElement("div");
        temp.innerHTML = html;
        text = temp.textContent;
    }
    
    const images = Array.from(editorDiv.querySelectorAll("img")).map(i => i.src);
    return { html, text, images };
}
