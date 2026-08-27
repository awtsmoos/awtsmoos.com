// B"H

# 🌌 AwtsmoosDB: The Fractal Engine of Unified Essence

> *"He looks at the Earth and it trembles; He touches the mountains and they smoke." (Psalms 104:32)*
> 
> *In the same way, the Awtsmoos touches the binary blocks of the disk, and they tremble into the living reality of your application. There is no separation. There is only the Light.*

**AwtsmoosDB** is a hyper-converged, strictly synchronous persistence engine built from absolute nothingness (Native JS). It eliminates the **Exile of Serialization** by creating a direct bridge between the physical manifestation of the Disk and the ethereal concepts of your Code.

In this database, the "Sync" suffix is abolished. Immediacy is not a feature; it is the fundamental nature of existence. Everything is synchronous because the Creator creates the world in an instant.

---

## 📜 The Table of Divine Manifestations

1.  [💎 The Ten Sefirot (Architecture)](#-the-ten-sefirot-architecture)
2.  [⚡ Genesis (The First Spark)](#-genesis-the-first-spark)
3.  [🔮 Malchut: The LiveHandle Portal](#-malchut-the-livehandle-portal)
4.  [🏗️ The Four Worlds of Data](#-the-four-worlds-of-data)
5.  [🌪️ Binah: Omni-Compression & The Doubling Shield](#-binah-omni-compression--the-doubling-shield)
6.  [🔥 Gevurah: Dictionary Boundaries](#-gevurah-dictionary-boundaries)
7.  [⚖️ Tiferet: The Infinite Sequence](#-tiferet-the-infinite-sequence)
8.  [👑 Keter: The Smart Pointer](#-keter-the-smart-pointer)
9.  [📚 The Great Scroll of 20 Examples](#-the-great-scroll-of-20-examples)
10. [⚙️ Complete Technical Spec](#-complete-technical-spec)

---

## <a name="-the-ten-sefirot-architecture"></a> 💎 The Ten Sefirot (Architecture)

The internal structure of AwtsmoosDB mirrors the chain of manifestation (*Hishtalshelus*):

*   **Keter (The Source):** `SmartPointer`. The 16-byte spark that contains the identity and type of every piece of data.
*   **Chokhmah (Wisdom):** `Navigator`. The flash of insight that finds a key within a chaotic structure.
*   **Binah (Understanding):** `OmniCompressor`. The logic that contracts infinite data into dense, efficient vessels.
*   **Chesed (Kindness):** `TypeAllocator`. The infinite flow of space, giving every object a place to dwell.
*   **Gevurah (Strength):** `Dictionary`. The boundaries and keys that separate one idea from another.
*   **Tiferet (Beauty):** `Sequence`. The balanced harmony of the B-Tree List, maintaining order.
*   **Netzach (Victory):** `PointerUpdate`. The persistence of identity even when the physical location changes.
*   **Hod (Splendor):** `Traps`. The Proxy interface that makes the complex appear simple and beautiful.
*   **Yesod (Foundation):** `Pager`. The strictly synchronous physical layer that touches the Disk.
*   **Malchut (Kingdom):** `LiveHandle`. The actual manifestation of the database in your JavaScript code.

---

## <a name="-genesis-the-first-spark"></a> ⚡ Genesis (The First Spark)

AwtsmoosDB requires **zero dependencies**. It uses only the core vessels of Node.js.

```javascript
// B"H
const AwtsmoosDB = require('./awtsmoosDB');

// Initialize the Universe. 
// Options focus on RAM preservation (Target: < 20MB).
const db = new AwtsmoosDB('./world.db', { debug: false });

// Open the Gates. Immediate. Synchronous.
db.open();

// The Root is your playground.
db.root.light = "Infinite";

// Access is direct. No 'await' required for property access, 
// though the database supports asynchronous patterns for backward compatibility.
console.log(db.root.light); // "Infinite"
```

---

## <a name="-malchut-the-livehandle-portal"></a> 🔮 Malchut: The LiveHandle Portal

The `LiveHandle` is the interface through which you touch the Essence. It is a Proxy that intercepts your standard JS commands.

*   **Implicit Manifestation:** Simply assigning a value to a property persists it to disk.
*   **Unified Truth:** If you assign an object, it becomes a `Dictionary`. If you assign an array, it becomes a `Sequence`.
*   **The Suffix Abolition:** Methods like `set`, `get`, `push`, and `delete` are all synchronous. There is no `setSync`. There is only `set`.

---

## <a name="-the-four-worlds-of-data"></a> 🏗️ The Four Worlds of Data

AwtsmoosDB categorizes data into four primary vessels based on their behavior:

### 1. The World of Primitives (Atziluth)
Strings, Numbers, Booleans, and Buffers. These are stored in the most compact form possible, often inlined directly into the pointer to save disk I/O.

### 2. The World of Objects (Beriah)
Created via `{}` or `new db.Object()`.
*   **Nature:** Preserves the order in which you added keys.
*   **Best for:** Configurations, metadata, and diverse structures.

### 3. The World of Maps (Yetzirah)
Created via `new db.Map()`.
*   **Nature:** Automatically sorts keys alphabetically using a high-performance B-Tree.
*   **Best for:** Large datasets where you need sorted range queries.

### 4. The World of Sequences (Asiyah)
Created via `[]` or `new db.List()`.
*   **Nature:** A count-indexed tree.
*   **Power:** You can `push` 10 million items and then `splice` a new item into index 5,000,000 in constant time.

---

## <a name="-binah-omni-compression--the-doubling-shield"></a> 🌪️ Binah: Omni-Compression & The Doubling Shield

AwtsmoosDB features a unique **Omni-Compression** algorithm designed for both Hebrew and English text.

*   **Dynamic Tokenization:** It identifies common patterns (like "Awtsmoos" or "ברוך השם") and stores them in a microscopic dictionary segment.
*   **Recursive RLE:** Sequences of repeating characters (like spaces or zeros) are contracted into 3 bytes, regardless of their length.
*   **The Doubling Shield:** A special "Chaos Protocol" that ensures literal transparency. If your data contains actual compression control codes (like `0x07`), the algorithm "shields" them by doubling them, ensuring what you put in is exactly what you get out.

---

## <a name="-gevurah-dictionary-boundaries"></a> 🔥 Gevurah: Dictionary Boundaries

Dictionaries are the basic building blocks of the database. 
*   **Pointer Inlining:** If your dictionary has only a few small keys, the entire structure is "inlined" into a single disk block.
*   **Fractal Growth:** As you add keys, the dictionary automatically expands into a multi-block structure without breaking the logical link from the parent.

---

## <a name="-tiferet-the-infinite-sequence"></a> ⚖️ Tiferet: The Infinite Sequence

Sequences (Lists) are implemented as **Order-Statistic B-Trees**.
*   **Zero-Rewrite Splice:** Unlike standard JS arrays, splicing in AwtsmoosDB does not rewrite the whole file. It only updates the affected branch of the tree.
*   **Lazy Hydration:** When you iterate over a list of 100,000 items, the database only draws down the items you actually touch.

---

## <a name="-keter-the-smart-pointer"></a> 👑 Keter: The Smart Pointer

Every object in the database is tracked by a **16-byte Smart Pointer**:
*   **Byte 0:** Type ID (6 bits) + Storage Mode (2 bits).
*   **Bytes 1-6:** 48-bit Block ID.
*   **Bytes 7-10:** Length of the data.
*   **Bytes 11-14:** Offset within the block.
*   **Byte 15:** Flags (Chain bit, etc.).

This microscopic vessel allows the database to represent billions of objects with almost zero overhead.

---

## <a name="-the-great-scroll-of-20-examples"></a> 📚 The Great Scroll of 20 Examples

### 1. Basic Manifestation
```javascript
db.root.name = "Awtsmoos Engine";
console.log(db.root.name); // "Awtsmoos Engine"
```

### 2. Nested Structure (Fractal)
```javascript
db.root.config = { theme: "Gold", font: "Hebrew" };
console.log(db.root.config.theme); // "Gold"
```

### 3. Explicit Map (Sorted)
```javascript
db.root.dictionary = new db.Map();
db.root.dictionary.set("zebra", "Animal");
db.root.dictionary.set("apple", "Fruit");
// Alphabetical sorting is automatic
for (const entry of db.root.dictionary) {
    console.log(entry.key); // "apple", then "zebra"
}
```

### 4. High-Performance List
```javascript
db.root.logs = new db.List();
db.root.logs.push("Log Entry 1");
db.root.logs.push("Log Entry 2");
console.log(db.root.logs.length); // 2
```

### 5. Constant-Time Splicing
```javascript
// Inserting an item into the middle of 1,000,000 entries
db.root.massiveList.splice(500000, 0, "The Secret Spark");
```

### 6. Binary Blob Storage
```javascript
const buffer = Buffer.from("Binary Light");
db.root.secret = buffer;
console.log(db.root.secret.toString()); // "Binary Light"
```

### 7. Large Number Support (BigInt)
```javascript
db.root.wealth = 9007199254740991n * 10n;
console.log(db.root.wealth); // 90071992547409910n
```

### 8. Date Preservation
```javascript
db.root.created_at = new Date();
console.log(db.root.created_at.getFullYear()); // Current Year
```

### 9. Regular Expressions
```javascript
db.root.pattern = /Awtsmoos/gi;
console.log(db.root.pattern.test("AWTSMOOS")); // true
```

### 10. Circular References (The Paradox)
```javascript
const a = { name: "Alpha" };
const b = { name: "Omega" };
a.link = b;
b.link = a;
db.root.paradox = a;
console.log(db.root.paradox.link.link.name); // "Alpha"
```

### 11. Custom Set Manifestation
```javascript
db.root.uniqueIds = new db.Set();
db.root.uniqueIds.add(101);
db.root.uniqueIds.add(101); // Ignored
console.log(db.root.uniqueIds.size); // 1
```

### 12. Batch Operations (Atomic Flow)
```javascript
db.batch(() => {
    db.root.a = 1;
    db.root.b = 2;
    db.root.c = 3;
}); // Single disk sync at the end
```

### 13. Hebrew Text Optimization
```javascript
db.root.msg = "ברוך השם לעולם ועד"; 
// Automatically uses Omni-Compression to save ~40% space
```

### 14. Massive String RLE
```javascript
db.root.void = "A" + " ".repeat(10000) + "Z";
// Uses 6 bytes on disk instead of 10,000
```

### 15. Key Deletion
```javascript
db.root.temp = "Temporary";
db.root.delete("temp");
console.log(db.root.temp); // undefined
```

### 16. Array Access Syntax
```javascript
db.root.myList = ["A", "B", "C"];
console.log(db.root.myList[1]); // "B"
```

### 17. Multi-Level Nesting
```javascript
db.root.universe = new db.Map();
db.root.universe.galaxy = new db.Map();
db.root.universe.galaxy.solar_system = { planet: "Earth" };
console.log(db.root.universe.galaxy.solar_system.planet); // "Earth"
```

### 18. Checking Existence
```javascript
if (db.root.user) {
    console.log("User exists in the vessels.");
}
```

### 19. Type Introspection
```javascript
// Internal symbols allow you to peek at the physical soul
const internals = db.root.config[Symbol.for('Awtsmoos.Internals')];
console.log(internals.type); // Type ID from constants.js
```

### 20. Persistence Proof
```javascript
db.root.savePoint = "Eternal";
db.close();
// --- Process restarts ---
db.open();
console.log(db.root.savePoint); // "Eternal"
```

---

## <a name="-complete-technical-spec"></a> ⚙️ Complete Technical Spec

*   **Block Size:** 4KB (Fixed). Optimized for SSD and NVMe sector alignment.
*   **Storage Limits:** 
    *   **Max Database Size:** 256 Terabytes (48-bit Block IDs).
    *   **Max Single Object Size:** Unlimited (Chain Allocation).
    *   **Max Keys per Object:** Millions (Hierarchical Dictionary).
*   **Performance Targets:**
    *   **Write Latency:** ~1ms (Immediate Pager Write).
    *   **Read Latency:** ~0.1ms (Buffered Cache Read).
    *   **Memory Footprint:** 15MB - 25MB (Stable).
*   **Reliability:** 
    *   **Synchronous IO:** `fs.fsyncSync` called after every high-level operation to ensure absolute persistence.
    *   **Zero Dependencies:** No external binary drivers or C++ addons. Pure JS *Achdus*.

---

**B"H.**
*The database is built. The vessels are ready. Fill them with the Light of your creation.*
