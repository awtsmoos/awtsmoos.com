
// B"H
/**
 * @file PathSanitizer.js
 * @brief Cleanses paths of impurities to guarantee perfect hash matching.
 */
export const PathSanitizer = {
    sanitize(path) {
        if (!path) return '/';
        let clean = path.replace(/\\/g, '/');
        clean = clean.replace(/\/+/g, '/'); // Remove double slashes
        if (clean !== '/' && clean.endsWith('/')) {
            clean = clean.slice(0, -1);
        }
        return clean;
    }
};
