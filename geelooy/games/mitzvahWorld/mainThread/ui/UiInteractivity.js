
// B"H
/**
 * @file UiInteractivity.js
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  CHAPTER: THE CURTAIN AND THE STAGE — TIKKUN OF THE UNCLICKABLE UI        ║
 * ║                                                                              ║
 * ║  The UI is a curtain (Parochet) draped over the 3D world.                  ║
 * ║  The curtain must be TRANSPARENT to clicks in empty space                  ║
 * ║  (so the world behind receives them), but SOLID over actual buttons         ║
 * ║  (so the player can interact with menus, inventory, dialogues).            ║
 * ║                                                                              ║
 * ║  THE BUG:                                                                    ║
 * ║  The old `interactiveSelector` default was:                                 ║
 * ║    '.awtsmoosBtn, .loginStatus, .healthBar'                                 ║
 * ║                                                                              ║
 * ║  This missed EVERYTHING else — inventory slots, dialogue buttons,          ║
 * ║  construction menus, input fields, the quest log, the store,               ║
 * ║  character designers, and every other interactive UI element.               ║
 * ║  They all inherited `pointer-events: none` from their container and         ║
 * ║  became permanently unclickable behind the invisible barrier.               ║
 * ║                                                                              ║
 * ║  THE FIX:                                                                    ║
 * ║  The `interactiveSelector` is expanded to include ALL common interactive    ║
 * ║  HTML element types (button, input, select, textarea, a) plus the          ║
 * ║  game-specific class names used throughout the codebase.                    ║
 * ║                                                                              ║
 * ║  Additionally: a new `makeDivClickable(container)` method recursively      ║
 * ║  enables pointer events on ALL descendant elements of a given container,   ║
 * ║  for cases where the UI element tree is dynamically generated.             ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * @class UiInteractivity
 */
export class UiInteractivity {

    /**
     * @static
     * @description
     * The comprehensive list of CSS selectors that should ALWAYS be
     * clickable within any UI container. This covers:
     *   - Native HTML interactive elements (button, input, select, a, etc.)
     *   - Game-specific button and panel class names
     *   - Any element with an explicit `onclick` attribute
     *
     * @type {string}
     */
    static get FULL_INTERACTIVE_SELECTOR() {
        return [
            // Native HTML interactive elements — ALWAYS clickable
            'button',
            'input',
            'select',
            'textarea',
            'a',
            'label',
            '[onclick]',
            '[data-clickable]',
            '[tabindex]',

            // Game-specific button classes
            '.awtsmoosBtn',
            '.mitzvahBtn',
            '.ctx-btn',
            '.loginStatus',
            '.healthBar',
            '.actionBar',
            '.action-bar',

            // Inventory and equipment
            '.inventory-slot',
            '.inv-slot',
            '.equipment-slot',
            '.slot',
            '.item-slot',
            '.craftBtn',

            // Dialogue and NPC interaction
            '.dialogue-option',
            '.dialogueBtn',
            '.talk-option',
            '.npc-option',

            // Menus and navigation
            '.menu-item',
            '.menuItem',
            '.menu-btn',
            '.menu-option',
            '.tab',
            '.tab-btn',
            '.close-btn',
            '.closeBtn',
            '.back-btn',
            '.backBtn',

            // Store and trading
            '.store-item',
            '.storeItem',
            '.buy-btn',
            '.buyBtn',
            '.sell-btn',
            '.sellBtn',

            // Quest and mission UI
            '.quest-item',
            '.questItem',
            '.mission-item',
            '.missionItem',

            // Construction and editor
            '.construct-btn',
            '.constructBtn',
            '.build-option',
            '.buildOption',
            '.editor-btn',

            // Character and customization
            '.character-option',
            '.skin-option',
            '.colorPicker',
            '.color-picker',

            // Joystick and mobile controls
            '#joystick-base',
            '#joystick-thumb',
            '.joystick',

            // Generic interactive class patterns used in the codebase
            '[class*="Btn"]',
            '[class*="btn"]',
            '[class*="Button"]',
            '[class*="button"]',
            '[class*="Option"]',
            '[class*="option"]',
            '[class*="Slot"]',
            '[class*="slot"]',
            '[class*="Item"]:not(.world-item)',
            '[class*="item"]:not(.world-item)',
            '[class*="Menu"]:not(.world-menu)',
            '[class*="menu"]:not(.world-menu)',
        ].join(', ');
    }

    /**
     * @method applyPassThrough
     * @description
     * Configures a UI container so that:
     *   - The container itself is TRANSPARENT to clicks (pointer-events: none)
     *   - All interactive children are SOLID (pointer-events: auto)
     *
     * Uses the comprehensive FULL_INTERACTIVE_SELECTOR by default to catch
     * ALL interactive elements, not just the handful specified before.
     *
     * @param {HTMLElement} container - The main UI wrapper element.
     * @param {string} [interactiveSelector] - Optional override CSS selector.
     *        Defaults to the comprehensive FULL_INTERACTIVE_SELECTOR.
     * @returns {void}
     */
    static applyPassThrough(
        container,
        interactiveSelector = UiInteractivity.FULL_INTERACTIVE_SELECTOR
    ) {
        if (!container) return;

        // The container frame is transparent — clicks pass through empty space
        container.style.pointerEvents = 'none';
        container.style.position = 'absolute';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.height = '100%';

        // All interactive descendants are made solid
        const items = container.querySelectorAll(interactiveSelector);
        items.forEach(item => {
            item.style.pointerEvents = 'auto';
        });

        console.log(
            `B"H 🖱️ UiInteractivity: Container transparent. ` +
            `${items.length} interactive elements made solid (clickable).`
        );
    }

    /**
     * @method makeDivClickable
     * @description
     * Nuclear option: enables pointer-events on a container AND all its
     * descendants. Use this for dynamically-generated UI panels where the
     * class names may not match the static FULL_INTERACTIVE_SELECTOR.
     *
     * Call this when creating popups, modals, or any new UI panel that
     * should be fully interactive.
     *
     * @param {HTMLElement} container - The container to make fully clickable.
     * @returns {void}
     */
    static makeDivClickable(container) {
        if (!container) return;
        container.style.pointerEvents = 'auto';

        // Walk all descendants and enable pointer events
        const allDescendants = container.querySelectorAll('*');
        allDescendants.forEach(el => {
            el.style.pointerEvents = 'auto';
        });

        console.log(
            `B"H ✅ UiInteractivity.makeDivClickable: ` +
            `${container.tagName}#${container.id || '(no-id)'} ` +
            `and ${allDescendants.length} descendants are now fully clickable.`
        );
    }

    /**
     * @method isUiEvent
     * @description
     * Determines if a mouse event occurred on a UI element (not the canvas).
     *
     * @param {MouseEvent} event - The raw browser event.
     * @param {HTMLCanvasElement} canvas - The 3D world vessel.
     * @returns {boolean} true if the event is for the UI, false if for the world.
     */
    static isUiEvent(event, canvas) {
        // B"H: If the target is NOT the canvas, it is a UI event.
        return event.target !== canvas;
    }
}
  