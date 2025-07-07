//B"H
/**
 * @file ExtremeDropdown.js
 * @description Generates an extreme, intense, vivid, excellent, and insane dropdown list.
 *              The dropdown positions itself absolutely based on the parent element
 *              and populates with options defined in the configuration.
 *              Designed to work seamlessly across devices with a professional,
 *              beyond-imagination aesthetic.
 */

class ExtremeDropdown {
    /**
     * The main container element for the dropdown.
     * @type {HTMLElement}
     * @private
     */
    _dropdownContainer;

    /**
     * The element that triggers the dropdown's visibility.
     * @type {HTMLElement}
     * @private
     */
    _triggerElement;

    /**
     * The array of options to display in the dropdown.
     * Each option can be an object with 'text' and 'href' properties,
     * or a simple string for text-only items.
     * @type {Array<string|{text: string, href: string}>}
     * @private
     */
    _options;

    /**
     * Configuration options for the dropdown.
     * @typedef {Object} DropdownOptions
     * @property {HTMLElement} parentElement - The HTML element that will serve as the anchor for the dropdown.
     * @property {Array<string|{text: string, href: string}>} options - The list of items for the dropdown.
     * @property {string} [dropdownClass='extreme-dropdown'] - A custom CSS class to apply to the dropdown container.
     * @property {string} [triggerClass='extreme-dropdown-trigger'] - A custom CSS class to apply to the trigger element.
     * @property {boolean} [closeOnClickOutside=true] - Whether to close the dropdown when clicking outside of it.
     * @property {string} [animationDuration='0.3s'] - The CSS transition duration for opening/closing animations.
     * @property {string} [animationTimingFunction='ease-in-out'] - The CSS timing function for animations.
     */

    /**
     * Creates an instance of ExtremeDropdown.
     *
     * @param {Object} options - Configuration options for the dropdown.
     * @param {HTMLElement} options.parentElement - The HTML element that will serve as the anchor for the dropdown.
     * @param {Array<string|{text: string, href: string}>} options.options - The list of items for the dropdown.
     * @param {string} [options.dropdownClass='extreme-dropdown'] - A custom CSS class to apply to the dropdown container.
     * @param {string} [options.triggerClass='extreme-dropdown-trigger'] - A custom CSS class to apply to the trigger element.
     * @param {boolean} [options.closeOnClickOutside=true] - Whether to close the dropdown when clicking outside of it.
     * @param {string} [options.animationDuration='0.3s'] - The CSS transition duration for opening/closing animations.
     * @param {string} [options.animationTimingFunction='ease-in-out'] - The CSS timing function for animations.
     */
    constructor(options) {
        if (!options || !options.parentElement || !options.options) {
            throw new Error("ExtremeDropdown: 'parentElement' and 'options' are required in the constructor.");
        }

        this._triggerElement = options.parentElement;
        this._options = options.options;
        this.dropdownClass = options.dropdownClass || 'extreme-dropdown';
        this.triggerClass = options.triggerClass || 'extreme-dropdown-trigger';
        this.closeOnClickOutside = options.closeOnClickOutside !== undefined ? options.closeOnClickOutside : true;
        this.animationDuration = options.animationDuration || '0.3s';
        this.animationTimingFunction = options.animationTimingFunction || 'ease-in-out';

        this._setupTrigger();
        this._createDropdownStructure();
        this._applyInitialStyles();
        this._bindEvents();

        this.insertCSS("/style/extreme-dropdown.css")
    }

    
    insertCSS(href) {
        var lk = document.createElement("link")
        lk.rel = "stylesheet"
        lk.type = "text/css";
        lk.href = href;
        document.head.appendChild(lk)
    }

    /**
     * Sets up the trigger element with necessary classes and ARIA attributes.
     * @private
     */
    _setupTrigger() {
        if (!this._triggerElement.classList.contains(this.triggerClass)) {
            this._triggerElement.classList.add(this.triggerClass);
        }
        this._triggerElement.setAttribute('aria-haspopup', 'true');
        this._triggerElement.setAttribute('aria-expanded', 'false');
        this._triggerElement.setAttribute('role', 'button'); // Assume it's a button-like element
        this._triggerElement.style.cursor = 'pointer'; // Ensure visual cue for interactivity
    }

