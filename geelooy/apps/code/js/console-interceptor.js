// B"H
// FILE: js/console-interceptor.js
// FINAL "FLAWLESS" VERSION

export default /*js*/`
// B"H
// Welcome to the Awtsmoos Profound Console Interceptor! v3.0 (Flawless Edition)
(function() {
    'use strict';

    // --- 1. Preserve Original Console & State ---
    const originalConsole = {
        log: console.log.bind(console), error: console.error.bind(console),
        warn: console.warn.bind(console), info: console.info.bind(console),
        clear: console.clear.bind(console), table: console.table.bind(console)
    };
    
    // This special variable will hold the result of the last execution for REPL-style '$_' access.
    let lastResult = undefined;

    // --- 2. Centralized Communication Hub ---
    function post(type, payload) {
        window.parent.postMessage({
            source: 'html-preview-console', type: type, payload: payload
        }, '*');
    }

    // --- 3. The "Vivid Extreme" Serializer ---
    // This is the heart of the console, converting any JS value into a rich, serializable object.
    function serialize(data, depth = 0, visited = new WeakMap()) {
        if (depth > 15) return { type: 'string', value: '[Max depth reached]' };
        if (data === null) return { type: 'null', value: 'null' };
        
        const type = typeof data;

        // Gracefully handle primitives and BigInt
        if (type !== 'object' && type !== 'function') {
            if (type === 'bigint') return { type: 'bigint', value: \`\${data}n\` };
            return { type: type, value: String(data) };
        }
        
        // Use a WeakMap for robust circular reference tracking without causing memory leaks.
        if (visited.has(data)) {
            return { type: 'string', value: \`[Circular ~ \${visited.get(data)}]\` };
        }

        // --- Handle Complex Types ---
        if (type === 'function') {
            const signature = data.toString().match(/^(function\\*?|async function\\*?|\\(.*\\)|[^\\s=]+)\\s*=>|function\\s*([^\\(]+)/);
            visited.set(data, data.name || '(anonymous function)');
            return { type: 'function', name: data.name, signature: signature ? signature[0].replace('{', '').trim() : 'ƒ' };
        }
        
        if (type === 'object') {
            // Prevent crashes when trying to inspect huge global objects.
            if (data === window) return { type: 'global', constructorName: 'Window', value: 'Window' };
            if (data === document) return { type: 'global', constructorName: 'HTMLDocument', value: 'Document' };

            const constructorName = data.constructor ? data.constructor.name : 'Object';
            visited.set(data, constructorName);

            // Specific handlers for rich display
            if (data instanceof Error) return { type: 'error', constructorName, message: data.message, stack: data.stack };
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
                const entries = Array.from(data.entries()).map(([key, val]) => [serialize(key, depth + 1, visited), serialize(val, depth + 1, visited)]);
                return { type: 'map', constructorName: 'Map', size: data.size, entries: entries };
            }
            if (data instanceof Set) {
                const values = Array.from(data.values()).map(val => serialize(val, depth + 1, visited));
                return { type: 'set', constructorName: 'Set', size: data.size, values: values };
            }
            if (Array.isArray(data)) {
                return { type: 'array', constructorName: 'Array', length: data.length, value: data.map(item => serialize(item, depth + 1, visited)) };
            }
            // Catch all typed arrays (Uint8Array, Float32Array, etc.)
            if (ArrayBuffer.isView(data) && !(data instanceof DataView)) {
                return { type: 'array', constructorName, length: data.length, value: Array.from(data).map(item => serialize(item, depth + 1, visited)) };
            }

            // Fallback for generic objects
            const props = [];
            const proto = Object.getPrototypeOf(data);
            for (const key of Object.getOwnPropertyNames(data)) {
                try {
                    const descriptor = Object.getOwnPropertyDescriptor(data, key);
                    if (descriptor) {
                        if (descriptor.get || descriptor.set) {
                             props.push({ key, value: {type: 'accessor', value: 'getter/setter'}, isAccessor: true });
                        } else {
                             props.push({ key, value: serialize(data[key], depth + 1, visited) });
                        }
                    }
                } catch (e) {
                    props.push({ key, value: {type: 'error', value: \`[Throws: \${e.name}]\`} });
                }
            }
            return { type: 'object', constructorName, properties: props, prototype: proto ? serialize(proto, depth + 1, visited) : { type: 'null', value: 'null' } };
        }
        
        return { type: 'string', value: '[Unsupported Type]' };
    }

    // --- 4. Override Native Console Methods ---
    Object.keys(originalConsole).forEach(methodName => {
        console[methodName] = (...args) => {
            originalConsole[methodName](...args);
            
            if (methodName === 'clear') {
                 post('clear');
                 return;
            }

            post('log', {
                type: 'log',
                level: methodName,
                args: args.map(arg => serialize(arg)),
                timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'})
            });
        };
    });
    
    // --- 5. Listen for Code Execution Commands ---
    window.addEventListener('message', (event) => {
        if (!event.data || event.data.source !== 'awtsmoos-editor') return;

        const { command, executionId } = event.data;
        
        // Make the special '$_' variable (last result) available in the global scope for the next command.
        window.$_ = lastResult;
        
        try {
            // Force execution in the global scope to ensure a true REPL environment.
            const result = window.eval(command);

            // Store the successful result for the next '$_' access.
            lastResult = result;
            
            post('execution-result', {
                executionId, result: serialize(result), isError: false
            });
        } catch (e) {
            // Don't update lastResult on error.
            post('execution-result', {
                executionId, result: serialize(e), isError: true
            });
        }
    });

    // --- 6. Global Error Handling ---
    window.addEventListener('error', (event) => console.error(event.error || 'An unknown error occurred'));
    window.addEventListener('unhandledrejection', (event) => console.error('Unhandled Promise Rejection:', event.reason || 'No reason provided'));
    
    // --- 7. Announce Readiness ---
    post('status', { status: 'ready' });
})();
`;