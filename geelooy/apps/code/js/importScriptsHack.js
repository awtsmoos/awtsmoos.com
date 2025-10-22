// B"H
// FILE: js/importScriptsHack.js

export default (workerPath, originalScriptContent) => /*js*/`
(function() {
    if (self.hasImportScriptsPolyfill) return;
    self.hasImportScriptsPolyfill = true;

    console.log('%c[WORKER] Chunked protocol polyfill loaded.', 'color: #4682B4');

    let controlView, dataBytes, dataSAB;

    self.addEventListener('message', (e) => {
        if (e.data && e.data.type === 'init-chunked-sync') {
            const { controlSAB, dataSAB: receivedDataSAB } = e.data;
            controlView = new Int32Array(controlSAB);
            dataBytes = new Uint8Array(receivedDataSAB);
            dataSAB = receivedDataSAB;
            console.log('[WORKER] Initialized with chunked SABs.');
        }
    });

    function waitForChunk() {
        Atomics.wait(controlView, 0, 0);
        
        const chunkLen = Atomics.load(controlView, 1);
        const isNamePhase = Atomics.load(controlView, 2) === 1;
        const isLastChunk = Atomics.load(controlView, 3) === 1;
        const errorCode = Atomics.load(controlView, 4);

        if (errorCode !== 0) {
            Atomics.store(controlView, 0, 0);
            self.postMessage({ type: 'ack' });
            throw new Error('Main thread signaled an error during chunk transfer.');
        }

        const chunk = new Uint8Array(chunkLen);
        chunk.set(new Uint8Array(dataSAB, 0, chunkLen));

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
            self.postMessage({ type: 'import-scripts-request', path: path, basePath: workerPath });

            const nameBytes = receiveVariableLengthField();
            const scriptName = new TextDecoder().decode(nameBytes);

            const scriptBytes = receiveVariableLengthField();
            const scriptText = new TextDecoder().decode(scriptBytes);

            try {
                const blob = new Blob([scriptText], { type: 'application/javascript' });
                const url = URL.createObjectURL(blob);
                importScripts(url); // Native, synchronous call with a blob URL
                URL.revokeObjectURL(url);
            } catch(e) {
                console.error(\`Error executing script received via chunks for \${scriptName}\`, e);
                throw e;
            }
        }
    };

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