    /**
     * Creates the DOM structure for the dropdown and its options.
     * @private
     */
    _createDropdownStructure() {
        this._dropdownContainer = document.createElement('div');
        this._dropdownContainer.classList.add(this.dropdownClass);
        this._dropdownContainer.setAttribute('role', 'menu');
        this._dropdownContainer.setAttribute('aria-labelledby', this._triggerElement.id || 'dropdown-trigger-id'); // Fallback ID

        this._options.forEach((option, index) => {
            const item = document.createElement('div');
            item.classList.add(`${this.dropdownClass}__item`);
            item.setAttribute('role', 'menuitem');
            item.setAttribute('tabindex', '-1'); // Initially not focusable by tab

            if (typeof option === 'string') {
                item.textContent = option;
                item.setAttribute('data-index', index);
            } else if (typeof option === 'object' && option.text) {
                const link = document.createElement('a');
                link.href = option.href || "javascript: (void(0))";
                var k = option.onclick;
                if(k) {
                    link.addEventListener("click", k)
                }
                link.textContent = option.text;
                link.classList.add(`${this.dropdownClass}__link`);
                item.appendChild(link);
                item.setAttribute('data-index', index);
            } else {
                console.warn(`ExtremeDropdown: Invalid option format at index ${index}. Skipping.`);
                return; // Skip invalid options
            }
            this._dropdownContainer.appendChild(item);
        });

        // Append the dropdown to the body to ensure absolute positioning works without parent overflow issues
        document.body.appendChild(this._dropdownContainer);
    }

    /**
     * Applies initial styles and prepares the dropdown for animation.
     * @private
     */
    _applyInitialStyles() {
     
        
        // Apply styles to the trigger element for positioning
        // This will be overridden by CSS, but sets a baseline if CSS isn't loaded yet
        this._triggerElement.style.position = this._triggerElement.style.position || 'relative';
        this._triggerElement.style.display = this._triggerElement.style.display || 'inline-block';
    }

