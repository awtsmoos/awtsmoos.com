
// B"H
/**
 * @file singularity_test.js
 * @description
 *  SEDER HISHTALSHELUS (The Order of Evolution).
 *  
 *  A Kabbalistic simulation testing the limits of AwtsmoosDB.
 *  It simulates the flow of light (Data) into vessels (Structures),
 *  the breaking of vessels (Stress/Concurrency), and the repair (Persistence/Recovery).
 */

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../index.js');

const DB_PATH = path.join(__dirname, 'hishtalshelus.db');

// --- The Ten Sefiros of Logging ---
const COLORS = {
    Keter: "\x1b[1m\x1b[37m", // White/Bold
    Chesed: "\x1b[34m", // Blue
    Gevurah: "\x1b[31m", // Red
    Tiferet: "\x1b[35m", // Purple
    Netzach: "\x1b[32m", // Green
    Hod: "\x1b[33m", // Orange/Yellow
    Yesod: "\x1b[36m", // Cyan
    Malchut: "\x1b[30m\x1b[47m", // Black on White
    Reset: "\x1b[0m"
};

const log = (sefirah, msg) => console.log(`${COLORS[sefirah]}[${sefirah}] ${msg}${COLORS.Reset}`);
const assert = (cond, msg) => {
    if (!cond) {
        console.error(`\x1b[41m[DIN] JUDGMENT FAILED: ${msg}\x1b[0m`);
        process.exit(1);
    }
};

