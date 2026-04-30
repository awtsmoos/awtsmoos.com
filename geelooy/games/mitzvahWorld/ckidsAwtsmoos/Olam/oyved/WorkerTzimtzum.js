
/**
 * @file WorkerTzimtzum.js
 * @description
 * 📜 CHAPTER 12: THE ETERNAL SCROLL OF LOGS 📜
 */
export default class WorkerTzimtzum {
    static logStage(num, msg, detail = "") {
        const ts = new Date().toLocaleTimeString();
        console.log(`B"H - [${ts}] 👷‍♂️ STAGE ${num}: ${msg}`, detail);

        try {
            // Post status update to UI with precise scaling
            self.postMessage({
                increasedOlamLoading: {
                    amount: Math.round(num * 14.28), // Split into 7 stages
                    action: msg,
                    subAction: detail,
                    reset: num === 1
                }
            });
        } catch(e) {}
    }

    static reportImportSuccess(p) { console.log(`B"H - ✅ ${p} Manifested.`); }
    static reportImportFailure(p, e) {
        console.error(`B"H - 🚨 VESSEL SHATTERED: ${p}`);
        self.postMessage({ type: 'ERROR', details: `Shattered: ${p} - ${e.toString()}` });
    }
}
