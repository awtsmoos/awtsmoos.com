// B"H
// rfc_final_test.js: Final, definitive, fully-logged validation.

'use strict';

const { GevurahCipher } = require('../ayzarim/ssh/Gevurah-Crypto.js');
const { createCipheriv } = require('crypto'); // We need this for the log section

console.log('--- RUNNING FINAL CORRECTED RFC VALIDATION ---');

// === INPUTS (From your original rfc_test.js) ===
const keyMaterial = Buffer.from(
    '8bbff6855fc102338c373e73aac0c914f076a905b2444a32eecaffeae22becc5' + // K_1
    'e9b7a7a5825a8249346ec1c28301cf394543fc7569887d76e168f37562ac0740', // K_2
    'hex'
);

const text = Buffer.from('Lorem ipsum dolor sit amet, consectetur adipisicing elit', 'ascii');
const logicalPayload = Buffer.allocUnsafe(1 + 4 + 4 + text.length);
let p = 0;
logicalPayload[p++] = 0x5e;
logicalPayload.writeUInt32BE(0, p); p += 4;
logicalPayload.writeUInt32BE(text.length, p); p += 4;
text.copy(logicalPayload, p);

const seq_no = 7n;

// === EXPECTED OUTPUTS (From your logged test failure with corrected keys) ===
// These are our targets.
const expectedEncryptedLength = '2c3ecce4';
const expectedEncryptedPayload = 'a5bc05895bf07a7ba956b6c68829ac7c' +
                               '83b780b7000ecde745afc705bbc378ce' +
                               '03a280236b87b53bed5839662302b164' +
                               'b6286a48cd1e097138e3cb909b8b2b82' +
                               '9dd18d2a35ff82d9';
const expectedAuthTag = '95349e855bf02c298ef775f2d1a7e8b8';

// --- RUN THE REAL METHOD AND CAPTURE OUTPUT ---
const outputs = [];
const onWrite = (data) => { outputs.push(data); };

const cipher = new GevurahCipher('chacha20-poly1305@openssh.com', null, null, keyMaterial, null, onWrite);
cipher.outSeqno = seq_no;
cipher.encrypt(logicalPayload, true); // The 'true' flag ensures the same static padding is used.

const [actualEncryptedLen, actualEncryptedPayload, actualAuthTag] = outputs;

// --- FULL LOGGING AND VERIFICATION ---
console.log('\n--- FULL DIAGNOSTIC LOG & VERIFICATION ---');

const logAndVerify = (name, expected, actual) => {
    const actualHex = actual ? actual.toString('hex') : 'null';
    const isMatch = (actualHex === expected);
    const status = isMatch ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m';
    console.log(`\n[VERIFY] ${name.padEnd(20)}: ${status}`);
    console.log(`  - Expected: ${expected}`);
    console.log(`  - Actual  : ${actualHex}`);
};

logAndVerify('Encrypted Length', expectedEncryptedLength, actualEncryptedLen);
logAndVerify('Encrypted Payload', expectedEncryptedPayload, actualEncryptedPayload);
logAndVerify('Authentication Tag', expectedAuthTag, actualAuthTag);

if (outputs.length === 3 &&
    actualEncryptedLen.toString('hex') === expectedEncryptedLength &&
    actualEncryptedPayload.toString('hex') === expectedEncryptedPayload &&
    actualAuthTag.toString('hex') === expectedAuthTag) {
    console.log('\n\x1b[32mSUCCESS: The GevurahCipher encrypt method is now fully correct and verified.\x1b[0m');
} else {
     console.log('\n\x1b[31mFAILURE: Logic is still incorrect. Review logged values.\x1b[0m');
}