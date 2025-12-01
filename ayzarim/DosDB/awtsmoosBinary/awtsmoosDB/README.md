#B"H

# AwtsmoosDB Architecture Documentation

> **"The Console View Database"**
> An on-disk data structure designed to mirror the memory efficiency of a JavaScript Runtime Inspector.

## 1. Core Philosophy
Most databases force a choice between **read speed** (monolithic files) and **write speed** (fragmented logs). AwtsmoosDB achieves "Best of Everything" by enforcing a unique access pattern: **Recursive Pagination**.

Just as a browser console doesn't crash when you inspect an Array of 10 million items (because it only renders indices 0-100), AwtsmoosDB never loads data it doesn't need. It physically separates the **Index** (Keys/Structure) from the **Data** (Values) while keeping related data physically clustered for sequential I/O.

### Key Features
*   **Unified Block Architecture:** No separate "small" and "large" storage files. Every 4KB block can handle tiny boolean flags or chunks of a massive video file.
*   **Bitmap Allocator:** Solves fragmentation. Stores small objects (32 bytes) inside the headers of other blocks.
*   **Sequential Chaining:** Large files are not scattered; they are allocated in contiguous disk sectors for maximum read throughput.
*   **Runtime Fidelity:** Supports `Infinity`, `NaN`, `-0`, `Buffer`, and specific Float precisions (1-byte vs 8-byte), preserving the exact state of JavaScript runtime values.

---

## 2. Physical Layout: The Unified Block

The file is divided into strictly aligned **4096-byte (4KB)** Blocks.

### The Unit System
To handle variable data sizes without fragmentation, every Block is logically divided into **128 Units** of **32 bytes** each.

| Unit Index | Offset | Purpose |
| :--- | :--- | :--- |
| **0** | 0 - 31 | **Block Header (Metadata)** |
| **1** | 32 - 63 | Data Slot 1 |
| **...** | ... | ... |
| **127** | 4064 - 4095 | Data Slot 127 |

### The Header (Unit 0)
The first 32 bytes of *every single block* contain the map for that block:
1.  **Block Type (4 Bytes):** Is this a Page? A Superblock? Raw Data?
2.  **Next Block ID (4 Bytes):** Used if this block is part of a large sequential chain.
3.  **The Bitmap (16 Bytes / 128 Bits):** The genius of the system.
    *   Bit 0 is always `1` (Header is occupied).
    *   If Bit `N` is `0`, then Unit `N` (32 bytes) is empty.
    *   This allows the Allocator to find "holes" for small data instantly.

---

## 3. Logical Architecture: The Collection & Page

There is only one logical data structure in AwtsmoosDB: **The Collection**.
*   The Root Database is a Collection.
*   A nested Object is a Collection.
*   An Array is a Collection.

A Collection is a **Linked List of Pages**.

### The Page (The Bucket)
A Page is a block that contains **Index Entries**. It does **NOT** contain data (unless the data is tiny).
*   **Capacity:** Strictly capped (e.g., 100 items).
*   **Entry Format:** `[Key] [Type] [Pointer]`
*   **Pointer:** A structure `{ blockId, offset, length }`.

**The "Console View" Effect:**
When you ask for `db.get("users")`, the DB reads the Root Page. It sees "users" points to **Collection ID 500**. It returns a lightweight proxy. It does **not** read Collection 500. Only when you "expand" that proxy does the DB load **Page 1** of Collection 500.

---

## 4. Operational Mechanics

### A. Allocation Strategies (The Allocator)
The Allocator switches modes based on data size to optimize disk usage.

#### Mode 1: Heap Allocation (Small Data < 4KB)
*   **Input:** "Store 50 bytes."
*   **Calculation:** Needs `ceil(50/32) = 2 Units`.
*   **Scan:** It looks at the current "Hot Block". It checks the Bitmap for **2 contiguous zeros**.
*   **Action:** It flips those bits to `1` and writes the data to those specific 32-byte slots.
*   **Result:** Zero fragmentation. Small objects pack tightly.

#### Mode 2: Sequential Chain (Large Data > 4KB)
*   **Input:** "Store 10MB."
*   **Calculation:** Needs ~2560 Blocks.
*   **Scan:** It looks at the "High Water Mark" of the file (end of file).
*   **Action:** It reserves 2560 contiguous blocks IDs. It marks them as `OVERFLOW`.
*   **Result:** The drive head seeks once and writes sequentially. Reading is equally fast.