async function runSimulation() {
    log("Keter", "B\"H - Initiating Seder Hishtalshelus (Cosmic Data Evolution)...");

    // 1. TZIMTZUM (Contraction/Cleanup)
    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + '.wal')) fs.unlinkSync(DB_PATH + '.wal');

    const db = new AwtsmoosDB(DB_PATH, { debug: false });
    await db.open();

    try {
        // =================================================================
        // PHASE 1: CHESED (The Infinite Flow)
        // Injecting 3,000 Souls with Vectors, Text, and Deep Data.
        // =================================================================
        log("Chesed", "The Light Flows: Creating 3,000 Souls...");
        
        await db.root.createList("souls");
        await db.root.souls.enableVectorIndex({ dimensions: 4, metric: 'cosine' });
        await db.root.souls.enableSearch();

        const TOTAL_SOULS = 3000;
        const BATCH_SIZE = 500;
        
        const startChesed = Date.now();

        // We use Batches to minimize I/O overhead (The vessel must hold the light)
        for (let b = 0; b < TOTAL_SOULS; b += BATCH_SIZE) {
            await db.batch(async () => {
                for (let i = 0; i < BATCH_SIZE; i++) {
                    const idx = b + i;
                    // Generate a "Soul"
                    const vec = [
                        Math.sin(idx), 
                        Math.cos(idx), 
                        Math.tan(idx/1000), 
                        Math.random()
                    ];
                    
                    const soul = {
                        id: `neshamah_${idx}`,
                        name: `Soul Number ${idx}`,
                        // Deep Nesting (Binah)
                        yichud: {
                            level: Math.floor(idx / 100),
                            shoresh: {
                                origin: "Adam Kadmon",
                                sparks: idx
                            }
                        },
                        // Text for Search (Da'at)
                        bio: idx % 2 === 0 ? "A spark of wisdom from the upper worlds." : "A hidden light in the darkness.",
                        // Vector for Similarity (Chochmah)
                        vector: vec
                    };
                    
                    await db.root.souls.push(soul);
                }
            });
            process.stdout.write(COLORS.Chesed + "." + COLORS.Reset);
        }
        
        const durChesed = Date.now() - startChesed;
        console.log("");
        log("Chesed", `Creation complete in ${durChesed}ms.`);
        
        const count = await db.root.souls.length;
        assert(count === TOTAL_SOULS, `Soul Count Mismatch: ${count}`);


        // =================================================================
        // PHASE 2: GEVURAH (The Restriction)
        // Massive Deletion. Cutting the first 1,000 souls.
        // =================================================================
        log("Gevurah", "The Judgment: Tzimtzum (Pruning 1,000 Souls)...");
        
        const REMOVED_COUNT = 1000;
        await db.root.souls.splice(0, REMOVED_COUNT);
        await db.waitForIdle();
        
        const remaining = await db.root.souls.length;
        log("Gevurah", `Remaining Souls: ${remaining}`);
        assert(remaining === TOTAL_SOULS - REMOVED_COUNT, "Gevurah failed to restrict correctly.");
        
        // Check Index Integrity
        // The first item should now be ID 1000
        const firstSoul = await db.root.souls[0];
        assert(firstSoul.id === "neshamah_1000", `Shift Logic Failed. First soul is ${firstSoul.id}`);


        // =================================================================
        // PHASE 3: TIFERET (Harmony & Search)
        // Testing Full-Text and Vector Search on the remaining set.
        // =================================================================
        log("Tiferet", "The Harmony: Seeking the Hidden Light...");
        
        // 1. Text Search
        const hiddenSparks = await db.root.souls.search("hidden light");
        log("Tiferet", `Found ${hiddenSparks.length} hidden sparks via Text Search.`);
        // Roughly half of 2000 should match
        assert(hiddenSparks.length > 900 && hiddenSparks.length < 1100, "Text Search logic flawed.");

        // 2. Vector Search (Chochmah)
        // Let's find neighbors of Soul 1500
        const pivotSoul = await db.root.souls[500]; // Index 500 is ID 1500
        log("Tiferet", `Seeking neighbors for ${pivotSoul.name}...`);
        
        const nearest = await db.root.souls.nearest(pivotSoul.vector, 5);
        log("Tiferet", `Found ${nearest.length} kindred spirits.`);
        
        assert(nearest.length === 5, "Vector k-NN failed.");
        assert(nearest[0].item.id === pivotSoul.id, "Self-identity not preserved in Vector Space.");


        // =================================================================
        // PHASE 4: YESOD (Foundation / Graph)
        // Creating relationships and running PageRank.
        // =================================================================
        log("Yesod", "The Connection: Wiring the Web of Life...");
        
        // We need stable references. Let's create a Map for the graph nodes to ensure identity.
        await db.root.createMap("network");
        
        const NETWORK_SIZE = 500;
        const EDGES_PER_NODE = 3;
        
        await db.batch(async () => {
            // Materialize nodes
            for(let i=0; i<NETWORK_SIZE; i++) {
                await db.root.network.createMap(`node_${i}`);
                await db.root.network[`node_${i}`].set("energy", Math.random());
            }
            
            // Connect them randomly (Gilgul)
            for(let i=0; i<NETWORK_SIZE; i++) {
                const source = db.root.network[`node_${i}`];
                for(let j=0; j<EDGES_PER_NODE; j++) {
                    const targetIdx = Math.floor(Math.random() * NETWORK_SIZE);
                    if (targetIdx === i) continue;
                    const target = db.root.network[`node_${targetIdx}`];
                    await source.relateTo(target, "GILGUL", { strength: Math.random() });
                }
            }
        });
        
        log("Yesod", "Calculating PageRank (The Tzadik of the Generation)...");
        
        // We need to run this on the graph manager.
        // Note: graph.pageRank() scans the whole graph.
        const ranks = await db.graph.pageRank({ iterations: 15 });
        const tzadik = ranks[0];
        
        log("Yesod", `The Tzadik is ${tzadik.id} with score ${tzadik.score.toFixed(4)}`);
        assert(ranks.length > 0, "PageRank yielded no results.");


        // =================================================================
        // PHASE 5: HOD (Splendor / Concurrency)
        // Shevirat HaKelim: Intense parallel updates attempting to break the structure.
        // =================================================================
        log("Hod", "The Breaking: 500 Concurrent Updates to a Fractal...");
        
        await db.root.createMap("fractal");
        await db.root.fractal.set("core", { stability: 100 });
        
        const ATTACKERS = 500;
        const promises = [];
        
        for(let i=0; i<ATTACKERS; i++) {
            promises.push(
                db.root.fractal.set(`shard_${i}`, { chaos_level: i })
            );
        }
        
        await Promise.all(promises);
        await db.waitForIdle();
        
        // Verify Stability
        let shardCount = 0;
        for await (const shard of db.root.fractal) {
            shardCount++;
        }
        // Core + 500 shards = 501
        log("Hod", `Fractal Shards Counted: ${shardCount}`);
        assert(shardCount === 501, `Concurrency Fracture! Expected 501, got ${shardCount}`);


        // =================================================================
        // PHASE 6: NETZACH (Eternity / Persistence)
        // Histalkus: Death and Resurrection.
        // =================================================================
        log("Netzach", "Histalkus: Closing the Gates...");
        await db.close();
        
        log("Netzach", "Techiyas HaMeisim: Reopening...");
        const db2 = new AwtsmoosDB(DB_PATH);
        await db2.open();
        
        // Verify Chesed (Soul Count)
        const rebornSouls = await db2.root.souls.length;
        assert(rebornSouls === 2000, "Souls did not survive the transition.");
        
        // Verify Yesod (Graph)
        const node0 = db2.root.network.node_0;
        const edges = await node0.relationships("OUT", "GILGUL");
        assert(edges.length === EDGES_PER_NODE, "Graph connections severed.");
        
        // Verify Hod (Fractal)
        const fractalCheck = await db2.root.fractal.shard_499;
        assert(fractalCheck.chaos_level === 499, "Fractal data corrupted.");

        log("Netzach", "The Data is Eternal.");
        await db2.close();

        // =================================================================
        // FINAL: MALCHUT (Kingship)
        // Completion.
        // =================================================================
        log("Malchut", "The Vessel is Complete. The Light is Infinite.");
        console.log(`\n\x1b[42m\x1b[30m B"H - SEDER HISHTALSHELUS COMPLETED SUCCESSFULLY. \x1b[0m`);

    } catch (e) {
        console.error("\n\x1b[41m!!! KLIPAH (Evil Shell) DETECTED - FAILURE !!!\x1b[0m");
        console.error(e);
        process.exit(1);
    }
}

runSimulation();
