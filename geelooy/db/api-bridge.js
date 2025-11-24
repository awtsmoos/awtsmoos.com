// B"H
// FILE: api-bridge.js
import {
	serialize as awtsmooSerialize
} from "/scripts/awtsmoos/binary/awtsmoos-json-serializer.js";

import {
	parse as awtsmooParse
} from "/scripts/awtsmoos/binary/awtsmoos-json-parser.js";
document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURATION & DOM REFERENCES ---
    const API_BASE = '/api/public';
    var holder = document.getElementById('editor-holder');
    var editorIframe ;
    const statusOverlay = document.getElementById('status-overlay');
    var base = "/"
    
    // =================================================================
    // SECTION 1: THE PERMANENT MESSAGE LISTENER (THE "OS")
    // This is the core of the bridge. It listens for any and all file system
    // requests that the editor makes AFTER it has been initialized.
    // =================================================================
    window.addEventListener('message', async (event) => {
        // Security check: Only accept messages from the iframe.
        if (event.source !== editorIframe.contentWindow) {
            return;
        }

        const { type, payload, requestId } = event.data;
        console.log("GOT",event.data);
        // We only care about file system requests, which the editor prefixes with "request".
        if (!type || !type.startsWith('request')) {
            return;
        }

        try {
            let responsePayload;

            // Route the incoming request to the correct API handler function.
            switch (type) {
                case 'requestFolderList':
                    responsePayload = await handleListFolder(payload.path);
                    break;
                case 'requestFileContent':
                    responsePayload = await handleReadFile(payload.path, payload.fileName);
                    break;
                case 'requestFileWrite':
                    responsePayload = await handleWriteFile(payload.fullPath, payload.content);
                    break;
                case 'requestItemCreate':
                    responsePayload = await handleCreateItem(payload.parentPath, payload.name, payload.kind);
                    break;
                case 'requestItemDelete':
                    responsePayload = await handleDeleteItem(payload.fullPath, payload.kind);
                    break;
                default:
                    // If we don't recognize the request, ignore it.
                    return;
            }

            // Send the successful result back to the iframe, referencing the original requestId.
            editorIframe.contentWindow.postMessage({ type: 'osResponse', payload: responsePayload, requestId }, '*');

        } catch (e) {
            // If any handler throws an error, send an error message back to the iframe.
            console.error(`API Bridge failed to handle '${type}':`, e);
            editorIframe.contentWindow.postMessage({ type: 'osResponse', error: e.message, requestId }, '*');
        }
    });

    // =================================================================
    // SECTION 2: API HANDLER FUNCTIONS
    // These functions translate editor requests into your backend API calls.
    // =================================================================

    async function checkAuth() {
        try {
            const params = new URLSearchParams({ 'authorized': 'true' });
            const response = await fetch(API_BASE, {
	            method: 'POST',
	            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
	            body: params
            });
            const result = await response.json();
            return result.status === 'success';
        } catch (error) {
            console.error('Authorization Check Error:', error);
            return false;
        }
    }


	function ext(n) {
		if(typeof(n) != "string") return null;
		var d = n.lastIndexOf(".")
		if(d > -1) {
			return n.substring(d)
			
		}
		return null;
	}
    async function handleListFolder(path) {
	    if(path.startsWith(base)) {
		    path = path.substring(base.length)
	    }
        const response = await fetch(`${API_BASE}?path=${encodeURIComponent(path)}`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        const items = (data.directory || []).map(w=> {
	       var x = ext(w);
	       if(!x) return w + ".folder";
	       return w;
        });
        console.log("sending",items);
        return { items };
    }

    async function handleReadFile(parentPath, fileName) {
        const fullPath = parentPath === '/' ? `/${fileName}` : `${parentPath}/${fileName}`;
        const response = await fetch(`${API_BASE}?path=${encodeURIComponent(fullPath)}`);
        const data = await response.json();
        var content;
        if(data.dynamicEntry) {
	        var bytes = awtsmooSerialize(data.dynamicEntry);
	        var uint = new Uint8Array(bytes);
	        content = uint.buffer;
        } else if(data.file) {
	        var d = data.file.data;
	        var uint = new Uint8Array(d);
	        var f=new TextDecoder()
	        content = f.decode(uint.buffer);
	        
        } else {
	        content = "Other type";
        }
        if (data.error) throw new Error(data.error);
        //content = JSON.stringify(data.dynamicEntry, null, 4);
        return { content };
    }
    

    async function handleWriteFile(fullPath, content) {
    var x = ext(fullPath);
    var wr = content;
    if(x == ".awtsmoosJSON") {
	    wr = JSON.stringify(awtsmooParse(content?.buffer));
    }

        const params = new URLSearchParams({ endpoint: 'update', record: wr});
        /*
	    const params = new URLSearchParams();
            params.append('endpoint', 'update');
            params.append('record', JSON.stringify(updatedJson));

        */
        
    console.log("writing", wr , fullPath, params,window.a= content );
       // return;
        const response = await fetch(`${API_BASE}?path=${encodeURIComponent(fullPath)}`, {
	        method: 'POST', body: params
        });
        const result = await response.json();
        if (result.status !== 'success') throw new Error(result.message);
        return { saved: true };
    }
    
    async function handleCreateItem(parentPath, name, kind) {
        const isDir = kind === 'directory';
        const fileName = isDir ? `${name}/.placeholder.awtsmoosJSON` : name;
        const newPath = parentPath === '/' ? `/${fileName}` : `${parentPath}/${fileName}`;
        const initialContent = JSON.stringify({ "B\"H": `Created via API Editor` });
        const params = new URLSearchParams({ endpoint: 'create', record: initialContent });
        const response = await fetch(`${API_BASE}?path=${encodeURIComponent(newPath)}`, { method: 'POST', body: params });
        const result = await response.json();
        if (result.status !== 'success') throw new Error(result.message);
        return { created: true };
    }

    async function handleDeleteItem(fullPath, kind) {
        if (kind === 'directory') {
            throw new Error("Directory deletion is not supported by this API simulation.");
        }
        const params = new URLSearchParams({ endpoint: 'delete' });
        const response = await fetch(`${API_BASE}?path=${encodeURIComponent(fullPath)}`, { method: 'POST', body: params });
        const result = await response.json();
        if (result.status !== 'success') throw new Error(result.message);
        return { deleted: true };
    }

    // =================================================================
    // SECTION 3: PAGE INITIALIZATION
    // =================================================================

    // This function runs once when the page loads.
    (async function main() {
        

        const isAuthorized = await checkAuth();

        if (isAuthorized) {
            statusOverlay.textContent = "Authorization successful. Loading workspace...";
	    editorIframe = document.createElement('iframe');
	    editorIframe .src = '/apps/code/index.html?embedded=true';
	    editorIframe .style.cssText = `width: 100%; height: 100%; border: none;`;
	   
	    editorIframe .onload = () => {
		    console.log("Loading");
	            // This is the ONE-WAY command to the editor to initialize itself.
	            // After this message is sent, this function's job is done.
	            // The permanent listener in Section 1 will handle all future interactions.
	            editorIframe.contentWindow.postMessage({
	                type: 'loadFolderAsWorkspace',
	                payload: {
	                    folderName: 'API Root', // This is the name that will appear in the editor's sidebar.
	                    folderPath: base          // This is the path the editor will use for its root.
	                }
	            }, '*');
            };
             holder.appendChild(editorIframe);

            // Fade out and remove the status overlay.
            setTimeout(() => {
                statusOverlay.style.opacity = '0';
                setTimeout(() => statusOverlay.remove(), 500);
            }, 500);

        } else {
            // If authorization fails, display a permanent error message.
            statusOverlay.textContent = "Authorization Failed.\nYou do not have permission to access this resource.";
        }
    })();
});