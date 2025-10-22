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
    const scriptCache = new Map();
    const OriginalImportScripts = self.importScripts;
    let isInitialized = false;

    // This promise ensures the original user script does not execute
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

    // This handler runs whenever the main thread sends a response. Because importScripts
    // is suspended with Atomics.wait(), this handler CAN run. It now controls the handshake.
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

            // --- THE GUARANTEED HANDSHAKE ---
            // STEP 1: Set the signal to 1, confirming the data is cached and ready.
            Atomics.store(signalInt32, 0, 1);
            // STEP 2: Notify the waiting importScripts function that it can now safely proceed.
            Atomics.notify(signalInt32, 0, 1);
        }
    });

    self.importScripts = (...paths) => {
        if (!isInitialized) {
            throw new Error('Profound Editor: importScripts called before sync mechanism was ready.');
        }
        
        for (const relativePath of paths) {
            // Set the signal to 0, meaning "I am now waiting for the onmessage handler".
            Atomics.store(signalInt32, 0, 0);

            console.log('%c[WORKER] Requesting script:', 'color: #4682B4;', relativePath);
            // Post the request to the main thread.
            self.postMessage({ type: 'import-scripts-request', path: relativePath, basePath: workerBasePath });
            
            console.log('%c[WORKER] Now freezing until onmessage completes...', 'color: #B0C4DE;');
            // Freeze this execution context. It will ONLY wake up when the onmessage
            // handler above calls notify(). This eliminates the race condition.
            const result = Atomics.wait(signalInt32, 0, 0, SCRIPT_FETCH_TIMEOUT);

            if (result === 'timed-out') {
                throw new Error(\`Profound Editor: Timed out waiting for importScripts response for '\${relativePath}'.\`);
            }
            console.log('%c[WORKER] ...Woke up! Cache is guaranteed to be ready.', 'color: #B0C4DE;');
            
            if (!scriptCache.has(relativePath)) {
                // This should theoretically never happen with the handshake in place.
                throw new Error(\`Profound Editor: Woke up but could not find cached script for '\${relativePath}'. This indicates a critical bug.\`);
            }

            const cachedResult = scriptCache.get(relativePath);
            scriptCache.delete(relativePath); // Clean up after use.

            if (cachedResult.error) {
                throw new Error(cachedResult.error);
            }

            try {
                const blob = new Blob([cachedResult.content], { type: 'application/javascript' });
                const blobUrl = URL.createObjectURL(blob);
                OriginalImportScripts(blobUrl);
                URL.revokeObjectURL(blobUrl);
            } catch (e) {
                console.error(\`Profound Editor: Error executing imported script '\${relativePath}'\`, e);
            //    throw e;
            }
        }
    };

    // This async IIFE wraps the original script to ensure it doesn't run before initialization.
    (async () => {
        await sabReadyPromise;
        console.log('%c[WORKER] Executing original script...', 'color: #90EE90; font-weight: bold;');
        try {
            ${originalScriptContent}
        } catch (e) {
            console.error("CRITICAL: Error during initial execution of worker script.", e);
        }
    })();
})();
`;