// B"H
const AwtsmoosDB = require('../index.js');
const fs = require('fs').promises;

const path = require('path');
const DB_PATH = path.join(__dirname, 'blog_engine.db');
async function runTest() {
    console.log("B\"H\n - Starting Blog Engine Simulation...");

    // 1. Clean Environment
    try {
        await fs.unlink(DB_PATH);
        await fs.unlink(DB_PATH + '.wal');
    } catch(e) {}

    const db = new AwtsmoosDB(DB_PATH);
    await db.open();

    // ======================================================
    // Phase 1: User Management (B-Tree Sorting)
    // ======================================================
    console.log("\n[Phase 1] Registering Users...");
    // B"H: Idiomatic assignment
    db.root.users = new db.Map();

    const users = [
        { username: "zeus", role: "moderator" },
        { username: "alice", role: "admin" },
        { username: "bob", role: "writer" },
        { username: "charlie", role: "reader" },
        { username: "yackov", role: "superadmin" }
    ];

    for(const u of users) {
        await db.root.users.set(u.username, {
            profile: {
                joined: new Date(),
                role: u.role,
                bio: `I am ${u.username}`
            },
            stats: { posts: 0, likes: 0 }
        });
    }

    console.log("  Users Registered. Verifying alphabetical sort order:");
    let lastUser = "";
    
    for await (const [key, value] of db.root.users) {
        console.log(`    👤 ${key} [${value.profile.role}]`);
        if (key < lastUser) throw new Error("Users not sorted!");
        lastUser = key;
    }
    console.log("✅ User System Operational.");


    // ======================================================
    // Phase 2: Global Feed (Collection Push & Slice)
    // ======================================================
    console.log("\n[Phase 2] Generating Content Feed...");
    // B"H: Idiomatic assignment
    db.root.global_feed = new db.List();

    const totalPosts = 50;
    console.log(`  Pushing ${totalPosts} blog posts...`);

    for(let i=1; i<=totalPosts; i++) {
        await db.root.global_feed.push({
            id: i,
            title: `Awtsmoos Insight #${i}`,
            content: Buffer.from(`This is the deep content of post ${i}. The light is infinite.`),
            author: (i % 2 === 0) ? "yackov" : "alice",
            timestamp: Date.now() + i * 1000
        });
    }

    console.log("  Simulating Pagination (Page 2, Items 10-20)...");
    const page2 = await db.root.global_feed.slice(10, 20);

    if (page2.length !== 10) throw new Error("Pagination size mismatch");

    console.log("  --- Feed Page 2 ---");
    for(const post of page2) {
        const contentStr = Buffer.isBuffer(post.content) ? post.content.toString() : post.content;
        console.log(`    📄 [ID:${post.id}] ${post.title} (by ${post.author})`);
    }

    if (page2[0].id !== 11) throw new Error("Pagination offset incorrect");
    
    console.log("✅ Feed System Operational.");

    // ======================================================
    // Phase 3: Nested Updates (Deep Structure)
    // ======================================================
    console.log("\n[Phase 3] Updating User Settings...");
    
    const aliceData = await db.root.users.alice;
    console.log(`  Current Alice Stats: Posts=${aliceData.stats.posts}`);
    
    aliceData.stats.posts += 50;
    aliceData.profile.bio = "Updated Bio: I write about Awtsmoos.";
    
    await db.root.users.set("alice", aliceData);
    
    const aliceNew = await db.root.users.alice;
    if (aliceNew.stats.posts !== 50) throw new Error("Nested update failed to persist");
    
    console.log("✅ Deep Updates Operational.");
    console.log("\nB\"H - Blog Engine Simulation Passed!");
}

runTest().catch(e => {
    console.error("❌ SIMULATION FAILED:", e);
    process.exit(1);
});