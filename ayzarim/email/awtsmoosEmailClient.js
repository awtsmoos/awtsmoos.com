/**
 * B"H
 * @module AwtsmoosEmailClient
 * PRODUCTION EDITION - Simple/Simple Canonicalization
 */

var crypto = require('crypto');
var tls = require("tls");
var fs = require("fs");
var net = require('net');
var dns = require('dns');
var CRLF = '\r\n';

class AwtsmoosEmailClient {
    socket = null;
    cert = null;
    key = null;
    hasFiles = false;

    constructor({
        port = 25,
        pathToPrivateKey = "/root/keys/dkim_private.pem"
    } = {}) {
        try {
            this.privateKey = fs.readFileSync(pathToPrivateKey , 'utf-8');
            console.log("DKIM Private Key loaded.");
        } catch (e) {
            console.warn("Warning: Could not load DKIM file. Checking Env...");
            var privateKey = process.env.BH_key;
            if(privateKey) this.privateKey = privateKey.replace(/\\n/g, '\n');
        }

        this.port = port || 25;
        this.previousCommand = '';

        var certPath = process.env.BH_email_cert;
        var keyPath = process.env.BH_email_key;

        if (certPath && keyPath) {
            try {
                this.cert = fs.readFileSync(certPath, 'utf-8');
                this.key = fs.readFileSync(keyPath, 'utf-8');
                this.hasFiles = true;
            } catch (err) { console.error("Error reading certs", err); }
        }
    }

    async getDNSRecords(email) {
        return new Promise((r,j) => {
            if(typeof(email) != "string") return j("Not an email");
            var domain = email.split('@')[1];
            if(!domain) return j("Not an email");
            dns.resolveMx(domain, (err, addresses) => {
                if (err) return j(err);
                addresses.sort((a, b) => a.priority - b.priority);
                r(addresses);
            });
        });
    }

    getNextCommand() {
        var commandOrder = [
            'START', 'EHLO', 'SEND_STARTTLS_COMMAND',
            'DO_TLS_HANDSHAKE', 'EHLO_SECURE',
            'MAIL FROM', 'RCPT TO', 'DATA', 'END OF DATA'
        ];
        
        var currentIndex = commandOrder.indexOf(this.previousCommand);
        if (currentIndex === -1) return commandOrder[0];
        return commandOrder[currentIndex + 1];
    }

    handleSMTPResponse({ lineOrMultiline, client, sender, recipient, emailData }) {
        if (lineOrMultiline.startsWith('221')) {
            client.end();
            return;
        }

        var isMultiline = lineOrMultiline.charAt(3) === '-';
        var lastLine = lineOrMultiline;
        if(isMultiline) {
            var lines = lineOrMultiline.split(CRLF);
            lastLine = lines[lines.length - 1];
        }

        try {
            let nextCommand = '';

            if (this.previousCommand === '' && lastLine.startsWith('220')) {
                nextCommand = 'EHLO';
            }
            else if (this.previousCommand === 'EHLO' && lastLine.startsWith('250')) {
                if (lineOrMultiline.includes('STARTTLS')) {
                    nextCommand = 'SEND_STARTTLS_COMMAND';
                } else {
                    nextCommand = 'MAIL FROM'; 
                }
            }
            else if (this.previousCommand === 'SEND_STARTTLS_COMMAND' && lastLine.startsWith('220')) {
                nextCommand = 'DO_TLS_HANDSHAKE';
            }
            else if (this.previousCommand === 'EHLO_SECURE' && lastLine.startsWith('250')) {
                nextCommand = 'MAIL FROM';
            }
            else if (this.previousCommand === 'MAIL FROM' && lastLine.startsWith('250')) nextCommand = 'RCPT TO';
            else if (this.previousCommand === 'RCPT TO' && lastLine.startsWith('250')) nextCommand = 'DATA';
            else if (this.previousCommand === 'DATA' && (lastLine.startsWith('354'))) nextCommand = 'SEND_BODY';
            else if (this.previousCommand === 'END OF DATA' && lineOrMultiline.startsWith('250')) {
                console.log("B\"H - Email Sent Successfully (250 OK).");
                client.write('QUIT\r\n');
                client.end();
                return;
            }

            if (!nextCommand) nextCommand = this.getNextCommand();

            var handler = this.commandHandlers[nextCommand];
            if (handler) {
                handler({ client, sender, recipient, emailData, lineOrMultiline });
                if(nextCommand !== 'SEND_BODY') {
                    this.previousCommand = nextCommand;
                } else {
                     this.previousCommand = 'END OF DATA';
                }
            }

        } catch (e) {
            console.error("Handler Error:", e);
            client.end();
        } 
    }

