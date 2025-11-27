/**
 * B"H
 * @module AwtsmoosEmailClient
 * PARANOID LOGGING EDITION (Fixed SMTP Logic)
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
            console.log("DEBUG: Private Key loaded successfully.");
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

    /**
     * Determine the next step in the dance.
     * Fixed logic: 
     * 1. START -> EHLO
     * 2. EHLO -> (Server says 250 STARTTLS) -> SEND_STARTTLS_COMMAND
     * 3. SEND_STARTTLS_COMMAND -> (Server says 220) -> DO_TLS_HANDSHAKE
     * 4. DO_TLS_HANDSHAKE -> EHLO (Secure)
     * 5. EHLO (Secure) -> MAIL FROM
     */
    getNextCommand() {
        var commandOrder = [
            'START', 
            'EHLO', 
            'SEND_STARTTLS_COMMAND',
            'DO_TLS_HANDSHAKE',
            'EHLO_SECURE',
            'MAIL FROM', 'RCPT TO', 'DATA', 'END OF DATA'
        ];
        
        // Simple sequential fallback, but handleSMTPResponse usually overrides
        var currentIndex = commandOrder.indexOf(this.previousCommand);
        if (currentIndex === -1) return commandOrder[0];
        return commandOrder[currentIndex + 1];
    }

    handleSMTPResponse({ lineOrMultiline, client, sender, recipient, emailData }) {
        if (lineOrMultiline.startsWith('221')) {
            console.log("Server closed (221). Done.");
            client.end();
            return;
        }

        if (lineOrMultiline.startsWith('4') || lineOrMultiline.startsWith('5')) {
             console.error("SMTP Error Code Detected: " + lineOrMultiline);
        }

        var isMultiline = lineOrMultiline.charAt(3) === '-';
        var lastLine = lineOrMultiline;
        if(isMultiline) {
            var lines = lineOrMultiline.split(CRLF);
            lastLine = lines[lines.length - 1];
        }

        try {
            let nextCommand = '';

            // --- STATE MACHINE LOGIC ---
            
            // 1. Initial Connection (220) -> Send EHLO
            if (this.previousCommand === '' && lastLine.startsWith('220')) {
                nextCommand = 'EHLO';
            }
            // 2. Response to First EHLO -> Send STARTTLS text
            else if (this.previousCommand === 'EHLO' && lastLine.startsWith('250')) {
                if (lineOrMultiline.includes('STARTTLS')) {
                    nextCommand = 'SEND_STARTTLS_COMMAND';
                } else {
                    nextCommand = 'MAIL FROM'; // No TLS supported?
                }
            }
            // 3. Response to STARTTLS command (220) -> Perform Upgrade
            else if (this.previousCommand === 'SEND_STARTTLS_COMMAND' && lastLine.startsWith('220')) {
                console.log("Server is ready for TLS. Upgrading socket...");
                nextCommand = 'DO_TLS_HANDSHAKE';
            }
            // 4. Response to Second EHLO (Encrypted) -> Mail From
            else if (this.previousCommand === 'EHLO_SECURE' && lastLine.startsWith('250')) {
                nextCommand = 'MAIL FROM';
            }
            // 5. Normal Flow
            else if (this.previousCommand === 'MAIL FROM' && lastLine.startsWith('250')) nextCommand = 'RCPT TO';
            else if (this.previousCommand === 'RCPT TO' && lastLine.startsWith('250')) nextCommand = 'DATA';
            else if (this.previousCommand === 'DATA' && (lastLine.startsWith('354'))) nextCommand = 'SEND_BODY'; // Actually trigger send
            
            // 6. Response to Body (250 OK)
            else if (this.previousCommand === 'END OF DATA' && lineOrMultiline.startsWith('250')) {
                console.log("B\"H - Success! Email accepted.");
                client.write('QUIT\r\n');
                client.end();
                return;
            }

            if (!nextCommand) {
                console.warn("State machine unsure. Guessing based on previous:", this.previousCommand);
                nextCommand = this.getNextCommand();
            }

            // Execute Handler
            var handler = this.commandHandlers[nextCommand];
            if (handler) {
                handler({ client, sender, recipient, emailData, lineOrMultiline });
                // Only update previousCommand if it's not the internal data handler (handled separately)
                if(nextCommand !== 'SEND_BODY') {
                    this.previousCommand = nextCommand;
                } else {
                     this.previousCommand = 'END OF DATA';
                }
            } else {
                console.error("No handler for command:", nextCommand);
            }

        } catch (e) {
            console.error("Handler Error:", e);
            client.end();
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
            console.log("MX Server: " + this.smtpServer);
            
            this.socket = net.createConnection({
	            port: this.port, host: this.smtpServer, family: 4 
	        });
            
            var domain = 'awtsmoos.com';
            var selector = 'selector';
            var messageId = `<${Date.now()}@${domain}>`;
            var dateHeader = new Date().toUTCString();
            
            var headers = 
                `Message-ID: ${messageId}${CRLF}` +
                `Date: ${dateHeader}${CRLF}` +
                `From: ${sender}${CRLF}` +
                `To: ${recipient}${CRLF}` +
                `Subject: ${subject}${CRLF}`;
            
            var bodyToSend = rawBody;
            var dataToSend = "";
            if(this.privateKey) {
                var sig = this.signEmail(domain, selector, this.privateKey, headers, bodyToSend);
                if(sig) {
                    var dkimHeader = `DKIM-Signature: ${sig}${CRLF}`;
                    dataToSend = dkimHeader + headers + CRLF + bodyToSend;
                } else {
                    dataToSend = headers + CRLF + bodyToSend;
                }
            } else {
                 dataToSend = headers + CRLF + bodyToSend;
            }

            this.socket.on('connect', () => { console.log("Socket Connected. Waiting for Greeting."); });

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
        'EHLO': ({ client }) => {
            client.write(`EHLO ${this.smtpServer}${CRLF}`);
        },
        'SEND_STARTTLS_COMMAND': ({ client }) => {
            console.log("Sending STARTTLS command...");
            client.write(`STARTTLS${CRLF}`);
        },
        'DO_TLS_HANDSHAKE': ({ client, sender, recipient, emailData }) => {
            // Options used to identify THIS server to the other (Cert/Key), and defaults for parsing
            var options = { 
                socket: client, 
                // We use the MX domain we found as servername for SNI
                servername: this.smtpServer, 
                minVersion: 'TLSv1.2',
                rejectUnauthorized: false // Opportunistic - don't fail if they have self-signed (Gmail has valid tho)
            };
            if(this.hasFiles) { options.key = this.key; options.cert = this.cert; }
            
            var secureSocket = tls.connect(options, () => {});
            secureSocket.on('error', (e) => console.error("TLS Error", e));
            secureSocket.on("secureConnect", () => {
                console.log("TLS Secured. Resending EHLO.");
                this.socket = secureSocket;
                client.removeAllListeners();
                
                try {
                    this.handleClientData({ client: secureSocket, sender, recipient, dataToSend: emailData });
                } catch(e){ console.error(e); }
                
                this.previousCommand = "EHLO_SECURE"; // Update state so we know where we are
                secureSocket.write(`EHLO ${this.smtpServer}${CRLF}`);
            });
        },
        'EHLO_SECURE': ({ client }) => {
             // Logic is inside DO_TLS_HANDSHAKE secureConnect
        },
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
            console.log("Sending DATA payload (" + emailData.length + " bytes)");
            // Ensure data ends with \r\n.\r\n
            var payload = `${emailData}${CRLF}.${CRLF}`;
            client.write(payload);
            // This flag is handled by response parser 250
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
            console.log('Job script finished (waiting for socket close).');
        } catch (err) {
            console.error('Job Failed:', err);
        }
    })();
}

module.exports = AwtsmoosEmailClient;