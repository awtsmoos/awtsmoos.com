// B"H
/**
 * LOCAL DKIM VERIFIER - DEBUG MODE
 */
var crypto = require('crypto');
var Client = require('./awtsmoosEmailClient'); 

async function test() {
    console.log("\n\n--- B\"H Starting DEBUG DKIM Verification ---");

    var client = new Client();
    if(!client.privateKey) { console.error("No private key."); return; }
    
    // Simulate Keys
    var pubKeyObject = crypto.createPublicKey(client.privateKey);
    var publicKeyPem = pubKeyObject.export({ type: 'pkcs1', format: 'pem' });

    // Mock Email Data
    var headers = 
        "Message-ID: <12345@awtsmoos.com>\r\n" +
        "Date: Thu, 27 Nov 2025 00:00:00 GMT\r\n" +
        "From: me@awtsmoos.com\r\n" +
        "To: awtsmoos@gmail.com\r\n" +
        "Subject: B\"H Test\r\n"; 
    var body = "This is a test body.\r\nIt has two lines.";

    console.log(">>> CALLING SIGNER...");
    var signatureHeaderVal = client.signEmail("awtsmoos.com", "selector", client.privateKey, headers, body);
    
    // --- VERIFYER LOGIC START ---
    console.log("\n>>> CALLING VERIFIER LOGIC...");
    
    var bMatch = signatureHeaderVal.match(/b=([^;]*)$/);
    var hMatch = signatureHeaderVal.match(/h=([^;]+)/);
    
    // 1. Reconstruct Headers
    var hTags = hMatch[1].split(':');
    var rawHeaderBlock = "";
    hTags.forEach(name => {
        var re = new RegExp(`^${name}:.*$`, 'mi');
        var m = headers.match(re);
        if(m) rawHeaderBlock += m[0] + '\r\n';
    });
    
    var { canonicalHeaders } = client.canonicalizeRelaxed(rawHeaderBlock, null);
    
    // 2. Reconstruct DKIM Line
    var dkimStub = signatureHeaderVal.replace(/b=[^;]*$/, 'b=');
    var canonicalDkim = "dkim-signature:" + dkimStub.replace(/\s+/g, ' ').trim();
    
    var stringToVerify = canonicalHeaders + canonicalDkim + '\r\n';
    
    var buf = Buffer.from(stringToVerify, 'utf-8');
    console.log("DEBUG: Verifier toSign HEX:", buf.toString('hex'));

    // Compare?
    // User must manually check console if they differ.
    
    var verify = crypto.createVerify('SHA256');
    verify.update(stringToVerify);
    var isValid = verify.verify(publicKeyPem, bMatch[1], 'base64');

    if(isValid) {
        console.log("\n🎉 VICTORY! Match!");
    } else {
        console.log("\n💀 DEFEAT! Mismatch.");
        console.log("COMPARE 'Final toSign HEX' (from signer) with 'Verifier toSign HEX' (above)!");
    }
}

test();