
/**
 * B"H
 * @module Serializer
 * @description
 * * Chapter 13: The Mirror of Complexity
 * Not all lights can be reflected directly. Some must be transformed
 * into a blueprint that the higher worlds can understand. This 
 * module converts circular and complex objects into safe JSON.
 */

export const SerializerLogic = `
    function safeSerialize(data, depth=0, visited=new WeakSet()) {
        if (depth > 8) return { type: 'string', value: '[Depth Limit]' };
        if (data === null) return { type: 'null', value: 'null' };
        const t = typeof data;
        
        if (t !== 'object' && t !== 'function') {
            if (t === 'bigint') return { type: 'bigint', value: data.toString() + 'n' };
            return { type: t, value: String(data) };
        }
        
        if (visited.has(data)) return { type: 'string', value: '[Circular]' };
        visited.add(data);
        
        if (t === 'function') {
            return { type: 'function', name: data.name || 'anonymous', signature: 'ƒ' };
        }
        
        if (Array.isArray(data)) return { type: 'array', length: data.length, value: data.map(i => safeSerialize(i, depth+1, visited)) };
        if (data instanceof Error) return { type: 'error', name: data.name, message: data.message, stack: data.stack };
        if (data instanceof Date) return { type: 'date', value: data.toISOString() };
        if (data instanceof RegExp) return { type: 'regexp', value: String(data) };
        if (data instanceof Promise) return { type: 'promise', value: 'Promise' };
        
        if (data instanceof Element) {
            return { 
                type: 'dom', 
                value: data.tagName.toLowerCase() + (data.id ? '#'+data.id : '') + (data.className ? '.'+data.className.split(' ').join('.') : ''),
                path: getElementPath(data)
            };
        }

        const props = [];
        for (let k in data) { 
            try { props.push({ key: k, value: safeSerialize(data[k], depth+1, visited) }); } catch(e){} 
        }
        return { type: 'object', constructorName: data.constructor?.name || 'Object', properties: props };
    }
`;
