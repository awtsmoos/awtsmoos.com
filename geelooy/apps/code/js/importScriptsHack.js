// B"H
// FILE: js/importScriptsHack.js

export default (workerPath, originalScriptContent) => /*js*/`
    (function() {
        console.log('%c[WORKER] Polyfill Loaded.', 'color: #4682B4');
        const workerBasePath = '${workerPath}';
        let sab, int32;
        const scriptCache = new Map();
        const OriginalImportScripts = self.importScripts;
        let messageQueue = []; // Queue for messages that arrive before init
        let isInitialized = false;

        // B"H: THE ASYNC WRAPPER SOLUTION
        // This promise is the key to solving the race condition.
        const sabReadyPromise = new Promise((resolve) => {
            self.addEventListener('message', (event) => {
                if (event.data.type === 'init-sync') {
                    sab = event.data.sab;
                    int32 = new Int32Array(sab);
                    console.log('%c[WORKER] Sync mechanism INITIALIZED.', 'color: #4682B4; font-weight: bold;');
                    isInitialized = true;
                    // Process any queued messages
                    messageQueue.forEach(msg => self.dispatchEvent(new MessageEvent('message', { data: msg })));
                    messageQueue = [];
                    resolve(); // The SAB is ready, release the await.
                } else if (!isInitialized) {
                    // If we get any other message before init, queue it.
                    messageQueue.push(event.data);
                }
            });
        });

        self.addEventListener('message', (event) => {
            if (!isInitialized) return; // Don't process until SAB is ready
            
            if (event.data.type === 'import-scripts-response') {
                console.log('%c[WORKER] Received content for:', 'color: #4682B4;', event.data.path);
                scriptCache.set(event.data.path, event.data.content || '');
                if(event.data.error) scriptCache.set('error:' + event.data.path, event.data.error);
                Atomics.store(int32, 0, 1);
                Atomics.notify(int32, 0);
            }
        });

        self.importScripts = (...paths) => {
            if (!sab) {
                throw new Error('Profound Editor: Sync mechanism not initialized before importScripts was called. This indicates a race condition.');
            }
            
            for (const relativePath of paths) {
                console.log('%c[WORKER] Posting import-scripts-request for:', 'color: #4682B4;', relativePath);
                self.postMessage({ type: 'import-scripts-request', path: relativePath, basePath: workerBasePath });
                
                console.log('%c[WORKER] Now blocking with Atomics.wait()...', 'color: #B0C4DE;');
                // This is the correct way to wait while allowing the event loop to process messages.
                // It will sleep for 100ms at a time, wake up to allow messages to be processed,
                // and then go back to sleep if the response hasn't arrived yet.
                let waitTimeout = 5000; // 5 seconds total timeout
                while(Atomics.wait(int32, 0, 0, 100) === 'timed-out' && waitTimeout > 0) {
                    waitTimeout -= 100;
                }
                
                if (waitTimeout <= 0) {
                    throw new Error('Profound Editor: Timed out waiting for importScripts: ' + relativePath);
                }

                console.log('%c[WORKER] ...Woke up!', 'color: #B0C4DE;');
                Atomics.store(int32, 0, 0); // Reset the flag for the next import

                if (scriptCache.has('error:' + relativePath)) {
                     throw new Error(scriptCache.get('error:' + relativePath));
                }
                if (scriptCache.has(relativePath)) {
                    const content = scriptCache.get(relativePath);
                    scriptCache.delete(relativePath);
                    try {
                        const base64Content = btoa(unescape(encodeURIComponent(content)));
                        const dataUrl = 'data:application/javascript;base64,' + base64Content;
                        OriginalImportScripts(dataUrl);
                    } catch (e) {
                        console.error('Profound Editor: Error executing imported script:', relativePath, e);
                        throw e;
                    }
                } else {
                    //throw new Error('Profound Editor: Failed to load script for importScripts: ' + relativePath);
                console. log("WE RAN OUT OF TIME TO IMPORT")
                }
            }
        };

        // This is the async wrapper for the user's original code.
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