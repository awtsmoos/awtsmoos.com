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
        // NEW: Check if we are opening a file or a folder
        if (typeof content === 'string') {
            // It's a single file
            iframe.contentWindow.postMessage({
                type: 'loadFile',
                payload: { fileName, content, saveContext: { osPath: path, osFileName: fileName } }
            }, '*');
        } else if (typeof content === 'object' && content.osPath) {
            // It's a folder
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
            case 'saveFile':
                await os.db.Koysayv(payload.saveContext.osPath, payload.saveContext.osFileName, payload.content);
                system.makeToast(`Saved ${payload.saveContext.osFileName}`);
                iframe.contentWindow.postMessage({ type: 'saveSuccess' }, '*');
                break;

            case 'requestFolderList':
                const items = await os.db.getAllKeys(payload.path);
                respond('responseFolderList', { payload: { items } });
                break;

            case 'requestFileContent':
                const fileContent = await os.db.Laynin(payload.path, payload.fileName);
                respond('responseFileContent', { payload: { content: fileContent } });
                break;

            
            case 'requestFileWrite':
                const parentPath = payload.fullPath.substring(0, payload.fullPath.lastIndexOf('/'));
                const fileName = payload.fullPath.substring(payload.fullPath.lastIndexOf('/') + 1);
                await os.db.Koysayv(parentPath, fileName, payload.content);
                system.makeToast(`Saved ${fileName}`);
                respond('responseSuccess', { payload: {} }); // Acknowledge success
                break;

            case 'requestItemCreate':
                if (payload.kind === 'file') {
                    await os.createFile({ path: payload.parentPath, title: payload.name, content: '' });
                } else { // directory
                    await os.createFolder({ path: payload.parentPath, title: payload.name });
                }
                system.makeToast(`Created ${payload.kind} '${payload.name}'`);
                respond('responseSuccess', { payload: {} });
                break;
                
            case 'requestItemDelete':
                const delParentPath = payload.fullPath.substring(0, payload.fullPath.lastIndexOf('/'));
                const delItemName = payload.fullPath.substring(payload.fullPath.lastIndexOf('/') + 1);
                
                // Note: AwtsmoosDB `delete` is not recursive. This will only delete empty folders.
                // A recursive delete function could be an future OS enhancement.
                await os.db.deleteFile(delParentPath, delItemName);

                system.makeToast(`Deleted '${delItemName}'`);
                respond('responseSuccess', { payload: {} });
                break;
        }
    } catch (error) {
        console.error(`OS Error handling request '${type}':`, error);
        // If any operation fails, send a clear error message back to the editor
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