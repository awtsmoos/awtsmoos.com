
// B"H
/**
 * @file resolver.js
 * @brief Universal Path Discernment.
 */
export const PathResolver = {
    resolve(base, rel) {
        // Leave external absolute strings alone.
        if (!rel || rel.startsWith('http') || rel.startsWith('data:') || rel.startsWith('blob:') || rel.startsWith('ws')) {
            return rel;
        }

        // B"H - If relative string literally starts with root, trust it as absolute workspace root logic.
        if (rel.startsWith('/')) {
            return rel.replace(/\/+/g, '/');
        }

        let basePath = (base || '').substring(0, (base || '').lastIndexOf('/'));
        const stack = basePath ? basePath.split('/').filter(Boolean) : [];
        const parts = rel.split('/');
        
        for (const p of parts) {
            if (p === '..') {
                stack.pop();
            } else if (p !== '.') {
                stack.push(p);
            }
        }

        const finalPath = '/' + stack.join('/');
        return finalPath;
    }
};
