// B"H
/**
 * @file onnx/engine.js
 * @description 
 * B"H
 * The Controller of the Neural Forge.
 * A pure ES6 Class that manages the Worker lifecycle and Audio Synthesis.
 * Encapsulated in the 'onnx/' subdomain.
 */

import { WORKER_SOURCE } from './worker.js';
import { createWavFile } from '../audioUtils.js';
import { log } from '../logger.js';
import { 
    getElements, 
    updateStatus, 
    setProcessing, 
    updateGenProgress, 
    displayTokens 
} from '../ui.js';
import { playAudio } from '../visualizer.js';

export class NeuralEngine {
    constructor() {
        this.worker = null;
        this.isSessionActive = false;
        this.isProcessing = false;
        
        // Queue State
        this.queue = [];
        this.audioFragments = [];
        this.totalFragments = 0;
        this.processedCount = 0;
    }

    /**
     * Manifests the Worker thread from the source string.
     * Uses a Blob to avoid external file dependencies.
     */
    initWorker() {
        if (this.worker) return this.worker;

        try {
            const blob = new Blob([WORKER_SOURCE], { type: 'application/javascript' });
            const url = URL.createObjectURL(blob);
            this.worker = new Worker(url);

            this.worker.onmessage = this.handleMessage.bind(this);
            this.worker.onerror = (e) => log(`B"H Worker Error: ${e.message}`, 'error');
            
            this.worker.postMessage({ type: 'PING' });
            return this.worker;
        } catch (e) {
            log(`Failed to create worker: ${e.message}`, 'error');
            throw e;
        }
    }

    /**
     * Handles all incoming signals from the Worker.
     */
    handleMessage(e) {
        const { type, payload } = e.data;

        switch (type) {
            case 'LOG':
                log(payload.msg, payload.type);
                break;
            case 'PONG':
                // Worker is alive
                break;
            case 'PHONEMIZE_RESULT':
                getElements().textInput.value = payload;
                log("B\"H - Phonemes Aligned.");
                break;
            case 'TOKENS':
                displayTokens(payload);
                break;
            case 'INIT_SUCCESS':
                // Progress is handled by KokoroTTS wrapper usually
                this.isSessionActive = true;
                updateStatus(true);
                log(`B"H - Model Bound. IO: [${payload.inputs}] -> [${payload.outputs}]`, 'success');
                break;
            case 'VOICE_SUCCESS':
                log("B\"H - Voice Bank Injected.", 'success');
                break;
            case 'GENERATE_SUCCESS':
                this.handleFragmentSuccess(payload);
                break;
            case 'ERROR':
                log(payload, 'error');
                this.resetProcessing();
                break;
        }
    }

    // loadModel and loadVoice are now largely deprecated in favor of KokoroTTS.ignite() 
    // passing buffers directly via postMessage, but we keep them for compatibility if needed.

    /**
     * Requests phonemization of the current text.
     */
    requestPhonemes(text) {
        if (!this.worker) this.initWorker();
        this.worker.postMessage({ type: 'PHONEMIZE', payload: { text } });
    }

    /**
     * Starts the generation process.
     */
    generate(text, speed, isRawMode) {
        if (!this.isSessionActive) {
            log("B\"H - Error: No Neural Weights Loaded.", 'error');
            return;
        }
        if (this.isProcessing) return;

        this.isProcessing = true;
        setProcessing(true);
        updateGenProgress(0);
        
        // 1. Split Text
        this.queue = text.match(/[^.!?]+[.!?]*|[^.!?]+/g);
        if (!this.queue) this.queue = [text];
        this.queue = this.queue.map(s => s.trim()).filter(s => s.length > 0);

        this.totalFragments = this.queue.length;
        this.processedCount = 0;
        this.audioFragments = new Array(this.totalFragments);

        log(`B"H - Synthesis Started: ${this.totalFragments} fragments.`);
        this.dispatchNext();
    }

    dispatchNext() {
        if (this.processedCount >= this.totalFragments) {
            this.finalize();
            return;
        }
        
        const text = this.queue[this.processedCount];
        // Defaults if not provided
        const speed = parseFloat(getElements().speedSlider?.value) || 1.0;
        const isRawMode = getElements().rawModeToggle?.checked || false;

        this.worker.postMessage({
            type: 'GENERATE',
            payload: { text, speed, chunkIndex: this.processedCount, isRawMode }
        });
    }

    handleFragmentSuccess(payload) {
        const { audioData, chunkIndex } = payload;
        this.audioFragments[chunkIndex] = new Float32Array(audioData);
        this.processedCount++;
        
        const prog = (this.processedCount / this.totalFragments) * 100;
        updateGenProgress(prog);
        
        this.dispatchNext();
    }

    finalize() {
        log("B\"H - Stitched Audio Complete.", 'success');
        
        // Concatenate
        const totalLen = this.audioFragments.reduce((acc, c) => acc + (c ? c.length : 0), 0);
        if (totalLen === 0) {
            this.resetProcessing();
            return;
        }

        const finalBuffer = new Float32Array(totalLen);
        let offset = 0;
        for (const frag of this.audioFragments) {
            if (frag) {
                finalBuffer.set(frag, offset);
                offset += frag.length;
            }
        }

        // Global Normalization
        let max = 0;
        for(let i=0; i<finalBuffer.length; i++) {
            const val = Math.abs(finalBuffer[i]);
            if (val > max) max = val;
        }
        if (max > 0) {
            const scale = 0.95 / max; // Headroom
            for(let i=0; i<finalBuffer.length; i++) finalBuffer[i] *= scale;
        }

        // Export
        const blob = createWavFile(finalBuffer);
        const url = URL.createObjectURL(blob);
        
        // UI Update
        const els = getElements();
        if (els.downloadBtn) {
            els.downloadBtn.href = url;
            els.downloadBtn.classList.remove('disabled');
            els.downloadBtn.classList.remove('hidden'); // Legacy support
        }
        
        playAudio(url);
        this.resetProcessing();
        updateGenProgress(100);
    }

    resetProcessing() {
        this.isProcessing = false;
        setProcessing(false);
    }
}