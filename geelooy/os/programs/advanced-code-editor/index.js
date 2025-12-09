
// B"H
// FILE: /Remember/awtsmoos/com/geelooy/os/programs/advanced-code-editor/index.js

export default ({ os, system, fileName, content, path }) => {
    const container = document.createElement('div');
    container.style.cssText = `width: 100%; height: 100%; overflow: hidden; display: flex; flex-direction: column;`;

    const iframe = document.createElement('iframe');
    iframe.src = '/apps/code/index.html?embedded=true';
    iframe.style.cssText = `width: 100%; height: 100%; border: none; background: #1e1e1e;`;
    container.appendChild(iframe);

    // Check if we are opening a folder or a file
    // Context menu passes { osPath, osFolderName } for folders
    const isFolder = content && typeof content === 'object' && content.osPath;

    // Track if we have sent the initial configuration
    let initialLoadSent = false;

    // Function to send configuration and content once editor is ready
    const sendInitialLoad = () => {
        if (initialLoadSent) return;
        
        // 1. Send Menu Config (Optional)
        const awtsmoosMenuConfig = {
            title: 'Awtsmoos',
            items: [
                { label: 'Save to OS', action: 'save' }
            ]
        };
        
        iframe.contentWindow.postMessage({
            type: 'registerMenus',
            payload: [awtsmoosMenuConfig]
        }, '*');

        // 2. Send Content or Workspace Info
        if (isFolder) {
            console.log("Opening as Workspace:", content);
            iframe.contentWindow.postMessage({
                type: 'loadWorkspace',
                payload: {
                    name: content.osFolderName,
                    path: content.osPath,
                    type: 'osfolder'
                }
            }, '*');
        } else {
            console.log("Opening as File:", fileName);
            iframe.contentWindow.postMessage({
                type: 'loadFile',
                payload: {
                    content: content, 
                    fileName: fileName,
                    saveContext: { path } // Path used for single-file saves
                }
            }, '*');
        }

        initialLoadSent = true;
    };

    // Wait for the editor to signal it is ready, or fall back to onload
    const messageHandler = async (e) => {
        if (e.source !== iframe.contentWindow) return;
        const { type, payload, requestId } = e.data;

        // -- Handshake --
        if (type === 'editorReady') {
            sendInitialLoad();
            return;
        }

        // -- RPC Helper to reply to the iframe --
        const reply = (responsePayload) => {
            if (requestId === undefined) return;
            iframe.contentWindow.postMessage({
                requestId,
                payload: responsePayload
            }, '*');
        };

        const replyError = (msg) => {
            if (requestId === undefined) return;
            iframe.contentWindow.postMessage({
                requestId,
                error: msg || "Unknown Error"
            }, '*');
        };

        // -- Protocol Handling --
        try {
            // 1. Save Single File
            if (type === 'saveFile') {
                // payload: { content, saveContext }
                const savePath = payload.saveContext?.path || path; 
                // If it's a single file open, path variable is the folder, fileName is the name
                // If saveContext is present, use that.
                
                await system.save({
                    content: () => payload.content,
                    fileName: () => fileName 
                });
                
                iframe.contentWindow.postMessage({ type: 'saveSuccess' }, '*');
            }

            // 2. OS Folder: List Directory
            if (type === 'requestFolderList') {
                // payload: { path }
                const folderData = await os.db.readFolder(payload.path);
                
                // B"H - Convert to rich items array with metadata
                let items = [];
                if (Array.isArray(folderData)) {
                    items = folderData.map(i => {
                        if (typeof i === 'string') return { name: i, kind: i.endsWith('.folder') ? 'directory' : 'file' };
                        return {
                            name: i.name,
                            kind: i.type === 'directory' || (i.name && i.name.endsWith('.folder')) ? 'directory' : 'file',
                            size: i.size || 0,
                            lastModified: i.mtime || i.modified || 0
                        };
                    });
                } else if (folderData && typeof folderData === 'object') {
                    items = Object.keys(folderData).map(key => {
                        const val = folderData[key];
                        const isDir = key.endsWith('.folder');
                        if (typeof val === 'object' && val !== null) {
                            return {
                                name: key,
                                kind: val.type || (isDir ? 'directory' : 'file'),
                                size: val.size || 0,
                                lastModified: val.mtime || val.modified || 0
                            };
                        }
                        return { name: key, kind: isDir ? 'directory' : 'file' };
                    });
                }
                
                reply({ items });
            }

            // 3. OS Folder: Read File
            if (type === 'requestFileContent') {
                // payload: { path, fileName }
                // Note: os.db.readFile takes (storeName, key)
                const fileContent = await os.db.readFile(payload.path, payload.fileName);
                reply({ content: fileContent });
            }

            // 4. OS Folder: Write File
            if (type === 'requestFileWrite') {
                // payload: { fullPath, content }
                const fullPath = payload.fullPath;
                const lastSlash = fullPath.lastIndexOf('/');
                const folder = fullPath.substring(0, lastSlash);
                const file = fullPath.substring(lastSlash + 1);
                
                await os.db.makeFile(folder, file, payload.content);
                reply({ success: true });
            }

            // 5. OS Folder: Create Item
            if (type === 'requestItemCreate') {
                // payload: { parentPath, name, kind }
                const targetPath = payload.parentPath;
                if (payload.kind === 'directory') {
                    // makeFolder takes just the path string usually
                    const newFolderPath = targetPath === '/' ? payload.name : `${targetPath}/${payload.name}`;
                    await os.db.makeFolder(newFolderPath);
                } else {
                    await os.db.makeFile(targetPath, payload.name, "");
                }
                reply({ success: true });
            }

            // 6. OS Folder: Delete Item
            if (type === 'requestItemDelete') {
                // payload: { fullPath, kind }
                const fullPath = payload.fullPath;
                const lastSlash = fullPath.lastIndexOf('/');
                const folder = fullPath.substring(0, lastSlash);
                const file = fullPath.substring(lastSlash + 1);
                
                await os.db.deleteFile(folder, file);
                reply({ success: true });
            }

        } catch (err) {
            console.error("OS Bridge Error:", err);
            replyError(err.message);
        }
    };

    window.addEventListener('message', messageHandler);
    
    // Fallback if ready message missed
    iframe.onload = () => {
        setTimeout(sendInitialLoad, 500); 
    };

    // Cleanup listeners when window closes (if supported by OS window manager)
    container.addEventListener('remove', () => {
        window.removeEventListener('message', messageHandler);
    });

    return { div: container };
};