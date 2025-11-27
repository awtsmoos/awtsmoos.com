// B"H
/**
 * awtsmoosSocket.js
 * Native, zero-dependency WebSocket implementation.
 * Features:
 * - Robust Frame Parsing
 * - Alias/User Routing (with Fuzzy Matching)
 * - Heartbeat (Ping/Pong)
 * - Broadcast Capability
 */
const crypto = require('crypto');
const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

class AwtsmoosSocket {
    constructor() {
        this.clients = new Set();
        this.aliasMap = new Map();

        // Start Heartbeat (Ping every 30s)
        setInterval(() => this.heartbeat(), 30000);
    }

    // --- 1. Connection Handling ---

    handleUpgrade(req, socket, head) {
        const key = req.headers['sec-websocket-key'];
        if (!key) { socket.destroy(); return; }

        const digest = crypto.createHash('sha1').update(key + GUID).digest('base64');
        socket.write([
            'HTTP/1.1 101 Switching Protocols',
            'Upgrade: websocket',
            'Connection: Upgrade',
            `Sec-WebSocket-Accept: ${digest}`,
            '\r\n'
        ].join('\r\n'));

        const client = {
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            socket: socket,
            aliasId: null,
            isAlive: true,
            send: (msg) => this.sendFrame(socket, typeof msg === 'string' ? msg : JSON.stringify(msg))
        };

        this.clients.add(client);
        console.log("B\"H - Socket Connected:", client.id);

        socket.on('data', (buffer) => this.processBuffer(client, buffer));
        socket.on('close', () => this.removeClient(client));
        socket.on('error', () => this.removeClient(client));
    }

    removeClient(client) {
        this.clients.delete(client);
        if (client.aliasId) {
            const set = this.aliasMap.get(client.aliasId);
            if (set) {
                set.delete(client);
                if (set.size === 0) this.aliasMap.delete(client.aliasId);
            }
        }
    }

    heartbeat() {
        this.clients.forEach(client => {
            if (!client.isAlive) {
                console.log("Terminating dead socket:", client.id);
                return client.socket.end();
            }
            client.isAlive = false;
            // Send Ping Frame (Opcode 0x9)
            client.socket.write(Buffer.from([0x89, 0x00]));
        });
    }

    // --- 2. Frame Parsing ---

    processBuffer(client, buffer) {
        let offset = 0;
        const byte0 = buffer.readUInt8(offset++);
        const opcode = byte0 & 0x0F;
        const byte1 = buffer.readUInt8(offset++);
        const isMasked = (byte1 & 0x80) === 0x80;
        let payloadLen = byte1 & 0x7F;

        if (payloadLen === 126) {
            payloadLen = buffer.readUInt16BE(offset);
            offset += 2;
        } else if (payloadLen === 127) {
            offset += 8;
        }

        let maskKey = null;
        if (isMasked) {
            maskKey = buffer.slice(offset, offset + 4);
            offset += 4;
        }

        const rawPayload = buffer.slice(offset, offset + payloadLen);
        const finalPayload = Buffer.alloc(rawPayload.length);
        
        if (isMasked) {
            for (let i = 0; i < rawPayload.length; i++) finalPayload[i] = rawPayload[i] ^ maskKey[i % 4];
        } else {
            rawPayload.copy(finalPayload);
        }

        // Handle Opcodes
        if (opcode === 0x8) return client.socket.end(); // Close
        if (opcode === 0xA) { client.isAlive = true; return; } // Pong (Response to our Ping)
        
        if (opcode === 0x1) {
            // Text Frame
            client.isAlive = true; // Any activity marks alive
            const msg = finalPayload.toString('utf8');
            this.onMessage(client, msg);
        }
    }

    // --- 3. Message Logic ---

    onMessage(client, msg) {
        try {
            const data = JSON.parse(msg);
            
            if (data.type === 'LOGIN' && data.aliasId) {
                // Remove old mapping if exists
                if(client.aliasId) {
                     const oldSet = this.aliasMap.get(client.aliasId);
                     if(oldSet) oldSet.delete(client);
                }

                client.aliasId = data.aliasId;
                if (!this.aliasMap.has(data.aliasId)) {
                    this.aliasMap.set(data.aliasId, new Set());
                }
                this.aliasMap.get(data.aliasId).add(client);
                
                console.log(`Socket ${client.id} identified as [${data.aliasId}]`);
                client.send({ type: 'ACK', message: `Logged in as ${data.aliasId}` });
            }
            
        } catch (e) {
            // Echo or Broadcast Chat
            // this.broadcastAll({ type: 'CHAT', msg: msg });
        }
    }

    // --- 4. Sending Logic ---

    /**
     * Sends a message to a specific user/alias.
     * Like the Sefirot connecting to one another, we try multiple paths of unification.
     * 1. Essence to Essence (Exact Match)
     * 2. Form to Form (Swapping @ for _at_)
     * 3. Garment to Essence (Long to Short)
     * 4. Essence to Garment (Short to Long) - *The Missing Link*
     */
    sendToAlias(targetAlias, data) {
        // B"H - Tracing the transmission of Light
        // console.log(`WS: Attempting send to [${targetAlias}]`);
        
        // 1. Direct Match (Malchus to Malchus)
        if (this._trySend(targetAlias, data)) return true;

        // 2. Swapped Syntax (Translation between Worlds)
        const swapped = targetAlias.includes("_at_") ? targetAlias.replace(/_at_/g, "@") : targetAlias.replace(/@/g, "_at_");
        if (this._trySend(swapped, data)) return true;

        // 3. Short Name Extraction (Peeling the Fruit)
        // e.g. "bob_at_gmail.com" -> "bob"
        // This handles cases where we send to the full address, but client logged in as short.
        const shortName = targetAlias.split("_at_")[0].split("@")[0];
        if (shortName !== targetAlias) {
             if (this._trySend(shortName, data)) return true;
        }

        // 4. Long Name Reconstruction (Dressing the Soul)
        // e.g. "bob" -> "bob_at_awtsmoos.com"
        // This handles cases where we send to the Short name, but client logged in with their Full Awtsmoos ID.
        if (!targetAlias.includes("_at_") && !targetAlias.includes("@")) {
            if (this._trySend(`${targetAlias}_at_awtsmoos.com`, data)) return true;
        }

        // The vessel was not found; the light returns to the source.
        // console.log(`WS: User [${targetAlias}] not found online.`);
        return false;
    }

    _trySend(key, data) {
        if (this.aliasMap.has(key)) {
            const clients = this.aliasMap.get(key);
            console.log(`WS: Found ${clients.size} sockets for [${key}]`);
            for (const client of clients) {
                client.send(data);
            }
            return true;
        }
        return false;
    }

    /**
     * Broadcast to EVERY connected socket (Good for testing)
     */
    broadcastAll(data) {
        console.log("WS: Broadcasting to all clients...");
        for (const client of this.clients) {
            client.send(data);
        }
    }

    sendFrame(socket, data) {
        const payload = Buffer.from(data);
        const len = payload.length;
        let frame = [0x81]; // Text frame

        if (len < 126) {
            frame.push(len);
        } else if (len < 65536) {
            frame.push(126, (len >> 8) & 0xFF, len & 0xFF);
        } else {
            frame.push(127);
            for (let i = 7; i >= 0; i--) frame.push((len >> (i * 8)) & 0xFF);
        }

        try {
            if(socket.writable) socket.write(Buffer.concat([Buffer.from(frame), payload]));
        } catch(e) {
            console.error("WS Write Error", e.message);
        }
    }
}

module.exports = AwtsmoosSocket;