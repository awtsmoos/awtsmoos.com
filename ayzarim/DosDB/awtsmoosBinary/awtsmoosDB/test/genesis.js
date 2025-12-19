
// B"H
/**
 * @file genesis.js
 * @description
 *  THE GENESIS SIMULATION.
 *  
 *  This is the Capstone Test. It does not test features in isolation.
 *  It weaves them into a single reality.
 */

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../index.js');

const DB_PATH = path.join(__dirname, 'genesis.db');

const log = (msg) => console.log(`\x1b[35m[GENESIS]\x1b[0m ${msg}`);
const assert = (cond, msg) => {
    if (!cond) {
        console.error(`\x1b[31m[FAIL]\x1b[0m ${msg}`);
        process.exit(1);
    }
};

// --- Custom Class Definition ---
class LifeForm {
    constructor(name, element, bio) {
        this.name = name;
        this.element = element; // "Fire", "Water", etc.
        this.bio = bio;
        this.inventory = ["Soul Spark"];
        this.status = { hp: 100, mana: 100 };
    }
    
    castSpell() {
        return `${this.name} casts ${this.element} Blast!`;
    }
}

// Register class globally for hydration
globalThis.LifeForm = LifeForm;

async function runSimulation() {
    log("B\"H - Initiating The Genesis Simulation...");

    // 1. Tzimtzum (Cleanup)
    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(DB_PATH + '.wal')) fs.unlinkSync(DB_PATH + '.wal');

    // B"H: Enable Debug for Vector Tracing
    let db = new AwtsmoosDB(DB_PATH, { debug: false});
    await db.open();

    try {
        // =================================================================
        // DAY 1: FORMATION (Schema & Indexing)
        // =================================================================
        log("\n[Day 1] Formation of the Vessels...");
        
        await db.createMap(db.root, "universe");
        await db.createList(db.root.universe, "beings");
        
        // Enable All Indices on the 'beings' collection
        // B"H: New API
        await db.search.enable(db.root.universe.beings); // Text
        await db.vector.enable(db.root.universe.beings, { dimensions: 4, metric: 'cosine' }); // Vector
        
        await db.waitForIdle();
        log("    ✅ Indices Active (Text + Vector).");


        // =================================================================
        // DAY 2: CREATION (Population with Custom Classes)
        // =================================================================
        log("\n[Day 2] Breathing Life (Custom Classes)...");
        
        const ELEMENTS = ["Fire", "Water", "Air", "Earth"];
        // Base Vectors
        const VECTORS = {
            "Fire":  [1.0, 0.0, 0.0, 0.0],
            "Water": [0.0, 1.0, 0.0, 0.0],
            "Air":   [0.0, 0.0, 1.0, 0.0],
            "Earth": [0.0, 0.0, 0.0, 1.0]
        };

        const POPULATION = 50;
        const creationPromises = [];

        for(let i=0; i<POPULATION; i++) {
            const el = ELEMENTS[i % 4];
            let vec = VECTORS[el];

            // B"H: The Prophecy requires the Chosen One to be UNIQUE.
            if (el === "Fire" && i > 0) {
                vec = [0.9, 0.1, 0.0, 0.0]; // Diluted
            }

            const entity = new LifeForm(
                `Entity_${i}`, 
                el, 
                `Born of ${el}. Seeker of the ${i % 2 === 0 ? "Light" : "Darkness"}.`
            );
            
            // Wrap in object to attach ID and Vector for indexing
            const record = {
                id: `ent_${i}`,
                data: entity, // Nested Custom Class
                vector: vec, // For HNSW
                txt: entity.bio      // For ASE
            };
            
            creationPromises.push(db.root.universe.beings.push(record));
        }

        await Promise.all(creationPromises);
        await db.waitForIdle();
        log(`    ✅ Created ${POPULATION} Complex LifeForms.`);


        // =================================================================
        // DAY 3: CONNECTION (Graph Topology)
        // =================================================================
        log("\n[Day 3] Wiring the Web (Graph Relationships)...");
        
        const prophet = db.root.universe.beings[0];
        const disciple = db.root.universe.beings[1];
        const villain = db.root.universe.beings[49];

        // Connect them using the LiveHandles
        // B"H: New API
        await db.graph.connect(prophet, disciple, "TEACHES", { since: "Epoch 1" });
        await db.graph.connect(disciple, prophet, "FOLLOWS", { devotion: 100 });
        await db.graph.connect(villain, prophet, "ENEMY_OF", { malice: 9000 });
        
        await db.waitForIdle();
        log("    ✅ Graph Topology Established.");


        // =================================================================
        // DAY 4: THE PROPHECY (Complex Query & Vector Search)
        // =================================================================
        log("\n[Day 4] The Prophecy (Vector + Query + Graph)...");

        // 1. Find the Prophet via Soul (Vector)
        const searchVec = [0.99, 0.01, 0.0, 0.0]; 
        // B"H: New API
        const nearest = await db.vector.nearest(db.root.universe.beings, searchVec, 1);
        
        if (nearest.length === 0) {
             throw new Error("Day 4: Vector Search failed completely (0 results).");
        }

        const prophetFound = nearest[0].item;
        log(`    Vector Search Found: ${prophetFound.data.name} (Score: ${nearest[0].score})`);
        
        assert(prophetFound.data.name === "Entity_0", `Vector Search failed. Expected Entity_0, got ${prophetFound.data.name}`);

        // 2. Who searches for the Light? (Text Search)
        // B"H: New API
        const seekers = await db.search.run(db.root.universe.beings, "seeker light");
        log(`    Text Search 'seeker light': Found ${seekers.length} beings.`);
        assert(seekers.length === 25, `Expected 25 Light Seekers, got ${seekers.length}`);

        // 3. Graph Query
        const prophetHandle = db.root.universe.beings[0];
        
        // B"H: New API
        const enemies = await db.graph.getRelationships(prophetHandle, "IN", "ENEMY_OF");
        const villainNode = enemies[0].node;
        const villainName = await villainNode.data.name;
        
        log(`    Graph Traversal: Prophet's Enemy is ${villainName}`);
        assert(villainName === "Entity_49", "Graph Traversal failed");


        // =================================================================
        // DAY 5: INTERVENTION (Splicing & Mutation)
        // =================================================================
        log("\n[Day 5] Divine Intervention (Splice & Update)...");
        log("    [Trace] Reading Prophet Data...");
        
        // 1. Get the Prophet's data object wrapper
        const pData = await db.root.universe.beings[0].data;
        
        // 2. Push to inventory
        pData.inventory.push("The Tablets of Code");
        pData.status.mana = 9999;
        
        // 3. Write back (Update the record in the list)
        const updatedRecord = {
            id: 'ent_0',
            data: pData,
            vector: VECTORS["Fire"],
            txt: pData.bio + " REBORN"
        };
        
        log("    [Trace] Splicing Prophet (Delete 0, Insert New)...");
        // B"H: Splicing destroys the old node pointer, thus removing its graph edges.
        // We must re-establish the connection to maintain the web.
        await db.root.universe.beings.splice(0, 1, updatedRecord);
        
        log("    [Trace] Restoring Graph Connections...");
        // Restore Graph Connections for the New Prophet Node
        const newProphet = db.root.universe.beings[0];
        const newVillain = db.root.universe.beings[49];
        // B"H: New API
        await db.graph.connect(newVillain, newProphet, "ENEMY_OF", { malice: 9000 }); // Re-link enemy
        
        await db.waitForIdle();
        
        // 4. Verify Update via Search Index
        // B"H: New API
        const rebornSearch = await db.search.run(db.root.universe.beings, "reborn");
        log(`    Search for 'reborn': Found ${rebornSearch.length}`);
        assert(rebornSearch.length === 1, "Index update on Splice failed");
        assert(rebornSearch[0].id === 'ent_0', "Wrong entity indexed");
        
        log("    ✅ Intervention Successful.");


        // =================================================================
        // DAY 6: THE LONG SLEEP (Persistence)
        // =================================================================
        log("\n[Day 6] The Long Sleep (Persistence)...");
        await db.close();
        
        delete globalThis.LifeForm; 
        
        // B"H: Open with Debug on Day 7 to trace HNSW Load
        const db2 = new AwtsmoosDB(DB_PATH, { debug: false });
        await db2.open();
        
        // =================================================================
        // DAY 7: JUDGMENT (Verification)
        // =================================================================
        log("\n[Day 7] Judgment Day (Verification)...");
        
        // 1. Check Custom Class Rehydration
        const messiah = await db2.root.universe.beings[0];
        const mData = messiah.data;
        
        log(`    Resurrected Name: ${mData.name}`);
        log(`    Resurrected Class: ${mData.constructor.name}`);
        log(`    Resurrected Inventory: ${JSON.stringify(mData.inventory)}`);
        
        if (mData.castSpell) {
            log(`    Magic Check: ${mData.castSpell()}`);
        } else {
            log("    (Class methods not hydrated automatically without global registration, but data is safe)");
        }

        assert(mData.name === "Entity_0", "Name corrupted");
        assert(mData.inventory.includes("The Tablets of Code"), "Inventory update lost");
        assert(mData.status.mana === 9999, "Deep prop update lost");

        // 2. Check Vector Index Persistence
        log("    [Trace] Executing Vector Search for Entity_0...");
        
        // B"H: Search for Pure Fire [1,0,0,0]
        // Entity_0 should be the ONLY one with exactly [1,0,0,0] (others are diluted [0.9, ...])
        // B"H: New API
        const vCheck = await db2.vector.nearest(db2.root.universe.beings, [1,0,0,0], 5);
        
        log("    [Trace] Vector Results:");
        vCheck.forEach((r, i) => {
            log(`        ${i+1}. ID: ${r.item.id} Score: ${r.score} Name: ${r.item.data.name}`);
        });
        
        if (vCheck.length === 0) throw new Error("Vector Index lost persistence (Empty Result)");
        
        const topResult = vCheck[0].item;
        assert(topResult.id === 'ent_0', `Vector Index incorrect match. Got ${topResult.id} (${topResult.data.name})`);

        // 3. Check Graph Persistence
        const pNode = db2.root.universe.beings[0];
        // B"H: New API
        const pEnemies = await db2.graph.getRelationships(pNode, "IN", "ENEMY_OF");
        assert(pEnemies.length === 1, "Graph Edge lost persistence");
        
        // 4. Check Sequence Integrity
        const count = await db2.root.universe.beings.length;
        assert(count === POPULATION, `Population Count Mismatch: ${count}`);

        log("\n✅ B\"H - THE GENESIS SIMULATION IS COMPLETE. THE UNIVERSE IS STABLE.");
        await db2.close();

    } catch (e) {
        console.error("\n❌ SIMULATION COLLAPSE:", e);
        process.exit(1);
    }
}

runSimulation();
