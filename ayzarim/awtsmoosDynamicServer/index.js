// B"H
/**
 * awtsmoosDynamicServer/index.js
 */
var { parseMultipartFormData } = require("./multipartParser.js");
var url = require('url');
var fs = require('fs').promises; 
var {fetch, TextEncoder, URLSearchParams} = require("./fetch.js");
var path = require('path'); 
var Utils = require("../tools/utils.js");
var config = require("../awtsmoos.config.json");
var processTemplate = require('./awtsmoosProcessor.js'); 
var DosDB = require("../DosDB/index.js"); 
var querystring = require('querystring'); 
var auth = require("../tools/auth.js");
var AwtsmoosResponse = require("./awtsmoosResponse.js");
var awtsMoosification = "_awtsmoos.derech.js";
var Ayzarim = require("./getAwtsmooses.js"); 
var TemplateObjectGenerator = require("./TemplateObjectGenerator.js");
var sodos = require("../tools/sodos.js");
var crypto = require('crypto');
var doLogs = require("./doLogs.js");
var { binaryMimeTypes, mimeTypes } = require("./mimes.js");
const { startTaskRunner } = require('./cleanup-worker.js');

var self = null;

class AwtsmoosStaticServer {
    constructor(directory, mail=null) {
        self = this;
        this.directory = (directory || __dirname) + "/";
        this.mainDir = config.public || "geelooy";
        this.middleware = [];
        this.db = null;
        this.mail = mail; // The Mail Server & Client Object
        process.env.__awtsdir = this.directory;
        process.removeAllListeners('warning');
    }
    
    // ... [createJob and init/config logic remains the same] ...

    async createJob({ description, tasks, requestedBy }) {
	    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
	        throw new Error("Job creation requires a non-empty 'tasks' array.");
	    }

	    const jobId = `${description.replace(/\s+/g, '-').slice(0, 20)}-${Date.now()}`;
	    const jobRecord = {
	        jobId: jobId,
	        status: "pending",
	        description: description,
	        tasks: tasks,
	        createdAt: Date.now(),
	        requestedBy: requestedBy || "system"
	    };

	    const queuePath = '/_system/jobs/taskQueue';
	    const result = await this.db.arrayAppend(queuePath, jobRecord);

        if (result && result.error) {
            console.error("CRITICAL: Failed to append job to the queue file!", result.error);
            throw new Error("Failed to write job to the queue.");
        }

