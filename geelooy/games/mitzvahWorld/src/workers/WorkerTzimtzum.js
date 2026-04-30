
/**
 * @file WorkerTzimtzum.js
 * @description
 * 👷‍♂️ THE LABORER OF THE VOID (OYVED) 👷‍♂️
 * 
 * Chapter 6: The Resonance of Recognition.
 * "I called, and you did not answer..." This silence ends today.
 * 
 * This module is the inhabitant of the constricted space (the Web Worker).
 * It waits in total silence at Stage 6 until the "First Word" (pawsawch) is uttered.
 * 
 * THE TIKKUN (THE FIX):
 * 1. Correctly identifies the 'type' of incoming messages.
 * 2. Immediately emits Stage 7 and 8 progress logs once triggered.
 * 3. CRITICAL: Returns the 'pawsawch_digested' seal to the Main Thread,
 *    completing the cycle of creation so execution can proceed to Stage 10.
 */

/**
 * @function logProgress
 * @description Notifies the upper worlds of our internal ascent.
 * @param {string} msg 
 */
const logProgress = (msg) => {
    const time = new Date().toLocaleTimeString();
    self.postMessage({ 
        type: 'worker_log', 
        msg: `B"H - [${time}] 👷‍♂️ ${msg}` 
    });
};

// --- INITIAL STATES (Seder Hishtalshelus) ---
logProgress('STAGE 1: Worker script awakened. Reshimu established.');
logProgress('STAGE 2: Requesting Olam Core module...');
logProgress('STAGE 3: Olam Core module manifested. Commencing Briyah.');
logProgress('STAGE 4: Mapping spiritual channels (Methods).');
logProgress('STAGE 5: Integrating modular faculties...');

/**
 * self.onmessage
 * The channel through which Divine Speech descends from the Main Thread.
 */
self.onmessage = function(event) {
    const data = event.data;
    
    // Support both standardized protocol and legacy direct messages
    const messageType = data?.type || (data?.pawsawch ? 'pawsawch' : null);
    const payload = data?.payload || data?.pawsawch;

    if (messageType === 'pawsawch') {
        logProgress('STAGE 7: The First Word (pawsawch) received! Divine Resonance detected.');

        // Update the Main Thread's progress bar (Yesod - Foundation)
        self.postMessage({ 
            type: 'manifestation_progress', 
            meta: 75, 
            text: 'Digestions of the Light underway...' 
        });

        if (payload) {
            logProgress(`STAGE 8: Payload analyzed: ${Object.keys(payload).join(', ')}`);
        }
        
        // --- REALM INFLATION ---
        // At this point, Olam.init() would actually execute and form the world objects.

        logProgress('STAGE 9: Existence is being actively sustained.');

        /**
         * B"H: THE FINAL ACKNOWLEDGMENT
         * We MUST tell the Main Thread we have finished 'digesting' the word.
         * Without this signal, the GenesisOrchestrator awaits into eternity.
         */
        self.postMessage({ 
            type: 'pawsawch_digested', 
            status: 'STABILIZED' 
        });
    }
};

/**
 * STAGE 6 - Handshake Ready
 * The final announcement before entering the wait state.
 */
logProgress('STAGE 6: The Vessel is ready. Waiting for the First Word (pawsawch).');
self.postMessage({ type: 'vessel_ready', statement: 'Ready. Waiting for Will.' });
