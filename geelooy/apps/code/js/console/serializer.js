
// B"H
/**
 * @file serializer.js
 * @brief The transmutation of objects into serializable light.
 */

export const ConsoleSerializer = {
    /**
     * @function serialize
     * @description Traverses the object tree and creates a safe representation for the UI.
     */
    serialize(data, depth = 0, visited = new WeakMap()) {
        if (depth > 10) return { type: 'string', value: '[Depth Limit]' };
        if (data === null) return { type: 'null', value: 'null' };
        
        const type = typeof data;
        if (type !== 'object' && type !== 'function') return { type, value: String(data) };

        if (visited.has(data)) return { type: 'circular', value: '[Circular Reference]' };
        visited.set(data, true);

        if (type === 'function') return { type: 'function', name: data.name || 'anonymous' };
        
        if (Array.isArray(data)) {
            return { 
                type: 'array', 
                length: data.length, 
                value: data.map(i => this.serialize(i, depth + 1, visited)) 
            };
        }

        const props = Object.getOwnPropertyNames(data).map(key => {
            try { return { key, value: this.serialize(data[key], depth + 1, visited) }; }
            catch(e) { return { key, value: 'Error Reading' }; }
        });

        return { 
            type: 'object', 
            constructor: data.constructor?.name || 'Object', 
            properties: props 
        };
    }
};
