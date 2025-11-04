// B"H
// FILE: js/importScriptsHack.js

// This is now a static script string. The original worker code will be appended to this.
export default /*js*/`
(function() {
    // A safeguard to ensure this script doesn't run twice.
    if (self.hasImportScriptsPolyfill) return;
    self.hasImportScriptsPolyfill = true;

    // This path variable will be set by the main thread before this script is created.
    // We will use a placeholder that gets replaced.
    const workerBasePath = '%%WORKER_BASE_PATH%%';
    let controlView, dataSAB;

    self.addEventListener('message', (e) => {
        if (e.data && e.data.type === 'init-chunked-sync') {
            const { controlSAB, dataSAB: receivedDataSAB } = e.data;
            controlView = new Int32Array(controlSAB);
            dataSAB = receivedDataSAB;
        }
    });

    function waitForChunk() {
        // Wait until the main thread signals that a chunk is ready (controlView[0] becomes 1).
        Atomics.wait(controlView, 0, 0);
        
        const chunkLen = Atomics.load(controlView, 1);
        const isNamePhase = Atomics.load(controlView, 2) === 1;
        const isLastChunk = Atomics.load(controlView, 3) === 1;
        const errorCode = Atomics.load(controlView, 4);

        if (errorCode !== 0) {
            Atomics.store(controlView, 0, 0); // Reset state
            self.postMessage({ type: 'ack' }); // Acknowledge receipt
            throw new Error('Main thread signaled an error during chunk transfer.');
        }

        const chunk = new Uint8Array(chunkLen);
        chunk.set(new Uint8Array(dataSAB, 0, chunkLen));

        // Signal back to the main thread that we've processed this chunk.
        Atomics.store(controlView, 0, 0);
        self.postMessage({ type: 'ack' });

        return { chunk, isNamePhase, isLastChunk };
    }

    function receiveVariableLengthField() {
        const chunkParts = [];
        let isNamePhase = null;

        while (true) {
            const { chunk, isNamePhase: chunkIsName, isLastChunk } = waitForChunk();
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
            self.postMessage({ type: 'import-scripts-request', path: path, basePath: workerBasePath });

            const nameBytes = receiveVariableLengthField();
            const scriptName = new TextDecoder().decode(nameBytes);

            const scriptBytes = receiveVariableLengthField();
            const scriptText = new TextDecoder().decode(scriptBytes);

            try {
                eval.call(self, scriptText);
            } catch(e) {
                console.error("Error executing script received via chunks for",scriptName, e);
                throw e;
            }
        }
    };
})();

// The original worker code will be appended here by the html-preview-processor.
`;