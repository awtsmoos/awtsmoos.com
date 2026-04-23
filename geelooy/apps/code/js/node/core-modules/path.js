
// B"H
/**
 * @file path.js
 * @brief The Navigator of Dimensions, Stringified for the Golem's Consumption.
 * 
 * THE POEM OF THE STRINGIFIED WINDING ROAD:
 * The code must be text before it is mind,
 * A string in the browser, leaving execution behind.
 * Only when injected into the Worker's deep soul,
 * Does it awaken as logic and take full control.
 */

export const pathModule = `
module.exports = {
    /**
     * B"H
     * @function join
     * @description Merges multiple fragments of space into a unified coordinate.
     */
    join(...paths) {
        const parts = [];
        for (let i = 0; i < paths.length; i++) {
            let p = paths[i];
            if (typeof p !== 'string') throw new TypeError('Path must be a string.');
            if (p) parts.push(...p.split('/'));
        }
        
        const stack = [];
        for (const part of parts) {
            if (part === '..') {
                if (stack.length > 0 && stack[stack.length - 1] !== '..') stack.pop();
                else stack.push('..');
            } else if (part !== '.' && part !== '') {
                stack.push(part);
            }
        }
        
        return (paths[0].startsWith('/') ? '/' : '') + stack.join('/') || '.';
    },

    /**
     * B"H
     * @function resolve
     * @description Ascends to the absolute truth of a path.
     */
    resolve(...paths) {
        let resolvedPath = '';
        let resolvedAbsolute = false;

        for (let i = paths.length - 1; i >= -1 && !resolvedAbsolute; i--) {
            const path = (i >= 0) ? paths[i] : '/';
            if (typeof path !== 'string') throw new TypeError('Path must be a string.');
            if (!path) continue;

            resolvedPath = path + '/' + resolvedPath;
            resolvedAbsolute = path.startsWith('/');
        }

        const stack = [];
        const parts = resolvedPath.split('/');
        for (const part of parts) {
            if (part === '..') stack.pop();
            else if (part !== '.' && part !== '') stack.push(part);
        }

        return (resolvedAbsolute ? '/' : '') + stack.join('/') || '.';
    },

    /**
     * B"H
     * @function dirname
     * @description Extracts the parent vessel.
     */
    dirname(path) {
        if (typeof path !== 'string') throw new TypeError('Path must be a string.');
        if (path === '/' || path === '') return path;
        const lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return '.';
        if (lastSlash === 0) return '/';
        return path.substring(0, lastSlash);
    },

    basename(path, ext) {
        if (typeof path !== 'string') throw new TypeError('Path must be a string.');
        let base = path.substring(path.lastIndexOf('/') + 1);
        if (ext && base.endsWith(ext) && base.length > ext.length) {
            base = base.substring(0, base.length - ext.length);
        }
        return base;
    },

    extname(path) {
        if (typeof path !== 'string') throw new TypeError('Path must be a string.');
        const base = path.substring(path.lastIndexOf('/') + 1);
        const dotIndex = base.lastIndexOf('.');
        if (dotIndex <= 0) return '';
        return base.substring(dotIndex);
    }
};
`;
