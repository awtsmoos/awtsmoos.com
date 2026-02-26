
// B"H
/**
 * @file worker-hacks.js
 * @brief The Polyfill of Time Stoppage (Synchronous Worker Imports).
 */

export const importScriptsHack = `
(function() {
    if (self.hasImportScriptsPolyfill) return;
    self.hasImportScriptsPolyfill = true;

    let controlView, dataSAB; 

    self.addEventListener('message', (e) => {
        if (e.data && e.data.type === 'init-chunked-sync') {
            controlView = new Int32Array(e.data.controlSAB);
            dataSAB = e.data.dataSAB;
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
            throw new Error('Main thread signaled an error during script fetch. Script not found.');
        }

        const chunk = new Uint8Array(chunkLen);
        chunk.set(new Uint8Array(dataSAB, 0, chunkLen));

        Atomics.store(controlView, 0, 0); 
        self.postMessage({ type: 'ack' });

        return { chunk, isNamePhase, isLastChunk };
    }

    function receiveData() {
        const parts =[];
        while (true) {
            const { chunk, isLastChunk } = waitForChunk();
            parts.push(chunk);
            if (isLastChunk) break;
        }
        const totalLen = parts.reduce((s, p) => s + p.length, 0);
        const res = new Uint8Array(totalLen);
        let offset = 0;
        for (const p of parts) { res.set(p, offset); offset += p.length; }
        return res;
    }

    self.importScripts = (...paths) => {
        while (!controlView) { /* Busy wait until initialized */ }

        for (const path of paths) {
            self.postMessage({ type: 'import-scripts-request', path: path });

            const nameBytes = receiveData(); // Name phase
            const scriptBytes = receiveData(); // Content phase
            const scriptText = new TextDecoder().decode(scriptBytes);

            try {
                eval.call(self, scriptText);
            } catch(e) {
                console.error('Error executing imported script: ' + path, e);
                throw e;
            }
        }
    };
})();
`;
