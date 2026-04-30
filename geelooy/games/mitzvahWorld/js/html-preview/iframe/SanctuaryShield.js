
// B"H
/**
 * @file SanctuaryShield.js
 * @brief Applying the Laws of the Sandbox.
 * 
 * CHAPTER II: THE SACRED BOUNDARIES
 * An iframe is a sub-world. To ensure it remains a chariot for the will 
 * and not a source of chaos, we must strictly define its permissions. 
 * This shield applies the necessary garments of security.
 */

export const SanctuaryShield = {
    /**
     * @function apply
     * @description Enforces the sandboxed reality upon the iframe element.
     */
    apply(iframe) {
        // Allowing scripts, same-origin, forms, and UI interactions
        iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-modals allow-popups');
        
        // Ensure the iframe behaves like a proper world-vessel
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.style.backgroundColor = '#fff';
    }
};
