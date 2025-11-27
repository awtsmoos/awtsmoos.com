/**
 * B"H
 * DNS Record Generator
 * Run this to see what your DNS 'p=' value SHOULD be.
 */
var fs = require('fs');
var crypto = require('crypto');

try {
    var privateKey = fs.readFileSync('/root/keys/dkim_private.pem', 'utf-8');
    
    // Create the correct Public Key format (SPKI)
    var keyObj = crypto.createPrivateKey(privateKey);
    var publicKey = crypto.createPublicKey(keyObj).export({
        type: 'spki',    // <--- THIS IS WHAT DNS WANTS (SubjectPublicKeyInfo)
        format: 'pem'
    });

    // Strip headers and newlines to get the raw base64 string
    var dnsValue = publicKey
        .replace('-----BEGIN PUBLIC KEY-----', '')
        .replace('-----END PUBLIC KEY-----', '')
        .replace(/\s+/g, ''); // Remove all newlines/spaces

    console.log("\n========================================================");
    console.log("B\"H - DKIM Public Key Generator");
    console.log("========================================================");
    console.log("YOUR PRIVATE KEY GENERATES THIS PUBLIC STRING (p=):\n");
    console.log(dnsValue);
    console.log("\n========================================================");
    console.log("ACTION REQUIRED:");
    console.log("1. Go to your DNS provider.");
    console.log("2. Find the TXT record for: selector._domainkey");
    console.log("3. Ensure the 'p=' part matches the string above EXACTLY.");
    console.log("   (If it is different, UPDATE DNS NOW and wait 5 minutes).");
    console.log("========================================================\n");

} catch (e) {
    console.error("Error reading private key:", e.message);
}