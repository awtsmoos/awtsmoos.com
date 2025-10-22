// B"H
// FILE: js/console-interceptor.js
export default /*js*/`
//B"H
//Welcome! 
(function() {
    'use strict';
    // Keep a reference to the original console methods
    const originalConsole = {
        log: console.log.bind(console), error: console.error.bind(console),
        warn: console.warn.bind(console), info: console.info.bind(console),
        clear: console.clear.bind(console), table: console.table.bind(console)
    };

    // --- Communication with the parent editor window ---
    function post(type, payload) {
        window.parent.postMessage({
            source: 'html-preview-console', type: type, payload: payload
        }, '*');
    }

    // --- VIVID Data Serialization ---
    // This is the new, more powerful serializer that enables the extreme console experience.
    function serialize(data, depth = 0, visited = new WeakMap()) {
        if (depth > 12) return { type: 'string', value: '[Max depth reached]' };

        const type = typeof data;
        if (data === null) return { type: 'null', value: 'null' };
        if (type === 'undefined' || type === 'string' || type === 'number' || type === 'boolean' || type === 'symbol') {
            return { type: type, value: String(data) };
        }

        // Prevent infinite recursion with circular references
        if (visited.has(data)) {
            return { type: 'string', value: \`[Circular ~ \${visited.get(data)}]\` };
        }

        if (type === 'function') {
            const signature = data.toString().match(/^(function\\*?|async function\\*?|\\(.*\)|[^\\s=]+)\\s*=>|function\\s*([^\\(]+)/);
            visited.set(data, data.name || '(anonymous)');
            return { type: 'function', name: data.name, signature: signature ? signature[0].replace('{', '').trim() : 'ƒ' };
        }

        if (type === 'object') {
            const constructorName = data.constructor ? data.constructor.name : 'Object';
            visited.set(data, constructorName);

            if (data instanceof Error) {
                return { type: 'error', constructorName: constructorName, message: data.message, stack: data.stack };
            }
            if (data instanceof Date) {
                return { type: 'date', value: data.toISOString() };
            }
            if (data instanceof RegExp) {
                return { type: 'regexp', value: String(data) };
            }
            if (data instanceof Promise) {
                return { type: 'promise', constructorName: 'Promise' };
            }
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

            // Handle generic objects
            const props = [];
            const proto = Object.getPrototypeOf(data);
            for (const key of Object.getOwnPropertyNames(data)) {
                const descriptor = Object.getOwnPropertyDescriptor(data, key);
                if (descriptor) {
                    if (descriptor.get || descriptor.set) {
                         props.push({ key, value: {type: 'accessor'}, isAccessor: true });
                    } else {
                         props.push({ key, value: serialize(data[key], depth + 1, visited) });
                    }
                }
            }
            return {
                type: 'object', constructorName: constructorName, properties: props,
                prototype: proto ? serialize(proto, depth + 1, visited) : { type: 'null', value: 'null' }
            };
        }
        return { type: 'string', value: '[Unsupported Type]' };
    }

    // --- Override Console Methods ---
    Object.keys(originalConsole).forEach(methodName => {
        console[methodName] = (...args) => {
            // Call the original method so logs still appear in the browser's real devtools
            originalConsole[methodName](...args);
            
            if (methodName === 'clear') {
                 post('clear');
                 return;
            }

            const message = {
                type: 'log',
                level: methodName,
                args: args.map(arg => serialize(arg)),
                timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'})
            };
            post('log', message);
        };
    });
    
    // --- Listen for Code Execution Commands ---
    window.addEventListener('message', (event) => {
        if (!event.data || event.data.source !== 'awtsmoos-editor') return;

        const { command, executionId } = event.data;
        
        try {
            // Using 'eval' allows for a proper REPL environment where variables can be set and then used.
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

    // --- Capture Uncaught Errors ---
    window.addEventListener('error', (event) => {
        console.error(event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled Promise Rejection:', event.reason);
    });
    
    post('status', { status: 'ready' });

})();
`