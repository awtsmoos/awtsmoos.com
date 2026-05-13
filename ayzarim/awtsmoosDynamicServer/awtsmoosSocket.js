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
    constructor(db) {
    this.db = db; // Store DB reference for permission checks
    this.clients = new Set();
	this.aliasMap = new Map();
	this.tunnels = new Map();
	this.pendingTunnelRequests = new Map();
    this.settingsCache = new Map(); // Simple cache to prevent DB hammering
    setInterval(() => this.heartbeat(), 30000);
    // Clear settings cache every minute
    setInterval(() => this.settingsCache.clear(), 60000); 
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

		if (client.isTunnel && client.tunnelName) {
		  const current = this.tunnels.get(client.tunnelName);
		  if (current === client) {
		    this.tunnels.delete(client.tunnelName);
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




async onMessage(client, msg) {
    try {
        const data = JSON.parse(msg);
        
        if (data.type === 'LOGIN' && data.aliasId) {
            
             if(client.aliasId) {
                 const oldSet = this.aliasMap.get(client.aliasId);
                 if(oldSet) oldSet.delete(client);
            }
            client.aliasId = data.aliasId;
            if (!this.aliasMap.has(data.aliasId)) {
                this.aliasMap.set(data.aliasId, new Set());
            }
            this.aliasMap.get(data.aliasId).add(client);
            client.send({ type: 'ACK', message: `Logged in as ${data.aliasId}` });
        }

        // B"H
        else if (data.type === 'LIVE_PREVIEW' && data.to && client.aliasId) {
            const recipient = data.to;
            
            // 1. Resolve Recipient Alias Short Name
            const rcptShort = recipient.split('_at_')[0].split('@')[0];
            
            // 2. Check Permissions (With Cache)
            let allowed = false;
            if (this.settingsCache.has(rcptShort)) {
                allowed = this.settingsCache.get(rcptShort);
            } else if (this.db) {
                const settings = await this.db.get(`/social/aliases/${rcptShort}/emailSettings`);
                // Check if recipient allows viewing typing
                allowed = settings && settings.viewTyping === true;
                this.settingsCache.set(rcptShort, allowed);
            }

            if (allowed) {
                // Forward the stream
                this.sendToAlias(rcptShort, {
                    type: 'LIVE_PREVIEW',
                    from: client.aliasId,
                    content: data.content
                });
            }
        }

		if (data.type === "TUNNEL_REGISTER" && data.name) {
		  client.isTunnel = true;
		  client.tunnelName = data.name;
		
		  this.tunnels.set(data.name, client);
		
		  client.send({
		    type: "TUNNEL_ACK",
		    name: data.name
		  });
		
		  return;
		}
		
		if (data.type === "TUNNEL_RESPONSE" && data.id) {
		  const pending = this.pendingTunnelRequests.get(data.id);
		  if (!pending) return;
		
		  this.pendingTunnelRequests.delete(data.id);
		
		  pending.resolve(data);
		  return;
		}

    } catch (e) { console.log(e); }
}

	sendTunnelRequest(name, payload, timeout = 30000) {
	  const tunnel = this.tunnels.get(name);
	
	  if (!tunnel) {
	    return Promise.reject(new Error("No tunnel connected: " + name));
	  }
	
	  const id =
	    Date.now() +
	    "_" +
	    Math.random().toString(36).slice(2);
	
	  return new Promise((resolve, reject) => {
	    const timer = setTimeout(() => {
	      this.pendingTunnelRequests.delete(id);
	      reject(new Error("Tunnel timeout"));
	    }, timeout);
	
	    this.pendingTunnelRequests.set(id, {
	      resolve: data => {
	        clearTimeout(timer);
	        resolve(data);
	      },
	      reject
	    });
	
	    tunnel.send({
	      type: "TUNNEL_REQUEST",
	      id,
	      payload
	    });
	  });
	}

    sendToAlias(targetAlias, data) {
        if (!targetAlias) {
            console.log("B\"H DEBUG: sendToAlias called with NULL target");
            return false;
        }

        console.log(`B"H DEBUG: sendToAlias START. Target: [${targetAlias}]`);

        // 1. Essence Match
        if (this._trySend(targetAlias, data)) return true;

        // 2. Garment Match (Long <-> Short)
        const shortName = targetAlias.split(/[@_]/)[0];
        if (shortName && shortName !== targetAlias) {
            console.log(`B"H DEBUG: Trying Short Name [${shortName}]...`);
            if (this._trySend(shortName, data)) return true;
        }

        // 3. Vestment Match (Short <-> Long)
        if (!targetAlias.includes("_") && !targetAlias.includes("@")) {
            const longName = `${targetAlias}_at_awtsmoos.com`;
            console.log(`B"H DEBUG: Trying Long Name [${longName}]...`);
            if (this._trySend(longName, data)) return true;
        }

        // 4. Translation Match
        const swapped = targetAlias.includes("_at_") 
            ? targetAlias.replace("_at_", "@") 
            : targetAlias.replace("@", "_at_");
        if (swapped !== targetAlias) {
            console.log(`B"H DEBUG: Trying Swapped Name [${swapped}]...`);
            if (this._trySend(swapped, data)) return true;
        }

        console.log(`B"H DEBUG: FAILED to find target [${targetAlias}] anywhere.`);
        return false;
    }

    _trySend(key, data) {
        if (this.aliasMap.has(key)) {
            const clients = this.aliasMap.get(key);
            console.log(`B"H DEBUG: Found [${clients.size}] socket(s) for key [${key}]. Sending...`);
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