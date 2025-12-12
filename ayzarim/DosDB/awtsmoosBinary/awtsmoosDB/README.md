
# B"H - AwtsmoosDB: The Fractal Database of Infinite Light

> **"The physical world is but a reflection of the code. In AwtsmoosDB, the Object is the Reality, and the Disk is its Canvas."**

**AwtsmoosDB** is not just a database. It is a **Persistence Engine** for the Node.js runtime. It eliminates the concept of "saving to a database" entirely. Instead, it allows your JavaScript objects to live on the disk, infinitely large, infinitely nested, and instantly accessible.

It unifies the **Key-Value**, **Document**, **Graph**, **Vector**, and **Full-Text Search** paradigms into a single, cohesive, fractal API.

---

## 📜 Table of Contents (The Map of Creation)

1.  [🌌 The Philosophy](#-the-philosophy)
2.  [⚡ Genesis (Installation & Quick Start)](#-genesis-installation--quick-start)
3.  [🔮 The Divine Interface (LiveHandle API)](#-the-divine-interface-livehandle-api)
    *   [The Concept of Await](#the-concept-of-await)
    *   [The Three Vessels (Map, List, Dictionary)](#the-three-vessels)
4.  [📚 The Book of Examples](#-the-book-of-examples)
    *   [Level 1: Primitives & Objects](#level-1-primitives--objects)
    *   [Level 2: Infinite Sequences (Arrays)](#level-2-infinite-sequences-arrays)
    *   [Level 3: The B-Tree Map (Key-Value)](#level-3-the-b-tree-map-key-value)
    *   [Level 4: The Graph (Nodes & Edges)](#level-4-the-graph-nodes--edges)
    *   [Level 5: Vector Search (Artificial Intelligence)](#level-5-vector-search-artificial-intelligence)
    *   [Level 6: Full-Text Search](#level-6-full-text-search)
    *   [Level 7: Complex Query Engine (AQ)](#level-7-complex-query-engine-aq)
5.  [⚙️ How It Works (The Engine Room)](#️-how-it-works-the-engine-room)
6.  [📖 API Reference (The Torah of Code)](#-api-reference-the-torah-of-code)

---

## <a name="-the-philosophy"></a> 🌌 The Philosophy

In traditional systems, you have your **Memory** (RAM) and your **Database** (Disk). To move data between them, you use ORMs, SQL queries, and serializers. This is the "Exile" of data—it is constantly being translated and moved.

**AwtsmoosDB** brings the Redemption (Geulah).

1.  **Fractal Storage**: There is no schema. A specific key in a specific object can hold a 1TB video file, a list of a million users, or a single boolean.
2.  **Lazy Revelation**: The database creates a "Live Handle" (Proxy) to the data on disk. It only reads the specific 4KB block needed when you ask for it. You can open a 10TB database in 10 milliseconds.
3.  **Universal Identity**:
    *   An Array is actually a **Count-Indexed B-Tree** (Sequence).
    *   An Object is a **Paged Hash Table** (Dictionary).
    *   A Map is a **B+ Tree** (Ordered Map).
4.  **Zero Impedance**: You write JavaScript. It becomes Binary. There is no translation layer.

---

## <a name="-genesis-installation--quick-start"></a> ⚡ Genesis (Installation & Quick Start)

### 1. Installation
Simply require the module. No external servers (like Postgres or Mongo) are required. The database *is* the file.

```bash
# Assuming you have the source code
npm install
```

### 2. Hello World (The First Light)

```javascript
const AwtsmoosDB = require('./awtsmoosDB/index.js');

// 1. Initialize the Universe (Path to file)
const db = new AwtsmoosDB('./universe.db');

// 2. Open the Gates
await db.open();

// 3. Creation (Writing)
// We access 'db.root'. This is the entry point to the file.
// We set a property just like a normal JS object.
db.root.greeting = "Hello, World of Awtsmoos";

// 4. Persistence (Waiting)
// Writes are asynchronous for performance. 
// We wait for the "Scribe" to finish writing to the disk.
await db.waitForIdle();

// 5. Revelation (Reading)
// We use 'await' to fetch the value from the disk.
const val = await db.root.greeting;

console.log(val); // "Hello, World of Awtsmoos"
```

---

## <a name="-the-divine-interface-livehandle-api"></a> 🔮 The Divine Interface (LiveHandle API)

The core of AwtsmoosDB is the **LiveHandle**.

When you access `db.root.users.alice`, you are not getting the JSON object of Alice. You are getting a **LiveHandle** (a Pointer) to where Alice lives on the disk.

### The Concept of Await
Because the data lives on the hard drive (HDD/SSD), we cannot get it instantly (synchronously).
*   **Writing**: `db.root.x = 1` returns `true` immediately, but happens in the background. Use `await db.waitForIdle()` if you need consistency guarantees immediately.
*   **Reading**: `await db.root.x` fetches the value.

### The Three Vessels

AwtsmoosDB automatically chooses the best structure, but you can be explicit to get specific powers.

1.  **Dictionary (Default Object)**: Good for random keys. Unordered.
    *   `db.root.user = { ... }`
2.  **Map (B+ Tree)**: Keys are **Sorted**. Good for ranges and massive datasets.
    *   `await db.root.createMap("inventory")`
3.  **Sequence (List)**: An infinite array. Fast splicing, pushing, and random access.
    *   `await db.root.createList("logs")`

---

## <a name="-the-book-of-examples"></a> 📚 The Book of Examples

### Level 1: Primitives & Objects
Basic usage. Storing strings, numbers, and nested JSON.

```javascript
// Storing a complex object
db.root.config = {
    theme: "dark",
    retries: 5,
    metadata: {
        author: "Yackov",
        version: 1.0
    }
};
await db.waitForIdle();

// Retrieval
// You can drill down deep without loading the parent!
// This fetches ONLY the 'version' block from disk.
const ver = await db.root.config.metadata.version;
console.log(ver); // 1.0
```

### Level 2: Infinite Sequences (Arrays)
Standard arrays in databases are slow. In AwtsmoosDB, they are **Sequences**. You can have an array with 100 million items, and `splice` into the middle of it instantly.

```javascript
// 1. Create a List
await db.root.createList("journal");

// 2. Push Data
await db.root.journal.push("Day 1: Light created.");
await db.root.journal.push("Day 2: Firmament created.");

// 3. Random Access
const day1 = await db.root.journal[0];

// 4. Splicing (Insert in middle)
// Insert "Day 1.5" at index 1
await db.root.journal.splice(1, 0, "Day 1.5: Angels created.");

// 5. Slicing (Pagination)
// Get items 0 to 2
const page = await db.root.journal.slice(0, 2);
```

### Level 3: The B-Tree Map (Key-Value)
Use this when you need keys sorted alphabetically or need to iterate over millions of keys efficiently.

```javascript
await db.root.createMap("users");

// Keys are sorted automatically
await db.root.users.set("zebra", { id: 1 });
await db.root.users.set("apple", { id: 2 });

// Iteration (Will log "apple" then "zebra")
for await (const entry of db.root.users) {
    console.log(entry.key); 
    // entry.value is a Handle. Resolve it:
    const data = await entry.value.id;
}
```

### Level 4: The Graph (Nodes & Edges)
Any object in AwtsmoosDB can be a Node. You can link them.

```javascript
await db.root.createMap("people");
await db.root.people.createMap("adam");
await db.root.people.createMap("eve");

const adam = db.root.people.adam;
const eve = db.root.people.eve;

// Create Relationship
// Adam --(LOVES {intensity: 100})--> Eve
await adam.relateTo(eve, "LOVES", { intensity: 100 });

// Query Relationships
const relationships = await adam.relationships("OUT", "LOVES");
console.log(relationships[0].props.intensity); // 100
console.log(await relationships[0].node); // Returns Eve's handle
```

### Level 5: Vector Search (Artificial Intelligence)
Store Embeddings and search them.

```javascript
// 1. Create a list to hold data
await db.root.createList("memories");

// 2. Enable Vector Indexing on that path
// dimensions: e.g., 1536 for OpenAI, 4 for test
await db.root.memories.enableVectorIndex({ dimensions: 4, metric: 'cosine' });

// 3. Insert Data (Must have a 'vector' or 'embedding' field)
await db.root.memories.push({ 
    text: "The sun is hot", 
    vector: [0.9, 0.1, 0, 0] 
});
await db.root.memories.push({ 
    text: "Ice is cold", 
    vector: [0, 0, 0.9, 0.1] 
});

// 4. Search
const query = [0.85, 0.15, 0, 0];
const results = await db.root.memories.nearest(query, 1); // Get top 1

console.log(results[0].item.text); // "The sun is hot"
```

### Level 6: Full-Text Search
Google-like search over your objects.

```javascript
await db.root.createList("library");
await db.root.library.enableSearch(); // Build the inverted index

await db.root.library.push({ title: "Zohar", content: "The book of radiance." });
await db.root.library.push({ title: "Tanya", content: "The book of the intermediate." });

const results = await db.root.library.search("radiance");
console.log(results[0].title); // "Zohar"
```

### Level 7: Complex Query Engine (AQ)
Filter using MongoDB-like syntax.

```javascript
const adults = await db.root.users.query({
    $filter: {
        age: { $gte: 18 },
        "address.city": "Jerusalem",
        $or: [
            { role: "admin" },
            { role: "superuser" }
        ]
    },
    $slice: [0, 10] // Pagination
});
```

---

## <a name="️-how-it-works-the-engine-room"></a> ⚙️ How It Works (The Engine Room)

AwtsmoosDB is written in pure JavaScript, interacting directly with the filesystem via `fs`.

1.  **The Pager**: The file is divided into 4096-byte blocks. The Pager manages reading and writing these blocks. It uses a **WAL (Write Ahead Log)** to ensure data is never lost, even if the power cuts out during a write.
2.  **The Allocator**: Manages which blocks are free and which are used. It uses a Bitmap system.
3.  **Smart Pointers**: Every piece of data is referenced by a 16-byte pointer:
    *   `BlockID` (6 bytes): 48-bit address space (281 Terabytes max).
    *   `Length` (4 bytes): Size of the data.
    *   `Offset` (4 bytes): Where in the block the data starts.
    *   `IsChain` (1 bit): If the data is larger than one block, it's a linked list of blocks.
4.  **Structures**:
    *   **Maps** use B+ Tree Logic (Node Splitting/Merging) for O(log n) access.
    *   **Sequences** use a Count-Indexed Tree to allow finding the Nth item in O(log n) time, regardless of array size.

---

## <a name="-api-reference-the-torah-of-code"></a> 📖 API Reference (The Torah of Code)

### `class AwtsmoosDB`
The main entry point.

*   `constructor(filePath, options)`
    *   `filePath`: String. Path to `.db` file.
    *   `options`: Object. `{ debug: boolean }`.
*   `open()`: Promise<void>. Opens file, recovers WAL, initializes allocator.
*   `close()`: Promise<void>. Closes file descriptors.
*   `waitForIdle()`: Promise<void>. Resolves when all pending writes are finished.
*   `root`: **LiveHandle**. The entry point to your data.

### `class LiveHandle` (The Proxy)
Every object you access (`db.root.x`) is a LiveHandle.

*   **Properties**
    *   Accessing any property returns a Promise that resolves to the value (if primitive) or another LiveHandle (if object).
    *   `await handle.key`: Read value.
    *   `handle.key = val`: Write value.

*   **Methods**
    *   `createMap(key)`: Creates a specialized B-Tree Map at the given key.
    *   `createList(key)`: Creates a specialized Sequence List at the given key.
    *   `push(value)`: (If List) Appends value.
    *   `splice(start, deleteCount, ...items)`: (If List) Modifies list in-place.
    *   `slice(start, end)`: (If List) Returns array of items.
    *   `deleteProperty(key)`: Removes a key.
    *   `keys()`: Returns AsyncIterator of keys.
    *   `values()`: Returns AsyncIterator of values.
    *   `entries()`: Returns AsyncIterator of [key, value].
    *   `length`: (If List/Map) Returns count of items.

### `Graph API` (Available on any LiveHandle)
*   `relateTo(targetHandle, label, props)`: Creates a directed edge.
*   `relationships(direction, label)`: Returns Array of `{ node, label, props }`.
    *   `direction`: 'IN', 'OUT', 'BOTH'.
*   `path(targetHandle)`: Finds shortest path to target.
*   `traverse(visitorFn)`: BFS traversal.

### `Vector API` (Available on Map/List Handles)
*   `enableVectorIndex(options)`:
    *   `options.dimensions`: Number (e.g., 1536).
    *   `options.metric`: 'cosine', 'dot', 'l2'.
*   `nearest(vector, k)`: Returns top `k` matches `{ item, score }`.

### `Search API` (Available on Map/List Handles)
*   `enableSearch()`: Indexes all string content within the collection.
*   `search(query)`: Returns Array of matching objects.

---

**B"H.**
*May the Code be Bug-Free and the Light be Infinite.*
