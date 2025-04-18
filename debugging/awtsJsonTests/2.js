//B"H
const fs = require("fs");
const path = require("path");
const awts = require("../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js");

//( buffer, key,)
var deleteEntry = require("../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/operations/obj/deleteKeyFromJSON.js")


const TEST_PATH = "debugging/awtsJsonTests/wow.awts";

// 1. Base Object
const baseObj = {
  level1: {
    str: "hello",
    num: 42,
    neg: -666,
    float: 3.14159,
    bool: true,
    nil: null,
    und: undefined,
    deep: {
      deeper: {
        deepest: {
          value: "🕳️ core essence 🕳️"
        }
      }
    }
  },
  array: [
    "string", 1234, -555.55, null, undefined, true, false,
    { inside: "object", arr: [1, 2, { whoa: "trippy" }] },
    [{ nestedArray: [1,2,3] }]
  ]
};

// 2. Serialize and write
const ser = awts.serializeJSON(baseObj);
fs.mkdirSync(path.dirname(TEST_PATH), { recursive: true });
fs.writeFileSync(TEST_PATH, ser);

// 3. Deserialize from both buffer and file
const des1 = awts.deserializeBinary(ser);
const des2 = awts.deserializeBinary(TEST_PATH);
console.assert(JSON.stringify(des1) === JSON.stringify(des2), "❌ Deserialization mismatch");

// 4. Keys and Metadata
const keys = awts.getKeysFromBinary(TEST_PATH);
console.log("🗝️ Keys in root:", keys);

const meta = awts.getMetadataByKey(TEST_PATH, "level1");
console.log("📐 Metadata for 'level1':", meta);

// 5. Filter Mapping
const filtered = awts.mapObject(TEST_PATH, {
  level1: {
    str: { includes: "hell" },
    deep: {
     /* deeper: {
        deepest: { value: true }
      }*/
   //  s:2
    }
  },
  array: true
});
console.log("🧭 Filtered:", filtered);

// 6. Append Fields
awts.append(TEST_PATH, { key: "newField", value: 9001 });
awts.append(TEST_PATH, { key: "array", value: ["append", 123] });

const postAppend = awts.deserializeBinary(TEST_PATH);
console.log("📦 After append:", postAppend);

// 7. Append Edge Cases
awts.append(TEST_PATH, { key: "nullify", value: null });
awts.append(TEST_PATH, { key: "undefinedField", value: undefined });
awts.append(TEST_PATH, { key: "infinity", value: Infinity });
awts.append(TEST_PATH, { key: "negInfinity", value: -Infinity });
awts.append(TEST_PATH, { key: "nanField", value: NaN });

const postEdge = awts.deserializeBinary(TEST_PATH);
console.log("👹 After edge appends:", postEdge);

// 8. Append Repeating Fields
for (let i = 0; i < 10; i++) {
  awts.append(TEST_PATH, { key: `🔥key_${i}`, value: `value_${i}` });
}
const postRepeat = awts.deserializeBinary(TEST_PATH);
console.log("♻️ After repeated appends:", postRepeat);

// 9. Deserialize from raw buffer
const rawBuffer = fs.readFileSync(TEST_PATH);
const fromBuffer = awts.deserializeBinary(rawBuffer);
console.log("📤 Reborn from buffer:", fromBuffer);

// 10. Final Validation
const assertDeepEqual = (a, b) => {
  const aStr = JSON.stringify(a);
  const bStr = JSON.stringify(b);
  if (aStr !== bStr) throw new Error("💥 Objects not equal");
};
assertDeepEqual(postRepeat, fromBuffer);

console.log("\n✅ ALL TESTS PASSED: AWTSMOOS REVEALED IN BINARY 🧬");
