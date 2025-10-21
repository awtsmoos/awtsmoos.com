//B"H

export default (workerPath, originalScriptContent) => /*js*/`
    (function() {
        console.log('%c[WORKER] Polyfill Loaded.', 'color: #4682B4');
        const workerBasePath = '${workerPath}';
        let sab, int32;
        const scriptCache = new Map();
        const OriginalImportScripts = self.importScripts;

        // B"H: THE ASYNC WRAPPER SOLUTION
        // This promise is the key to solving the race condition.
        const sabReadyPromise = new Promise((resolve) => {
            self.addEventListener('message', (event) => {
                if (event.data.type === 'init-sync') {
                    sab = event.data.sab;
                    int32 = new Int32Array(sab);
                    console.log('%c[WORKER] Sync mechanism INITIALIZED.', 'color: #4682B4; font-weight: bold;');
                    resolve(); // The SAB is ready, release the await.
                }
            });
        });

        self.addEventListener('message', (event) => {
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
                // This error should now be impossible due to the await, but it's good practice.
                throw new Error('Profound Editor: Sync mechanism not initialized before importScripts was called. This indicates a race condition.');
            }
            
            for (const relativePath of paths) {
                console.log('%c[WORKER] Posting import-scripts-request for:', 'color: #4682B4;', relativePath);
                self.postMessage({ type: 'import-scripts-request', path: relativePath, basePath: workerBasePath });
                
                console.log('%c[WORKER] Now blocking with Atomics.wait()...', 'color: #B0C4DE;');
                const result = Atomics.wait(int32, 0, 0, 5000);
                
                if (result === 'timed-out') {
                    throw new Error('Profound Editor: Timed out waiting for importScripts: ' + relativePath);
                }
                console.log('%c[WORKER] ...Woke up!', 'color: #B0C4DE;');
                Atomics.store(int32, 0, 0);

                if (scriptCache.has('error:' + relativePath)) {
                     throw new Error(scriptCache.get('error:' + relativePath));
                }
                if (scriptCache.has(relativePath)) {
                    const content = scriptCache.get(relativePath);
                    scriptCache.delete(relativePath);
                    console.log('%c[WORKER] Received content for ' + relativePath, 'color: green');
                    console.log('--- SCRIPT CONTENT START ---\\n' + content + '\\n--- SCRIPT CONTENT END ---');
                    try {
                        const base64Content = btoa(unescape(encodeURIComponent(content)));
                        const dataUrl = 'data:application/javascript;base64,' + base64Content;
                        OriginalImportScripts(dataUrl);
                    } catch (e) {
                        console.error('Profound Editor: Error executing imported script:', relativePath, e);
                        throw e;
                    }
                } else {
                    throw new Error('Profound Editor: Failed to load script for importScripts: ' + relativePath);
                }
            }
        };

        // This is the async wrapper for the user's original code.
        (async () => {
            console.log('%c[WORKER] Waiting for SAB initialization...', 'color: #FFA500');
            await sabReadyPromise;
            console.log('%c[WORKER] SAB Initialized. Executing original script...', 'color: #90EE90; font-weight: bold;');
            
            // Now that we've waited, execute the user's original script.
            try {
                // We use eval here because the original script is now a string.
                // It's safe within the sandboxed worker.
                eval(originalScriptContent);
            } catch (e) {
                console.error("CRITICAL: Error during initial execution of worker script.", e);
            }
        })();
    })();
`