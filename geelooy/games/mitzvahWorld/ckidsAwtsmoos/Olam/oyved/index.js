
/**
 * B"H
 * Olam Worker Entry Point - Absolute Safety Edition
 * NO STATIC IMPORTS ALLOWED HERE.
 */

// 1. Trap global errors immediately
self.onerror = function(msg, url, lineNo, columnNo, error) {
    var errorInfo = {
        message: msg,
        filename: url,
        lineno: lineNo,
        colno: columnNo,
        error: error ? error.toString() : "N/A",
        stack: error ? error.stack : "No stack trace available",
        type: "Global Worker Error"
    };
    
    // Attempt to send to main thread
    try {
        self.postMessage({ error: errorInfo });
    } catch(e) {
        console.error("B\"H - Failed to report error to main thread:", e);
    }
    
    return false; // Allow default browser error logging
};

// 2. Trap unhandled promises
self.addEventListener('unhandledrejection', function(event) {
    self.postMessage({
        error: {
            message: "Unhandled Promise Rejection: " + event.reason,
            stack: event.reason ? event.reason.stack : null,
            type: "Promise Rejection"
        }
    });
});

// 3. Async Bootstrap
// We wrap everything in an async function to use try/catch with dynamic imports.
(async function bootstrapWorker() {
    console.log("B\"H - Worker Bootstrap Starting...");

    var Utils, THREE, OlamClass;

    // A. Load Core Dependencies
    try {
        // Load Utils
        // Note: Dynamic import paths are relative to this file
        var utilsModule = await import("../../utils.js").catch(e => {
            throw new Error("Failed to load Utils.js: " + e.message);
        });
        Utils = utilsModule.default;
        
        // Load Three.js
        // We use the absolute path provided in your setup. 
        // If this 404s, the catch block will now catch it instead of the worker crashing silently.
        var threeModule = await import('/games/scripts/build/three.module.js').catch(e => {
            throw new Error("Failed to load THREE.js from /games/scripts/build/three.module.js. Check file path. Details: " + e.message);
        });
        THREE = threeModule;
        self.THREE = THREE; // Make available globally in worker scope

        // Load Olam Core
        var olamModule = await import("../index.js").catch(e => {
            throw new Error("Failed to load Olam Core: " + e.message);
        });
        OlamClass = olamModule.default;
        self.Olam = OlamClass;

        console.log("B\"H - Core Dependencies Loaded Successfully.");

    } catch (e) {
        console.error("B\"H - Bootstrap Import Error:", e);
        self.postMessage({
            error: {
                message: "Worker Bootstrap Failed during imports: " + e.message,
                stack: e.stack,
                type: "Import Error"
            }
        });
        return; // Stop execution if core deps fail
    }

    // B. Initialize Logic
    try {
        await startWorkerLogic(OlamClass, Utils);
    } catch (e) {
         self.postMessage({
            error: {
                message: "Worker Initialization Logic Failed: " + e.message,
                stack: e.stack
            }
        });
    }

})();

async function startWorkerLogic(OlamClass, Utils) {
    var promiseMap = new Map();

    function registerPromise(id) {
        return new Promise((resolve, reject) => {
            promiseMap.set(id, { resolve, reject });
        });
    }

    var me = {
        olam: null,
        promiseMap,
        registerPromise
    };

    // C. Load Methods Dynamically
    // We load each module file individually so we know exactly which one fails.
    var tawfkeedeem = {};
    var methodModules = {
        inventory: "./methods/inventory.js",
        world: "./methods/world.js",
        ui: "./methods/ui.js",
        input: "./methods/input.js",
        canvas: "./methods/canvas.js"
    };

    for (var name in methodModules) {
        var path = methodModules[name];
        try {
            var mod = await import(path);
            if (mod.default) {
                // Determine how to call the module factory
                if (name === 'world') {
                    Object.assign(tawfkeedeem, mod.default(me, OlamClass));
                } else {
                    Object.assign(tawfkeedeem, mod.default(me));
                }
            }
        } catch (e) {
            console.error(`B"H - Failed to load module '${name}' from ${path}:`, e);
            self.postMessage({
                error: {
                    message: `Failed to load worker module '${name}': ${e.message}`,
                    filename: path,
                    stack: e.stack,
                    type: "Module Load Error"
                }
            });
            // We continue loading other modules so the worker remains partially alive for debugging
        }
    }

    // D. Setup Message Listener
    addEventListener("message", async e => {
        var dayuh = e.data;
        if(typeof(dayuh) == "object") {
            try {
                for(var q of Object.keys(dayuh)) {
                    var tawfeek = tawfkeedeem[q];
                    
                    if(typeof(tawfeek) == "function") {
                        var result = await tawfeek(dayuh[q]);
                        
                        var tawch;
                        if(!result) result = {};
                        if(result.tawchlees) {
                            tawch = result.tawchlees
                        };
                        
                        var shouldITransfer = !!result.transfer;
                        postMessage({
                            [q]: tawch
                        }, shouldITransfer ? [tawch] : undefined)
                    }
                }
            } catch(err) {
                console.error("B\"H - Runtime Error processing message:", err);
                self.postMessage({
                    error: {
                        message: "Runtime Error: " + err.message,
                        stack: err.stack,
                        command: Object.keys(dayuh)[0]
                    }
                });
            }
        }
    });

    console.log("B\"H - Olam Worker Fully Initialized and Listening.");
    postMessage({ pawsawch: true });
}
