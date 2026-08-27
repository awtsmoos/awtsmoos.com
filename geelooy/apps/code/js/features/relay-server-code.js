
// B"H
/**
 * @file relay-server-code.js
 * @brief The Seed of the Remote World.
 */

export const RelayServerCode = `// B"H
const http = require('http');
const fs = require('fs/promises');
const path = require('path');

const PORT = 3000;
const TICKS = String.fromCharCode(96, 96, 96);

const setCorsHeaders = (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

const server = http.createServer(async (req, res) => {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
    }

    if (req.method !== 'POST') {
        res.writeHead(405);
        return res.end('Use POST prayers.');
    }

    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
        try {
            const params = new URLSearchParams(body);
            const action = params.get('action'); 
            const filePath = params.get('filepath');
            const content = params.get('content') || '';

            if (!filePath) {
                console.warn("[Server] B\\"H - Request received without filepath.");
                res.writeHead(400);
                return res.end('Error: filepath required');
            }

            // B"H - CROSS-DIMENSIONAL COORDINATE RECTIFICATION
            // Handles translation between browser-relative intent and OS Absolute Truth.
            let resolvedPath = path.resolve(process.cwd(), filePath.replace(/^\\/+/, ''));
            
            // If the server runs on Windows, and the client sends a Git Bash style path (/c/folder)
            if (process.platform === 'win32') {
                const match = filePath.match(/^\\/([a-zA-Z])\\/(.*)/);
                if (match) {
                    resolvedPath = path.resolve(match[1].toUpperCase() + ':\\\\', match[2]);
                } else if (/^\\/[a-zA-Z]:\\//.test(filePath)) {
                    // Just in case it was passed exactly as /C:/folder
                    resolvedPath = path.resolve(filePath.substring(1));
                }
            }
            
            const absPath = resolvedPath;
            
            console.log("B\\"H [Relay Server] Incoming -> [" + action.toUpperCase() + "] at [" + absPath + "]");

            switch (action) {
                case 'read':
                    const data = await fs.readFile(absPath);
                    console.log("  -> SUCCESS: Transmitted " + data.length + " bytes.");
                    res.writeHead(200, { 'Content-Type': 'application/octet-stream' });
                    res.end(data);
                    break;

                case 'write':
                    await fs.mkdir(path.dirname(absPath), { recursive: true });
                    await fs.writeFile(absPath, content);
                    console.log("  -> SUCCESS: Inscribed " + content.length + " characters.");
                    res.end("Solidified at " + absPath);
                    break;

                case 'delete':
                    const stat = await fs.stat(absPath);
                    if (stat.isDirectory()) {
                        await fs.rm(absPath, { recursive: true, force: true });
                    } else {
                        await fs.unlink(absPath);
                    }
                    console.log("  -> SUCCESS: Dissolved vessel.");
                    res.end("Purged from reality: " + absPath);
                    break;

                case 'mkdir':
                    await fs.mkdir(absPath, { recursive: true });
                    console.log("  -> SUCCESS: Created chamber.");
                    res.end("Domain manifested: " + absPath);
                    break;

                case 'list':
                    const files = await fs.readdir(absPath, { withFileTypes: true });
                    const listOutput = files.map(f => ({ name: f.name, isDirectory: f.isDirectory() }));
                    console.log("  -> SUCCESS: Enumerated " + files.length + " children.");
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(listOutput));
                    break;

                default:
                    console.error("  -> REJECTED: Invalid ritual: " + action);
                    res.writeHead(400);
                    res.end('Unknown ritual.');
            }
        } catch (err) {
            // We do not log to error if it's just a file check failing (like .awtsmoos-repo)
            if (err.code !== 'ENOENT') {
                console.error("  -> FAILED: " + err.message);
            }
            res.writeHead(err.code === 'ENOENT' ? 404 : 500);
            res.end("Shevirah: " + err.message);
        }
    });
});

server.listen(PORT, () => {
    console.log("B\\"H - Awakened on http://localhost:" + PORT);
    console.log("Coordinates resolved against: " + process.cwd());
});
\`;
`;
