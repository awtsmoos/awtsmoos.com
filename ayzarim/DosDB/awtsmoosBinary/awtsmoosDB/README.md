
B"H

# AwtsmoosDB: The Fractal Database of Infinite Light

> *"The lowest world is connected to the highest world. Thus, in the coarse physical blocks of the Disk, the Essence of the Infinite Light is found."* — Based on *Sefer Yetzirah* & Chabad Chassidus

**AwtsmoosDB** is not merely a database. It is a **hyper-converged persistence engine** that creates a "Dwelling Place in the Lower Worlds" (*Dirah B'Tachtonim*) for your JavaScript objects.

It obliterates the **Galut** (Exile) of serialization. In traditional databases, you must kill your objects (serialize to JSON) to bury them in the grave of the disk. In AwtsmoosDB, your objects live eternally. The Object *is* the Disk.

---

## 📜 The Scroll of Contents

1.  [🌌 The Philosophy (Chassidus)](##-the-philosophy-chassidus)
2.  [⚡ Genesis (Installation)](##-genesis-installation)
3.  [🔮 The Divine Interface (LiveHandle)](##-the-divine-interface-livehandle)
4.  [🏗️ The Four Worlds (Data Structures)](##-the-four-worlds-data-structures)
5.  [🕸️ The Web of Being (Graph DB)](##-the-web-of-being-graph-db)
6.  [👁️ The Eye of Wisdom (Vector AI)](##-the-eye-of-wisdom-vector-ai)
7.  [🗣️ The Voice (Full-Text Search)](##-the-voice-full-text-search)
8.  [🧠 The Da'at (Query Engine)](##-the-daat-query-engine)
9.  [⚰️ Techiyas HaMeisim (Class Resurrection)](##-techiyas-hameisim-class-resurrection)
10. [📚 The Book of Examples](##-the-book-of-examples)
11. [⚙️ Complete API Reference](##-complete-api-reference)

---

## <a name="-the-philosophy-chassidus"></a> 🌌 The Philosophy (Chassidus)

In the teachings of Chassidus, it is explained that *Atzmus* (The Essence) is found in everything. There is no separation between the spiritual idea and the physical vessel.

**AwtsmoosDB** reflects this unity:
*   **No Schema:** The vessel adapts to the light.
*   **No Serialization:** The memory (`RAM`) and the storage (`Disk`) are treated as a single continuum.
*   **Fractal Storage:** A list of 1 billion items is stored as a tree. Accessing item 1,000,000 takes `O(log n)` time. You do not load the whole array.
*   **Lazy Loading:** Data is drawn down (*Hamshacha*) only when observed.

---

## <a name="-genesis-installation"></a> ⚡ Genesis (Installation)

To bring this creation into your project:

```bash
npm install awtsmoos-db
```

### The First Spark

```javascript
// B"H
const AwtsmoosDB = require('awtsmoos-db');

// Initialize the Universe
const db = new AwtsmoosDB('./creation.db', {
    // 1 Block = 4KB (4096 bytes).
    // 5000 Blocks = ~20 MB RAM.
    // 250,000 Blocks = ~1 GB RAM.
    cacheSize: 5000, 
    
    // Alternatively, define in MB directly:
    // cacheSizeMB: 100, 
    
    debug: false // Verbose prophetic visions
});

// Open the Gates
await db.open();

// Creation is effortless
db.root.light = "Infinite";
await db.waitForIdle(); // Ensure it is written to the physical realm

console.log(await db.root.light); // "Infinite"
```

---

## <a name="-the-divine-interface-livehandle"></a> 🔮 The Divine Interface (LiveHandle)

The `LiveHandle` is the *Sefirah of Malchut*—the interface through which you interact with the essence. It behaves like a standard JavaScript Proxy.

1.  **Read:** Accessing a property returns a `Promise`.
    ```javascript
    const val = await db.root.user.name;
    ```
2.  **Write:** Setting a property returns `true` immediately (asynchronous write).
    ```javascript
    db.root.user.name = "Yackov";
    ```
3.  **Traverse:** You can chain properties infinitely.
    ```javascript
    await db.root.atzilus.briah.yetzirah.asiyah.earth.set("inhabited", true);
    ```

---

## <a name="-the-four-worlds-data-structures"></a> 🏗️ The Four Worlds (Data Structures)

AwtsmoosDB creates specific structures based on how you interact with it.

### 1. The World of Primitives (Scalars)
Stores `String`, `Number`, `Boolean`, `null`, `undefined`, `BigInt`, `Date`, `RegExp`, `Buffer`.

### 2. The World of Objects (Dictionaries)
Created via `{}` assignment or `createObject`.
*   **Nature:** Preserves Insertion Order.
*   **Use Case:** Settings, User Profiles, irregular data.

### 3. The World of Maps (B-Trees)
Created via `createMap`.
*   **Nature:** Keys are **Sorted Alphabetically**.
*   **Use Case:** Large datasets, Indices, Directories.
*   **Power:** Supports Range Queries (`db.range`).

### 4. The World of Sequences (Arrays)
Created via `[]` assignment or `createList`.
*   **Nature:** Count-Indexed B-Tree.
*   **Use Case:** Timelines, Logs, Feeds.
*   **Power:** `push`, `pop`, `shift`, `unshift`, `splice` at any index instantly.

---

## <a name="-the-web-of-being-graph-db"></a> 🕸️ The Web of Being (Graph DB)

> *"Everything is connected to everything else."*

Every object in AwtsmoosDB can be a **Node**. You can link any two objects with **Edges**.

```javascript
const adam = db.root.users.adam;
const eve = db.root.users.eve;

// Connect
await db.graph.connect(adam, eve, "MARRIED_TO", { since: "Creation" });

// Traverse
const relations = await db.graph.getRelationships(adam, "OUT");
console.log(relations[0].label); // "MARRIED_TO"
```

---

## <a name="-the-eye-of-wisdom-vector-ai"></a> 👁️ The Eye of Wisdom (Vector AI)

Embeddings are the "Soul" of data. Store high-dimensional vectors and perform **HNSW (Hierarchical Navigable Small World)** searches.

```javascript
// Enable Vector Index on a list
await db.vector.enable(db.root.memories, { dimensions: 1536 });

// Insert
await db.root.memories.push({
    text: "The essence of light",
    vector: [0.1, 0.2, ...], // 1536 floats
});

// Search
const results = await db.vector.nearest(db.root.memories, queryVector, 5);
```

---

## <a name="-the-voice-full-text-search"></a> 🗣️ The Voice (Full-Text Search)

An Inverted Index engine built directly into the storage.

```javascript
// Enable Search Index
await db.search.enable(db.root.library);

// Insert Data
await db.root.library.push({ title: "Tanya", content: "Longer is shorter..." });

// Query
const matches = await db.search.run(db.root.library, "longer shorter");
```

---

## <a name="-the-daat-query-engine"></a> 🧠 The Da'at (Query Engine)

A MongoDB-like query language that operates directly on the fractal structures.

```javascript
const results = await db.query(db.root.users, {
    $filter: {
        age: { $gte: 13 },
        "address.city": "Jerusalem",
        $relatedTo: {
            label: "STUDENT_OF",
            match: { name: "Rabbi Akiva" }
        }
    },
    $slice: [0, 10]
});
```

---

## <a name="-techiyas-hameisim-class-resurrection"></a> ⚰️ Techiyas HaMeisim (Class Resurrection)

If you save an instance of a JavaScript Class, AwtsmoosDB saves the **Source Code** of the class. Upon reading, it dynamically resurrects the class prototype.

```javascript
class Soul {
    sing() { return "Halleluyah"; }
}

db.root.neshamah = new Soul();
// ... Restart Database ...
const s = await db.root.neshamah;
console.log(s.sing()); // "Halleluyah"
```

---

## <a name="-the-book-of-examples"></a> 📚 The Book of Examples

### Example 1: The Infinite Scroll (Splicing)
Insert items into the middle of a massive array without rewriting the file.

```javascript
await db.createList(db.root, "feed");

// 1. Initial Load
const batch1 = Array.from({length: 1000}, (_, i) => `Post ${i}`);
await db.root.feed.push(...batch1);

// 2. Insert Ad at index 500
await db.root.feed.splice(500, 0, { type: "Ad", text: "Buy Mitvos!" });

// 3. Verify
const item500 = await db.root.feed[500];
console.log(item500.type); // "Ad"
```

### Example 2: The Deep Dive (Nested Maps)
Create a directory structure.

```javascript
await db.createMap(db.root, "filesystem");
await db.createMap(db.root.filesystem, "home");
await db.createMap(db.root.filesystem.home, "user");
await db.root.filesystem.home.user.set("config.json", { theme: "dark" });

// Access
const config = await db.root.filesystem.home.user["config.json"];
```

### Example 3: The Social Network (Graph)
finding friends of friends.

```javascript
// Assume users exist
const me = db.root.users.me;
const friend = db.root.users.friend;
const stranger = db.root.users.stranger;

await db.graph.connect(me, friend, "FRIEND");
await db.graph.connect(friend, stranger, "FRIEND");

// Find Path
const path = await db.graph.shortestPath(me, stranger, { maxDepth: 3 });
// Output: [ {node: me}, {edge:..., node: friend}, {edge:..., node: stranger} ]
```

### Example 4: The Librarian (Search & Vector)
Hybrid search combining meaning and keywords.

```javascript
const library = db.root.library;

// 1. Keyword Filter
const candidates = await db.search.run(library, "kabbalah meditation");

// 2. Semantic Rank (Re-ranking)
const vectorResults = await db.vector.nearest(library, queryVec, 100);

// Intersection Logic (Simplified)
const bestMatch = vectorResults.find(v => candidates.some(c => c.id === v.item.id));
```

### Example 5: The Time Machine (Circular References)
Saving objects that reference themselves.

```javascript
const chicken = { name: "Chicken" };
const egg = { name: "Egg" };
chicken.child = egg;
egg.parent = chicken;

db.root.paradox = chicken;
await db.waitForIdle();

const c = await db.root.paradox;
const e = await c.child;
const c2 = await e.parent; // Points back to Chicken!
```

### Example 6: The Architect (Batching)
Importing massive data efficiently.

```javascript
const hugeData = fetchHugeData(); // 100k items

// Disables FS Sync for individual writes
await db.batch(async () => {
    for(const item of hugeData) {
        await db.root.bigList.push(item);
    }
});
// Syncs once at the end
```

### Example 7: The Accountant (BigInt & Maps)
Precision math.

```javascript
const ledger = new Map();
ledger.set("wallet_1", 9007199254740991n);
ledger.set("wallet_2", 100n);

db.root.ledger = ledger; // Auto-converts to B-Tree Map
await db.waitForIdle();

const bal = await db.root.ledger.get("wallet_1"); // Returns BigInt
```

### Example 8: The Mystic (Range Queries)
Iterate alphabetically.

```javascript
await db.createMap(db.root, "dictionary");
// ... insert words ...

// Get words starting with 'a' through 'c'
for await (const entry of db.range(db.root.dictionary, "a", "d")) {
    console.log(entry.key); // apple, boy, cat...
}
```

### Example 9: The Cleaner (Compaction)
Reclaim space after deletions.

```javascript
await db.root.logs.splice(0, 5000); // Delete 5k items
const stats = await db.stats(db.root.logs);

if (stats.fragmentation > 0.3) {
    console.log("Compacting...");
    await db.compact(db.root.logs);
}
```

### Example 10: The Observer (Graph Algorithms)
Who is the most important node?

```javascript
// Run PageRank on the entire graph stored in 'db.root.network'
const ranks = await db.graph.pageRank({ iterations: 20 });
console.log("Most influential node:", ranks[0].id);
```

### Example 11: The Analyst (Complex Query)
Projection and filtering.

```javascript
const result = await db.query(db.root.users, {
    $filter: { age: { $gt: 18 } },
    $map: {
        fullName: "profile.name",
        isAdmin: { $check: { role: "admin" } }
    }
});
```

### Example 12: The Binary Vault (Buffers)
Storing images/files directly.

```javascript
const fs = require('fs');
const img = fs.readFileSync('image.png');

db.root.files.myImage = img;
await db.waitForIdle();

const loaded = await db.root.files.myImage;
// loaded is a Buffer
```

---

## <a name="-complete-api-reference"></a> ⚙️ Complete API Reference

### `AwtsmoosDB` Class
*   `constructor(path, options)`:
    *   `cacheSize`: Number of 4KB blocks to keep in RAM.
    *   `cacheSizeMB`: (Optional) Cache size in Megabytes (Auto-calculates blocks).
    *   `debug`: (Default false) Log internal ops.
*   `open()`: Opens file/WAL.
*   `close()`: Syncs and closes.
*   `waitForIdle()`: **Crucial.** Awaits all pending background writes.
*   `batch(fn)`: Runs `fn` without syncing to disk until completion.
*   `compact(handle)`: Re-writes a specific structure to remove fragmentation.
*   `stats(handle)`: Returns `{ count, size, capacity, fragmentation }`.
*   `size(handle)`: Returns count of items.
*   `keys(handle)`, `values(handle)`, `entries(handle)`: Returns Arrays.
*   `streamKeys`, `streamValues`, `streamEntries`: Returns Async Iterators.
*   `range(handle, start, end)`: Range iterator for Maps.

### `db.graph`
*   `connect(src, tgt, label, props)`: Creates an edge.
*   `getRelationships(node, direction, label)`: Returns array of edges.
*   `deleteNode(nodeHandle)`: Deletes node and cleans up edges.
*   `shortestPath(start, end, options)`: BFS search.
*   `traverse(start, visitor, options)`: Graph walker.
*   `pageRank(options)`: Graph centrality algorithm.
*   `communityDetection()`: Label propagation.

### `db.vector`
*   `enable(handle, config)`: Turns a List/Map into a Vector Store.
    *   `dimensions`: (e.g., 1536)
    *   `metric`: 'cosine', 'l2', 'dot'
*   `nearest(handle, vec, k)`: Returns top `k` matches `{ item, score }`.
*   `insert(path, key, vector, payload)`: Manual insert (auto-handled by `push`).

### `db.search`
*   `enable(handle)`: Indexes string content in the container.
*   `run(handle, query)`: Returns matching objects.
*   `reindex(path)`: Rebuilds index.

### `db.query`
*   `execute(handle, criteria)`:
    *   `$filter`: Mongo-style filter.
    *   `$map`: Projection.
    *   `$slice`: Pagination.
    *   `$relatedTo`: Graph filter.

---

**B"H.**
*The vessels are broken, but the light remains. Use this tool to gather the sparks.*
