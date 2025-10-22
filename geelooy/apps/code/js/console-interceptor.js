// B"H
// FILE: js/console-interceptor.js
export default /*js*/`(function() {
    // Keep a reference to the original console methods
    const originalConsole = {
        log: console.log.bind(console),
        error: console.error.bind(console),
        warn: console.warn.bind(console),
        info: console.info.bind(console),
        clear: console.clear.bind(console),
        table: console.table.bind(console)
    };

    // --- Communication with the parent editor window ---
    function post(type, payload) {
        // We post to the parent window (your editor)
        window.parent.postMessage({
            source: 'html-preview-console',
            type: type,
            payload: payload
        }, '*'); // Use a specific origin in production for security
    }
    
    // --- Data Serialization ---
    // This function recursively converts data into a serializable format
    // that our custom console can understand and render.
    function serialize(data, depth = 0, visited = new Set()) {
        if (depth > 10) return { type: 'string', value: '[Max depth reached]' };

        const type = typeof data;

        if (data === null) return { type: 'null', value: 'null' };
        if (type === 'undefined') return { type: 'undefined', value: 'undefined' };
        if (type === 'string') return { type: 'string', value: data };
        if (type === 'number' || type === 'boolean' || type === 'symbol') {
            return { type: type, value: String(data) };
        }
        
        // Prevent infinite recursion with circular references
        if (visited.has(data)) {
            return { type: 'string', value: '[Circular]' };
        }
        visited.add(data);

        if (Array.isArray(data)) {
            return {
                type: 'array',
                constructorName: 'Array',
                length: data.length,
                value: data.map(item => serialize(item, depth + 1, visited))
            };
        }

        if (data instanceof Error) {
            return {
                type: 'error',
                message: data.message,
                stack: data.stack
            }
        }
        
        if (data instanceof Element) {
             return { type: 'dom', value: data.outerHTML.split('>')[0] + '>' };
        }

        if (type === 'object') {
            const props = [];
            const proto = Object.getPrototypeOf(data);
            
            // Get own properties
            for (const key of Object.getOwnPropertyNames(data)) {
                try {
                    props.push({ key, value: serialize(data[key], depth + 1, visited) });
                } catch (e) {
                     props.push({ key, value: { type: 'string', value: `[Can't access]` } });
                }
            }
            
            return {
                type: 'object',
                constructorName: data.constructor ? data.constructor.name : 'Object',
                properties: props,
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
            
            // Send the serialized data to our custom console
            if (methodName === 'clear') {
                post('log', { type: 'clear' });
            } else {
                const serializedArgs = args.map(arg => serialize(arg));
                post('log', { type: 'log', level: methodName, args: serializedArgs });
            }
        };
    });
    
    // --- Listen for Code Execution Commands ---
    window.addEventListener('message', (event) => {
        if (!event.data || event.data.source !== 'awtsmoos-editor') return;

        const { command, executionId } = event.data;
        
        try {
            // We use new Function() to execute code in the global scope of the iframe
            const result = new Function(`return ${command}`)();
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

})()`