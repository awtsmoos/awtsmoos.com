
// B"H
/**
 * @file path.js
 * @brief The Navigator of Dimensions, Stringified for the Golem's Consumption.
 * 
 * THE POEM OF THE TIRELESS CARTOGRAPHER:
 * The string is the path, the path is the law,
 * Resolving the angles, ignoring the flaw.
 * It chops off the head, it extracts the root,
 * It names every leaf on the digital shoot!
 * The Golem (Worker) relies on this map to be true,
 * To find all the files that are hidden from you.
 */

export const pathModule = `
module.exports = {
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
        let base = path.substring(path.lastIndexOf('/') + 1) || path;
        if (base === '' && path.endsWith('/')) {
            const stripped = path.slice(0, -1);
            base = stripped.substring(stripped.lastIndexOf('/') + 1);
        }
        if (ext && base.endsWith(ext) && base.length > ext.length) {
            base = base.substring(0, base.length - ext.length);
        }
        return base;
    },

    extname(path) {
        if (typeof path !== 'string') throw new TypeError('Path must be a string.');
        const base = module.exports.basename(path);
        const dotIndex = base.lastIndexOf('.');
        if (dotIndex <= 0) return '';
        return base.substring(dotIndex);
    },
    
    parse(path) {
        if (typeof path !== 'string') throw new TypeError('Path must be a string.');
        const ret = { root: '', dir: '', base: '', ext: '', name: '' };
        if (path.length === 0) return ret;
        ret.root = path.startsWith('/') ? '/' : '';
        ret.base = module.exports.basename(path);
        ret.ext = module.exports.extname(path);
        ret.name = ret.base.substring(0, ret.base.length - ret.ext.length);
        ret.dir = module.exports.dirname(path);
        return ret;
    },
    
    format(pathObj) {
        if (!pathObj || typeof pathObj !== 'object') throw new TypeError('Parameter must be an object.');
        const dir = pathObj.dir || pathObj.root || '';
        const base = pathObj.base || ((pathObj.name || '') + (pathObj.ext || ''));
        if (!dir) return base;
        if (dir === pathObj.root) return dir + base;
        return dir + '/' + base;
    }
};
`;
