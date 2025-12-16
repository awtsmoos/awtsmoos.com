
B"H

# AwtsmoosDB: The Fractal Database of Infinite Light

> *"In the beginning there was the Object. And the Object was with the Disk, and the Object WAS the Disk."*

**AwtsmoosDB** is a hyper-converged, persistence engine for Node.js that obliterates the boundary between Memory (RAM) and Storage (Disk). It is not just a database; it is a **Living Organism of Data**.

It unifies:
*   **Key-Value** (Dictionaries)
*   **Ordered Maps** (B+ Trees)
*   **Lists/Arrays** (Count-Indexed Trees)
*   **Graph Networks** (Nodes & Edges)
*   **Vector Search** (HNSW AI Embeddings)
*   **Full-Text Search** (Inverted Indices)

All accessible through a single, fractal JavaScript proxy called the **LiveHandle**.

---

B"H
## 📜 The Scroll of Contents

1.  [🌌 The Philosophy (Ma'amar)](##-the-philosophy)
2.  [⚡ Genesis (Installation)](##-genesis)
3.  [🔮 The Divine Interface (LiveHandle)](##-the-divine-interface)
4.  [🏗️ The Structures of Creation](##-the-structures-of-creation)
    *   [The Aleph: Primitives](##-the-aleph-primitives)
    *   [The Vessel: Objects (Insertion Order)](##-the-vessel-objects)
    *   [The Tree of Life: Maps (Sorted Order)](##-the-tree-of-life-maps)
    *   [The Infinite Chain: Sequences (Arrays)](##-the-infinite-chain-sequences)
    *   [The Range: Teleportation](##-the-range-teleportation)
5.  [🕸️ The Web of Being (Graph DB)](##-the-web-of-being-graph-db)
6.  [👁️ The Eye of Wisdom (Vector AI)](##-the-eye-of-wisdom-vector-ai)
7.  [🗣️ The Voice (Full-Text Search)](##-the-voice-full-text-search)
8.  [🧠 The Da'at (Query Engine)](##-the-daat-query-engine)
9.  [⚰️ Resurrection (Classes)](##-resurrection-classes)
10. [⏳ Time & Consistency](##-time--consistency)
11. [⚙️ The Engine Room](##-the-engine-room)

---

B"H
## <a name="-the-philosophy"></a> 🌌 The Philosophy (Ma'amar)

> *"There is nothing new under the sun."* — Ecclesiastes 1:9

Most databases force you into "Exile" (Galut). You must take your living, breathing JavaScript objects, kill them (serialize to JSON strings), and bury them in a foreign table (SQL/NoSQL). When you want them back, you must dig them up and resurrect them.

**AwtsmoosDB** brings "Redemption" (Geulah).
Your objects live on the disk. They are never serialized into a monolithic string. They are stored as **Fractals**.
*   A 1TB array is just a 16-byte pointer.
*   Accessing `db.users[5000]` does not load the other 4,999 users. It seeks directly to the block containing index 5000.
*   **No Schema.** The structure determines itself.

---

B"H
## <a name="-genesis"></a> ⚡ Genesis (Installation)

To create the universe, one needs but a command.

```bash
npm install awtsmoos-db
```

### The First Spark

```javascript
// B"H
const AwtsmoosDB = require('awtsmoos-db');

// The universe is contained in a single file (plus a WAL for safety).
const db = new AwtsmoosDB('./universe.db');

// Open the Gates of Wisdom
await db.open();

// Creation is immediate.
db.root.message = "Let there be light";

// The Write is asynchronous (fire-and-forget).
// To guarantee it is written to the physical platter:
await db.waitForIdle();

// Reading back:
const msg = await db.root.message;
console.log(msg); // "Let there be light"
```

---

B"H
## <a name="-the-divine-interface"></a> 🔮 The Divine Interface (LiveHandle)

The `LiveHandle` is the soul of the system. It is a Proxy that intercepts your access.

*   **Read**: Accessing a property returns a `Promise`. You must `await` it.
*   **Write**: Assigning a property returns `true` immediately. The engine manages the I/O in the background via a Write-Ahead Log (WAL).

### The Secret of Consistency
> *"The end is wedged in the beginning."* — Sefer Yetzirah

You do **not** need to wait for a write to finish before reading it back.
The database maintains strict internal ordering.

```javascript
// B"H
db.root.status = "Loading";
db.root.status = "Ready";

// This will ALWAYS be "Ready", even if the disk hasn't spun yet.
// The read operation waits for the write queue to drain for that specific key.
const current = await db.root.status; 
```

---

B"H
## <a name="-the-structures-of-creation"></a> 🏗️ The Structures of Creation

### <a name="-the-aleph-primitives"></a> The Aleph: Primitives
AwtsmoosDB stores all standard JS types natively.

```javascript
// B"H
db.root.config = {
    pi: 3.14159,                // Double
    isActive: true,             // Boolean
    created: new Date(),        // Date (Stored as double timestamp)
    pattern: /Awtsmoos/i,       // RegExp
    secret: Buffer.from("00"),  // Buffer (Binary)
    big: 9007199254740991n      // BigInt (Stored as string)
};
```

### <a name="-the-vessel-objects"></a> The Vessel: Objects (Insertion Order)
Standard objects are stored as **Dictionaries**. They preserve the order in which keys were added.

```javascript
// B"H
// Use createObject explicitly, or just assign a {} literal.
await db.root.createObject("userProfile");

await db.root.userProfile.set("name", "Yackov");
await db.root.userProfile.set("age", 30);
await db.root.userProfile.set("role", "Admin");

// Iteration yields: name, age, role (Insertion Order)
for await (const k of db.root.userProfile.keys()) {
    console.log(k); 
}
```

### <a name="-the-tree-of-life-maps"></a> The Tree of Life: Maps (Sorted Order)
When you need keys sorted alphabetically (e.g., for range queries), use a **Map** (B+ Tree).

```javascript
// B"H
await db.root.createMap("inventory");

// Insert in random order
await db.root.inventory.set("zebra", 10);
await db.root.inventory.set("apple", 5);
await db.root.inventory.set("mango", 20);

// Iteration yields: apple, mango, zebra (Sorted Order)
for await (const entry of db.root.inventory) {
    console.log(entry.key, await entry.value);
}
```

### <a name="-the-infinite-chain-sequences"></a> The Infinite Chain: Sequences (Arrays)
Arrays in AwtsmoosDB are **Count-Indexed Trees**. They support O(log N) random access and splicing.

```javascript
// B"H
await db.root.createList("timeline");

// Push (Append)
await db.root.timeline.push("Creation");
await db.root.timeline.push("Flood");
await db.root.timeline.push("Exodus");

// Splice (Insert in Middle)
// Insert "Patriarchs" at index 2
await db.root.timeline.splice(2, 0, "Patriarchs");

// Result: ["Creation", "Flood", "Patriarchs", "Exodus"]

// Random Access
const event = await db.root.timeline[2]; // "Patriarchs"
```

### <a name="-the-range-teleportation"></a> The Range: Teleportation
If you use `createMap`, you can perform **Range Queries**. The engine seeks directly to the start key and stops at the end key.

```javascript
// B"H
// Get all words between "M" and "P"
const iterator = db.root.dictionary.range("M", "P");

for await (const {key, value} of iterator) {
    console.log(key); // Mango, Melon, Orange, Papaya...
}
// Does not read "Apple" (before M) or "Zebra" (after P). Efficient!
```

---

B"H
## <a name="-the-web-of-being-graph-db"></a> 🕸️ The Web of Being (Graph DB)

> *"Everything is connected to everything else."* — Zohar

Any object in the DB can be a **Node**. You can link them with **Edges**.

```javascript
// B"H
const alice = db.root.users.alice;
const bob = db.root.users.bob;

// Alice KNOWS Bob since 2022
await alice.relateTo(bob, "KNOWS", { since: 2022 });

// Query Relations
const friends = await alice.relationships("OUT", "KNOWS");
const firstFriend = friends[0].node; // Resolves to bob's handle

// Traversal (BFS)
await alice.traverse(async (node, depth) => {
    console.log(`Visited ${await node.name} at depth ${depth}`);
}, { maxDepth: 3 });

// Pathfinding (Shortest Path)
const path = await alice.path(db.root.users.charlie);
// [Alice] -> [Bob] -> [Charlie]
```

---

B"H
## <a name="-the-eye-of-wisdom-vector-ai"></a> 👁️ The Eye of Wisdom (Vector AI)

Store embeddings and perform Semantic Search using the built-in **HNSW (Hierarchical Navigable Small World)** engine.

```javascript
// B"H
await db.root.createList("memories");

// 1. Enable Index
await db.root.memories.enableVectorIndex({ dimensions: 4, metric: 'cosine' });

// 2. Insert Data (Must have 'vector' or 'embedding' field)
await db.root.memories.push({ 
    id: "mem_1", 
    text: "I love coding", 
    vector: [0.1, 0.9, 0.1, 0.0] 
});

// 3. Search
const query = [0.1, 0.95, 0.0, 0.0];
const results = await db.root.memories.nearest(query, 5); // Top 5

console.log(results[0].item.text); // "I love coding"
console.log(results[0].score);     // 0.001 (Distance)
```

---

B"H
## <a name="-the-voice-full-text-search"></a> 🗣️ The Voice (Full-Text Search)

> *"And He spoke, and the world came into being."*

Instant Google-like search over your objects.

```javascript
// B"H
await db.root.createList("library");
await db.root.library.enableSearch();

await db.root.library.push({ title: "Tanya", content: "The book of the intermediate man" });
await db.root.library.push({ title: "Zohar", content: "The book of radiance" });

// Search for partial matches
const books = await db.root.library.search("radiance");
console.log(books[0].title); // "Zohar"
```

---

B"H
## <a name="-the-daat-query-engine"></a> 🧠 The Da'at (Query Engine)

Complex filtering with MongoDB-style syntax, plus Graph integration.

```javascript
// B"H
const results = await db.root.users.query({
    $filter: {
        age: { $gte: 18 },
        role: { $in: ["admin", "moderator"] },
        // Graph Query Inside Filter!
        $relatedTo: {
            direction: "OUT",
            label: "MANAGES",
            match: { department: "IT" }
        }
    },
    $slice: [0, 20], // Pagination
    $map: {          // Projection
        name: true,
        yearsActive: "stats.years" 
    }
});
```

---

B"H
## <a name="-resurrection-classes"></a> ⚰️ Resurrection (Classes)

AwtsmoosDB performs *Techiyas HaMeisim* (Resurrection of the Dead).
If you save an instance of a class, the database stores the **Source Code** of the class. When you read it back, it is re-instantiated with its methods intact.

```javascript
// B"H
class Golem {
    constructor(name) { this.name = name; this.active = false; }
    activate() { this.active = true; return "EMET"; }
}

// Save
db.root.guardian = new Golem("Yosef");
await db.waitForIdle();

// -- RESTART DATABASE --

// Load
const g = await db.root.guardian;
console.log(g.activate()); // "EMET" - Method works!
```

---

B"H
## <a name="-time--consistency"></a> ⏳ Time & Consistency

### The Read/Write Lock
The database allows:
*   **Multiple Simultaneous Readers**: Many `await db.root.x` calls can run in parallel.
*   **Exclusive Writer**: Only one write transaction happens at a time, but it queues automatically.

### Batch Mode
For massive imports, use `batch()`. It disables the `fsync` (disk flush) after every write and only flushes once at the end.

```javascript
// B"H
await db.batch(async () => {
    for(let i=0; i<10000; i++) {
        await db.root.logs.push(i);
    }
});
// fsync happens once here. Lightning fast.
```

---

B"H
## <a name="-the-engine-room"></a> ⚙️ The Engine Room

1.  **The Pager**: Reads/Writes 4096-byte blocks. Handles the WAL (Write-Ahead Log) for crash recovery.
2.  **The Allocator**: Manages free space using a bitmap in every block header. Supports "Heap" allocation (small objects sharing a block) and "Chain" allocation (large files spanning blocks).
3.  **Smart Pointers**: 16-byte DNA stored in parent objects. Contains BlockID (48-bit), Length, Offset, and Flags.
4.  **Engines**:
    *   `MapEngine`: B+ Tree.
    *   `SequenceEngine`: Count-Indexed B-Tree.
    *   `VectorEngine`: HNSW Graph on Disk.
    *   `Dictionary`: Hash-like insertion order storage.

---

**B"H.**
*May this tool bring clarity to your data and light to your code.*
