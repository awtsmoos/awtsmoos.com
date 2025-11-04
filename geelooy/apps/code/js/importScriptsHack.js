// B"H
// FILE: js/importScriptsHack.js

export default /*js*/`
(function() {
    // A safeguard to ensure this script doesn't run twice.
    if (self.hasImportScriptsPolyfill) return;
    self.hasImportScriptsPolyfill = true;

    const workerBasePath = '%%WORKER_BASE_PATH%%';
    let controlView, dataSAB; // These are now initialized by the event listener.

    self.addEventListener('message', (e) => {
        if (e.data && e.data.type === 'init-chunked-sync') {
            const { controlSAB, dataSAB: receivedDataSAB } = e.data;
            controlView = new Int32Array(controlSAB);
            dataSAB = receivedDataSAB;
        }
    });

    function waitForChunk() {
        Atomics.wait(controlView, 0, 0); // Wait for main thread to signal ready.
        
        const chunkLen = Atomics.load(controlView, 1);
        const isNamePhase = Atomics.load(controlView, 2) === 1;
        const isLastChunk = Atomics.load(controlView, 3) === 1;
        const errorCode = Atomics.load(controlView, 4);

        if (errorCode !== 0) {
            Atomics.store(controlView, 0, 0);
            self.postMessage({ type: 'ack' });
            throw new Error('Main thread signaled an error during script fetch. The script likely does not exist.');
        }

        const chunk = new Uint8Array(chunkLen);
        chunk.set(new Uint8Array(dataSAB, 0, chunkLen));

        Atomics.store(controlView, 0, 0); // Signal back that we've processed the chunk.
        self.postMessage({ type: 'ack' });

        return { chunk, isNamePhase, isLastChunk };
    }

    function receiveVariableLengthField() {
        const chunkParts = [];
        let isNamePhase = null;
        while (true) {
            const { chunk, isNamePhase: chunkIsName, isLastChunk } = waitForChunk();
            if (isNamePhase === null) isNamePhase = chunkIsName;
            if (chunkIsName !== isNamePhase) throw new Error('Protocol error: Phase mismatch.');
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
        // --- THIS IS THE DEFINITIVE FIX FOR THE RACE CONDITION ---
        // This loop will pause execution here until the 'init-chunked-sync' message
        // has been received and 'controlView' has been assigned.
        while (!controlView) {
            // Busy-wait is the correct pattern here to simulate a synchronous block.
        }

        for (const path of paths) {
            self.postMessage({ type: 'import-scripts-request', path: path, basePath: workerBasePath });

            // This block will now only run AFTER the SABs are initialized.
            // If the script fetch fails, receiveVariableLengthField will throw the error.
            const nameBytes = receiveVariableLengthField();
            const scriptName = new TextDecoder().decode(nameBytes);
            const scriptBytes = receiveVariableLengthField();
            const scriptText = new TextDecoder().decode(scriptBytes);

            try {
                eval.call(self, scriptText);
            } catch(e) {
                console.error(\`Error executing imported script: \${scriptName}\`, e);
                throw e; // Re-throw to halt worker execution, mimicking native behavior.
            }
        }
    };
})();
`;