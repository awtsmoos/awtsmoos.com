
// B"H
/**
 * @file UiPortalEnforcer.js
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  THE GUARDIAN OF THE PERIPHERAL VISION — TIKKUN OF BROKEN CLICKS          ║
 * ║                                                                              ║
 * ║  The Canvas is the physical world (Asiyah). The UI is the Divine Menu      ║
 * ║  of possibilities floating above it (Yetzirah). We must ensure both        ║
 * ║  realms can receive the attention of the player without interfering.        ║
 * ║                                                                              ║
 * ║  THE BUG IN THE OLD makeSolid():                                            ║
 * ║                                                                              ║
 * ║  The old code called e.stopPropagation() on mousedown, touchstart,         ║
 * ║  and wheel events inside every "solid" UI element:                          ║
 * ║                                                                              ║
 * ║    element.addEventListener('mousedown', (e) => e.stopPropagation());      ║
 * ║                                                                              ║
 * ║  This stopped the event from bubbling to parent elements — which means      ║
 * ║  nested UI structures BROKE. A button inside a panel inside a menu:         ║
 * ║    - The button catches mousedown, stops propagation                        ║
 * ║    - The panel's mousedown handler never fires                              ║
 * ║    - The menu's click handler never fires                                   ║
 * ║    - EFFECTIVELY BLOCKING ALL CLICKS ON NESTED UI                          ║
 * ║                                                                              ║
 * ║  THE FIX:                                                                    ║
 * ║  REMOVED stopPropagation entirely from makeSolid.                           ║
 * ║  The reason we needed it before was to "prevent the 3D world from          ║
 * ║  reacting to UI clicks" — but that is now handled at the worker input       ║
 * ║  layer via the `isOverUI` flag in SefiraOfInput. The click DOES reach       ║
 * ║  the worker, but the worker KNOWS it's a UI click and ignores it.          ║
 * ║                                                                              ║
 * ║  stopPropagation in the UI layer is NEVER needed anymore.                   ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * @class UiPortalEnforcer
 */
export class UiPortalEnforcer {

    /**
     * @method enforceDominance
     * @description
     * Establishes the correct z-index layering between the UI overlay
     * and the 3D canvas — ensuring the UI floats above the canvas while
     * still allowing the canvas to receive clicks through transparent areas.
     *
     * @param {string} containerId - The ID of the UI overlay container.
     * @param {string} canvasId - The ID of the 3D canvas element.
     * @returns {void}
     */
    static enforceDominance(containerId, canvasId) {
        const container = document.getElementById(containerId);
        const canvas = document.getElementById(canvasId);

        if (!container || !canvas) {
            console.error(`B"H UiPortalEnforcer: Vessels missing! containerId="${containerId}", canvasId="${canvasId}"`);
            return;
        }

        // B"H: UI layer sits visually above the canvas
        container.style.zIndex = '1000';
        container.style.position = 'fixed';
        container.style.pointerEvents = 'none'; // Transparent by default — clicks pass to canvas

        // B"H: Canvas is below in z-order but still receives clicks in empty spaces
        canvas.style.zIndex = '1';
        canvas.style.position = 'absolute';

        console.log(`B"H 🛡️ UiPortalEnforcer: DOM Hierarchy Enforced. UI Layer above canvas.`);
    }

    /**
     * @method makeSolid
     * @description
     * ════════════════════════════════════════════════════════════════
     * MAKES A UI ELEMENT RESPONSIVE TO CLICKS
     * ════════════════════════════════════════════════════════════════
     *
     * Sets pointer-events: auto and cursor: pointer on the element,
     * making it physically clickable despite any parent container
     * having pointer-events: none.
     *
     * CRITICAL TIKKUN: stopPropagation has been REMOVED.
     *
     * The old code stopped propagation to "prevent the world from
     * seeing UI clicks." But this broke ALL nested UI interaction
     * (buttons inside panels, options inside menus, etc.).
     *
     * The correct solution is at the worker-input layer:
     * SefiraOfInput.isUI() classifies the event, and the isOverUI
     * flag is sent with EVERY mouse message to the worker. The worker
     * then decides whether to raycast based on this flag — NOT based
     * on whether the event reached it at all.
     *
     * @param {HTMLElement} element - The button, bar, or panel to activate.
     * @returns {void}
     */
    static makeSolid(element) {
        if (!element) return;

        // B"H: Enable pointer events so clicks register
        element.style.pointerEvents = 'auto';
        element.style.cursor = 'pointer';

        // B"H: INTENTIONALLY NOT calling stopPropagation.
        // The old version did this to prevent world clicks, but it broke
        // nested UI. The isOverUI flag in the worker input layer handles
        // this correctly without blocking DOM event propagation.

        console.log(
            `B"H ✅ UiPortalEnforcer.makeSolid: ` +
            `