	    return { jobId };
	}

    async init() {
        if (config) {
            if(config?.logFile) {
                try {
                    var key = await fs.readFile(config.logFile);
                    var json = JSON.parse(key.toString());
                    if(json) this.firebaseKey = json;
                } catch(e){}
            }
            if (typeof(config.dbPath) == "string") {
                try {
                    process.awtsmoosDbPath = path.resolve(this.directory, config.dbPath);
                } catch (e) {}
            } else {
                try {
                    process.awtsmoosDbPath = path.resolve(this.directory, "../../");
                } catch (e) {}
            }
            
            var db = new DosDB(process.awtsmoosDbPath);
            await db.init();
            this.db = db;
            
            try {
                startTaskRunner(this.db);
            } catch (workerError) {
                console.error("CRITICAL: Failed to start cleanup worker!", workerError);
            }
            
            if (typeof(config.secret) == "string") {
                var sec = null;
                try { sec = require(this.directory + config.secret); } catch (e) {}
                if (!sec) sec = { BH: 'B"H', noKey: "No security" };
                if (sec) {
                    this.secret = JSON.stringify(sec);
                    var awtsAuth = new auth(this.secret);
                    this.use(awtsAuth.sessionMiddleware.bind(awtsAuth));
                }
            }
        } else {
            console.log("NO config set!");
        }

        // ======================================================
        // INCOMING MAIL HANDLER (INGRESS)
        // ======================================================
        if (this.mail) {
            this.mail.gotMail = async ({ sender, recipients, data }) => {
                try {
                    var time = Date.now();
                    // Sender: "bob@gmail.com" -> "bob_at_gmail.com"
                    var cleanSender = sender.replace("@", "_at_").replace(/[<>]/g, "");

                    for (var r of recipients) {
                        // Recipient: "me@awtsmoos.com" -> "me_at_awtsmoos.com"
                        var cleanRecipient = r.replace("@", "_at_").replace(/[<>]/g, "");
                        
                        // NEW UNIFIED PATH: /emails/[ME]/threads/[FRIEND]
                        // "friend" here is the Sender
                        var path = `/emails/${cleanRecipient}/threads/${cleanSender}`;

                        // We save it as "incoming" because 'gotMail' handles *incoming* SMTP
                        await this.db.appendToObj(path, {
                            key: time + "",
                            value: {
                                rawData: data + "", // Store raw SMTP for parsing
                                time: time,
                                read: false,
                                direction: "incoming",
                                correspondent: cleanSender
                            }
                        });
                    }
                    console.log("B\"H - Saved Incoming Email Thread:", sender, recipients);
                } catch ($) {
                    console.log("Error saving incoming email", $);
                }
            }
        }
    }

    use(fn) {
        if (typeof(fn) == "function") this.middleware.push(fn);
    }

    async doMiddleware(q, r) {
        if (this.middleware.length) {
            await Promise.all(this.middleware.map(async w => { await w(q, r); }));
        }
    }
    
    async onRequest(request, response) {
        const requestOrigin = request.headers.origin;
        response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE');
        response.setHeader("Access-Control-Allow-Headers", "awtsmoos-file-status");
        response.setHeader('Access-Control-Allow-Origin', requestOrigin||"*");
        response.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
        response.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
        response.setHeader('cross-origin-resource-policy', "cross-origin");
        
        if (request.method === 'OPTIONS') {
            response.writeHead(204);
            response.end();
            return; 
        }
        
        var self = this;
        response.statusCode = 200;
        var cookies = {};
        if (typeof(request.headers.cookie) == "string") {
            cookies = Utils.parseCookies(request.headers.cookie);
        }
        request.cookies = cookies;
        var parsedUrl = url.parse(request.url, true);
        var originalPath = parsedUrl.pathname || '/';
        
        try { originalPath = decodeURIComponent(originalPath); } catch (e) { console.log(e); }
        
        var serverPath = path.join(this.directory, this.mainDir);
        var filePath = path.join(serverPath, originalPath);
        
        if (request.method == "GET" && request.headers['awtsmoos-file-status']) {
            request.isAwtsmoosFileStatusRequest = true;
        }
        
        var currentPath = filePath;
        var parentPath = serverPath;
        var foundAwtsmooses = [];
        var paramKinds = { POST: {}, PUT: {}, GET: {}, DELETE: {} };
        
        this.doMiddleware(request, response);
        response.setHeader("BH", "Boruch Hashem");
        response.setHeader("Awtsmoos", "Is found in all things");
        response.setHeader('Connection', 'keep-alive');
        response.setHeader("content-language", "en");

        // B"H - Robust GET Parsing
        // Create a clean object from the parsed query to avoid null-prototype issues
        paramKinds.GET = Object.assign({}, parsedUrl.query);

        // Attempt to parse JSON strings (e.g., "true"->true, "123"->123)
        // safely, without re-parsing the entire query string.
        Object.keys(paramKinds.GET).forEach(key => {
            try {
                paramKinds.GET[key] = JSON.parse(paramKinds.GET[key]);
            } catch (e) {
                // Value is a regular string (like "awtsmoos"), keep as is.
            }
        });
    
        var extname = String(path.extname(filePath)).toLowerCase();
        var contentType = mimeTypes[extname] || 'application/octet-stream';
        var isBinary = false;
        var isDirectoryWithIndex = false;
        var isDirectoryWithoutIndex = false;
        var fileName = null;
        var filePaths = null;
        var modifiedResponse = response;
        var oldEnd = response.end;
        var ended = false;

        modifiedResponse.end = function(...args) {
            if(!ended) { ended = true; oldEnd.bind(response)(...args); }
        }

        var dependencies = {
            createJob: this.createJob.bind(this),
            makeToken: (vl,ex={})=>{
                try{ return {success:sodos.createToken(vl,self.secret,ex)} }
                catch(e){ return {error: e.stack} }
            },
            TextEncoder, URLSearchParams, binaryMimeTypes, mimeTypes, path,
            originalPath, sodos, fs, self, awtsMoosification, filePath, parentPath,
            template, DosDB, require, parsedUrl, location: parsedUrl, request, response,
            console, mimeTypes, binaryMimeTypes, url, cookies, paramKinds, Utils, config,
            fileName, isDirectoryWithIndex, contentType, getPostData, btoa, atob,
            getPutData, getDeleteData,
            
            // INJECT MAIL HERE SO API CAN USE IT
            mail: this.mail 
        };

        var templateObjectGenerator = new TemplateObjectGenerator(dependencies);
        var nextDependencies = { awtsRes, templateObjectGenerator, ...templateObjectGenerator.dependencies };
        var awtsRes = new AwtsmoosResponse(nextDependencies);
        var moreDependencies = { ...nextDependencies, awtsRes };
        var ayz = new Ayzarim(moreDependencies);
        
        var { fetchAwtsmoos, doEverything } = ayz;
        fetchAwtsmoos = fetchAwtsmoos.bind(ayz);
        templateObjectGenerator.fetchAwtsmoos = fetchAwtsmoos;
        doEverything = doEverything.bind(ayz);

        try {
            doLogs({ firebaseKey: this.firebaseKey, filePath, request });
            return await doEverything();
        } catch(e) { console.log(e); }

        async function getPostData() { return await getData(); }
        async function getPutData() { return await getData("PUT"); }
        async function getDeleteData() { return await getData("DELETE"); }
        
        function getData(method = "POST") {
            return new Promise((resolve, reject) => {
                const contentType = request.headers['content-type'] || '';
                const chunks = [];
                request.on('data', chunk => { chunks.push(chunk); });
                request.on('error', err => reject(err));
                request.on('end', async () => {
                    if (request.method.toUpperCase() !== method) return resolve(null);
                    const bodyBuffer = Buffer.concat(chunks);
                    if (contentType.startsWith('multipart/form-data')) {
                        const boundary = contentType.match(/boundary=(.+)/)[1];
                        paramKinds[method] = parseMultipartFormData(bodyBuffer, boundary);
                    } else if (contentType.startsWith('application/x-www-form-urlencoded')) {
                        const paramData = bodyBuffer.toString();
                        paramKinds[method] = querystring.parse(paramData);
                        Object.keys(paramKinds[method]).forEach(key => {
                            try { paramKinds[method][key] = JSON.parse(paramKinds[method][key]); } 
                            catch (e) { }
                        });
                    } else if (bodyBuffer.length > 0) {
                        paramKinds[method] = { __raw_body__: bodyBuffer };
                    }
                    resolve(paramKinds[method]);
                });
            });
        }

        function parseData(paramKinds, method, paramData) {
            paramKinds[method] = querystring.parse(paramData);
            paramKinds[method] = Object.fromEntries(Object.entries(paramKinds[method]).map(([key, value]) => {
                try { return [key, JSON.parse(value)]; } catch (error) { return [key, value]; }
            }));
            return paramKinds;
        }
        
        async function template(textContent, ob = {}, entire = false) {
            if (typeof(ob) != "object") ob = {};
            return await processTemplate(textContent, await templateObjectGenerator.getTemplateObject(ob), entire);
        };
    }
}

function btoa(input) { return Buffer.from(input).toString('base64'); }
function atob(input) { return Buffer.from(input, 'base64').toString('binary'); }
module.exports = AwtsmoosStaticServer;