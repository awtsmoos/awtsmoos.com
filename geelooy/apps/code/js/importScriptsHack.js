// B"H
// FILE: js/importScriptsHack.js

export default (workerPath, originalScriptContent) => /*js*/`
(function() {
    // A safeguard to ensure this script doesn't run twice in the same worker.
    if (self.hasImportScriptsPolyfill) return;
    self.hasImportScriptsPolyfill = true;

    console.log('%c[WORKER] Chunked protocol polyfill loaded.', 'color: #4682B4');

    // --- CRITICAL FIX: This line was missing. It makes the worker's own path available
    // within its scope so it can correctly resolve relative paths for sub-scripts.
    const workerBasePath = '${workerPath}';

    let controlView, dataSAB;

    self.addEventListener('message', (e) => {
        if (e.data && e.data.type === 'init-chunked-sync') {
            const { controlSAB, dataSAB: receivedDataSAB } = e.data;
            controlView = new Int32Array(controlSAB);
            dataSAB = receivedDataSAB;
            console.log('[WORKER] Initialized with chunked SABs.');
        }
    });

    function waitForChunk() {
        // This blocks execution until the main thread sets the state to 1.
        Atomics.wait(controlView, 0, 0);
        
        const chunkLen = Atomics.load(controlView, 1);
        const isNamePhase = Atomics.load(controlView, 2) === 1;
        const isLastChunk = Atomics.load(controlView, 3) === 1;
        const errorCode = Atomics.load(controlView, 4);

        if (errorCode !== 0) {
            Atomics.store(controlView, 0, 0); // Reset state
            self.postMessage({ type: 'ack' }); // Acknowledge to unblock main thread
            throw new Error('Main thread signaled an error during chunk transfer.');
        }

        const chunk = new Uint8Array(chunkLen);
        chunk.set(new Uint8Array(dataSAB, 0, chunkLen));

        // Reset state to 0 and send ACK to unblock the main thread. This is the core of the handshake.
        Atomics.store(controlView, 0, 0);
        self.postMessage({ type: 'ack' });

        return { chunk, isNamePhase, isLastChunk };
    }

    function receiveVariableLengthField() {
        const chunkParts = [];
        let isNamePhase = null;

        while (true) {
            const { chunk, isNamePhase: chunkIsName, isLastChunk } = waitForChunk();
            // The first chunk determines if we are receiving a name or script content.
            if (isNamePhase === null) isNamePhase = chunkIsName;
            
            if (chunkIsName !== isNamePhase) {
                throw new Error('Protocol error: Phase mismatch during chunk transfer.');
            }
            chunkParts.push(chunk);
            if (isLastChunk) break;
        }

        const totalLength = chunkParts.reduce((sum, part) => sum + part.length, 0);
        const finalBytes = new Uint8Array(totalLength);
        let offset = 0;
        for (const part of chunkParts) {
            finalBytes.set(part, offset);
            offset += part.length;
        }
        return finalBytes;
    }

    self.importScripts = (...paths) => {
        for (const path of paths) {
            // --- CRITICAL FIX: The postMessage call now correctly uses the 'workerBasePath' constant defined above.
            self.postMessage({ type: 'import-scripts-request', path: path, basePath: workerBasePath });

            // The protocol dictates that the name is sent first, then the content.
            const nameBytes = receiveVariableLengthField();
            const scriptName = new TextDecoder().decode(nameBytes);

            const scriptBytes = receiveVariableLengthField();
            const scriptText = new TextDecoder().decode(scriptBytes);

            try {
                // Executing the script via a Blob URL is a synchronous operation.
                const blob = new Blob([scriptText], { type: 'application/javascript' });
                const url = URL.createObjectURL(blob);
                importScripts(url);
                URL.revokeObjectURL(url);
            } catch(e) {
                console.error(\`Error executing script received via chunks for \${scriptName}\`, e);
                throw e;
            }
        }
    };

    // This async IIFE ensures the user's script does not run before the SABs are initialized.
    (async () => {
        while (!controlView) {
            await new Promise(r => setTimeout(r, 10));
        }
        console.log('%c[WORKER] Executing original script...', 'color: #90EE90; font-weight: bold;');
        try {
            ${originalScriptContent}
        } catch (e) {
            console.error("CRITICAL: Error during initial execution of worker script.", e);
        }
    })();
})();
`;