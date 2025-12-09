# B"H - AwtsmoosDB: The Database of Infinite Potential

> "In the beginning, there was the Void (Disk), and the Code hovered over the face of the waters."

**AwtsmoosDB** is a pure JavaScript, transactional, persistent, schema-less object database. It creates a bridge between the **Abstract Will** (your JavaScript code) and the **Concrete Reality** (binary storage), handling the complexity of serialization, memory management, and data structural integrity with the grace of a living organism.

It is built from scratch, utilizing **B-Trees** for order, **Linked Paged Collections** for flow, and a **Write-Ahead Log (WAL)** for eternity.

---

## 📜 Table of Contents

1.  [The Book of Genesis (Getting Started)](#the-book-of-genesis)
2.  [The Book of Attributes (Primitives & Objects)](#the-book-of-attributes)
3.  [The Book of Order (Maps & B-Trees)](#the-book-of-order)
4.  [The Book of Flow (Collections & Arrays)](#the-book-of-flow)
    *   [The Power of Splice](#the-power-of-splice)
    *   [The Vision of Slice](#the-vision-of-slice)
    *   [Direct Access](#direct-access)
5.  [The Book of Depth (Nested Universes)](#the-book-of-depth)
6.  [The Book of Formation (Architecture & Internals)](#the-book-of-formation)

---

## <a name="the-book-of-genesis"></a> The Book of Genesis

To bring the database into existence, you simply invoke its name. It requires no heavy installation, no external daemons. It is *Atzmus*—self-contained.

```javascript
const AwtsmoosDB = require('./awtsmoosDB');

// The Path is the Vessel.
const db = new AwtsmoosDB('./universe.db', { 
    debug: false,
    walCheckpointLimit: 5 * 1024 * 1024 // 5MB WAL
});

// Open the Gates of Understanding
await db.open();
```

---

## <a name="the-book-of-attributes"></a> The Book of Attributes

The `db.root` is the **Keter** (Crown). From here, all data emanates. You may assign simple lights (primitives) or complex structures (JSON objects) directly to it.

```javascript
// Setting the Foundation
db.root.name = "The Endless World";
db.root.age = 13.8e9;
db.root.isActive = true;
db.root.metadata = { 
    author: "The Scribe", 
    tags: ["mystical", "binary"] 
};

// Waiting for the Light to Settle (Persistence)
await db.waitForIdle();

// Retrieval
const name = await db.root.name;
console.log(name); // "The Endless World"
```

---

## <a name="the-book-of-order"></a> The Book of Order (Maps)

When you need structure that allows for **Infinite Expansion** and **Divine Order** (sorting), you create a **Map**. Internally, this manifests as a **B-Tree**, balancing itself automatically as data enters.

### Creation and Assignment
```javascript
// Create a Container for Souls
await db.root.createMap("souls");

// Insert Entities (Keys are sorted automatically)
await db.root.souls.set("charlie", { level: "Nefesh" });
await db.root.souls.set("alice", { level: "Neshama" });
await db.root.souls.set("bob", { level: "Ruach" });
```

### The Iteration (Walking the Tree)
You can walk through the tree. It will always return keys in sorted order, regardless of insertion order.

```javascript
// Iterating Entries
for await (const soul of db.root.souls) {
    console.log(`${soul.key}: ${soul.value.level}`);
}
// Output:
// alice: Neshama
// bob: Ruach
// charlie: Nefesh
```

### Introspection
You may gaze at the keys or values independently.

```javascript
// Get all Keys
for await (const key of db.root.souls.keys()) {
    console.log(key);
}

// Get all Values
for await (const val of db.root.souls.values()) {
    console.log(val);
}
```

---

## <a name="the-book-of-flow"></a> The Book of Flow (Collections)

When data must flow like a river—ordered by time or sequence—you use a **Collection** (List). Unlike a standard array which must be loaded entirely into memory, an AwtsmoosDB Collection is a **Linked Chain of Pages**. It can hold billions of items, yet you can read just one.

### Creation & Expansion
```javascript
// Create the Timeline
await db.root.createList("timeline");

// Push events into the stream
await db.root.timeline.push("Big Bang");
await db.root.timeline.push("Formation of Stars");
await db.root.timeline.push("Life");
```

### <a name="the-power-of-splice"></a> The Power of Splice (The Surgeon)
The `splice` method is the scalpel. It allows you to perform surgical operations on the timeline: **Insert**, **Delete**, or **Replace** items at *any* index without rewriting the whole list.

**Insertion (Mitosis):**
If you splice into a full page, the database performs **Mitosis**, splitting the page into two linked pages to make room.

```javascript
// Insert "The Dinosaur Era" at index 2 (between Formation and Life)
// splice(start, deleteCount, ...items)
await db.root.timeline.splice(2, 0, "The Dinosaur Era");

// Result: ["Big Bang", "Formation of Stars", "The Dinosaur Era", "Life"]
```

**Replacement:**
```javascript
// Replace "Life" (index 3) with "Intelligent Life"
await db.root.timeline.splice(3, 1, "Intelligent Life");
```

**Deletion:**
```javascript
// Remove "The Dinosaur Era" (index 2)
await db.root.timeline.splice(2, 1);
```

### <a name="the-vision-of-slice"></a> The Vision of Slice (Pagination)
You need not consume the whole ocean to drink. `slice` retrieves a specific window of items.

```javascript
// Get items from index 0 to 10
const page1 = await db.root.timeline.slice(0, 10);
console.log(page1);
```

### <a name="direct-access"></a> Direct Access (The Portal)
You can access any item in the list directly by its index, as if it were a simple array in memory.

```javascript
// Get the 5000th item instantly
const event = await db.root.timeline[5000];

// Get the length (O(1) operation)
const count = await db.root.timeline.length;
```

---

## <a name="the-book-of-depth"></a> The Book of Depth (Nested Universes)

AwtsmoosDB allows for infinite recursion. Maps inside Lists inside Maps. The proxy handles the navigation seamlessly.

```javascript
// Constructing a Universe
await db.root.createMap("universe");
await db.root.universe.createMap("milkyWay");
await db.root.universe.milkyWay.createMap("solarSystem");
await db.root.universe.milkyWay.solarSystem.createList("planets");

// Adding Earth
await db.root.universe.milkyWay.solarSystem.planets.push({
    name: "Earth",
    population: 8e9,
    properties: {
        atmosphere: "Nitrogen/Oxygen",
        hasWater: true
    }
});

// Deep Reading (Dot Notation)
const earth = await db.root.universe.milkyWay.solarSystem.planets[0];
console.log(earth.properties.atmosphere); // "Nitrogen/Oxygen"

// Deep Mutation
earth.population = 9e9; // Modifying the local object...
// To persist, we replace it in the list:
await db.root.universe.milkyWay.solarSystem.planets.splice(0, 1, earth);
```

---

## <a name="the-book-of-formation"></a> The Book of Formation (Architecture)

How does the Awtsmoos maintain such order in the chaos of binary?

### 1. The Divine Hand (LiveHandle Proxy)
The API you interact with (`db.root.x`) is a **Proxy**. It intercepts your intent. When you ask for a property, it does not fetch the whole object; it returns a Promise of a Pointer. It traverses the B-Tree or Collection structure on-disk, only loading the specific Node or Page required.

### 2. Tzimtzum (The Allocator)
To create a world, one must make space. The **Allocator** manages the disk space. It uses a **Bitmap** to track used and free blocks (4KB pages). 
*   **Sanctuary:** It protects the SuperBlock and Headers from being overwritten.
*   **Healing:** If it detects corruption in the bitmap, it self-heals by scanning the block headers.

### 3. The Tree of Knowledge (B-Tree)
**Maps** are stored as B-Trees.
*   **Nodes:** 4KB blocks containing sorted keys and pointers.
*   **Inline Data:** Small values are stored *inside* the node for speed.
*   **Leaves & Branches:** As you insert data, nodes split and grow upwards. The root is dynamic.

### 4. The River of Pages (Collections)
**Lists** are stored as a Linked List of Pages.
*   **Pages:** Each page holds ~100-1000 items.
*   **Mitosis:** When you `splice` data into a full page, it splits into two.
*   **Indexing:** The Header keeps track of the Total Count, allowing `getItem(index)` to traverse the page chain intelligently without scanning every item.

### 5. Gilgul (Persistence & WAL)
Data is eternal.
*   **Write-Ahead Log (WAL):** Every change is written to a sequential log (`.wal`) before touching the main database file. This ensures that even if the process crashes (power loss), the database can **Replay** the log upon resurrection (`db.open()`) and restore the state perfectly.
*   **Checkpointing:** When the log gets too heavy, the system performs a "Tikkun" (Correction), flushing data to the main file and clearing the log.

---

> "The purpose of knowledge is not to know, but to create."

**AwtsmoosDB** is ready. The vessel is prepared. Pour your light into it.