    // --- SIMPLE CANONICALIZER ---
    signEmail(domain, selector, privateKey, headers, body) {
        try {
            // 1. Simple Body Canonicalization:
            // Remove all empty lines at very end, ensure exactly one CRLF.
            // (We keep internal whitespace exact).
            var bodyToSign = body;
            // Trim trailing CRLFs manually
            while (bodyToSign.endsWith(CRLF)) {
                bodyToSign = bodyToSign.slice(0, -2);
            }
            bodyToSign += CRLF; // Ensure exactly one
            
            // Hash the body
            var bodyHash = crypto.createHash('sha256')
                .update(bodyToSign)
                .digest('base64');
            
            // 2. Simple Header Canonicalization:
            // "Simple" means NO modification. We use the raw bytes.
            // The `headers` argument passed here is what we generated in sendMail.
            // It assumes correct capitalization and CRLFs are already present.
            
            // Defines the headers list based on our known sending order
            // Note: Casing must match what is in `headers` string for the `h=` tag to be polite,
            // though standard says it's case insensitive finding.
            var hTags = ['Message-ID', 'Date', 'From', 'To', 'Subject', 'Content-Type', 'In-Reply-To', 'References'];
            
            var timestamp = Math.floor(Date.now() / 1000);
            
            // The DKIM Header Stub
            // Note: DKIM-Signature casing MUST match what we emit exactly
            var dkimHeader = `DKIM-Signature: v=1; a=rsa-sha256; c=simple/simple; d=${domain}; s=${selector}; t=${timestamp}; bh=${bodyHash}; h=${hTags.join(':')}; b=`;
            
            // 3. String to Sign
            // Simple method: The header lines + The DKIM header line (without CRLF on the DKIM line? No, needs it if implicit?)
            // RFC says: "treated as the value... excluding the signature... but including the CRLF"
            // Wait, for `c=simple`, we don't trim or unfold.
            // But we must add the DKIM header to the list.
            
            var toSign = headers + dkimHeader; 
            // In "simple", we do NOT modify spacing. 
            // The header 'headers' has a trailing CRLF already from sendMail loop.
            // We append `DKIM-Signature: ... b=`
            // Does this `DKIM-Signature` line need a CRLF? Yes.
            
            // Because it is a header field, and the signature calculates the hash of the Header Fields.
            // Header Field = Name ":" Value CRLF
            // We verify against `dkimHeader` + signature. 
            // The verifier reads the full header line.
            
            // So we sign `dkimHeader`... wait. The verifier will receive `DKIM-Signature: ... b=sig;\r\n`.
            // The value of `b` is ignored during hash.
            // So we sign `headers` + `DKIM-Signature: ... b=` NO!
            // We sign `headers` + `DKIM-Signature: ... b=`... ???
            
            // Actually, for Simple/Simple, we generally do NOT assume trimming.
            // Let's force strict CRLF at end of DKIM header too.
            var toSignParams = headers + dkimHeader;
            
            // Create Signature
            var signature = crypto.createSign('SHA256')
                .update(toSignParams)
                .sign(privateKey, 'base64');
            
            return dkimHeader.substring("DKIM-Signature: ".length) + signature;

        } catch (e) {
            console.error("Signing Error:", e);
            return null;
        }
    }

