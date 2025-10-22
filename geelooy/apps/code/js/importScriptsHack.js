// B"H
// FILE: js/importScriptsHack.js

export default (workerPath, originalScriptContent) => /*js*/`
(function() {
    // A safeguard to ensure this script doesn't run twice in the same worker.
    if (self.hasImportScriptsPolyfill) return;
    self.hasImportScriptsPolyfill = true;

    console.log('%c[WORKER] Polyfill loaded.', 'color: #4682B4');
    const workerBasePath = '${workerPath}';
    const SCRIPT_FETCH_TIMEOUT = 10000; // 10 seconds timeout.

    let signalSAB, signalInt32;
    // The script cache holds responses that arrive while the worker is waiting.
    const scriptCache = new Map();
    const OriginalImportScripts = self.importScripts;
    let isInitialized = false;

    // This promise ensures that the original user script does not execute
    // until the sync mechanism has been initialized.
    const sabReadyPromise = new Promise((resolve) => {
        self.addEventListener('message', (event) => {
            if (event.data.type === 'init-sync') {
                console.log('%c[WORKER] Sync mechanism INITIALIZED.', 'color: #4682B4; font-weight: bold;');
                signalSAB = event.data.signalSAB;
                signalInt32 = new Int32Array(signalSAB);
                isInitialized = true;
                resolve();
            }
        });
    });

    // This is the general message handler. Its ONLY job is to take incoming script data
    // and put it in the cache. It can run successfully AFTER the worker is woken up.
    self.addEventListener('message', (event) => {
        if (event.data.type === 'import-scripts-response') {
            const { path, contentSAB, error } = event.data;
            console.log('%c[WORKER] Caching response for:', 'color: #4682B4;', path);
            if (error) {
                scriptCache.set(path, { error });
            } else if (contentSAB) {
                const decoder = new TextDecoder();
                const content = decoder.decode(new Uint8Array(contentSAB));
                scriptCache.set(path, { content });
            }
        }
    });

    self.importScripts = (...paths) => {
        if (!isInitialized) {
            throw new Error('Profound Editor: importScripts called before sync mechanism was ready.');
        }
        
        for (const relativePath of paths) {
            // STEP 1: Reset the signal to 0 (meaning "I am now waiting").
            Atomics.store(signalInt32, 0, 0);

            console.log('%c[WORKER] Requesting script via postMessage:', 'color: #4682B4;', relativePath);
            // STEP 2: Post the request to the main thread.
            self.postMessage({ type: 'import-scripts-request', path: relativePath, basePath: workerBasePath });
            
            console.log('%c[WORKER] Now freezing with Atomics.wait()...', 'color: #B0C4DE;');
            // STEP 3: Freeze this thread. Wait until the value at index 0 is no longer 0, or until timeout.
            const result = Atomics.wait(signalInt32, 0, 0, SCRIPT_FETCH_TIMEOUT);

            if (result === 'timed-out') {
                throw new Error(\`Profound Editor: Timed out waiting for importScripts response for '\${relativePath}'.\`);
            }
            console.log('%c[WORKER] ...Woke up!', 'color: #B0C4DE;');
            
            // STEP 4: We have woken up. The message with our data MUST have been processed by now.
            // Check the cache to get the data.
            if (!scriptCache.has(relativePath)) {
                // This can happen if the main thread notifies but fails to send a message, which would be a bug.
                throw new Error(\`Profound Editor: Woke up but could not find cached script for '\${relativePath}'.\`);
            }

            const cachedResult = scriptCache.get(relativePath);
            scriptCache.delete(relativePath); // Clean up cache after use.

            if (cachedResult.error) {
                console.error(\`[WORKER] Error importing script '\${relativePath}':\`, cachedResult.error);
                throw new Error(cachedResult.error);
            }

            try {
                // Use a Blob URL to execute the script in the worker's global scope.
                const blob = new Blob([cachedResult.content], { type: 'application/javascript' });
                const blobUrl = URL.createObjectURL(blob);
                OriginalImportScripts(blobUrl);
                URL.revokeObjectURL(blobUrl);
            } catch (e) {
                console.error(\`Profound Editor: Error executing imported script '\${relativePath}'\`, e);
                throw e;
            }
        }
    };

    // This async IIFE wraps the original script and waits for the polyfill to be ready.
    (async () => {
        await sabReadyPromise;
        console.log('%c[WORKER] Executing original script...', 'color: #90EE90; font-weight: bold;');
        try {
            ${originalScriptContent}
        } catch (e) {
            console.error("CRITICAL: Error during initial execution of worker script.", e);
            // Optionally, post an error message back to the main thread.
            // self.postMessage({ type: 'worker-error', error: e.message, stack: e.stack });
        }
    })();
})();
`;