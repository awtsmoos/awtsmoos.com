
// B"H
/**
 * Inference Worker
 * Runs the model in a background thread.
 */
import { initSession, runInference } from './inference_loop.js';

let isInitialized = false;

self.onmessage = async (e) => {
    const { type, payload } = e.data;

    try {
        if (type === 'INIT') {
            const buffer = payload;
            
            // Bridge the worker logging to the main thread
            const logger = (msg, level) => self.postMessage({ type: 'LOG', payload: { msg, level } });
            
            // 1. Parse GGUF (Now in Worker)
            self.postMessage({ type: 'PROGRESS', payload: { percent: 15, msg: "Parsing Metadata..." } });
            
            if (!self.parseGGUF) throw new Error("GGUF Parser not loaded in worker");
            const metaData = self.parseGGUF(buffer);
            
            // 2. Send Metadata back to UI
            self.postMessage({ type: 'METADATA', payload: metaData });
            
            // 3. Init Session
            self.postMessage({ type: 'PROGRESS', payload: { percent: 40, msg: "Mapping Tensors..." } });
            await initSession(buffer, metaData, logger);
            
            isInitialized = true;
            
            self.postMessage({ type: 'STATUS', payload: 'Engine Online' });
            self.postMessage({ type: 'READY' });
            
            logger("Worker: Model Initialized successfully.", 'accent');
        }
        else if (type === 'GENERATE') {
            if (!isInitialized) throw new Error("Worker not initialized");
            
            const prompt = payload;
            const onToken = (token) => self.postMessage({ type: 'TOKEN', payload: token });
            const onDone = () => self.postMessage({ type: 'DONE' });
            
            await runInference(prompt, onToken, onDone);
        }
        else if (type === 'RESET') {
             // Basic reset if implemented in loop
             // For now just log
             self.postMessage({ type: 'LOG', payload: { msg: "Reset received (Logic pending)", level: 'warn' } });
        }
    } catch (err) {
        self.postMessage({ type: 'ERROR', payload: err.message });
        console.error(err);
    }
};