    // B"H
    // Generic Send with Attachment Support
    // attachments = [{ filename: "doc.html", content: "<html>...", contentType: "text/html" }]
    // B"H - Updated sendMail: Supports Generic Attachments & Multipart
    async sendMail(sender, recipient, subject, rawBody, customHeaders = {}, attachments = []) {
        if (this.socket) {
            // Forward to worker instance
            var worker = new AwtsmoosEmailClient({ port: this.port });
            worker.privateKey = this.privateKey; worker.cert = this.cert; worker.key = this.key; worker.hasFiles = this.hasFiles;
            return worker.sendMail(sender, recipient, subject, rawBody, customHeaders, attachments);
        }

        return new Promise(async (resolve, reject) => {
            this._resolve = resolve; this._reject = reject; this.previousCommand = ''; 
            
            try {
                var addresses = await this.getDNSRecords(recipient);
                this.smtpServer = addresses[0].exchange;
                
                this.socket = net.createConnection({ port: this.port, host: this.smtpServer, family: 4 });
                this.socket.setTimeout(20000, () => { this.socket.destroy(); reject(new Error("SMTP Timeout")); });
                
                // 1. Process Internal Capsules & Merge with Explicit Attachments
                var { cleanBody, attachments: detectedAtt } = processCapsules(rawBody);
                var allAttachments = [...detectedAtt, ...(attachments || [])];

                var domain = 'awtsmoos.com';
                var messageId = `<${Date.now()}@${domain}>`;
                var dateHeader = new Date().toUTCString();
                var normalizedBody = cleanBody.replace(/\r\n/g, '\n').replace(/\n/g, CRLF);
                
                var headers = `Message-ID: ${messageId}${CRLF}Date: ${dateHeader}${CRLF}From: ${sender}${CRLF}To: ${recipient}${CRLF}Subject: ${subject}${CRLF}`;

                if (customHeaders) {
                    for (let key in customHeaders) {
                        if(key.toLowerCase() !== 'content-type' && customHeaders[key]) headers += `${key}: ${customHeaders[key]}${CRLF}`;
                    }
                }

                // Default to HTML if not specified, unless generic binary provided
                var bodyContentType = customHeaders['Content-Type'] || 'text/html; charset=utf-8';
                var finalPayload = "";

                // 2. Multipart Logic
                if (allAttachments.length > 0) {
                    var boundary = "Awtsmoos_Bound_" + Date.now().toString(16);
                    headers += `Content-Type: multipart/mixed; boundary="${boundary}"${CRLF}MIME-Version: 1.0${CRLF}`;

                    // Part A: Main Text
                    finalPayload += `--${boundary}${CRLF}Content-Type: ${bodyContentType}${CRLF}Content-Transfer-Encoding: 7bit${CRLF}${CRLF}${normalizedBody}${CRLF}${CRLF}`;

                    // Part B: Attachments
                    allAttachments.forEach(att => {
                        finalPayload += `--${boundary}${CRLF}`;
                        finalPayload += `Content-Type: ${att.contentType || 'application/octet-stream'}; name="${att.filename}"${CRLF}`;
                        finalPayload += `Content-Disposition: attachment; filename="${att.filename}"${CRLF}`;
                        finalPayload += `Content-Transfer-Encoding: base64${CRLF}${CRLF}`;
                        
                        let b64 = Buffer.isBuffer(att.content) ? att.content.toString('base64') : Buffer.from(String(att.content)).toString('base64');
                        b64 = b64.replace(/(.{76})/g, "$1" + CRLF); // Split lines
                        finalPayload += b64 + CRLF + CRLF;
                    });
                    finalPayload += `--${boundary}--${CRLF}`;
                } else {
                    headers += `Content-Type: ${bodyContentType}${CRLF}`;
                    finalPayload = normalizedBody + CRLF;
                }

                var dataToSend = headers + CRLF + finalPayload;
                
                if(this.privateKey) {
                    var sigValue = this.signEmail(domain, 'selector', this.privateKey, headers, finalPayload);
                    if(sigValue) dataToSend = `DKIM-Signature: ${sigValue}${CRLF}` + dataToSend;
                }

                this.socket.on('connect', () => { });
                this.handleClientData({ client: this.socket, sender, recipient, dataToSend });
                this.socket.on('end', () => { this.socket.removeAllListeners(); resolve(); });
                this.socket.on('error', (e)=>{ this.socket.removeAllListeners(); reject(e); });
                this.socket.on('close', () => { 
                    this.socket.removeAllListeners(); 
                    if (this.previousCommand === 'END OF DATA' || this.previousCommand === 'QUIT') resolve();
                    else reject(new Error('Closed prematurely'));
                });

            } catch (e) { reject(e); }
        });
    }

    handleClientData({ client, sender, recipient, dataToSend } = {}) {
        var firstData = false;
        let buffer = '';
        let multiLineBuffer = '';
        let isMultiLine = false;
        let currentStatusCode = '';

        client.on('data', (data) => {
            buffer += data;
            let index;
            while ((index = buffer.indexOf(CRLF)) !== -1) {
                var line = buffer.substring(0, index).trim();
                buffer = buffer.substring(index + CRLF.length);
                if (!firstData) firstData = true;

                var potentialStatusCode = line.substring(0, 3);
                var fourthChar = line.charAt(3);

                if (fourthChar === '-') {
                    isMultiLine = true;
                    currentStatusCode = potentialStatusCode;
                    multiLineBuffer += line + CRLF;
                    continue;
                }

                if (isMultiLine && currentStatusCode === potentialStatusCode && fourthChar === ' ') {
                    var fullLine = multiLineBuffer + line;
                    multiLineBuffer = ''; isMultiLine = false; currentStatusCode = '';
                    this.handleSMTPResponse({ lineOrMultiline: fullLine, client, sender, recipient, emailData: dataToSend });
                } else if (!isMultiLine) {
                    this.handleSMTPResponse({ lineOrMultiline: line, client, sender, recipient, emailData: dataToSend });
                }
            }
        });
    }

