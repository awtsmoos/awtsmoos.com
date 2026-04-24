
// B"H
/**
 * @file centralLogger.js
 * @description
 *  Authoritative Scribe of the Essence.
 *  Aggressively filters log entries to prevent memory and I/O hoarding during 
 *  massive synchronous simulations, completely eliminating OS file-system overhead.
 */

let lastLogSignature = null;
let repeatCount = 0;

module.exports = {
    resetLog() {
        lastLogSignature = null; 
        repeatCount = 0;
    },

    log(scope, msg, data) {
        let content = `${scope} ${msg}`;
        let rawDataStr = "";

        if (data !== undefined) {
            try {
                if (Buffer.isBuffer(data)) rawDataStr = ` <Buffer len=${data.length}>`;
                else if (typeof data === 'object') rawDataStr = ` [Object]`;
                else rawDataStr = ` ${String(data)}`;
            } catch (e) { rawDataStr = ` [Complex]`; }
        }

        const fullLine = content + rawDataStr;
        if (fullLine === lastLogSignature) { repeatCount++; return; }

        if (repeatCount > 0) {
            repeatCount = 0;
        }

        lastLogSignature = fullLine;
        
        // B"H: The Lightning Path - Console Filtering
        // Only Sefirotic criticals break through the silence, maintaining extreme velocity.
        const isCritical = scope.includes("FATAL") || scope.includes("ERROR") || scope.includes("TEST") || scope.includes("SIMULATION") || scope.includes("FAIL");
        if (isCritical) {
            process.stdout.write(`\x1b[33mB"H ${content}\x1b[0m\n`);
        }
    },

    section(title) {
        this.log("=== SESSION ===", title);
    }
};
