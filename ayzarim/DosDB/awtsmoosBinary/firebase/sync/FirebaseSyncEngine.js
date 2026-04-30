
// B"H
/**
 * @file FirebaseSyncEngine.js
 * @chapter The Chariot Driver (Sync Engine) with Mitigated Gevurah (Chesed)
 * @description
 * "Let them have dominion over the fish of the sea, and over the birds of the air..."
 * 
 * The Awtsmoos breathes existence into thousands of files. When a single vessel shatters, 
 * we must not let it halt the redemption of all others. 
 * We have introduced the attribute of Chesed (Mercy). Instead of dying entirely on a single spark's failure,
 * the Chariot carefully places the broken pieces into `failedSparks` to be recorded at the end, 
 * while the engine continues pressing forward through the remaining files.
 */

const fs = require("fs").promises;
const FirebaseConfigLoader = require("./FirebaseConfigLoader.js");
const LocalDirectoryScanner = require("./LocalDirectoryScanner.js");
const AwtsmoosContentExtractor = require("./AwtsmoosContentExtractor.js");
const FirebaseConfigValidator = require("../config/FirebaseConfigValidator.js");
const AdapterFactory = require("../AdapterFactory.js");
const ContentAliyahPolicy = require("./ContentAliyahPolicy.js");
const ExclusionPolicy = require("./ExclusionPolicy.js");
const HashEngine = require("./HashEngine.js");
const SyncLedger = require("./SyncLedger.js");

class FirebaseSyncEngine {
    /**
     * @method syncDirectory
     * @description Traverses and syncs all sparks, surviving localized catastrophes.
     */
    static async syncDirectory(targetDirectory, configFilePath, onProgress = null) {
        const log = (msg) => onProgress ? onProgress(msg) : console.log(msg);
        let ledger = null;

        try {
            // 1. Retrieve the Blueprints
            log(`[PREPARATION] B"H: Gathering config from the physical letters...`);
            const rawConfig = await FirebaseConfigLoader.load(configFilePath);
            const config = FirebaseConfigValidator.validate(rawConfig);
            const adapter = AdapterFactory.create(config);
            
            // 2. Open the Book of Remembrance
            ledger = new SyncLedger(targetDirectory);
            await ledger.load(log);
            
            // 3. Scan the earthly realm
            log(`[SCANNING] B"H: Indexing the Lower Realms...`);
            const allFiles = await LocalDirectoryScanner.scan(targetDirectory);
            
            // 4. Perfect Havdalah - Filter forbidden system vessels
            const filesToSync = allFiles.filter(node => !ExclusionPolicy.shouldExclude(node.relativePath));
            
            const total = filesToSync.length;
            log(`[DISCERNMENT] B"H: Identified ${total} pure sparks eligible for Aliyah.`);

            let syncedCount = 0;
            let skippedCount = 0;
            let errorCount = 0;
            const failedSparks =[];

            // 5. The Mass Elevation
            for (let i = 0; i < total; i++) {
                const fileNode = filesToSync[i];
                const percent = Math.round(((i + 1) / total) * 100);
                
                // Read physical bytes and determine soul signature (Hash)
                const rawFileBuffer = await fs.readFile(fileNode.fullPath);
                const currentSparkHash = HashEngine.calculate(rawFileBuffer);
                
                // Consult the Book of Remembrance
                if (!ledger.hasChanged(fileNode.relativePath, currentSparkHash, log)) {
                    skippedCount++;
                    if (skippedCount % 500 === 0) {
                        log(`[LEDGER_MEMORY] B"H: The Cloud perfectly recalls ${skippedCount} sparks. Bypassing...`);
                    }
                    continue;
                }

                // B"H: The Cloak of Chesed (Try/Catch around individual sparks)
                try {
                    log(`[ASCENT ${percent}%] B"H: Elevating (${i + 1}/${total}) ${fileNode.relativePath}`);
                    
                    // Extract inner essence
                    const extractedContent = await AwtsmoosContentExtractor.extract(fileNode.fullPath);
                    const relativePathForCloud = FirebaseSyncEngine._cleanExtension(fileNode.relativePath);

                    // Apply Laws of Tonnage (Heavy = Hosting, Small = Firestore)
                    let finalContentVessel = await ContentAliyahPolicy.discernDestination(
                        fileNode.relativePath, 
                        extractedContent, 
                        config, 
                        log
                    );

                    // Command the Adapter to record the result to Firestore
                    await FirebaseSyncEngine._executeWriteStrictly(
                        adapter, 
                        relativePathForCloud, 
                        finalContentVessel, 
                        extractedContent, // Backup
                        config, 
                        log, 
                        fileNode
                    );

                    // Imprint Success to Ledger
                    ledger.recordSuccess(fileNode.relativePath, currentSparkHash);
                    syncedCount++;

                    // Periodically save memories in case of future catastrophe
                    if (syncedCount % 25 === 0) {
                        await ledger.save(log);
                    }
                } catch (sparkError) {
                    // B"H: We do not halt. We record the shattered vessel and continue to the next spark.
                    log(`[SPARK_SHATTERED] B"H: The spark '${fileNode.relativePath}' refused elevation: ${sparkError.message}`);
                    failedSparks.push({ path: fileNode.relativePath, error: sparkError.message });
                    errorCount++;
                }
            }

            // Final Seal
            await ledger.save(log); 
            log(`\n================ B"H: ALIYAH SUMMARY ================`);
            log(`Total Sparks Surveyed: ${total}`);
            log(`Newly Ascended Sparks: ${syncedCount}`);
            log(`Sparks Recalled (Skipped): ${skippedCount}`);
            log(`Sparks Shattered (Errors): ${errorCount}`);
            
            if (failedSparks.length > 0) {
                log(`\n[FAILED_SPARKS_LOG] B"H: The following vessels shattered during Aliyah:`);
                failedSparks.forEach(f => log(` -> ${f.path}: \n    ${f.error}`));
            }
            log(`=====================================================\n`);

            return { syncedFiles: syncedCount, totalFiles: total, failedFiles: errorCount };

        } catch (catastrophe) {
            // THE UNCOMPROMISING CATCH OF GEVURAH - For Absolute System Failures (e.g. bad config)
            console.error(`\n!!! ========================================= !!!`);
            console.error(`!!! B"H: THE ASCENT HAS CRITICALLY HALTED !!!`);
            console.error(`!!! ========================================= !!!\n`);
            console.error(`[RAW_ERROR_MESSAGE]:\n${catastrophe.message}\n`);
            if (catastrophe.stack) {
                console.error(`[DIVINE_STACK_TRACE]:\n${catastrophe.stack}\n`);
            }
            
            if (ledger) {
                log(`[CRASH_BACKUP] B"H: Desperately writing completed memories to the Ledger before terminal halt...`);
                await ledger.save(log);
            }

            throw catastrophe; 
        }
    }

