
// B"H
/**
 * @file SyncLedger.js
 * @chapter The Persistent Book of Remembrance
 * @description
 * "He remembers the forgotten things."
 * 
 * To solve the 'Re-uploading' mystery, we have reinforced the Ledger. 
 * It now uses absolute paths and provides verbal confirmation of its 
 * memories. We ensure the ledger is saved whenever a spark reaches 
 * the cloud, so that progress is never lost to a crash.
 */

const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");

class SyncLedger {
    constructor(dbRoot) {
        this.ledgerPath = path.resolve(dbRoot, ".awtsmoos_sync_ledger.json");
        this.data = {};
        this.isDirty = false;
    }

    async load(log) {
        try {
            if (fsSync.existsSync(this.ledgerPath)) {
                const raw = await fs.readFile(this.ledgerPath, "utf8");
                this.data = JSON.parse(raw);
                log(`[LEDGER_LOADED] B"H: Recalled memory of ${Object.keys(this.data).length} sparks.`);
            } else {
                log(`[LEDGER_NEW] B"H: A new book has been opened.`);
            }
        } catch (e) {
            log(`[LEDGER_FAIL] B"H: Memory recall failed: ${e.message}`);
            this.data = {};
        }
    }

    hasChanged(relativePath, currentHash, log) {
        const record = this.data[relativePath];
        if (!record) {
            // No memory of this spark
            return true;
        }
        if (record.hash !== currentHash) {
            // The spark has been transformed
            return true;
        }
        // The spark is identical to the memory
        return false;
    }

    recordSuccess(relativePath, hash) {
        this.data[relativePath] = {
            hash,
            timestamp: Date.now()
        };
        this.isDirty = true;
    }

    async save(log) {
        if (!this.isDirty) return;
        try {
            const content = JSON.stringify(this.data);
            await fs.writeFile(this.ledgerPath, content, "utf8");
            this.isDirty = false;
            if (log) log(`[LEDGER_SAVED] B"H: Memories persisted to ${this.ledgerPath}`);
        } catch (e) {
            console.error(`B"H: Ledger save failed: ${e.message}`);
        }
    }
}

module.exports = SyncLedger;