    /**
     * Binds event listeners for toggling the dropdown and closing it.
     * @private
     */
    _bindEvents() {
        // Toggle dropdown on trigger click
        this._triggerElement.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent immediate closing if this is nested
            this.toggle();
        });

        // Close dropdown if clicking outside
        if (this.closeOnClickOutside) {
            document.addEventListener('click', (event) => {
                if (this.isVisible() && !this._dropdownContainer.contains(event.target) && !this._triggerElement.contains(event.target)) {
                    this.hide();
                }
            });
        }

        // Keyboard navigation (Enter/Space to toggle, Esc to close, Arrow keys for focus)
        this._triggerElement.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                this.toggle();
            }
        });

        this._dropdownContainer.addEventListener('keydown', (event) => {
            const items = this._dropdownContainer.querySelectorAll(`.${this.dropdownClass}__item[tabindex="-1"], .${this.dropdownClass}__link`);
            const currentIndex = Array.from(items).indexOf(document.activeElement);

            if (event.key === 'Escape') {
                this.hide();
                this._triggerElement.focus(); // Return focus to the trigger
            } else if (event.key === 'ArrowDown') {
                event.preventDefault();
                const nextIndex = (currentIndex + 1) % items.length;
                items[nextIndex].focus();
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                const prevIndex = (currentIndex - 1 + items.length) % items.length;
                items[prevIndex].focus();
            } else if (event.key === 'Enter' || event.key === ' ') {
                // If an item is focused and activated, close the dropdown
                if (document.activeElement && (document.activeElement.tagName === 'A' || document.activeElement.parentElement.tagName === 'DIV')) {
                    // Ensure it's an actual menu item that was focused
                    if (document.activeElement.closest(`.${this.dropdownClass}__item`)) {
                        this.hide();
                    }
                }
            }
        });
    }

    /**
     * Positions the dropdown absolutely based on the trigger element's position.
     * @private
     */
    _positionDropdown() {
        const triggerRect = this._triggerElement.getBoundingClientRect();
        const dropdownRect = this._dropdownContainer.getBoundingClientRect(); // Get current dims before positioning

        this._dropdownContainer.style.top = `${triggerRect.bottom + window.scrollY}px`;
        this._dropdownContainer.style.left = `${triggerRect.left + window.scrollX}px`;

        // Basic responsive adjustment: prevent dropdown from going off-screen to the right
        const viewportWidth = window.innerWidth;
        if (triggerRect.left + dropdownRect.width > viewportWidth) {
            this._dropdownContainer.style.left = `${viewportWidth - dropdownRect.width}px`;
        }
        // Adjust for left overflow if it's too far left (less common but possible)
        if (triggerRect.left < 0) {
             this._dropdownContainer.style.left = '0px';
        }
    }

    /**
     * Makes the dropdown visible and applies positioning.
     */
    show() {
        if (!this.isVisible()) {
            this._positionDropdown();
            this._dropdownContainer.style.visibility = 'visible';
            this._dropdownContainer.style.opacity = '1';
            this._dropdownContainer.style.transform = 'translateY(0)';
            this._triggerElement.setAttribute('aria-expanded', 'true');

            // Make menu items focusable when dropdown is visible
            const items = this._dropdownContainer.querySelectorAll(`.${this.dropdownClass}__item`);
            items.forEach(item => item.setAttribute('tabindex', '0'));

            // Focus the first item for keyboard navigation
            if (items.length > 0) {
                const firstFocusable = items[0].querySelector('a') || items[0];
                firstFocusable.focus();
            }
        }
    }

    /**
     * Hides the dropdown and resets its state.
     */
    hide() {
        if (this.isVisible()) {
            this._dropdownContainer.style.opacity = '0';
            this._dropdownContainer.style.transform = 'translateY(-10px)';
            this._triggerElement.setAttribute('aria-expanded', 'false');

            // Make menu items non-focusable when dropdown is hidden
            const items = this._dropdownContainer.querySelectorAll(`.${this.dropdownClass}__item`);
            items.forEach(item => item.setAttribute('tabindex', '-1'));

            // Wait for the transition to complete before hiding completely
            setTimeout(() => {
                this._dropdownContainer.style.visibility = 'hidden';
            }, parseFloat(this.animationDuration) * 1000);
        }
    }

    /**
     * Toggles the visibility of the dropdown.
     */
    toggle() {
        if (this.isVisible()) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * Checks if the dropdown is currently visible.
     * @returns {boolean} True if visible, false otherwise.
     */
    isVisible() {
        return this._dropdownContainer.style.visibility === 'visible' && this._dropdownContainer.style.opacity === '1';
    }

    /**
     * Updates the dropdown options.
     * @param {Array<string|{text: string, href: string}>} newOptions - The new list of options.
     */
    updateOptions(newOptions) {
        if (!Array.isArray(newOptions)) {
            console.error("ExtremeDropdown: 'newOptions' must be an array.");
            return;
        }
        this._options = newOptions;
        // Clear existing items
        this._dropdownContainer.innerHTML = '';
        // Re-render items
        this._createDropdownStructure();
        // If currently visible, re-position and potentially re-focus
        if (this.isVisible()) {
            this._positionDropdown();
            const items = this._dropdownContainer.querySelectorAll(`.${this.dropdownClass}__item`);
            if (items.length > 0) {
                const firstFocusable = items[0].querySelector('a') || items[0];
                firstFocusable.focus();
            }
        }
    }

    /**
     * Removes the dropdown from the DOM and unbinds event listeners.
     */
    destroy() {
        // Remove dropdown container from DOM
        if (this._dropdownContainer && this._dropdownContainer.parentNode) {
            this._dropdownContainer.parentNode.removeChild(this._dropdownContainer);
        }

        // Remove event listeners from the trigger element
        // Note: This requires a more robust event listener management if you want to
        // precisely remove the *specific* listeners added by this instance.
        // For simplicity here, we'll just remove common ones.
        // A more robust approach would involve storing listener references and using removeEventListener with those references.
        this._triggerElement.removeEventListener('click', this.toggle); // Assuming toggle is bound directly, not a handler function reference
        this._triggerElement.removeEventListener('keydown', this._handleTriggerKeydown); // If _handleTriggerKeydown was bound as a method

        // Remove general document listeners if this instance was the only one
        // (This is tricky - often better to manage document listeners externally)
        // document.removeEventListener('click', this._handleDocumentClick); // If bound
        // document.removeEventListener('keydown', this._handleDropdownKeydown); // If bound

        // Clear references
        this._dropdownContainer = null;
        this._triggerElement = null;
        this._options = null;
        console.log("ExtremeDropdown: Destroyed.");
    }
}

export default ExtremeDropdown;