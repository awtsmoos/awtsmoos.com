// B"H
// FILE: js/console-interceptor.js
export default /*js*/`
// B"H
// Welcome to the Awtsmoos Profound Console Interceptor!
(function() {
    'use strict';
    // --- 1. Store original console methods before we override them ---
    const originalConsole = {
        log: console.log.bind(console), error: console.error.bind(console),
        warn: console.warn.bind(console), info: console.info.bind(console),
        clear: console.clear.bind(console), table: console.table.bind(console)
    };

    // --- 2. Centralized function for communicating with the editor UI ---
    function post(type, payload) {
        window.parent.postMessage({
            source: 'html-preview-console',
            type: type,
            payload: payload
        }, '*'); // In a production environment, this should be the specific editor origin for security.
    }

    // --- 3. The VIVID Serializer: The core of the enhanced console experience ---
    // This function intelligently converts any JavaScript value into a serializable object
    // that our custom console UI can understand and render beautifully.
    function serialize(data, depth = 0, visited = new WeakMap()) {
        // --- BASE CASES & PRIMITIVES ---
        if (depth > 12) return { type: 'string', value: '[Max depth reached]' };
        if (data === null) return { type: 'null', value: 'null' };
        
        const type = typeof data;
        if (type !== 'object' && type !== 'function') {
            return { type: type, value: String(data) };
        }

        // --- CIRCULAR REFERENCE HANDLING ---
        // Use a WeakMap to track visited objects to prevent infinite loops.
        if (visited.has(data)) {
            return { type: 'string', value: \`[Circular ~ \${visited.get(data)}]\` };
        }

        // --- COMPLEX TYPES ---
        if (type === 'function') {
            // THIS IS THE CORRECTED REGULAR EXPRESSION: All backslashes are escaped (e.g., \\*).
            const signature = data.toString().match(/^(function\\*?|async function\\*?|\\(.*\\)|[^\\s=]+)\\s*=>|function\\s*([^\\(]+)/);
            visited.set(data, data.name || '(anonymous function)');
            return { type: 'function', name: data.name, signature: signature ? signature[0].replace('{', '').trim() : 'ƒ' };
        }
        
        if (type === 'object') {
            const constructorName = data.constructor ? data.constructor.name : 'Object';
            visited.set(data, constructorName);

            // Handle specific, known object types for a richer display
            if (data instanceof Error) {
                return { type: 'error', constructorName: constructorName, message: data.message, stack: data.stack };
            }
            if (data instanceof Date) return { type: 'date', value: data.toISOString() };
            if (data instanceof RegExp) return { type: 'regexp', value: String(data) };
            if (data instanceof Promise) return { type: 'promise', constructorName: 'Promise' };
            
            if (data instanceof Element) {
                 const tagName = data.tagName.toLowerCase();
                 let selector = tagName;
                 if(data.id) selector += \`#\${data.id}\`;
                 if(data.className && typeof data.className === 'string') selector += \`.\${data.className.split(' ').join('.')}\`;
                 return { type: 'dom', constructorName: data.constructor.name, value: selector };
            }
            if (data instanceof Map) {
                const entries = Array.from(data.entries()).map(([key, value]) => [serialize(key, depth + 1, visited), serialize(value, depth + 1, visited)]);
                return { type: 'map', constructorName: 'Map', size: data.size, entries: entries };
            }
            if (data instanceof Set) {
                const values = Array.from(data.values()).map(value => serialize(value, depth + 1, visited));
                return { type: 'set', constructorName: 'Set', size: data.size, values: values };
            }
            if (Array.isArray(data)) {
                return { type: 'array', constructorName: 'Array', length: data.length, value: data.map(item => serialize(item, depth + 1, visited)) };
            }

            // --- GENERIC OBJECT HANDLING ---
            // This is the fallback for plain objects or custom classes.
            const props = [];
            const proto = Object.getPrototypeOf(data);
            for (const key of Object.getOwnPropertyNames(data)) {
                try {
                    const descriptor = Object.getOwnPropertyDescriptor(data, key);
                    if (descriptor) {
                        // Differentiate between regular properties and getters/setters
                        if (descriptor.get || descriptor.set) {
                             props.push({ key, value: {type: 'accessor'}, isAccessor: true });
                        } else {
                             props.push({ key, value: serialize(data[key], depth + 1, visited) });
                        }
                    }
                } catch (e) {
                    // This gracefully handles properties that might throw an error when accessed.
                    props.push({ key, value: {type: 'error', value: \`[Throws: \${e.message}]\`} });
                }
            }
            return {
                type: 'object', constructorName: constructorName, properties: props,
                prototype: proto ? serialize(proto, depth + 1, visited) : { type: 'null', value: 'null' }
            };
        }
        
        return { type: 'string', value: '[Unsupported Type]' };
    }

    // --- 4. Override native console methods ---
    Object.keys(originalConsole).forEach(methodName => {
        console[methodName] = (...args) => {
            // First, call the original method so logs still appear in the browser's real DevTools.
            originalConsole[methodName](...args);
            
            if (methodName === 'clear') {
                 post('clear'); // Send a dedicated 'clear' message
                 return;
            }
            
            // Serialize all arguments and post them to our custom console.
            const message = {
                type: 'log',
                level: methodName,
                args: args.map(arg => serialize(arg)),
                timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'})
            };
            post('log', message);
        };
    });
    
    // --- 5. Listen for code execution commands from the editor ---
    window.addEventListener('message', (event) => {
        if (!event.data || event.data.source !== 'awtsmoos-editor') return;

        const { command, executionId } = event.data;
        
        try {
            // Use 'eval' to execute in the global scope of the iframe, creating a REPL-like experience.
            const result = eval(command);
            post('execution-result', {
                executionId: executionId,
                result: serialize(result),
                isError: false
            });
        } catch (e) {
            post('execution-result', {
                executionId: executionId,
                result: serialize(e),
                isError: true
            });
        }
    });

    // --- 6. Global Error Catching ---
    // Capture uncaught exceptions and unhandled promise rejections and log them to our console.
    window.addEventListener('error', (event) => {
        console.error(event.error || 'An unknown error occurred');
    });
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled Promise Rejection:', event.reason || 'No reason provided');
    });
    
    // --- 7. Final step: Announce that the console is ready ---
    post('status', { status: 'ready' });

})();
`;