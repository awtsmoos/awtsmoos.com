# B"H - AwtsmoosDB

**AwtsmoosDB** is a high-performance, pure JavaScript, transactional, persistent database engine built from scratch. It is designed to handle complex nested structures, ordered B-Trees, and efficient append-only Collections, all backed by a robust, crash-resistant disk format.

It requires **zero dependencies** and runs natively in Node.js.

---

## 📖 Usage Guide & Examples

### 1. Quick Start

Initialize the database. No manual setup is required; the DB file is created automatically.

```javascript
const AwtsmoosDB = require('./index.js');

// Initialize (Lazy Loading)
const db = new AwtsmoosDB('./my_database.db');

// Basic Key-Value Storage on the Root Object
async function main() {
    // Storing values
    await db.root.set("server_status", "online");
    await db.root.set("uptime", Date.now());

    // Retrieving values
    const status = await db.root.server_status;
    console.log(`Server is: ${status}`);
}

main();
```

---

### 2. B-Tree Maps (Sorted Key-Value Stores)

Use `createMap` to create a sub-namespace that supports **automatic sorting** of keys. This is perfect for dictionaries, user indexes, or caches.

```javascript
async function mapExample() {
    // Create a new B-Tree Map
    await db.root.createMap("inventory");

    // Insert items (Order doesn't matter, DB sorts them)
    await db.root.inventory.set("zebra_cake", { price: 5, stock: 100 });
    await db.root.inventory.set("apple", { price: 1, stock: 50 });
    await db.root.inventory.set("mango", { price: 3, stock: 20 });

    // Retrieve specific item
    const apple = await db.root.inventory.apple;
    console.log("Apple Price:", apple.price);

    // Iteration is guaranteed to be ALPHABETICAL
    console.log("--- Inventory List ---");
    for await (const item of db.root.inventory) {
        // Yields { key: "apple", value: {...} } then "mango", then "zebra_cake"
        console.log(`${item.key}: $${item.value.price}`);
    }
}
```

---

### 3. Collections (Append-Only Lists & Pagination)

Use `createList` to create efficient linked-list collections. Supports `push` and `slice` (pagination). Ideal for logs, feeds, and transaction histories.

```javascript
async function listExample() {
    // Create a Collection
    await db.root.createList("audit_logs");

    // Push thousands of items efficiently
    for (let i = 0; i < 1000; i++) {
        await db.root.audit_logs.push({
            id: i,
            timestamp: Date.now(),
            action: `Login Attempt #${i}`
        });
    }

    // Pagination: Get items 500 to 505 (Zero-load on other items)
    const page = await db.root.audit_logs.slice(500, 505);
    
    page.forEach(log => {
        console.log(`[${log.id}] ${log.action}`);
    });
}
```

---

### 4. Deeply Nested Structures & Binary Data

AwtsmoosDB supports storing complex JSON-like objects, `Buffer` (binary data), `Date`, `RegExp`, `Map`, and `Set` natively.

```javascript
async function complexDataExample() {
    const fs = require('fs').promises;
    const imageBuffer = await fs.readFile('./logo.png'); // Binary data

    await db.root.set("user_profile", {
        id: 1,
        meta: {
            created: new Date(),
            tags: new Set(["admin", "pro_user"]),
            preferences: new Map([["theme", "dark"]])
        },
        // Store raw binary directly in the JSON structure
        avatar: imageBuffer 
    });

    // Retrieval is seamless
    const profile = await db.root.user_profile;
    
    console.log("Created At:", profile.meta.created.toISOString());
    console.log("Avatar Size:", profile.avatar.length, "bytes");
    
    // You can also write the buffer back to disk
    await fs.writeFile('./retrieved_logo.png', profile.avatar);
}
```

---

### 5. Nested Databases (The "Tower")

You can nest Maps inside Maps indefinitely.

```javascript
async function nestedMaps() {
    await db.root.createMap("usa");
    await db.root.usa.createMap("ny");
    await db.root.usa.ny.createMap("nyc");
    
    await db.root.usa.ny.nyc.set("population", 8000000);
    
    // Access via path
    const pop = await db.root.usa.ny.nyc.population;
}
```

---

## ⚙️ Architecture & Internals

AwtsmoosDB is designed with a **Copy-on-Write (CoW)** architecture to ensure transactional integrity and crash resistance.

### 1. The Pager & Block Structure
- **Block Size**: 4096 bytes (4KB).
- **SuperBlock (Block 0)**: Contains the Root Pointer and the Allocator Cursor.
    - **Root Pointer**: Offset `64`. Points to the root B-Tree node.
    - **Cursor**: Offset `128`. Tracks the next free block for allocation.
- **Sanctuary Protection**: The first `64` bytes of *every* block (Header Space) are strictly protected by the Allocator. User data is never written there. This prevents Bitmap corruption.

### 2. The Allocator
- **Bitmaps**: Every block tracks usage of its own internal units (32-byte chunks) via a bitmap in the header.
- **Smart Allocation**:
    - **Small**: Finds gaps inside existing pages to minimize fragmentation.
    - **Page**: Allocates full blocks for B-Tree nodes.
    - **Large (Chain)**: Allocates sequential blocks for large binary blobs (e.g., images).

### 3. B-Tree Engine (Maps)
- **Type Safety**: Every node starts with a `BNOD` magic signature. This prevents the "Frankenstein Pointer" bug where the DB might try to interpret a List Handle as a B-Tree Node.
- **Transactional Writes**:
    - When a key is inserted, we **copy** the modified leaf node to a new location (CoW).
    - We propagate the change up to the root, creating a new path.
    - The SuperBlock is updated to point to the new Root **atomically**.
- **Deferred Freeing**:
    - Old nodes are NOT freed immediately. They are added to a `pendingFrees` list.
    - Only *after* the new Root is successfully persisted to disk do we flush the `pendingFrees` list. This ensures that if the power goes out mid-write, the DB simply loads the old (valid) root on restart.

### 4. Collection Engine (Lists)
- Implements a Linked-List of **Page Blocks**.
- **Handles**: A Collection is represented by a persistent Handle Block (`COLL` signature) that points to the Head and Tail pages.
- **Slicing**: Efficiently traverses the linked list to retrieve only the requested range of items.

### 5. Crash Recovery (WAL)
- **Write-Ahead Log**: All writes are appended to a `.wal` file before hitting the main `.db` file.
- **Auto-Recovery**: On startup, if an unclean shutdown is detected, the WAL is replayed to restore consistency.
- **Corruption Heuristics**: If a corrupted Root is detected (e.g., due to disk rot), the engine automatically resets the root to a safe empty state to allow the application to continue.

---

**Built with <3 for the Awtsmoos.**
