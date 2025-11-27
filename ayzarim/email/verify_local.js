// B"H
/**
 * LOCAL DKIM VERIFIER
 * This mimics what Gmail does.
 */

var crypto = require('crypto');
var fs = require('fs');
var Client = require('./awtsmoosEmailClient'); // Adjust path to your class

async function test() {
    console.log("--- B\"H Starting Local DKIM Simulation ---");

    // 1. Setup Mock Data
    var client = new Client();
    
    // Check key
    if(!client.privateKey) {
        console.error("No private key found! Check your constructor or ENV.");
        return;
    }

    var domain = "awtsmoos.com";
    var selector = "selector";
    
    // We assume the PUBLIC KEY matches what you have in DNS.
    // For local testing, we extract the Public Key from the Private Key.
    var pubKeyObject = crypto.createPublicKey(client.privateKey);
    var publicKeyPem = pubKeyObject.export({ type: 'pkcs1', format: 'pem' });
    
    var headers = 
        "Message-ID: <12345@awtsmoos.com>\r\n" +
        "Date: Thu, 27 Nov 2025 00:00:00 GMT\r\n" +
        "From: me@awtsmoos.com\r\n" +
        "To: awtsmoos@gmail.com\r\n" +
        "Subject: B\"H Test"; // Note: raw headers often end without CRLF on last line until joined

    var body = "This is a test body.\r\nIt has two lines.";

    // 2. RUN SIGNING (This runs YOUR code)
    console.log("Signing...");
    // We add CRLF to headers just like sendMail does before passing
    var fullHeaders = headers + '\r\n'; 
    var signatureHeaderVal = client.signEmail(domain, selector, client.privateKey, fullHeaders, body);
    
    if(!signatureHeaderVal) {
        console.error("Signing returned null!");
        return;
    }
    console.log("Generated Signature Header Value:\n" + signatureHeaderVal);

    // 3. RECONSTRUCT What Google Sees
    // Google sees: DKIM-Signature: ... \r\n + Headers + \r\n + Body
    
    // Parse the DKIM header to find 'h', 's', 'd', 'b', 'bh'
    // But for verification, we just need to reconstruct the Signed String (Canonicalized).
    
    // A. Re-Calculate Body Hash
    var { canonicalBody } = client.canonicalizeRelaxed(null, body);
    var freshBodyHash = crypto.createHash('sha256').update(canonicalBody).digest('base64');
    console.log("Verifier Body Hash: " + freshBodyHash);

    // Extract bh from signature
    var bhMatch = signatureHeaderVal.match(/bh=([^;]+)/);
    if(bhMatch[1] !== freshBodyHash) {
        console.error("❌ BODY HASH MISMATCH!");
        console.error("Signed bh: " + bhMatch[1]);
        console.error("Actual bh: " + freshBodyHash);
        // If this happens, fix body canonicalization
    } else {
        console.log("✅ Body Hash matches.");
    }

    // B. Re-Construct Headers String to Verify
    // 1. Identify headers in h=
    var hMatch = signatureHeaderVal.match(/h=([^;]+)/);
    var hTags = hMatch[1].split(':'); // [Message-ID, Date, ...]

    // 2. Build Raw Headers string from hTags order
    var verifierRawHeaders = "";
    hTags.forEach(name => {
        var regex = new RegExp(`^${name}:.*$`, 'mi');
        var match = fullHeaders.match(regex);
        if(match) verifierRawHeaders += match[0] + '\r\n';
    });

    // 3. Canonicalize those headers
    var { canonicalHeaders } = client.canonicalizeRelaxed(verifierRawHeaders, null);

    // 4. Create the DKIM header to verify
    // We must take the existing signature value, REMOVE the signature (b=...), 
    // but KEEP the empty b=
    
    var sigMatch = signatureHeaderVal.match(/b=([^;]*)$/);
    var actualSignature = sigMatch[1];
    
    // The "Header" part for hash includes everything up to "b="
    // Use regex to strip the signature data but keep "b="
    var dkimHeaderNoSig = signatureHeaderVal.replace(/b=[^;]*$/, 'b=');
    
    // Canonicalize IT (relaxed)
    var dkimCanonical = "dkim-signature:" + dkimHeaderNoSig.replace(/\s+/g, ' ').trim();
    
    // 5. Total String
    var stringToVerify = canonicalHeaders + dkimCanonical;

    console.log("--- Verifying String (Preview) ---");
    console.log(JSON.stringify(stringToVerify).substring(0, 100) + "...");

    // 6. CRYPTO VERIFY
    var verify = crypto.createVerify('SHA256');
    verify.update(stringToVerify);
    var valid = verify.verify(publicKeyPem, actualSignature, 'base64');

    if(valid) {
        console.log("\n🎉 VICTORY! The signature verifies LOCALLY.");
        console.log("If Gmail fails now, it is due to 'socket' issues (e.g. unexpected extra \\n or \\r).");
    } else {
        console.log("\n💀 DEFEAT! Local verification FAILED.");
        console.log("This means the logic inside signEmail != verification logic.");
    }
}

test();