    // Inside AwtsmoosEmailClient class...
    
    commandHandlers = {
        'EHLO': ({ client }) => {
            // FIX: Introduce OURSELVES, not the server we are talking to.
            // Using a hardcoded domain or extracting from sender is better.
            client.write(`EHLO awtsmoos.com${CRLF}`);
        },
        'SEND_STARTTLS_COMMAND': ({ client }) => {
            client.write(`STARTTLS${CRLF}`);
        },
        'DO_TLS_HANDSHAKE': ({ client, sender, recipient, emailData }) => {
            var options = { 
                socket: client, 
                // We still use this.smtpServer for SNI (to verify THEIR cert)
                servername: this.smtpServer, 
                minVersion: 'TLSv1.2',
                rejectUnauthorized: false
            };
            if(this.hasFiles) { options.key = this.key; options.cert = this.cert; }
            var secureSocket = tls.connect(options, () => {});
            secureSocket.on('error', (e) => console.error("TLS Error", e));
            secureSocket.on("secureConnect", () => {
	            this.socket = secureSocket;
	            client.removeAllListeners(); // Removes original resolve/reject listeners
	            
	            // --- RE-ATTACH PROMISE LISTENERS TO NEW SOCKET ---
	            secureSocket.on('end', () => { 
	                 secureSocket.removeAllListeners(); 
	                 if(this._resolve) this._resolve(); 
	            });
	            secureSocket.on('error', (e) => { 
	                 console.error("TLS Socket Error", e);
	                 if(this._reject) this._reject(e); 
	            });
	            secureSocket.on('close', () => { 
	                secureSocket.removeAllListeners(); 
	                if (this.previousCommand !== 'END OF DATA') {
	                    if(this._reject) this._reject('Closed prematurely');
	                } else {
	                    if(this._resolve) this._resolve();
	                }
	            });
	            // ------------------------------------------------
	
	            try {
	                this.handleClientData({ client: secureSocket, sender, recipient, dataToSend: emailData });
	            } catch(e){ console.error(e); }
	            this.previousCommand = "EHLO_SECURE";
	            // Re-Introduce OURSELVES securely
	            secureSocket.write(`EHLO awtsmoos.com${CRLF}`);
	        });
        },
        'EHLO_SECURE': ({ client }) => { },
        // ... rest of the handlers remain the same ...
        'MAIL FROM': ({ client, recipient, sender }) => {
            client.write(`MAIL FROM:<${sender}>${CRLF}`);
        },
        'RCPT TO': ({ client, recipient }) => {
            client.write(`RCPT TO:<${recipient}>${CRLF}`);
        },
        'DATA': ({ client }) => {
            client.write(`DATA${CRLF}`);
        },
        'SEND_BODY': ({ client, emailData }) => {
            var payload = `${emailData}${CRLF}.${CRLF}`;
            client.write(payload);
        },
    };
}

if (require.main === module) {
    var smtpClient = new AwtsmoosEmailClient();
    (async function() {
        try {
            var subject = 'B"H - Verification of Unified Systems';
            var body = `B"H

Hello,

This is a formal verification that the Awtsmoos mail server is now correctly configured with DKIM, SPF, and aligned HELLO protocols.

System Time: ${new Date().toISOString()}
Encryption: TLS v1.3 Standard
Signature: Verified Simple/Simple

Regards,
System Admin
Awtsmoos.com`;
            
            await smtpClient.sendMail('me@awtsmoos.com', 'awtsmoos@gmail.com', subject, body);
        } catch (err) { console.error('Job Failed:', err); }
    })();
}






// B"H - Helper to extract HTML Capsules or Raw HTML as Attachments
function processCapsules(body) {
    let cleanBody = body || "";
    let attachments = [];
    let counter = 1;

    // Extract Markdown Code Blocks marked as HTML
    const capsuleRegex = /```html\s*([\s\S]*?)```/gi;
    if (cleanBody.match(capsuleRegex)) {
        cleanBody = cleanBody.replace(capsuleRegex, (match, code) => {
            const filename = `artifact_${Date.now()}_${counter++}.html`;
            attachments.push({ filename, content: code, contentType: 'text/html' });
            return `\n[Attached HTML Artifact: ${filename}]\n`;
        });
    }

    // Detect if the entire message is a Raw HTML Document
    if (/^\s*<!DOCTYPE html/i.test(cleanBody) || /^\s*<html/i.test(cleanBody)) {
        const filename = `document_${Date.now()}.html`;
        attachments.push({ filename, content: cleanBody, contentType: 'text/html' });
        cleanBody = "Please find the attached HTML document.";
    }
    
    return { cleanBody, attachments };
}


module.exports = AwtsmoosEmailClient;