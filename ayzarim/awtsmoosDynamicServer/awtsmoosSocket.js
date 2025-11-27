// B"H
/**
 * awtsmoosSocket.js
 * A native, zero-dependency WebSocket implementation.
 */
const crypto = require('crypto');
const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'; // Magic String from RFC 6455

class AwtsmoosSocket {
    constructor() {
        this.clients = new Set();
    }

    // 1. Handle the HTTP Upgrade Request (The Handshake)
    handleUpgrade(req, socket, head) {
        const key = req.headers['sec-websocket-key'];
        if (!key) {
            socket.destroy();
            return;
        }

        // Calculate Accept Key: Base64(SHA1(Key + GUID))
        const digest = crypto.createHash('sha1')
            .update(key + GUID)
            .digest('base64');

        const headers = [
            'HTTP/1.1 101 Switching Protocols',
            'Upgrade: websocket',
            'Connection: Upgrade',
            `Sec-WebSocket-Accept: ${digest}`,
            '\r\n'
        ];

        socket.write(headers.join('\r\n'));

        // Define client object
        const client = {
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            socket: socket,
            send: (msg) => this.sendFrame(socket, msg)
        };

        this.clients.add(client);
        console.log("B\"H - New WebSocket Connection:", client.id);

        // Listen for raw TCP data
        socket.on('data', (buffer) => {
            this.processBuffer(client, buffer);
        });

        socket.on('close', () => {
            this.clients.delete(client);
            console.log("B\"H - Connection Closed:", client.id);
        });
        
        socket.on('error', (err) => {
            console.error("Socket Error:", err);
            this.clients.delete(client);
        });
    }

    // 2. Process Incoming Data Frames
    processBuffer(client, buffer) {
        // RFC 6455 Frame Parsing
        let offset = 0;
        
        // Byte 0: FIN, Opcode
        const byte0 = buffer.readUInt8(offset++);
        const fin = (byte0 & 0x80) === 0x80;
        const opcode = byte0 & 0x0F;

        // Byte 1: Mask, Payload Length
        const byte1 = buffer.readUInt8(offset++);
        const isMasked = (byte1 & 0x80) === 0x80;
        let payloadLen = byte1 & 0x7F;

        // Handle Extended Lengths
        if (payloadLen === 126) {
            payloadLen = buffer.readUInt16BE(offset);
            offset += 2;
        } else if (payloadLen === 127) {
            // Note: JS numbers max out at 2^53, 64-bit length might lose precision purely mathematically here but usually fine for chat
            const high = buffer.readUInt32BE(offset);
            const low = buffer.readUInt32BE(offset + 4);
            payloadLen = (high * 0x100000000) + low; 
            offset += 8;
        }

        // Extract Mask Key (Clients MUST mask messages)
        let maskKey = null;
        if (isMasked) {
            maskKey = buffer.slice(offset, offset + 4);
            offset += 4;
        }

        // Extract Payload
        const rawPayload = buffer.slice(offset, offset + payloadLen);
        
        // Decode (Unmask)
        const finalPayload = Buffer.alloc(rawPayload.length);
        if (isMasked) {
            for (let i = 0; i < rawPayload.length; i++) {
                finalPayload[i] = rawPayload[i] ^ maskKey[i % 4];
            }
        } else {
            rawPayload.copy(finalPayload);
        }

        // Handle Opcodes
        if (opcode === 0x8) { // Close Frame
            client.socket.end();
            return;
        }
        if (opcode === 0x1) { // Text Frame
            const msg = finalPayload.toString('utf8');
            this.onMessage(client, msg);
        }
    }

    // 3. Logic for when a message arrives
    onMessage(sender, msg) {
        console.log(`Received from ${sender.id}: ${msg}`);
        
        // Echo back to everyone (Simple Chat Room logic)
        try {
            // Optional: Parse JSON if your app uses it
            // var data = JSON.parse(msg); 
            
            this.broadcast(`User ${sender.id} says: ${msg}`);
        } catch(e) {}
    }

    broadcast(msg) {
        for (const client of this.clients) {
            if (client.socket.writable) {
                client.send(msg);
            }
        }
    }

    // 4. Send Data Frame (Server -> Client)
    // Server messages are usually NOT masked.
    sendFrame(socket, data) {
        const payload = Buffer.from(data);
        const len = payload.length;
        let frame = [];

        // Byte 0: FIN (1) + Text Opcode (1) = 0x81
        frame.push(0x81);

        // Byte 1: Payload Len (No Mask bit)
        if (len < 126) {
            frame.push(len);
        } else if (len < 65536) {
            frame.push(126);
            frame.push((len >> 8) & 0xFF);
            frame.push(len & 0xFF);
        } else {
            frame.push(127);
            // 64-bit length (Write 8 bytes, simplistic handling for < 4GB)
            for (let i = 7; i >= 0; i--) {
                frame.push((len >> (i * 8)) & 0xFF);
            }
        }

        const frameBuffer = Buffer.concat([Buffer.from(frame), payload]);
        try {
            socket.write(frameBuffer);
        } catch(e) {
            console.log("Socket write error", e);
        }
    }
}

module.exports = AwtsmoosSocket;