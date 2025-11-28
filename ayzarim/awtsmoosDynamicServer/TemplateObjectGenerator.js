/**
 * B"H
 */

var di= require("./DependencyInjector.js")

class TemplateObjectGenerator {
    constructor(dependencies) {
        this.dependencies = dependencies;
        this.dependencies.me = this;
    }
    
    test=3
    /**
     * @method fetchAwtsmoos gets the
     * result as if one makes a request to
     * this path
     * @param {String} path 
     * @param {Object} opts 
     * 		@params of opts:
     * 		- method: 'POST', 'GET', etc.
     * 		- body: Data to be passed for POST, PUT, etc.
     * 		- headers: any additional headers
     * 		
     */
    async fetchAwtsmoos(path, opts) {
        if(!opts) opts = {}
        
        var me = this;
        var g = !!(me);
        console.log(g,"OK",path, opts)
        if(!g) {
            me = me.me
        }
        console.log("still me?")
        if(!me.test) return console.log("lo",(me?me.test:8))
        return di.execute({
            base: fetchAwtsmoos,
            params: {
                path, opts
                
            },
            
            dependencies:me.dependencies
        })
    }

    async getTemplateObject(ob={}) {
        
        return di.execute({
            base: _getTemplateObject,
            params: {
                ob: {
                    ...ob
                    
                },
                fetchAwtsmoos: this.fetchAwtsmoos
            },
            
            dependencies:this.dependencies
        })
    }

    
}


async function fetchAwtsmoos (path, opts) {
    if(!opts) opts = {}
        
    // Mock request object
    var mockRequest = {
        url: path,
        method: opts.method || 'GET',
         headers: {
            cookie: opts.cookies || '',
            host: 'internal-mock' // <--- Fixes new URL() crash
        },
        on: (eventName, callback) => {
            // Simulating request events for methods like POST/PUT
            if (eventName === 'data') {
                if (opts.body) {
                    var dataChunks = typeof opts.body === 'string' ? [opts.body] : opts.body;
                    dataChunks.forEach(chunk => callback(chunk));
                }
            } else if (eventName === 'end') {
                callback();
            }
        }
    };

    var _data = "";
    var _responseHeaders = {};
    // Mock response object
    
    var mockResponse = {
        _data: '',
        setHeader: (name, value) => {
	        console.log("SETTING HEADER!",name,value)
            if(typeof(name) == "string") {
                name = name.toLowerCase();
            } else return;

             _responseHeaders
            [name] = value
            // For this mock, we won't do anything with headers
            // but in a real server, this sets HTTP headers for the response
        },
        end: function(data) {
            _data += data;
        },
        get data() {
            return _data;
        }
    };
    
    try {
        // Invoke onRequest function
        await self.onRequest(mockRequest, mockResponse);
    } catch(e) {
        console.log(e)
    }

    var d = mockResponse.data;
    var ct = _responseHeaders["content-type"]
    if(ct && ct.includes("json")) {
        try {
            d = JSON.parse(d)
        } catch(e) {

        }
    }

    
    return d;
};

