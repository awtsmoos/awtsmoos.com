// B"H
/**
 * This is the main server script for our application, serving as the "Sefer Torah" of our server's operation.
 * It uses the built-in http, fs, path, url, and querystring modules from Node.js, akin to the foundational Sefirot.
 * Along with a custom template processing module (awtsmoosProcessor.js) and a custom database module (DosDB.js),
 * these comprise the "Tree of Life" of our server's functionality.
 *  
 * @fileoverview Main server script, the "Sefer Torah" of our application.
 * @requires http
 * @requires fs
 * @requires path
 * @requires url

 */ 

var http = require('http');

/**
 * @optional
 * email server support
 */
var AwtsMail = require("./ayzarim/email/email.js");
var mail = new AwtsMail(); 

var awts = require("./ayzarim/awtsmoosDynamicServer/index.js");

// B"H - Require the new WebSocket Handler
var AwtsSocket = require("./ayzarim/awtsmoosDynamicServer/awtsmoosSocket.js");

async function go() {
    var serv = new awts(
        __dirname,
        mail
    );
    await serv.init();

    // Initialize WebSocket Server
    var wsServer = new AwtsSocket();

    // Create the HTTP Server
    var httpServer = http.createServer(async (request, response) => { 
        await serv.onRequest(request, response);
    });
    
    // B"H - Listen for Upgrade requests (WS Handshake)
    httpServer.on('upgrade', (request, socket, head) => {
        // You can do path routing here if you want
        // if (request.url === '/ws/chat') ...
        
        wsServer.handleUpgrade(request, socket, head);
    });

    httpServer.listen(8080); // Listen for requests on port 8080
    
    console.log('B"H\n\n\n\n', 'Server running at http://127.0.0.1:8080/');
    console.log("Time: ", Date.now());

    try {
        mail.shoymayuh();
        console.log("Email server running")
    } catch(e) {
        console.log("Could not start email server", e);
    }
}

try {
    go();
} catch(e) {
    console.log(e);
}