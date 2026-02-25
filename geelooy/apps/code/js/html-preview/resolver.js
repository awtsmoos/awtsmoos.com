
// B"H
/**
 * @class PathResolver
 * @description Determines the Absolute Truth of paths within the workspace.
 */
export const PathResolver = {
    resolve(base, rel) {
        if (!rel || rel.startsWith('http') || rel.startsWith('data:') || rel.startsWith('blob:')) return rel;
        if (rel.startsWith('/')) return rel;
        
        let basePath = base.substring(0, base.lastIndexOf('/'));
        const stack = basePath ? basePath.split('/').filter(Boolean) : [];
        const parts = rel.split('/');
        
        for (const p of parts) {
            if (p === '..') stack.pop();
            else if (p !== '.') stack.push(p);
        }
        return '/' + stack.join('/');
    }
};
