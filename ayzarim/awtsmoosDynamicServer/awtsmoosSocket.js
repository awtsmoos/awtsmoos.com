// B"H
const crypto = require('crypto');
const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

class AwtsmoosSocket {
    constructor() {
        this.clients = new Set();
        // Map: "alias_at_domain.com" -> Set of Clients
        this.aliasMap = new Map(); 
    }

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
            aliasId: null, // Will be set via message
            send: (msg) => this.sendFrame(socket, typeof msg === 'string' ? msg : JSON.stringify(msg))
        };

        this.clients.add(client);
        console.log("B\"H - Socket Connected:", client.id);

        socket.on('data', (buffer) => this.processBuffer(client, buffer));
        
        socket.on('close', () => {
            this.removeClient(client);
        });
        
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
            offset += 8; // Skip huge length for now
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

        if (opcode === 0x8) return client.socket.end();
        if (opcode === 0x1) {
            const msg = finalPayload.toString('utf8');
            this.onMessage(client, msg);
        }
    }

    // Handle JSON messages
    onMessage(client, msg) {
        try {
            const data = JSON.parse(msg);
            
            // 1. LOGIN / IDENTIFY
            if (data.type === 'LOGIN' && data.aliasId) {
                client.aliasId = data.aliasId;
                
                if (!this.aliasMap.has(data.aliasId)) {
                    this.aliasMap.set(data.aliasId, new Set());
                }
                this.aliasMap.get(data.aliasId).add(client);
                
                console.log(`Socket ${client.id} logged in as ${data.aliasId}`);
                client.send({ type: 'ACK', message: 'Logged in' });
            }
            
        } catch (e) {
            // Not JSON? Ignore or treat as chat
        }
    }

    // TARGETED SEND
    sendToAlias(aliasId, data) {
        // Handle "bob@gmail.com" vs "bob_at_gmail.com"
        // Try both just in case
        const variants = [aliasId, aliasId.replace(/@/g, "_at_"), aliasId.replace(/_at_/g, "@")];
        
        for(let v of variants) {
            if (this.aliasMap.has(v)) {
                const clients = this.aliasMap.get(v);
                for (const client of clients) {
                    client.send(data);
                }
                return true; // Sent
            }
        }
        return false; // User not online
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
            socket.write(Buffer.concat([Buffer.from(frame), payload]));
        } catch(e) {}
    }
}

module.exports = AwtsmoosSocket;