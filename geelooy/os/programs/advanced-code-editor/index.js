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
        
        // 1. Send Menu Config
        const awtsmoosMenuConfig = {
            title: 'Awtsmoos',
            items: [
                { label: 'Run', action: 'run-js', icon: 'play' },
                { label: 'Open in New Tab', action: 'open-public-url', icon: 'external-link' },
                { label: 'Copy Public URL', action: 'copy-public-url', icon: 'link' }
            ]
        };
        iframe.contentWindow.postMessage({
            type: 'registerMenus',
            payload: [awtsmoosMenuConfig]
        }, '*');

        // 2. Send Content (File or Folder)
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
        
        initialLoadSent = true;
    };

    const handleMessageFromEditor = async (event) => {
        if (event.source !== iframe.contentWindow) return;
        
        const { type, payload, requestId } = event.data;
        
        const respond = (responsePayload, type='osResponse') => {
            iframe.contentWindow.postMessage({ type, requestId, payload: responsePayload }, '*');
        };
        
        const reject = (errorMessage) => {
            iframe.contentWindow.postMessage({ type: 'osResponse', requestId, error: errorMessage }, '*');
        };
    
        try {
            switch (type) {
                // B"H - HANDSHAKE LISTENER
                case 'editorReady':
                    sendInitialLoad();
                    break;

                // --- FILE SYSTEM PROVIDER REQUESTS ---
                case 'requestFolderList':
                    const rawItems = await os.db.getAllKeys(payload.path);
                    // Extract just names to ensure compatibility
                    const items = rawItems.map(item => (typeof item === 'string' ? item : item.name));
                    respond({ items });
                    break;
    
                case 'requestFileContent':
                    const fileContent = await os.db.Laynin(payload.path, payload.fileName);
                    respond({ content: fileContent });
                    break;
    
                case 'requestFileWrite':
                    await os.createFile({
                        path: payload.fullPath.substring(0, payload.fullPath.lastIndexOf('/')),
                        title: payload.fullPath.substring(payload.fullPath.lastIndexOf('/') + 1),
                        content: payload.content
                    });
                    respond({ success: true });
                    break;
    
                case 'requestItemCreate':
                    if (payload.kind === 'directory') {
                        await os.createFolder({ path: payload.parentPath, title: payload.name });
                    } else {
                        await os.createFile({ path: payload.parentPath, title: payload.name, content: '' });
                    }
                    respond({ success: true });
                    break;
    
                case 'requestItemDelete':
                    const parentPath = payload.fullPath.substring(0, payload.fullPath.lastIndexOf('/'));
                    const itemName = payload.fullPath.substring(payload.fullPath.lastIndexOf('/') + 1);
                    await os.db.delete(parentPath, itemName);
                    respond({ success: true });
                    break;
    
                // --- OTHER ACTIONS ---
                case 'customAction':
                    const { action, context } = payload;
                    switch (action) {
                        case 'run-js':
                            iframe.contentWindow.postMessage({ type: 'requestContent' }, '*');
                            break;
                        case 'open-public-url':
                        case 'copy-public-url':
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
    
                case 'responseContent':
                    const code = payload.content;
                    if (code) {
                        try {
                            eval('(async () => {' + code + '})()');
                            system.makeToast("Script executed in OS context.");
                        } catch (e) {
                            console.error("Error executing script in OS context:", e);
                            system.makeToast(`Script Error: ${e.message}`);
                        }
                    }
                    break;
                    
                case "saveFile":
                    await os.createFile({
                        path: payload.saveContext.osPath,
                        title: payload.saveContext.osFileName,
                        content: payload.content
                    });
	                respond({saved: payload.saveContext.osFileName}, "saveSuccess");
                break;
            }
        } catch (error) {
            console.error(`OS Error handling request '${type}':`, error);
            reject(error.message);
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