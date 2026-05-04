
// B"H
/**
 * @file relay-server-code.js
 * @brief The Seed of the Distant World.
 * 
 * THE POEM OF THE GIVEN SPARK:
 * We do not force the seeker to build the bridge from memory alone.
 * We provide the very wood and nails, the Node.js code itself,
 * packaged as a pure string, ready to be downloaded and awakened
 * on any machine across the earth. 
 * Once ignited (node relay-server.js), it hums with the power of CORS,
 * dissolving the barriers of the browser and allowing the Awtsmoos Editor
 * to reach across the void and touch the physical disk.
 */

export const RelayServerCode = `// B"H
const http = require('http');
const fs = require('fs/promises');
const path = require('path');

const PORT = 3000;
// Escaped backticks for safe markdown generation
const TICKS = String.fromCharCode(96, 96, 96);

// B"H - The Shield of Permissibility (CORS)
const setCorsHeaders = (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

const isBinary = (fileName) => {
    const ext = path.extname(fileName).toLowerCase();
    const binaryExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.pdf', '.zip', '.exe', '.dll', '.so', '.node', '.pyc', '.woff', '.woff2', '.ttf'];
    return binaryExtensions.includes(ext);
};

async function getDirectoryTree(dirPath) {
    const stats = await fs.stat(dirPath);
    const item = {
        name: path.basename(dirPath),
        path: dirPath,
        type: stats.isDirectory() ? 'directory' : 'file'
    };

    if (stats.isDirectory()) {
        const files = await fs.readdir(dirPath);
        item.children = await Promise.all(
            files.map(child => getDirectoryTree(path.join(dirPath, child)))
        );
    }
    return item;
}

async function getDirectoryMarkdown(dirPath, rootPath = dirPath) {
    let output = "";
    const items = await fs.readdir(dirPath, { withFileTypes: true });

    for (const item of items) {
        const fullPath = path.join(dirPath, item.name);
        const relativePath = path.relative(rootPath, fullPath);

        if (item.name === 'node_modules' || item.name === '.git' || item.name === '.DS_Store') continue;

        if (item.isDirectory()) {
            output += await getDirectoryMarkdown(fullPath, rootPath);
        } else {
            if (isBinary(item.name)) continue;
            try {
                const content = await fs.readFile(fullPath, 'utf-8');
                output += "\\n--- FILE START: " + relativePath + " ---\\n";
                output += TICKS + (path.extname(item.name).slice(1) || 'text') + "\\n";
                output += content;
                output += "\\n" + TICKS + "\\n--- FILE END: " + relativePath + " ---\\n";
            } catch (e) {
                output += "\\n[Error reading " + relativePath + ": " + e.message + "]\\n";
            }
        }
    }
    return output;
}

const server = http.createServer(async (req, res) => {
    // 1. Instantly bless the response with CORS headers
    setCorsHeaders(res);

    // 2. Acknowledge the browser's preflight prayer
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
    }

    if (req.method !== 'POST') {
        res.writeHead(405);
        return res.end('Use POST');
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
                res.writeHead(400);
                return res.end('Error: filepath is required');
            }

            const absPath = path.resolve(filePath);

            switch (action) {
                case 'read':
                    const fileData = await fs.readFile(absPath);
                    res.writeHead(200, { 'Content-Type': 'application/octet-stream' });
                    res.end(fileData);
                    break;

                case 'write':
                    await fs.writeFile(absPath, content);
                    res.end("Written to " + absPath);
                    break;

                case 'delete':
                    const stats = await fs.stat(absPath);
                    if (stats.isDirectory()) {
                        await fs.rm(absPath, { recursive: true, force: true });
                    } else {
                        await fs.unlink(absPath);
                    }
                    res.end("Deleted " + absPath);
                    break;

                case 'mkdir':
                    await fs.mkdir(absPath, { recursive: true });
                    res.end("Created directory " + absPath);
                    break;

                case 'list':
                    const files = await fs.readdir(absPath, { withFileTypes: true });
                    const listOutput = files.map(f => ({ name: f.name, isDirectory: f.isDirectory() }));
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(listOutput));
                    break;

                case 'tree':
                    const tree = await getDirectoryTree(absPath);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(tree, null, 2));
                    break;

                case 'download-md':
                    let mdOutput = "";
                    const filesParam = params.get('files');
                    if (filesParam) {
                        // Array of files requested
                        let fileList = [];
                        try { fileList = JSON.parse(filesParam); } catch(e) {}
                        for (let i = 0; i < fileList.length; i++) {
                            const f = fileList[i];
                            const fPath = path.resolve(absPath, f);
                            try {
                                const fileContent = await fs.readFile(fPath, 'utf-8');
                                mdOutput += "\\n--- FILE START: " + f + " ---\\n";
                                mdOutput += TICKS + (path.extname(f).slice(1) || 'text') + "\\n";
                                mdOutput += fileContent;
                                mdOutput += "\\n" + TICKS + "\\n--- FILE END: " + f + " ---\\n";
                            } catch (e) {
                                mdOutput += "\\n[Error reading " + f + ": " + e.message + "]\\n";
                            }
                        }
                    } else {
                        // Entire directory requested
                        mdOutput = await getDirectoryMarkdown(absPath, absPath);
                    }
                    res.writeHead(200, { 'Content-Type': 'text/markdown' });
                    res.end(mdOutput);
                    break;

                case 'ai-markdown':
                    const markdown = await getDirectoryMarkdown(absPath);
                    res.writeHead(200, { 'Content-Type': 'text/markdown' });
                    res.end(markdown);
                    break;

                default:
                    res.writeHead(400);
                    res.end('Invalid action. Valid: read, write, delete, mkdir, list, tree, ai-markdown, download-md');
            }
        } catch (err) {
            res.writeHead(err.code === 'ENOENT' ? 404 : 500);
            res.end("Error: " + err.message);
        }
    });
});

server.listen(PORT, () => {
    console.log("B\\"H - Relay Server operational on http://localhost:" + PORT);
    console.log("CORS is absolutely enabled for all origins. The Awtsmoos Editor may now connect.");
});
`;
