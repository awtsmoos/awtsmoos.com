/**
 * B"H
 * @module AwtsmoosEmailClient
 * PARANOID LOGGING EDITION
 */

var crypto = require('crypto');
var tls = require("tls");
var fs = require("fs");
var net = require('net');
var dns = require('dns');
var CRLF = '\r\n';

class AwtsmoosEmailClient {
    socket = null;
    useTLS = false;
    cert = null;
    key = null;

    constructor({
        port = 25,
        pathToPrivateKey = "/root/keys/dkim_private.pem"
    } = {}) {
        try {
            this.privateKey = fs.readFileSync(pathToPrivateKey , 'utf-8');
            console.log("DEBUG: Private Key loaded successfully.");
        } catch (e) {
            console.warn("Warning: Could not load DKIM file. Checking Env...");
            var privateKey = process.env.BH_key;
            if(privateKey) this.privateKey = privateKey.replace(/\\n/g, '\n');
        }

        this.port = port || 25;
        this.multiLineResponse = '';
        this.previousCommand = '';

        var certPath = process.env.BH_email_cert;
        var keyPath = process.env.BH_email_key;

        if (certPath && keyPath) {
            try {
                this.cert = fs.readFileSync(certPath, 'utf-8');
                this.key = fs.readFileSync(keyPath, 'utf-8');
                this.useTLS = true;
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
            'START', 'EHLO', 'STARTTLS', 'EHLO',
            'MAIL FROM', 'RCPT TO', 'DATA', 'END OF DATA'
        ];
        var currentIndex = commandOrder.indexOf(this.previousCommand);
        if (currentIndex === -1) return commandOrder[0];
        if (this.previousCommand === 'STARTTLS') return 'EHLO';
        return commandOrder[currentIndex + 1];
    }

    handleSMTPResponse({ lineOrMultiline, client, sender, recipient, emailData }) {
        if (lineOrMultiline.startsWith('221')) {
            console.log("Server closed (221). Done.");
            client.end();
            return;
        }

        this.handleErrorCode(lineOrMultiline);

        var isMultiline = lineOrMultiline.charAt(3) === '-';
        var lastLine = lineOrMultiline;
        if(isMultiline) {
            var lines = lineOrMultiline.split(CRLF);
            lastLine = lines[lines.length - 1];
        }

        this.multiLineResponse = ''; 

        try {
            let nextCommand = this.getNextCommand();
            
            if (lastLine.includes('250-STARTTLS') || (lastLine.startsWith('220 ') && lastLine.includes('Ready to start TLS'))) {
                // Determine logic based on specific server responses
                if (lastLine.startsWith('220')) nextCommand = 'STARTTLS';
            } else if (this.previousCommand === 'STARTTLS' && lastLine.startsWith('250 ')) {
                this.previousCommand = 'EHLO'; 
            }

            if (this.previousCommand === 'END OF DATA' && lineOrMultiline.startsWith('250')) {
                console.log("B\"H - Success! 250 Received. Quitting.");
                client.write('QUIT\r\n');
                client.end();
                return;
            }

            var handler = this.commandHandlers[nextCommand];
            if (!handler) {
               // Default behavior, keep going
            }
            
            // Execute handler
            if (handler) {
                 handler({ client, sender, recipient, emailData, lineOrMultiline });
            }
            
            if (nextCommand !== 'DATA') this.previousCommand = nextCommand;

        } catch (e) {
            console.error("Handler Error:", e.message);
            client.end();
        } 
    }

    handleErrorCode(line) {
        if (line.startsWith('4') || line.startsWith('5')) {
            console.error("SMTP Error Code Detected: " + line);
        }
    }

    // --- LOGGING CANONICALIZER ---
    canonicalizeRelaxed(headers, body) {
        // Headers
        var canonicalHeadersStr = "";
        if (headers) {
            var headerLines = headers.split(CRLF).filter(l => l.trim().length > 0);
            var processHeader = (line) => {
                var split = line.indexOf(':');
                if (split === -1) return line; 
                var key = line.substring(0, split).toLowerCase().trim();
                var value = line.substring(split + 1).replace(/\s+/g, ' ').trim();
                return key + ':' + value;
            };
            canonicalHeadersStr = headerLines.map(processHeader).join(CRLF) + CRLF;
        }

        // Body
        var canonicalBody = "";
        if (typeof body === 'string') {
            var bodyLines = body.split(CRLF);
            bodyLines = bodyLines.map(line => {
                return line.replace(/[ \t]+$/, '').replace(/[ \t]+/g, ' ');
            });
            while (bodyLines.length > 0 && bodyLines[bodyLines.length - 1] === '') {
                bodyLines.pop();
            }
            canonicalBody = bodyLines.join(CRLF);
            if (canonicalBody.length > 0) canonicalBody += CRLF;
            else canonicalBody = "";
        }

        return { canonicalHeaders: canonicalHeadersStr, canonicalBody };
    }

    // --- PARANOID SIGNER ---
    signEmail(domain, selector, privateKey, headers, body) {
        try {
            console.log("\n================ DKIM DEBUG LOG ================");
            
            // 1. Body Hash
            var { canonicalBody } = this.canonicalizeRelaxed(null, body);
            
            console.log("DEBUG: Raw Canonical Body (Hex):");
            console.log(Buffer.from(canonicalBody).toString('hex'));
            
            var bodyHash = crypto.createHash('sha256')
                .update(canonicalBody)
                .digest('base64');
            console.log("DEBUG: Computed Body Hash (bh): " + bodyHash);

            // 2. Header Selection
            var headersToSign = ['Message-ID', 'Date', 'From', 'To', 'Subject'];
            var collectedRawHeaders = "";
            var hTagList = [];

            headersToSign.forEach(name => {
                var regex = new RegExp(`^${name}:.*$`, 'mi');
                var match = headers.match(regex);
                if (match) {
                    collectedRawHeaders += match[0] + CRLF;
                    hTagList.push(name);
                }
            });

            // 3. Header Canonicalization
            var { canonicalHeaders } = this.canonicalizeRelaxed(collectedRawHeaders, null);
            
            // 4. DKIM Line Construction
            var timestamp = Math.floor(Date.now() / 1000);
            var dkimHeaderStart = `v=1; a=rsa-sha256; c=relaxed/relaxed; d=${domain}; s=${selector}; t=${timestamp}; bh=${bodyHash}; h=${hTagList.join(':')}; b=`;
            
            var relaxedValue = dkimHeaderStart.replace(/\s+/g, ' ').trim();
            var canonicalDkimLine = "dkim-signature:" + relaxedValue;

            // 5. Final Assembly
            var toSign = canonicalHeaders + canonicalDkimLine; 
            // Fix CRLF
            if (!toSign.endsWith(CRLF)) toSign += CRLF;

            console.log("DEBUG: Final String To Sign (Hex):");
            console.log(Buffer.from(toSign).toString('hex'));

            // 6. Sign
            var signature = crypto.createSign('SHA256')
                .update(toSign)
                .sign(privateKey, 'base64');
            
            console.log("DEBUG: Signature Generated.");
            console.log("==============================================\n");

            return dkimHeaderStart + signature;

        } catch (e) {
            console.error("Signing Error:", e);
            return null;
        }
    }

    async sendMail(sender, recipient, subject, rawBody) {
        return new Promise(async (resolve, reject) => {
            console.log("B\"H - Sending Mail...");
            var addresses = await this.getDNSRecords(recipient);
            this.smtpServer = addresses[0].exchange;
            
            this.socket = net.createConnection({
	            port: this.port, host: this.smtpServer, family: 4 
	        });
            
            // Prepare Variables
            var domain = 'awtsmoos.com';
            var selector = 'selector';
            var messageId = `<${Date.now()}@${domain}>`;
            var dateHeader = new Date().toUTCString();
            
            // We construct headers manually to ensure we own the CRLF
            var headers = 
                `Message-ID: ${messageId}${CRLF}` +
                `Date: ${dateHeader}${CRLF}` +
                `From: ${sender}${CRLF}` +
                `To: ${recipient}${CRLF}` +
                `Subject: ${subject}${CRLF}`;
            
            var bodyToSend = rawBody; // Ensure this is what we want (no extra newline logic here)
            
            var dataToSend = "";
            if(this.privateKey) {
                var sig = this.signEmail(domain, selector, this.privateKey, headers, bodyToSend);
                if(sig) {
                    var dkimHeader = `DKIM-Signature: ${sig}${CRLF}`;
                    // Header Block + CRLF + Body
                    dataToSend = dkimHeader + headers + CRLF + bodyToSend;
                } else {
                    dataToSend = headers + CRLF + bodyToSend;
                }
            } else {
                 dataToSend = headers + CRLF + bodyToSend;
            }

            this.socket.on('connect', () => { console.log("Socket Connected."); });

            try {
                this.handleClientData({ client: this.socket, sender, recipient, dataToSend });
            } catch(e) { reject(e); }

            this.socket.on('end', () => { this.socket.removeAllListeners(); this.previousCommand = ''; resolve(); });
            this.socket.on('error', (e)=>{ this.socket.removeAllListeners(); console.error(e); reject(e); });
            this.socket.on('close', () => { this.socket.removeAllListeners(); if (this.previousCommand !== 'END OF DATA') reject('Closed prematurely'); else resolve(); });
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

    commandHandlers = {
        'START': ({ client }) => {
            this.currentCommand = 'EHLO';
            client.write(`EHLO ${this.smtpServer}${CRLF}`);
        },
        'EHLO': ({ client, lineOrMultiline, sender }) => {
            if (lineOrMultiline.includes('STARTTLS')) {
                client.write(`STARTTLS${CRLF}`);
            } else {
                client.write(`MAIL FROM:<${sender}>${CRLF}`);
            }
        },
        'STARTTLS': ({ client, sender, recipient, emailData }) => {
            var options = { socket: client, servername: 'gmail-smtp-in.l.google.com', minVersion: 'TLSv1.2' }; // Adjust servername if needed dynamic
            if(this.useTLS) { options.key = this.key; options.cert = this.cert; }
            
            var secureSocket = tls.connect(options, () => {});
            secureSocket.on('error', (e) => console.error("TLS Error", e));
            secureSocket.on("secureConnect", () => {
                console.log("TLS Secured.");
                this.socket = secureSocket;
                client.removeAllListeners();
                try {
                    this.handleClientData({ client: secureSocket, sender, recipient, dataToSend: emailData });
                } catch(e){ console.error(e); }
                this.previousCommand = "STARTTLS";
                secureSocket.write(`EHLO ${this.smtpServer}${CRLF}`);
            });
        },
        'MAIL FROM': ({ client, recipient }) => {
            client.write(`RCPT TO:<${recipient}>${CRLF}`);
        },
        'RCPT TO': ({ client }) => {
            client.write(`DATA${CRLF}`);
        },
        'DATA': ({ client, emailData }) => {
            console.log("Sending DATA payload (" + emailData.length + " bytes)");
            // Enforce SMTP end-of-data sequence
            var payload = `${emailData}${CRLF}.${CRLF}`;
            client.write(payload);
            this.previousCommand = 'END OF DATA'; 
        },
    };
}

// --- Main Execution Block ---
if (require.main === module) {
    var smtpClient = new AwtsmoosEmailClient();
    (async function() {
        try {
            var subject = 'B"H ' + Date.now();
            var body = 'This is the logs test body.\r\nIt has exactly two lines of content.';
            
            await smtpClient.sendMail('me@awtsmoos.com', 'awtsmoos@gmail.com', subject, body);
            console.log('Email Job Completed.');
        } catch (err) {
            console.error('Job Failed:', err);
        }
    })();
}

module.exports = AwtsmoosEmailClient;