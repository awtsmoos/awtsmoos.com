/**
 * B"H
 * Strict Key & Signature Validator
 */
var fs = require('fs');
var crypto = require('crypto');
var dns = require('dns');

async function main() {
    console.log("--- B\"H Checking Keys ---");
    
    // 1. Load Private Key
    var privateKeyPem;
    try {
        privateKeyPem = fs.readFileSync('/root/keys/dkim_private.pem', 'utf-8');
        console.log("✅ Private Key loaded from file.");
    } catch(e) {
        console.error("❌ Failed to load private key:", e.message);
        return;
    }

    // 2. Extract Public Key from Private Key
    var publicKeyFromPrivate;
    try {
        var keyObj = crypto.createPrivateKey(privateKeyPem);
        publicKeyFromPrivate = crypto.createPublicKey(keyObj).export({type: 'pkcs1', format: 'pem'});
        // Standardize output
        publicKeyFromPrivate = publicKeyFromPrivate.replace(/(-----(BEGIN|END) PUBLIC KEY-----|\n)/g, '');
        console.log("✅ derived Public Key from Private Key.");
    } catch(e) {
        console.error("❌ Private Key seems invalid/corrupt:", e.message);
        return;
    }

    // 3. Fetch Public Key from DNS
    var selector = "selector";
    var domain = "awtsmoos.com";
    var lookup = `${selector}._domainkey.${domain}`;
    
    console.log(`\nQuerying DNS for ${lookup}...`);
    
    dns.resolveTxt(lookup, (err, records) => {
        if (err) {
            console.error("❌ DNS Lookup Failed:", err.message);
            console.log("   (Are you offline? Or is the DNS record missing?)");
            return;
        }
        
        // Handle split TXT records
        var txtStr = records[0].join('');
        console.log("✅ DNS Record retrieved.");

        // Extract p= value
        var match = txtStr.match(/p=([^;]+)/);
        if (!match) {
            console.error("❌ No 'p=' tag found in DNS record.");
            return;
        }
        
        var dnsPublicKey = match[1];
        console.log("DNS Public Key Fragment: " + dnsPublicKey.substring(0, 30) + "...");
        console.log("Derived Public Key Frag: " + publicKeyFromPrivate.substring(0, 30) + "...");

        // 4. Compare
        if (dnsPublicKey === publicKeyFromPrivate) {
            console.log("\n🎉 MATCH! Your Private Key matches the DNS Public Key.");
        } else {
            console.error("\n💀 MISMATCH! The Private Key on disk is NOT the one in DNS.");
            console.log("You must update your DNS record to match the key in /root/keys/dkim_private.pem");
            return;
        }

        // 5. Test Signing Logic
        console.log("\n--- Testing Crypto Sign/Verify Loop ---");
        try {
            var data = "B\"H header data";
            
            // Sign
            var sign = crypto.createSign('SHA256');
            sign.update(data);
            var signature = sign.sign(privateKeyPem, 'base64');
            console.log("✅ Signed dummy data.");

            // Verify with PEM
            var pubPem = `-----BEGIN PUBLIC KEY-----\n${dnsPublicKey.match(/.{1,64}/g).join('\n')}\n-----END PUBLIC KEY-----`;
            
            var verify = crypto.createVerify('SHA256');
            verify.update(data);
            var valid = verify.verify(pubPem, signature, 'base64');
            
            if (valid) {
                console.log("🎉 SUCCESS: Crypto module verifies successfully locally.");
                console.log("   Conclusion: Keys are good. Issue is definitely in header formatting.");
            } else {
                console.error("❌ FAILED: Signed data could not be verified by Public Key.");
            }
        } catch(e) {
            console.error("❌ Crypto Error:", e);
        }
    });
}

main();