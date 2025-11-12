// B"H
// rfc_test.js: A script to validate the chacha20-poly1305 implementation
// against the worked example in draft-ietf-ssh-chacha20-poly1305-01, Appendix A.

'use strict';

const { GevurahCipher } = require('../ayzarim/ssh/Gevurah-Crypto.js');

console.log('--- RUNNING RFC WORKED EXAMPLE VALIDATION ---');

// Figure 5: Key material output from the key exchange
const keyMaterial = Buffer.from(
    '8bbff6855fc102338c373e73aac0c914' +
    'f076a905b2444a32eecaffeae22becc5' +
    'e9b7a7a5825a8249346ec1c28301cf39' +
    '4543fc7569887d76e168f37562ac0740',
    'hex'
);

// Figure 2->3: Constructing the logical payload
const text = Buffer.from('Lorem ipsum dolor sit amet, consectetur adipisicing elit', 'ascii');
const logicalPayload = Buffer.allocUnsafe(1 + 4 + 4 + text.length);
let p = 0;
logicalPayload[p++] = 0x5e; // SSH2_MSG_CHANNEL_DATA
logicalPayload.writeUInt32BE(0, p); p += 4; // recipient channel
logicalPayload.writeUInt32BE(text.length, p); p += 4;
text.copy(logicalPayload, p);

const outputs = [];
const onWrite = (data) => {
    outputs.push(data);
};

const cipher = new GevurahCipher('chacha20-poly1305@openssh.com', null, null, keyMaterial, null, onWrite);
cipher.outSeqno = 7n;
cipher.encrypt(logicalPayload, true);

// --- Verification ---
console.log('\n--- VERIFICATION AGAINST RFC FIGURES ---');

const rfcEncryptedLength = '2c3ecce4';
const rfcEncryptedPayload = 'a5bc05895bf07a7ba956b6c68829ac7c' +
                          '83b780b7000ecde745afc705bbc378ce' +
                          '03a280236b87b53bed5839662302b164' +
                          'b6286a48cd1e097138e3cb909b8b2b82' +
                          '9dd18d2a35ff82d9';
const rfcAuthTag = '95349e855bf02c298ef775f2d1a7e8b8';

const [encryptedLen, encryptedPayload, authTag] = outputs;

function verify(name, generated, expected) {
    const genHex = generated ? generated.toString('hex') : 'null';
    const status = (genHex === expected) ? 'MATCH' : 'MISMATCH';
    console.log(`[VERIFY] ${name.padEnd(20)}: ${status}`);
    if (status === 'MISMATCH') {
        console.log(`  - Expected: ${expected}`);
        console.log(`  - Generated: ${genHex}`);
    }
}

verify('Encrypted Length', encryptedLen, rfcEncryptedLength);
verify('Encrypted Payload', encryptedPayload, rfcEncryptedPayload);
verify('Authentication Tag', authTag, rfcAuthTag);
console.log('\n--- VALIDATION COMPLETE ---');