# B"H - AwtsmoosDB

**AwtsmoosDB** is a high-performance, pure JavaScript, transactional, persistent database engine built from scratch. It provides a MongoDB-like nested API backed by a robust B-Tree and Write-Ahead Log (WAL) architecture.

It requires **zero dependencies** and runs natively in Node.js.

---

## 📖 Usage Cookbook

### 1. Initialization
Lazy loading. The file is created automatically on the first write.

```javascript
const AwtsmoosDB = require('./index.js');
const db = new AwtsmoosDB('./my_database.db', { 
    walCheckpointLimit: 5 * 1024 * 1024 // Auto-cleanup WAL after 5MB
});
```

### 2. Basic Key-Value Storage
Anything can be a key. Any JSON-serializable value (plus Date, Buffer, Map, Set) can be stored.

```javascript
await db.root.set("status", "active");
await db.root.set("count", 42);
await db.root.set("meta", { created: new Date(), tags: ["new", "verified"] });

const val = await db.root.count; // 42
```

### 3. B-Tree Maps (Sorted Storage)
Use `createMap` for sorted key-value pairs (Dictionaries, Indexes).

```javascript
await db.root.createMap("users");

await db.root.users.set("zebra", { id: 99 });
await db.root.users.set("apple", { id: 1 });

// Iteration is Alphabetical: apple -> zebra
for await (const user of db.root.users) {
    console.log(user.key, user.value);
}

// Get Count (Fast O(1))
const count = await db.root.users.length;
```

### 4. Collections (Lists & Feeds)
Use `createList` for append-only logs or feeds. Optimized for push/slice.

```javascript
await db.root.createList("logs");

// Push items
await db.root.logs.push({ msg: "Login", ts: Date.now() });
await db.root.logs.push({ msg: "Logout", ts: Date.now() });

// Get Length (Fast O(1))
const len = await db.root.logs.length;

// Slicing (Pagination) - Efficiently reads only the needed blocks
const recent = await db.root.logs.slice(0, 10);
```

### 5. Introspection (Keys, Values, Entries)
Iterate efficiently without loading everything.

```javascript
// Get all keys
for await (const key of db.root.users.keys()) {
    console.log("User:", key);
}

// Get all values
for await (const val of db.root.users.values()) {
    console.log("Data:", val);
}

// Get entries [key, value]
for await (const [k, v] of db.root.users.entries()) {
    console.log(k, v);
}
```

### 6. Binary Data (Images / Files)
Store raw Buffers directly.

```javascript
const buf = Buffer.from("B\"H");
await db.root.set("my_file", buf);

const readBack = await db.root.my_file;
console.log(readBack.toString()); // B"H
```

### 7. Deep Nesting
Nest Maps inside Maps indefinitely.

```javascript
await db.root.createMap("usa");
await db.root.usa.createMap("ny");
await db.root.usa.ny.set("weather", "cloudy");

console.log(await db.root.usa.ny.weather);
```

---

## ⚙️ Architecture & Reliability

### Crash Resistance (WAL)
AwtsmoosDB uses a **Write-Ahead Log (WAL)**. Every change is appended to `.wal` first. If the process crashes mid-write, the database replays the log on next startup to restore consistency.
- **Auto-Checkpoint**: The system automatically flushes the WAL to the main DB and truncates it when it exceeds a size limit (default 2MB) or on close.

### Transactional Integrity
- **Copy-on-Write (CoW)**: Modified B-Tree nodes are written to new blocks. The old path remains valid until the new Root is successfully anchored.
- **Defer-Free**: Old blocks are only freed *after* the transaction is fully committed to the SuperBlock.

### Allocator Safety
- **Sanctuary**: The first 64 bytes of every block (Header) are strictly protected. User data cannot overwrite headers, preventing bitmap corruption.
- **Offsets**: The SuperBlock Cursor (Offset 128) and Root Pointer (Offset 64) are physically separated to prevent collision.

### Type Safety
- **BNOD Signature**: Every B-Tree node is signed with `BNOD`. The reader verifies this signature before parsing, preventing "Frankenstein Pointers" (reading garbage data as keys).

### Performance
- **Inline Values**: Small data (< 48 bytes) can be stored directly inside B-Tree nodes.
- **No-Sync Storm**: Write operations sync the WAL but let the OS cache the main DB file, providing high write throughput without sacrificing durability.

---

**Built with <3 for the Awtsmoos.**