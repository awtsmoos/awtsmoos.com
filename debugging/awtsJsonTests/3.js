//B"H
const fs = require("fs");
const path = require("path");
const awts = require("../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js");
const deleteKey = require("../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/operations/obj/deleteKeyFromJSON.js");

const TEST_PATH = "debugging/awtsJsonTests/INTENSE.awts";

// 🔥 Raw Chaos Object
const chaos = {
  deep:{
k:8,
p:{
  m:78,
  k:676
}
  },
  numericMadness: {
    positiveInfinity: Infinity,
    negativeInfinity: -Infinity,
    nanValue: NaN,
    maxSafe: Number.MAX_SAFE_INTEGER,
    minSafe: Number.MIN_SAFE_INTEGER,
    floatHell: 1.2345678910111213141516,
  },
  functions: {
    rawFn: function greet(name) { return "👁️ Hello, " + name; },
    arrowFn: (x) => x * x,
    anonFn: function() { return "anonymous darkness"; }
  },
 // recursion: {},
  deepArrays: Array.from({ length: 2 }, (_, i) => ({
    index: i,
    val: i * Math.PI,
    fn: () => i + 42,
    nested: [{ insanity: true }]
  }))
};

// Create circular reference (should be skipped or cause warning)
//chaos.recursion.self = chaos;

const buffer = awts.serializeJSON(chaos);
fs.writeFileSync(TEST_PATH, buffer);

const readBack = awts.deserializeBinary(TEST_PATH);
console.log("🔁 Decoded (post chaos):", readBack);



const postDelete = awts.deserializeBinary(TEST_PATH);
console.log("🪓 After delete (functions.arrowFn):", postDelete);

// 🧠 Map With Wild Includes
const filterResults = awts.mapObject(TEST_PATH, {
  numericMadness: {
    positiveInfinity: { equals: Infinity },
    negativeInfinity: { equals: -Infinity },
    nanValue: { equals: NaN }  // will fail, as NaN !== NaN
  },
  functions: true,
  deep: {
p:{
  m: true
}
  }
});
console.log("🧬 Filter mapped:", filterResults);

// ♻️ Re-serialize the readBack object again to test function re-entry
const reEncoded = awts.serializeJSON(readBack);
fs.writeFileSync(TEST_PATH, reEncoded);

// 📤 Final buffer test
const finalRound = awts.deserializeBinary(TEST_PATH);
console.log("🧨 Final load:", finalRound);

// ⏱️ Performance + Repetition
console.time("🌪️ 100 appends");
for (let i = 0; i < 5; i++) {
  awts.append(TEST_PATH, {
    key: `level_${i}`,
    value: {
      timestamp: Date.now(),
      payload: `🔥🔥🔥_${i}`,
      inf: Infinity,
      fn: () => `Function_${i}`
    }
  });
}
console.timeEnd("🌪️ 100 appends");

const finalRead = awts.deserializeBinary(TEST_PATH);
console.log("🛠️ After 100 appends:", finalRead);

// ✅ Deep Validate Function Content as Strings
const originalFnString = chaos.functions.rawFn.toString();
const decodedFnString = finalRead.functions?.rawFn?.toString?.() || "null";
if (originalFnString !== decodedFnString) {
  console.warn("⚠️ Function string mismatch!");
} else {
  console.log("✅ Function preserved:", decodedFnString);
}

console.log("\n💥 INTENSE TESTS COMPLETED — AWTSMOOS SITS IN THE VOID 💥");
