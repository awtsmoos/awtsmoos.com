// B"H
// FILE: js/importScriptsHack.js

export default (workerPath, originalScriptContent) => /*js*/`
    (function() {
        console.log('%c[WORKER] Polyfill Loaded.', 'color: #4682B4');
        const workerBasePath = '${workerPath}';
        let signalSAB, signalInt32;
        const scriptCache = new Map();
        const OriginalImportScripts = self.importScripts;
        let messageQueue = []; 
        let isInitialized = false;

        const sabReadyPromise = new Promise((resolve) => {
            self.addEventListener('message', (event) => {
                if (event.data.type === 'init-sync') {
                    // This is our notification channel, not for data transfer.
                    signalSAB = event.data.signalSAB;
                    signalInt32 = new Int32Array(signalSAB);
                    console.log('%c[WORKER] Sync mechanism INITIALIZED.', 'color: #4682B4; font-weight: bold;');
                    isInitialized = true;
                    messageQueue.forEach(msg => self.dispatchEvent(new MessageEvent('message', { data: msg })));
                    messageQueue = [];
                    resolve(); 
                } else if (!isInitialized) {
                    messageQueue.push(event.data);
                }
            });
        });

        self.addEventListener('message', (event) => {
            if (!isInitialized) return; 
            
            // --- B"H: REVISED MESSAGE HANDLER FOR SAB CONTENT ---
            if (event.data.type === 'import-scripts-response') {
                console.log('%c[WORKER] Received response for:', 'color: #4682B4;', event.data.path);
                const { path, contentSAB, error } = event.data;

                if (error) {
                    scriptCache.set('error:' + path, error);
                } else if (contentSAB) {
                    // 1. Decode the string from the received SharedArrayBuffer.
                    const decoder = new TextDecoder();
                    const sabView = new Uint8Array(contentSAB);
                    const content = decoder.decode(sabView);
                    scriptCache.set(path, content);
                } else {
                    // Handle case where content is missing but there's no error.
                    scriptCache.set(path, '');
                }
                // The main thread will notify us, so we don't need to do anything with Atomics here.
            }
        });

        self.importScripts = (...paths) => {
            if (!signalSAB) {
                throw new Error('Profound Editor: Sync mechanism not initialized.');
            }
            
            for (const relativePath of paths) {
                // Ensure the signal is reset before making a request.
                Atomics.store(signalInt32, 0, 0);

                console.log('%c[WORKER] Posting import-scripts-request for:', 'color: #4682B4;', relativePath);
                // The interceptor will attach the signalSAB for us.
                self.postMessage({ type: 'import-scripts-request', path: relativePath, basePath: workerBasePath });
                
                console.log('%c[WORKER] Now blocking with Atomics.wait()...', 'color: #B0C4DE;');
                // 2. This is the crucial wait. It blocks ONLY this worker's execution thread.
                // It does NOT block the message event listener.
                const result = Atomics.wait(signalInt32, 0, 0); // Wait until the value is not 0
                console.log('%c[WORKER] ...Woke up! Result:', 'color: #B0C4DE;', result);

                if (scriptCache.has('error:' + relativePath)) {
                     throw new Error(scriptCache.get('error:' + relativePath));
                }

                if (scriptCache.has(relativePath)) {
                    const content = scriptCache.get(relativePath);
                    scriptCache.delete(relativePath); // Clean up cache
                    try {
                        // Using a Blob URL is a robust way to execute the script
                        const blob = new Blob([content], { type: 'application/javascript' });
                        const blobUrl = URL.createObjectURL(blob);
                        OriginalImportScripts(blobUrl);
                        URL.revokeObjectURL(blobUrl);
                    } catch (e) {
                        console.error('Profound Editor: Error executing imported script:', relativePath, e);
                        throw e;
                    }
                } else {
                    throw new Error('Profound Editor: Woke up but failed to find script content for: ' + relativePath);
                }
            }
        };

        // Async wrapper remains the same and is a good pattern.
        (async () => {
            console.log('%c[WORKER] Waiting for SAB initialization...', 'color: #FFA500');
            await sabReadyPromise;
            console.log('%c[WORKER] SAB Initialized. Executing original script...', 'color: #90EE90; font-weight: bold;');
            
            try {
                ${originalScriptContent}
            } catch (e) {
                console.error("CRITICAL: Error during initial execution of worker script.", e);
            }
        })();
    })();
`;