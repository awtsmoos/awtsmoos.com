
// B"H
// FILE: /Remember/awtsmoos/com/geelooy/os/programs/advanced-code-editor/index.js

export default ({ os, system, fileName, content, path }) => {
    const container = document.createElement('div');
    container.style.cssText = `width: 100%; height: 100%; overflow: hidden;`;

    const iframe = document.createElement('iframe');
    iframe.src = '/apps/code/index.html?embedded=true';
    iframe.style.cssText = `width: 100%; height: 100%; border: none;`;
    container.appendChild(iframe);

    // Track if we have sent the initial configuration
    let initialLoadSent = false;

    // Function to send configuration and content once editor is ready
    const sendInitialLoad = () => {
        if (initialLoadSent) return;
        
        // 1. Send Menu Config (Optional, logic remains same)
        const awtsmoosMenuConfig = {
            title: 'Awtsmoos',
            items: [
                { label: 'Run', action: 'runCode' }, // Assuming the app handles 'runCode' logic or we bind it
                { label: 'Save', action: 'saveFile' }
            ]
        };
        
        iframe.contentWindow.postMessage({
            type: 'awtsmoosMenuConfig',
            config: awtsmoosMenuConfig
        }, '*');

        // 2. Send Content (Binary Blob or Text)
        // We pass it directly. The receiver app must handle Blobs/Buffers.
        iframe.contentWindow.postMessage({
            type: 'awtsmoosFileContent',
            content: content, 
            fileName: fileName,
            path: path
        }, '*');

        initialLoadSent = true;
    };

    iframe.onload = () => {
        sendInitialLoad();
    };

    // Handle messages from the iframe (e.g. Save)
    window.addEventListener('message', async (e) => {
        if (e.source !== iframe.contentWindow) return;

        const data = e.data;
        if (data.type === 'saveFile') {
            await system.save({
                content: () => data.content,
                fileName: () => fileName
            });
        }
    });

    return { div: container };
};
