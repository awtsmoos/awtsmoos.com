// B"H
/**
 * @file blog_engine_simulation.js
 * @description
 *  A vivid synchronous simulation of a blog engine.
 *  Uses strictly synchronous operations.
 */

const AwtsmoosDB = require('../index.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'blog_engine.db');

function runTest() {
    console.log(`\x1b[36mB"H [SIMULATION] Starting Hyper-Verbose Blog Engine Ritual (SYNC)...\x1b[0m`);

    try {
        if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
        if (fs.existsSync(DB_PATH + '.wal')) fs.unlinkSync(DB_PATH + '.wal');
    } catch(e) {}

    const db = new AwtsmoosDB(DB_PATH, { debug: true });
    db.open();
    console.log(`  [Database] Awakened at ${DB_PATH}.`);

    // ======================================================
    // Phase 1: User Management (B-Tree Sorting)
    // ======================================================
    console.log(`\n\x1b[35m[Phase 1] Manifesting User Map (B-Tree Sorting)...\x1b[0m`);
    
    db.root.users = new db.Map();

    const users = [
        { username: "zeus", role: "moderator" },
        { username: "alice", role: "admin" },
        { username: "bob", role: "writer" },
        { username: "charlie", role: "reader" },
        { username: "yackov", role: "superadmin" }
    ];

    for(const u of users) {
        console.log(`  B"H [USER_SET] Manifesting ${u.username}...`);
        db.root.users.set(u.username, {
            profile: {
                joined: new Date(),
                role: u.role,
                bio: `B"H - I am ${u.username}.`
            },
            stats: { posts: 0, likes: 0 }
        });
    }

    db.waitForIdle();
    console.log(`  [Persistence] Phase 1 Flushed.`);

    const userKeys = db.keys(db.root.users);
    if (userKeys[0] !== "alice") throw new Error("Sort failed");
    console.log(`\x1b[32m✅ User System Operational.\x1b[0m`);

    // ======================================================
    // Phase 2: Global Feed (Collection Push & Slice)
    // ======================================================
    console.log(`\n\x1b[35m[Phase 2] Generating Content Feed...\x1b[0m`);
    db.root.global_feed = new db.List();

    const totalPosts = 30;
    for(let i=1; i<=totalPosts; i++) {
        const author = (i % 2 === 0) ? "yackov" : "alice";
        db.root.global_feed.push({
            id: i,
            title: `Awtsmoos Insight #${i}`,
            content: Buffer.from(`Content ${i}`),
            author,
            timestamp: Date.now() + i * 1000
        });
    }

    console.log(`\x1b[32m  [Success] Feed Manifested. Attempting Pagination...\x1b[0m`);
    const page2 = db.root.global_feed.slice(10, 20);

    if (page2.length !== 10) throw new Error("Pagination size mismatch");
    if (page2[0].id !== 11) throw new Error("Pagination offset incorrect");
    
    db.waitForIdle();
    console.log(`\x1b[32m✅ Feed System Operational.\x1b[0m`);

    // ======================================================
    // Phase 3: Nested Updates (Deep Structure)
    // ======================================================
    console.log(`\n\x1b[35m[Phase 3] Performing Deep Vessel Transformation...\x1b[0m`);
    
    // B"H: Synchronous Deep Update
    // aliceHandle implies db.root.users.alice
    const aliceHandle = db.root.users.alice;
    
    console.log(`    Current Alice Stats: Posts=${aliceHandle.stats.posts}`);
    
    console.log(`  B"H [MUTATION] Injecting new data into memory objects...`);
    
    // Direct synchronous updates on handles
    aliceHandle.stats.posts += 50; 
    aliceHandle.profile.bio = "Updated Bio: I write about Unity.";
    
    console.log(`  B"H [PERSISTENCE] Updates written to disk immediately.`);
    
    console.log(`  B"H [VERIFICATION] Re-awakening Alice from the database disk...`);
    db.waitForIdle();
    db._structureCache.clear();
    
    const aliceNew = db.root.users.alice;
    // B"H: Access property triggers read from disk
    const newPosts = aliceNew.stats.posts; 
    const newBio = aliceNew.profile.bio;

    console.log(`    New Alice Stats: Posts=${newPosts}`);
    console.log(`    New Alice Bio: '${newBio}'`);

    if (newPosts !== 50) {
        throw new Error(`Nested update failed to persist. Got ${newPosts}, expected 50.`);
    }
    
    console.log(`\x1b[32m✅ Deep Updates Operational.\x1b[0m`);
    console.log(`\n\x1b[36m\x1b[1mB"H - Blog Engine Simulation Passed Flawlessly!\x1b[0m`);
}

if (require.main === module) {
    try {
        runTest();
    } catch(e) {
        console.error(`\n\x1b[31m❌ SIMULATION FAILED:\x1b[0m`, e);
        process.exit(1);
    }
}

module.exports = runTest;