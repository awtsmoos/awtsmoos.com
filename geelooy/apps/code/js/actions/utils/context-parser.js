
// B"H
/**
 * @file context-parser.js
 * @brief Isolates the true physical item from the chaotic action context.
 */

export const ContextParser = {
    /**
     * B"H - Extracts the physical file/folder item from the event context.
     * @param {Object} context 
     * @returns {Object|null}
     */
    getItem(context) {
        if (!context) return null;
        
        let item = context;
        
        // Unpack if it's wrapped in an object { item: ... } (Common in context menus)
        if (context.item) {
            item = context.item;
        } 
        
        // Double unwrap just in case of intense nesting
        if (item.item) {
            item = item.item;
        }

        // Ensure it's a valid data vessel with a path
        if (typeof item === 'object' && item.path !== undefined) {
            
            // B"H - The Grand Un-Virtualization!
            // If this item comes from an HTML preview tab, its type was temporarily altered.
            // We must restore its original physical type so FileCommander and FS can recognize it.
            const physicalType = item.originalType || item.type;
            
            // B"H - Infer 'kind' if missing, which happens sometimes when bridging UI state
            let kind = item.kind;
            if (!kind) {
                kind = (item.path.endsWith('/') || physicalType === 'directory') ? 'directory' : 'file';
            }

            return {
                ...item,
                type: physicalType,
                kind: kind
            };
        }
        
        return null;
    }
};
