//B"H
var fs = require('fs');
var crypto = require('crypto');
var dns = require('dns');

// 1. Load Private Key
try {
    var privateKey = fs.readFileSync('/root/keys/dkim_private.pem', 'utf-8');
    console.log("✅ Private Key loaded.");
} catch (e) {
    console.log("❌ CRITICAL: Could not read private key file!");
    process.exit(1);
}

// 2. Fetch Public Key from DNS
console.log("... Querying DNS for selector._domainkey.awtsmoos.com ...");

dns.resolveTxt('selector._domainkey.awtsmoos.com', (err, records) => {
    if (err) {
        console.log("❌ DNS Lookup Failed:", err);
        return;
    }

    // Join the parts if DNS returned split strings
    var record = records[0].join('');
    console.log("✅ DNS Record Found: " + record.substring(0, 30) + "...");

    // Extract the key (p=...)
    var match = record.match(/p=([^;]+)/);
    if (!match) {
        console.log("❌ Could not find 'p=' in DNS record.");
        return;
    }

    var publicKeyStr = match[1];
    var publicKeyPem = '-----BEGIN PUBLIC KEY-----\n' + 
                       publicKeyStr.match(/.{1,64}/g).join('\n') + 
                       '\n-----END PUBLIC KEY-----';

    // 3. The Test: Sign and Verify
    try {
        var testData = "B\"H - Testing 123";
        
        // Sign
        var sign = crypto.createSign('SHA256');
        sign.update(testData);
        var signature = sign.sign(privateKey, 'base64');

        // Verify
        var verify = crypto.createVerify('SHA256');
        verify.update(testData);
        var result = verify.verify(publicKeyPem, signature, 'base64');

        if (result) {
            console.log("\n🎉 SUCCESS: Your Private Key MATCHES the DNS Public Key!");
            console.log("   (This means your keys are perfect, and the bug is in the signing code logic.)");
        } else {
            console.log("\n💀 FAILURE: Keys DO NOT match.");
            console.log("   (This means you must regenerate keys and update DNS.)");
        }

    } catch (e) {
        console.log("❌ Crypto Error:", e.message);
    }
});