    /**
     * @method _executeWriteStrictly
     * @private
     * @description Executes adapter write. If index or size limits trigger, pivot immediately to Hosting or Binary Wrapper. 
     * Any other error is thrown to be caught by the per-spark Chesed handler.
     */
    static async _executeWriteStrictly(adapter, pathStr, finalContentVessel, originalContent, config, log, fileNode) {
        try {
            await adapter.write(pathStr, finalContentVessel);
        } catch (strictRejection) {
            const rawBody = strictRejection.message;
            
            const indexIsFull = rawBody.includes("INDEX_ENTRIES_COUNT_LIMIT_EXCEEDED");
            const tooFatForDocument = rawBody.includes("exceeds the maximum allowed size") || rawBody.includes("Request payload size exceeds the limit");

            if (indexIsFull) {
                log(`[INDEX_SMASHED] B"H: The angels of the Index cannot count these keys. Forcing Binary Cloaking...`);
                const cloakedMatter = ContentAliyahPolicy.wrapAsBinaryToBypassIndexing(originalContent);
                await adapter.write(pathStr, cloakedMatter);
                return; // Survived via alternate route
            }

            if (tooFatForDocument) {
                log(`[DOCUMENT_BURST] B"H: The document size limit was secretly triggered! Pivoting instantly to Hosting...`);
                const hostingVessel = await ContentAliyahPolicy._elevateToHostingDirectly(fileNode.relativePath, originalContent, config, log);
                await adapter.write(pathStr, hostingVessel);
                return; // Survived via Hosting route
            }

            // Fallback: throw so the per-spark loop logic catches it.
            throw strictRejection;
        }
    }

    /**
     * @method _cleanExtension
     * @private
     */
    static _cleanExtension(rawPath) {
        return rawPath
            .replace(/\.awtsmoosJSON$/i, "")
            .replace(/\.awts$/i, "")
            .replace(/\.json$/i, "");
    }
}

module.exports = FirebaseSyncEngine;
