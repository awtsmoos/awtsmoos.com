// B"H
// FILE: /Remember/awtsmoos/com/geelooy/os/programs/advanced-code-editor/index.js

export default ({ os, system, fileName, content, path }) => {

    const container = document.createElement('div');
    container.style.cssText = `width: 100%; height: 100%; overflow: hidden;`;

    const iframe = document.createElement('iframe');
    iframe.src = '/apps/code/index.html?embedded=true';
    iframe.style.cssText = `width: 100%; height: 100%; border: none;`;
    container.appendChild(iframe);

    // --- PostMessage Communication ---
    
   
iframe.onload = () => {
    // --- DEFINE THE CUSTOM MENU CONFIGURATION ---
    const awtsmoosMenuConfig = {
        title: 'Awtsmoos', // The name that appears on the menu bar
        items: [
            { label: 'Run', action: 'run-js', icon: 'play' },
            { label: 'Open in New Tab', action: 'open-public-url', icon: 'external-link' },
            { label: 'Copy Public URL', action: 'copy-public-url', icon: 'link' }
        ]
    };

    // Send the configuration to the editor. The editor will build the UI.
    iframe.contentWindow.postMessage({
        type: 'registerMenus',
        payload: [awtsmoosMenuConfig] // Send as an array to support multiple menus in the future
    }, '*');

    // --- The existing file-loading logic remains the same ---
    if (typeof content === 'string') {
        iframe.contentWindow.postMessage({
            type: 'loadFile',
            payload: { fileName, content, saveContext: { osPath: path, osFileName: fileName } }
        }, '*');
    } else if (typeof content === 'object' && content.osPath) {
        iframe.contentWindow.postMessage({
            type: 'loadFolderAsWorkspace',
            payload: { folderName: content.osFolderName, folderPath: content.osPath }
        }, '*');
    }
};
    
// In advanced-code-editor/index.js, replace the entire handleMessageFromEditor function

const handleMessageFromEditor = async (event) => {
    if (event.source !== iframe.contentWindow) return;
    
    const { type, payload, requestId } = event.data;

    // Helper to send responses back to the iframe
    const respond = (type, data = {}) => {
        iframe.contentWindow.postMessage({ type, requestId, ...data }, '*');
    };

    try {
        switch (type) {
            // ... your existing cases for saveFile, requestFolderList, etc. ...

            // --- THIS IS THE NEW, CORRECT "BRAIN" LOGIC ---
            case 'customAction':
                console.log("OS received custom action request:", payload);
                const { action, context } = payload;
                
                switch (action) {
                    case 'run-js':
                        // 1. OS decides to run. It needs the code.
                        console.log("OS is requesting code from editor to execute...");
                        // 2. It sends a NEW message asking the editor for its current content.
                        iframe.contentWindow.postMessage({ type: 'requestContent' }, '*');
                        break;
                    
                    case 'open-public-url':
                    case 'copy-public-url':
                        // This logic was already correct, as the OS handles it fully.
                        if (!window.curAlias) {
                            system.makeToast("Not logged in with an alias!");
                            break;
                        }
                        const { osPath, osFileName } = context;
                        const fullPath = `${osPath}/${osFileName}`;
                        const publicUrl = `${location.origin}/api/social/aliases/${curAlias}/fileSystem/readFile?${new URLSearchParams({ path: fullPath })}`;

                        if (action === 'copy-public-url') {
                            await navigator.clipboard.writeText(publicUrl);
                            system.makeToast("Public URL copied to clipboard!");
                        } else {
                            window.open(publicUrl);
                        }
                        break;
                }
                break;

            // --- NEW: LISTENER FOR THE CODE RESPONSE ---
            case 'responseContent':
                // 3. The editor has sent its code back.
                const code = payload.content;
                console.log("OS received code from editor. Executing now...");
                if (code) {
                    try {
                        // 4. The OS executes the code in its own context.
                        eval('(async () => {' + code + '})()');
                        system.makeToast("Script executed in OS context.");
                    } catch (e) {
                        console.error("Error executing script in OS context:", e);
                        system.makeToast(`Script Error: ${e.message}`);
                    }
                }
                break;

            // Default cases for other requests
            // ... (e.g., case 'saveFile': ...)
        }
    } catch (error) {
        console.error(`OS Error handling request '${type}':`, error);
        respond('responseError', { error: error.message });
    }
};


    
    window.addEventListener('message', handleMessageFromEditor);

    return {
        div: container,
        onclose: () => {
            window.removeEventListener('message', handleMessageFromEditor);
        }
    };
};