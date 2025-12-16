# B"H - AwtsmoosDB: The Fractal Database of Infinite Light

> **"In the beginning, there was the Object. And the Object was with the Disk, and the Object *was* the Disk."**

**AwtsmoosDB** is not merely a database. It is a **Persistence Engine** for the Node.js runtime that dissolves the barrier between Memory (RAM) and Storage (Disk). It rejects the "Exile of Data"—the constant serialization, translation, and movement of data between ORMs and SQL tables.

In **AwtsmoosDB**, your JavaScript objects live on the hard drive. They can be infinitely deep, infinitely large, and instantly accessible. It unifies the **Key-Value**, **Document**, **Graph**, **Vector**, and **Full-Text Search** paradigms into a single, cohesive, fractal API known as the **LiveHandle**.

---

## 📜 The Scroll of Contents

1.  [🌌 The Philosophy (Chassidus of Code)](#-the-philosophy)
2.  [⚡ Genesis (Installation & Initialization)](#-genesis)
3.  [🔮 The Divine Interface (The LiveHandle)](#-the-divine-interface)
4.  [📚 The Book of Examples](#-the-book-of-examples)
    *   [Chapter 1: The Aleph (Primitives & Objects)](#chapter-1-the-aleph)
    *   [Chapter 2: The Infinite Sequence (Arrays & Splicing)](#chapter-2-the-infinite-sequence)
    *   [Chapter 3: The Tree of Life (B-Tree Maps)](#chapter-3-the-tree-of-life)
    *   [Chapter 4: The Web of Being (Graph Network)](#chapter-4-the-web-of-being)
    *   [Chapter 5: The Eye of Wisdom (Vector AI)](#chapter-5-the-eye-of-wisdom)
    *   [Chapter 6: The Voice (Full-Text Search)](#chapter-6-the-voice)
    *   [Chapter 7: The Resurrection (Custom Classes)](#chapter-7-the-resurrection)
    *   [Chapter 8: The Omniverse (Complex Queries)](#chapter-8-the-omniverse)
5.  [⚙️ The Engine Room (Internal Architecture)](#️-the-engine-room)
6.  [📖 The Torah of Code (Complete API Reference)](#-the-torah-of-code)

---

## <a name="-the-philosophy"></a> 🌌 The Philosophy

Traditional databases are "Stores." You put data in, you take data out.
**AwtsmoosDB** is an "Extension."

1.  **Fractal Storage**: There is no schema. A specific key in a specific object can hold a 1TB video file, a list of a million users, or a single boolean. The structure is recursive.
2.  **Lazy Revelation**: The database uses a **Smart Pointer** system (16-byte DNA). When you access `db.root.users.alice`, it does not load the entire `users` collection. It reads *only* the specific 4KB block where `alice` resides.
3.  **Unified Identity**:
    *   An **Array** is a **Count-Indexed B-Tree** (Sequence).
    *   An **Object** is a **Paged Hash Table** (Dictionary).
    *   A **Map** is a **B+ Tree** (Ordered Map).
    *   A **Node** is just an Object with Edges.
4.  **Zero Impedance**: You write JavaScript. It becomes Binary. There is no translation layer.

---

## <a name="-genesis"></a> ⚡ Genesis

### Installation
AwtsmoosDB requires no external server processes. The database *is* the file.

```bash
npm install awtsmoos-db
```

### The First Spark
To begin, one must instantiate the database and open the gates of file I/O.

```javascript
const AwtsmoosDB = require('awtsmoos-db');

// 1. Define the path. The universe will be contained within 'universe.db'.
const db = new AwtsmoosDB('./universe.db');

// 2. Open the Gates.
// This initializes the Pager, recovers the Write-Ahead Log (WAL), 
// and prepares the Allocator.
await db.open();

// 3. Creation.
// 'db.root' is the entry point. It is a LiveHandle.
// We assign a string to it. This string is immediately queued for serialization.
db.root.greeting = "B\"H - Hello World";

// 4. Persistence.
// Writing is asynchronous for performance.
// We await the 'Scribe' (Pager) to ensure the data is etched onto the disk platters.
await db.waitForIdle();

// 5. Revelation.
// We read it back. Accessing the property returns a Promise.
const val = await db.root.greeting;

console.log(val); // "B"H - Hello World"
```

---

## <a name="-the-divine-interface"></a> 🔮 The Divine Interface (LiveHandle)

The core innovation of AwtsmoosDB is the `LiveHandle`.
It is a JavaScript `Proxy` that wraps a binary pointer.

### The Concept of Await
Because the data lives on the physical disk, it exists in a different timeframe than the CPU.
*   **Writing (`=`)**: Returns `true` immediately (fire-and-forget). The database handles the I/O in the background. Use `await db.waitForIdle()` to sync.
*   **Reading (`await`)**: Accessing a property (e.g., `db.root.user`) returns a `Promise`. You must `await` it to resolve the pointer into actual data.

---

## <a name="-the-book-of-examples"></a> 📚 The Book of Examples

### <a name="chapter-1-the-aleph"></a> Chapter 1: The Aleph (Primitives & Objects)

Store standard JavaScript types effortlessly. They are serialized into compact binary formats.

```javascript
// We create a complex configuration object.
// This is not stored as a generic JSON blob strings. 
// It is stored structurally, allowing us to access 'version' later 
// without parsing the whole object.
db.root.config = {
    theme: "dark",
    maxConnections: 100,
    isActive: true,
    startedAt: new Date(), // Stored as a 64-bit float timestamp
    binarySecret: Buffer.from("HiddenLight"), // Stored as raw binary
    metadata: {
        author: "Yackov",
        version: "1.0.0"
    }
};

await db.waitForIdle();

// --- DEEP ACCESS ---
// We want ONLY the version. 
// In MongoDB, you'd fetch the doc. In AwtsmoosDB, we traverse pointers.
// This reads O(1) blocks, regardless of how large 'config' is.
const version = await db.root.config.metadata.version;
console.log(version); // "1.0.0"

// --- UPDATING ---
// We can update a deep property directly.
db.root.config.maxConnections = 200;
await db.waitForIdle();
```

### <a name="chapter-2-the-infinite-sequence"></a> Chapter 2: The Infinite Sequence (Arrays)

Standard arrays in databases are typically contiguous blocks. Resizing them is expensive.
AwtsmoosDB uses **Count-Indexed B-Trees**. You can insert, delete, or replace items in the middle of a multi-million item array instantly.

```javascript
// 1. Create a specialized List container
await db.root.createList("timeline");

// 2. Push events (Append to the end)
await db.root.timeline.push("Creation of Light");
await db.root.timeline.push("Creation of Firmament");
await db.root.timeline.push("Creation of Man");

// 3. Random Access
// Access by index, just like an array.
const day1 = await db.root.timeline[0]; 
console.log(day1); // "Creation of Light"

// 4. Splicing (The Miracle)
// We forgot the Animals! Insert them before "Creation of Man" (Index 2).
// usage: splice(start, deleteCount, ...items)
await db.root.timeline.splice(2, 0, "Creation of Animals");

// 5. Replace
// Update index 0.
await db.root.timeline.splice(0, 1, "Creation of Photons");

// 6. Slicing (Pagination)
// Fetch items 1 through 3.
const era = await db.root.timeline.slice(1, 3);
console.log(era); // ["Creation of Firmament", "Creation of Animals"]
```

### <a name="chapter-3-the-tree-of-life"></a> Chapter 3: The Tree of Life (B-Tree Maps)

When you need keys to be **Sorted** (alphabetically/numerically) or need to handle millions of dynamic keys, use a Map.

```javascript
// Create a B+ Tree Map
await db.root.createMap("inventory");

// Keys are inserted in random order...
await db.root.inventory.set("zebra", { price: 100 });
await db.root.inventory.set("apple", { price: 5 });
await db.root.inventory.set("mango", { price: 20 });

// ...but they are stored Sorted!
// Iterating the map automatically yields them in alphabetical order.
console.log("Inventory List:");
for await (const item of db.root.inventory) {
    // item is { key: string, value: LiveHandle }
    const price = await item.value.price;
    console.log(`${item.key}: $${price}`);
}
// Output:
// apple: $5
// mango: $20
// zebra: $100
```

### <a name="chapter-4-the-web-of-being"></a> Chapter 4: The Web of Being (Graph)

Every object in AwtsmoosDB can act as a **Node** in a graph. You can link any two objects with directed **Edges**.

```javascript
// 1. Create Nodes
await db.root.createMap("users");
await db.root.users.createMap("alice");
await db.root.users.createMap("bob");
await db.root.users.createMap("charlie");

const alice = db.root.users.alice;
const bob = db.root.users.bob;
const charlie = db.root.users.charlie;

// 2. Create Relationships (Edges)
// Alice --(KNOWS {since: 2020})--> Bob
await alice.relateTo(bob, "KNOWS", { since: 2020 });

// Bob --(KNOWS)--> Charlie
await bob.relateTo(charlie, "KNOWS", { since: 2021 });

// Charlie --(LOVES {deeply: true})--> Alice
await charlie.relateTo(alice, "LOVES", { deeply: true });

// 3. Query Relationships
// "Who does Alice know?"
const friends = await alice.relationships("OUT", "KNOWS");
for (const rel of friends) {
    console.log(`Alice knows ${rel.node.getPath()} since ${rel.props.since}`);
}

// 4. Pathfinding (Shortest Path)
// Find the shortest path from Alice to Charlie.
// Result: Alice -> Bob -> Charlie
const path = await alice.path(charlie);
console.log(`Path length: ${path.length} hops`);
```

### <a name="chapter-5-the-eye-of-wisdom"></a> Chapter 5: The Eye of Wisdom (Vector AI)

AwtsmoosDB includes a native **HNSW (Hierarchical Navigable Small World)** engine. This allows you to store AI Embeddings and perform semantic search.

```javascript
// 1. Create a container for our memories
await db.root.createList("brain");

// 2. Enable Vector Indexing
// We define the dimensionality (e.g., 4 for test, 1536 for OpenAI) and metric.
await db.root.brain.enableVectorIndex({ dimensions: 4, metric: 'cosine' });

// 3. Insert Memories
// Objects MUST have a 'vector' or 'embedding' field (array of numbers).
await db.root.brain.push({ 
    thought: "The sky is blue and vast", 
    vector: [0.1, 0.2, 0.8, 0.1] 
});
await db.root.brain.push({ 
    thought: "I love chocolate cake", 
    vector: [0.9, 0.1, 0.0, 0.0] 
});

// 4. Semantic Search
// We want to find thoughts related to "dessert" (vector similar to [0.85, ...])
const queryVec = [0.85, 0.15, 0.05, 0.0];
const results = await db.root.brain.nearest(queryVec, 1); // Get top 1 match

console.log(`Found: "${results[0].item.thought}" (Score: ${results[0].score})`);
// Found: "I love chocolate cake"
```

### <a name="chapter-6-the-voice"></a> Chapter 6: The Voice (Full-Text Search)

Built-in Inverted Indexing allows you to Google-search your objects.

```javascript
// 1. Create library
await db.root.createList("library");

// 2. Enable Search Index
// This scans all strings recursively in objects added to this list.
await db.root.library.enableSearch();

// 3. Add Books
await db.root.library.push({ 
    title: "Zohar", 
    text: "The book of radiance and light." 
});
await db.root.library.push({ 
    title: "Tanya", 
    text: "The book of the intermediate man." 
});

// 4. Search
const results = await db.root.library.search("radiance");
console.log(results[0].title); // "Zohar"
```

### <a name="chapter-7-the-resurrection"></a> Chapter 7: The Resurrection (Custom Classes)

AwtsmoosDB can serialize *classes* and *methods*, resurrecting them with behavior intact.

```javascript
class Dog {
    constructor(name) { this.name = name; }
    bark() { return `${this.name} says Woof!`; }
}

// 1. Save an instance
db.root.pet = new Dog("Rex");
await db.waitForIdle();

// -- RESTART DATABASE --

// 2. Read it back
const myPet = await db.root.pet;

// It is not just data. It has methods.
// AwtsmoosDB stored the source code of the class alongside the data.
console.log(myPet.bark()); // "Rex says Woof!"
```

### <a name="chapter-8-the-omniverse"></a> Chapter 8: The Omniverse (Complex Queries)

The **Awtsmoos Query (AQ)** language allows MongoDB-style filtering, coupled with Graph traversal logic.

```javascript
// Find all users who:
// 1. Are "admin" OR "moderator"
// 2. Live in "Jerusalem"
// 3. Are connected to "Bob" via a "FRIEND" edge
const results = await db.root.users.query({
    $filter: {
        "address.city": "Jerusalem",
        $or: [ 
            { role: "admin" }, 
            { role: "moderator" } 
        ],
        $relatedTo: {
            direction: "OUT",
            label: "FRIEND",
            match: { name: "Bob" }
        }
    },
    $slice: [0, 10], // Pagination
    $map: {          // Projection (Select specific fields)
        userName: "name",
        userRole: "role"
    }
});
```

---

## <a name="️-the-engine-room"></a> ⚙️ The Engine Room (Internal Architecture)

AwtsmoosDB is written in pure JavaScript, interacting directly with the filesystem via `fs`. It is built on a stack of abstractions:

1.  **The Pager**:
    The hard drive is divided into fixed-size **4096-byte blocks**. The Pager reads and writes these blocks. It implements a **WAL (Write-Ahead Log)**. Before any block is overwritten, the new data is appended to the WAL. This guarantees ACID compliance; if the power fails, the WAL is replayed upon restart.

2.  **The Allocator**:
    Manages free space. It uses a **Bitmap** stored in block headers to track used/free chunks (Units of 32 bytes). It supports:
    *   **Small Allocations**: Placing small objects (numbers, small strings) into shared pages to reduce fragmentation.
    *   **Large Allocations**: Chaining multiple blocks together for large files (Blobs/Videos).

3.  **Smart Pointers**:
    The DNA of the system. Every piece of data is referenced by a 16-byte buffer:
    *   `BlockID` (6 bytes): 48-bit address space (281 Terabytes max).
    *   `Length` (4 bytes): Exact byte size of the data.
    *   `Offset` (4 bytes): Where in the block the data starts.
    *   `IsChain` (1 byte): Flags indicating if the data spans multiple blocks.

4.  **The Engines**:
    *   **MapEngine**: Implements a B+ Tree for key-value sorting. Handles node splitting (Mitosis) and merging.
    *   **SequenceEngine**: Implements a hierarchical Count-Indexed Tree. Allows finding the Nth item without scanning. Handles splicing/shifting.
    *   **VectorEngine**: Implements the HNSW graph algorithm on disk for nearest-neighbor search.

---

## <a name="-the-torah-of-code"></a> 📖 The Torah of Code (API Reference)

### `class AwtsmoosDB`
The main entry point.

*   `constructor(filePath, options)`
    *   `filePath` (String): Path to the `.db` file.
    *   `options` (Object): `{ debug: boolean }` (Log internal ops).
*   `open()`: `Promise<void>`. Initializes Pager, Allocator, and recovers WAL.
*   `close()`: `Promise<void>`. Flushes data and closes file handles.
*   `waitForIdle()`: `Promise<void>`. Resolves when all background writes complete.
*   `root`: `LiveHandle`. The root entry point of the database.
*   `batch(fn)`: `Promise<void>`. Runs `fn` in a transaction. Disables `fsync` until batch ends for massive speedups.

### `class LiveHandle` (The Proxy)
Every object you access (`db.root.x`) is a `LiveHandle`.

#### Properties
*   Accessing any property returns a `Promise` that resolves to the value (if primitive) or another `LiveHandle` (if object).
*   `await handle.key`: Read value.
*   `handle.key = val`: Write value.

#### Structural Methods
*   `createMap(key)`: Creates a specialized B-Tree Map at `key`.
*   `createList(key)`: Creates a specialized Sequence List at `key`.
*   `deleteProperty(key)`: Removes a key.
*   `keys()`: Returns `AsyncIterator` of keys.
*   `values()`: Returns `AsyncIterator` of values.
*   `entries()`: Returns `AsyncIterator` of `[key, value]`.
*   `length`: (List/Map) Returns count of items.
*   `byteSize()`: Returns storage size in bytes.

#### Sequence Methods (Arrays)
*   `push(value)`: Appends value to the end.
*   `splice(start, deleteCount, ...items)`: Modifies list in-place.
*   `slice(start, end)`: Returns Array of items.
*   `concat(otherListHandle)`: Merges another list into this one.

#### Graph API
*   `relateTo(targetHandle, label, props)`: Creates a directed edge to target.
*   `relationships(direction, label)`: Returns Array of `{ node, label, props }`.
    *   `direction`: `'IN' | 'OUT' | 'BOTH'`.
*   `path(targetHandle, options)`: Finds shortest path.
    *   `options`: `{ maxDepth: number }`.
*   `traverse(visitorFn)`: BFS traversal. `visitorFn(node, depth)`.

#### Search & Vector API
*   `enableSearch()`: Indexes string content in this collection.
*   `search(query)`: Returns Array of matching objects.
*   `enableVectorIndex(options)`:
    *   `dimensions`: (e.g. 4, 1536).
    *   `metric`: `'cosine' | 'l2' | 'dot'`.
*   `nearest(vector, k)`: Returns top `k` matches `{ item, score }`.

#### Query API
*   `query(spec)`: Executes a complex query.
    *   `spec.$filter`: Object. Criteria (e.g. `{ age: { $gt: 18 } }`).
    *   `spec.$slice`: `[start, end]`.
    *   `spec.$map`: Object. Projection map.

---

**B"H.**
*May the Code be Bug-Free and the Light be Infinite.*