### B. The Write Pipeline
1.  **Serialize:** Convert JS Value -> Binary Buffer (Awtsmoos Format).
2.  **Allocate:** Ask Allocator for space. Receive Pointer `{ blockId, offset, length }`.
3.  **Write Data:** Pager writes the buffer to the physical offsets.
4.  **Index:** Load the Tail Page of the current Collection.
5.  **Append:** Add Key + Pointer to the Page.
6.  **Split:** If Page > 100 items, allocate a new Page block and link them.

### C. The Read Pipeline
1.  **Lookup:** Traverse Linked List of Pages to find the Key.
2.  **Resolve Pointer:**
    *   If `length < 4096`: Read specific block, slice specific offsets.
    *   If `length > 4096`: Identify the chain length. Issue a **Bulk Read** (e.g., read 10MB in one syscall) for maximum throughput.
3.  **Deserialize:** Convert Binary Buffer -> JS Value.

---

## 5. Type System & Serialization
AwtsmoosDB preserves the *exact* semantics of the JavaScript runtime.

| Type | ID | Description |
| :--- | :--- | :--- |
| **Integers** | 4, 9, 10, 22 | Auto-scales (UInt8 to UInt64) based on magnitude. |
| **Floats** | 14-16 | **Compressed.** If `1.5` fits in 1 byte, it uses 1 byte. Falls back to Double (8 bytes). |
| **Special** | 24-26 | Explicit support for `Infinity`, `-Infinity`, `NaN`. |
| **Buffer** | 8 | Native binary storage (zero serialization cost). |
| **Functions** | 27 | Stored as strings. |

---

## 6. Directory Map

### `/core`
The engine room.
*   **`pager.js`**: Low-level FS wrapper. Handles 4KB block read/write and sequential bursts.
*   **`allocator.js`**: The intelligence. Manages Bitmaps, finds free space, handles chains.

### `/structure`
The logic layer.
*   **`page.js`**: Manages a single bucket of 100 items. Handles VarInt metadata encoding.
*   **`collection.js`**: Manages the Linked List logic (Head/Tail) and total counts.

### `/serialize` & `/deserialize`
The translation layer.
*   **`serializeValue.js`**: Determines the Type ID and compresses data.
*   **`parser.js`**: Strict parsing logic to restore values.

### `/utils`
*   **`binaryHelpers.js`**: Bitwise logic, Packing/Unpacking, Hashing.
*   **`floatHandler.js`**: The complex math for compressing floating point numbers.

---

## 7. Future Proofing & Recovery
*   **Corruption:** Every block has a Type header. A recovery tool can scan the file linearly and reconstruct the Index even if the Root Pointer is lost.
*   **Expansion:** The Bitmap system allows us to mark blocks as "Free" upon deletion. The Allocator automatically reuses these holes before growing the file size.




## 8. HTAP & The "Magic" Sort (V2 Features)
AwtsmoosDB includes a sophisticated Hybrid Transactional/Analytical Processing engine.

### The "Fire and Forget" Indexer
When you save a complex object, the database performs a **Write-Heavy / Read-Instant** trade-off.
1.  **Timeline Write:** The data is immediately appended to the insertion log (0ms latency).
2.  **Async Flattening:** A background process walks every property of your object (e.g., `user.address.city`).
3.  **B+ Tree Injection:** It inserts pointers into separate B+ Trees for *every single property*.

### The Result: Instant Deep Sorting
This architecture allows you to perform queries that are impossible in standard key-value stores:

```javascript
// Sort by a deep nested property, get page 50, fast.
await db.getConsoleView("user.address.zipCode", 50);
```

The database uses **Count-Augmented B+ Trees** to jump directly to the 5,000th item in the sorted index without reading the 4,999 items before it.

### Automatic Defragmentation

The Allocator includes a free() mechanism. When you delete() an item:
1. The space in the 4KB block is marked as "Free" in the Bitmap.
2. The next time you set(), the Allocator automatically fills this hole.
3. This ensures the database file behaves like a reusable heap, not an append-only log.