async function _getTemplateObject(ob) {


	// Create a copy of the original db object
    // B"H


const instrumentedDb = new Proxy(self.db, {
    get: function(target, prop, receiver) {
        // Get the original property or method from the actual db object.
        const originalValue = Reflect.get(target, prop, receiver);

        // We only need to wrap functions (the methods).
        // If it's not a function, return it as-is.
        if (typeof originalValue !== 'function') {
            return originalValue;
        }

        // Return a new, wrapped async function that replaces the original method.
        return async function(...args) {
            
            // This is our instrumentation logic. It runs BEFORE the original method.
            if (request.isAwtsmoosFileStatusRequest) {
                try {
                    // The first argument to our DB methods is consistently the path/key.
                    const key = args[0];
                    if (typeof key === 'string' && key) {
                        
                        // Ask DosDB for the real, physical file path for this key.
                        const realDataPath = await target.getAwtsmoosFilePath(key);
                        const stats = await fs.stat(realDataPath);
                        
                        // Attach the result to the request object.
                        // IMPROVEMENT: If multiple files are read, we keep the timestamp
                        // of the MOST RECENTLY modified file.
                        if (!request.awtsmoosDataSourceStat || stats.mtime.getTime() > request.awtsmoosDataSourceStat.mtime.getTime()) {
                            request.awtsmoosDataSourceStat = stats;
                        }
                    }
                } catch (error) {
                    // It's perfectly fine if this fails (e.g., checking a file that
                    // doesn't exist yet). The original method will handle the actual logic.
                    // We don't need to do anything in the catch block.
                }
            }
            
            // IMPORTANT: Now, call the ORIGINAL db method (e.g., getObjectKeys)
            // with the correct 'this' context and all of its original arguments.
            // Then, return its result to the caller.
            return originalValue.apply(target, args);
        };
    }
});

    
    var getT /*get template content*/
    
    = async (path, vars) => {
        var temps = config.templateDir ||
            "templates"
        var pth = self.directory + "/" + 
            temps + "/" 
            + path;
            
        var fl;
        var temp;
        try {
            fl = await fs.readFile(pth);
        } catch (e) {
            return null;
        }
        if (fl) {
            temp = await template(
                fl + "",
                vars
            );
            return temp;
        }
        return null;
    }
    
    /**
     * @method getA (getAwtsmoos)
     * gets a file in current directory
     * as a template.
     * @param {String} path 
     * @param {Object} ob to
     * set as global variables in template
     * @returns 
     */
    var getA =
        async (pathToFile, vars) => {
            var derechPath = typeof(ob.derech) ==
                "string" ? ob.derech : null;
            
            // Use path.dirname to get the parent directory of derechPath
            var derechParent = derechPath ?
                path.dirname(derechPath) : null;
            
            // Use path.join to safely concatenate paths
            var pth = path.join(derechParent || parentPath, pathToFile);
            
            var fl;
            var temp;
            try {
                fl = await fs.readFile(pth);
                
            } catch (e) {
            
                return null;
            }
            if (fl) {
                temp = await template(
                    fl + "",
                    vars
                );
                return temp;
            }
            
            return null;
        };
    
    if (typeof(ob) != "object" || !ob)
        ob = {};
    
    function fetchIt(urlString, options = {}) {
        return new Promise((resolve, reject) => {
            const url = new URL(urlString);
            const protocol = url.protocol === 'https:' ? https : http;
        
            // Parse options
            const { method = 'GET', headers = {}, body } = options;
        
            // Prepare request options
            const requestOptions = {
            method: method.toUpperCase(),
            headers: headers,
            };
        
            // If there's a body, add it to request options
            if (body) {
            requestOptions.headers['Content-Length'] = Buffer.byteLength(body);
            }
        
            // Send request
            const req = protocol.request(url, requestOptions, (res) => {
            let responseData = '';
        
            res.on('data', (chunk) => {
                responseData += chunk;
            });
        
            res.on('end', () => {
                resolve({
                ok: res.statusCode >= 200 && res.statusCode < 300,
                status: res.statusCode,
                statusText: res.statusMessage,
                headers: res.headers,
                text: () => Promise.resolve(responseData),
                json: () => Promise.resolve(JSON.parse(responseData)),
                });
            });
            });
        
            req.on('error', (error) => {
            reject(error);
            });
        
            // If there's a body, write it to the request
            if (body) {
            req.write(body);
            }
        
            req.end();
        });
        }
    return ({ // Await processTemplate
        DosDB,
        
        require,
        request,
        setHeader: (nm, vl) => {
            response.setHeader(nm, vl);
        //    console.log("Header",nm,vl)
        },
        base64ify: str => {
            try {
                return Buffer.from(str)
                    .toString("base64");
            } catch (e) {
                return null;
            }
        },
        response,
        console: {
            log: (...args) => console.log(args)
        },
        createJob,
        db: instrumentedDb,
        location,
        getT,
        btoa, atob,
        getA,
        fetchAwtsmoos,
        fetchIt,
        fetch,
        TextEncoder,
        $ga: getA,
        __awtsdir: self.directory,
        setStatus: status => response.statusCode = status,
        template,
        process,
        mimeTypes,
        binaryMimeTypes,
        path,
        server: self,
        getHeaders: () => request.headers,
        path,
        URLSearchParams,
        url,
        sodos,
        fs,
        cookies,
        setCookie: (nm,val)=>{
            try {
                var encoded = encodeURIComponent(val);
            response.setHeader(
                "set-cookie",
                `${nm}=${encoded}; HttpOnly; `+
                "max-age="+(60*60*24*365) + "; "
                + "Path=/;"
            );
                return {success: true}

            } catch(e) {
                return {error: e.stack+""};

            }

        },
        removeCookie:nm => {
            response.setHeader(
                "set-cookie",
                `${nm}=; HttpOnly; `+
                "max-age=0; "
                + "Path=/;"
            );
        },
        makeToken,
        $_POST: paramKinds.POST, // Include the POST parameters in the context
        $_GET: paramKinds.GET // Include the GET parameters in the context
            ,
        $_PUT: paramKinds.PUT,
        $_DELETE: paramKinds.DELETE,
        config,
        utils: Utils,
        mail,
        ws,
        rulesEngine, // Inject the Rules Engine into $i
        callAi,      // Inject the AI caller into $i
        ...ob
    })
}
module.exports = TemplateObjectGenerator;
