// B"H
/**
 * @file BoundaryGuard.js
 * @brief THE ARCHITECT OF THE IMMUTABLE BOUNDARY.
 * 
 * THE PSALM OF THE GARDEN WALL:
 * Within the vastness of the digital sea,
 * We plant a garden where the code can be.
 * But lest the gardener wander far astray,
 * We build a wall to guard the holy way.
 * No path may exit, no coordinate roam,
 * Keeping the logic in its proper home.
 * The Awtsmoos is Simple, and so is the gate,
 * Rectifying the path and sealing its fate.
 */

/**
 * @class BoundaryGuard
 * @description Enforces a strict jailed environment for file system paths.
 */
export class BoundaryGuard {
    /**
     * B"H - Anchors a conceptual path to a physical Vibe session root.
     * @param {string} requestedPath - The path requested by the Oracle.
     * @param {object} vibeSession - The active Vibe session metadata.
     * @returns {string} The physical, jailed absolute path.
     */
    static jail(requestedPath, vibeSession) {
        if (!vibeSession) return requestedPath || "/";
        
        const req = (requestedPath || '/').split('\\').join('/');

        let jailRoot = (vibeSession.path || vibeSession.rootPath || '/');
        if (jailRoot.length > 1 && jailRoot.endsWith('/')) {
            jailRoot = jailRoot.substring(0, jailRoot.length - 1);
        }
        
        if (!jailRoot.startsWith('/')) jailRoot = '/' + jailRoot;
        if (jailRoot === '') jailRoot = '/';

        console.log('[BoundaryGuard] B"H - Tzimtzum: SessionRoot="' + jailRoot + '" | AI_Request="' + req + '"');

        let absoluteTarget = '';
        
        if (req === '/' || req === './' || req === '.' || req === '') {
            absoluteTarget = jailRoot;
        } else {
            let rel = req.startsWith('./') ? req.substring(2) : (req.startsWith('/') ? req.substring(1) : req);
            absoluteTarget = (jailRoot === '/' ? '' : jailRoot) + '/' + rel;
        }

        const segments = absoluteTarget.split('/').filter(Boolean);
        const stack = [];
        
        const jailSegments = jailRoot.split('/').filter(Boolean);

        for (let i = 0; i < segments.length; i++) {
            const part = segments[i];
            if (part === '..') {
                if (stack.length > jailSegments.length) {
                    stack.pop();
                } else {
                    console.warn('[BoundaryGuard] B"H - Thwarted escape attempt at: ' + jailRoot);
                }
            } else if (part !== '.') {
                stack.push(part);
            }
        }
        
        const finalPath = '/' + stack.join('/');
        
        if (jailRoot !== '/' && !finalPath.startsWith(jailRoot)) {
            console.error('[BoundaryGuard] B"H - Path breach! Resetting to root: ' + jailRoot);
            return jailRoot;
        }

        const result = finalPath.split('//').join('/');
        console.log('[BoundaryGuard] B"H - Final Coordinate Grounded: ' + result);
        return result;
    }
}