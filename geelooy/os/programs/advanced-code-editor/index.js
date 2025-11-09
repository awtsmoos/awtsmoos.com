// B"H

// This program wraps your external code editor in an iframe for use within the OS.

export default ({ os, system, fileName, content, path }) => {

    const container = document.createElement('div');
    container.style.cssText = `width: 100%; height: 100%; overflow: hidden;`;

    const iframe = document.createElement('iframe');
    iframe.src = '/apps/code/index.html?embedded=true';
    
    iframe.style.cssText = `width: 100%; height: 100%; border: none;`;

    container.appendChild(iframe);

    // --- PostMessage Communication ---
    
    // 1. Wait for the iframe to load before we try to send it anything.
    iframe.onload = () => {
        console.log("Advanced Editor Iframe Loaded. Sending file content...");
        // 2. Send the file data to the editor.
        iframe.contentWindow.postMessage({
            type: 'loadFile',
            payload: {
                fileName: fileName,
                content: content,
                // We send the path info so the editor knows where to save later
                saveContext: {
                    osPath: path,
                    osFileName: fileName
                }
            }
        }, '*'); // Use a specific origin in production for security
    };

    // 3. Listen for messages coming *from* the editor (like a save request).
    const handleMessageFromEditor = async (event) => {
        // Basic security check: ensure the message is from our iframe
        if (event.source !== iframe.contentWindow) {
            return;
        }

        const { type, payload } = event.data;

        if (type === 'saveFile') {
            console.log("OS received save request from Advanced Editor:", payload);
            try {
                // Use the context we sent earlier to save the file in the right place
                await os.db.Koysayv(payload.saveContext.osPath, payload.saveContext.osFileName, payload.content);
                system.makeToast(`Saved ${payload.saveContext.osFileName}`);

                // Optional: Send a confirmation back to the editor
                iframe.contentWindow.postMessage({ type: 'saveSuccess' }, '*');
            } catch (error) {
                system.makeToast(`Error saving file: ${error.message}`);
                iframe.contentWindow.postMessage({ type: 'saveError', error: error.message }, '*');
            }
        }
    };
    
    window.addEventListener('message', handleMessageFromEditor);


    var self = {
        div: container,
        // When this window is closed, we must clean up the event listener
        onclose: () => {
            console.log("Cleaning up advanced editor message listener.");
            window.removeEventListener('message', handleMessageFromEditor);
        }
    };
    
    // We need to tell the Window Handler to call our onclose method.
    // This requires a small change in `windows.js` later.
    return self;
};