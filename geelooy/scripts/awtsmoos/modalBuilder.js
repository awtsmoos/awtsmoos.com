/**
 * B"H
 * @module ModalBuilder
 * @description Creates and manages a highly dynamic, visually stunning, and performant modal overlay.
 * @author Your Name/Company
 * @license MIT
 */

class ModalBuilder {
    /**
     * Creates a new modal instance.
     *
     * @param {object} options - Configuration options for the modal.
     * @param {string} options.id - A unique ID for the modal container. This is crucial for CSS scoping.
     * @param {string} options.title - The main title of the modal.
     * @param {Array<object>} options.fields - An array of field objects to populate the form.
     *   Each field object can have:
     *   - {string} type: 'text', 'textarea', 'checkbox', 'radio', 'select', 'label', 'password', 'email', 'number', 'tel'.
     *   - {string} name: The name attribute for input elements. Required for form submission data.
     *   - {string} label: The text for the label.
     *   - {string} id: The ID for the input/label, useful for associations. Should be unique within the modal.
     *   - {string} [value]: The initial or default value for input elements.
     *   - {boolean} [checked]: The initial checked state for checkboxes/radios.
     *   - {Array<object>} [options]: For 'select' type, an array of { value: string, text: string } objects.
     *   - {string} [placeholder]: Placeholder text for input fields.
     *   - {function} [validation]: A function that takes the field's value and returns true if valid, false otherwise. Can be async.
     *   - {string} [errorMessage]: A message to display if validation fails.
     * @param {string} [options.submitButtonText='Submit'] - The text for the submit button.
     * @param {function} [options.onSubmit] - A callback function to execute when the form is submitted.
     *   This function receives an object with the form's data.
     *   It should return an object containing:
     *   - {boolean} success: Whether the submission was successful.
     *   - {string} [message]: A message to display to the user.
     *   - {boolean} [closeModal=true]: Whether to close the modal after submission.
     * @param {string} [options.successMessage='Operation successful!'] - Default message for successful submission.
     * @param {string} [options.errorMessage='An error occurred. Please try again.'] - Default message for failed submission.
     * @param {boolean} [options.closeOnClickOutside=true] - Whether the modal should close when the background overlay is clicked.
     * @param {string} [options.closeButtonText='Close'] - Text for an optional explicit close button.
     * @param {boolean} [options.showCloseButton=false] - Whether to show an explicit close button.
     */
    constructor(options) {
        // --- Basic Validation ---
        if (!options || typeof options.id !== 'string' || !options.id || typeof options.title !== 'string' || !options.title || !Array.isArray(options.fields)) {
            console.error("ModalBuilder Error: 'id', 'title', and 'fields' (as an array) are required and must be valid strings/arrays.");
            return;
        }

        // --- Options Merging with Defaults ---
        this.options = {
            id: options.id,
            title: options.title,
            fields: options.fields,
            submitButtonText: options.submitButtonText || 'Submit',
            onSubmit: options.onSubmit || (() => ({ success: true })),
            successMessage: options.successMessage || 'Operation successful!',
            errorMessage: options.errorMessage || 'An error occurred. Please try again.',
            closeOnClickOutside: options.closeOnClickOutside !== undefined ? options.closeOnClickOutside : true,
            closeButtonText: options.closeButtonText || 'Close',
            showCloseButton: options.showCloseButton || false,
        };

        // --- DOM Element References ---
        this.modalElement = null;
        this.overlayElement = null;
        this.previouslyFocusedElement = null; // To restore focus on close
        this.focusTrapKeyDownHandler = null; // To manage focus trapping events
        this.currentFormData = null; // Stores validated form data
        this.isModalOpen = false; // State flag for modal visibility
        this.openingTimeout = null; // Timeout ID for preventing immediate closure on open

        this.insertCSS("/style/modalBuilder.css")
        // --- Initialization ---
        this.createModalStructure();
        this.attachEventListeners();
    }

    insertCSS(href) {
        var lk = document.createElement("link")
        lk.rel = "stylesheet"
        lk.type = "text/css";
        lk.href = href;
        document.head.appendChild(lk)
    }

    /**
     * Creates the core DOM structure for the modal and overlay.
     * @private
     */
    createModalStructure() {
        // --- Overlay Element ---
        this.overlayElement = document.createElement('div');
        this.overlayElement.id = `${this.options.id}-overlay`;
        this.overlayElement.classList.add('modal-overlay'); // Base class for overlay styling
        this.overlayElement.setAttribute('aria-hidden', 'true'); // Initially hidden for accessibility

        // --- Modal Container Element ---
        this.modalElement = document.createElement('div');
        this.modalElement.id = this.options.id;
        this.modalElement.classList.add('modal-container'); // Base class for modal styling
        this.modalElement.setAttribute('role', 'dialog'); // Accessibility: Identify as a dialog
        this.modalElement.setAttribute('aria-modal', 'true'); // Accessibility: Indicate it's a modal
        this.modalElement.setAttribute('aria-hidden', 'true'); // Initially hidden for accessibility
        this.modalElement.setAttribute('aria-labelledby', `${this.options.id}-title`); // Link to title for screen readers

        // --- Modal Content Wrapper ---
        const modalContentWrapper = document.createElement('div');
        modalContentWrapper.classList.add('modal-content-wrapper');

        // --- Modal Header ---
        const modalHeader = document.createElement('div');
        modalHeader.classList.add('modal-header');
        const modalTitle = document.createElement('h2');
        modalTitle.classList.add('modal-title');
        modalTitle.id = `${this.options.id}-title`;
        modalTitle.textContent = this.options.title;
        modalHeader.appendChild(modalTitle);

        // --- Modal Body (Form) ---
        const modalBody = document.createElement('div');
        modalBody.classList.add('modal-body');
        const formElement = document.createElement('form');
        formElement.id = `${this.options.id}-form`;
        formElement.noValidate = true; // Disable native validation for custom handling
        this.populateForm(formElement); // Populate form fields
        modalBody.appendChild(formElement);

        // --- Modal Footer ---
        const modalFooter = document.createElement('div');
        modalFooter.classList.add('modal-footer');
        // Submit Button
        const submitButton = document.createElement('button');
        submitButton.classList.add('modal-submit-button');
        submitButton.textContent = this.options.submitButtonText;
        submitButton.addEventListener("click", async () => {
            var sub = new Event("submit", {cancelable: true});
            var fe = this.formElement;
            if(!fe) return console.log("NO")
            fe.dispatchEvent(sub)
        })
        modalFooter.appendChild(submitButton);
        // Optional Close Button
        if (this.options.showCloseButton) {
            const closeButton = document.createElement('button');
            closeButton.classList.add('modal-close-button');
            closeButton.textContent = this.options.closeButtonText;
            closeButton.addEventListener('click', this.close.bind(this));
            modalFooter.appendChild(closeButton);
        }

        // --- Assemble Modal Structure ---
        modalContentWrapper.appendChild(modalHeader);
        modalContentWrapper.appendChild(modalBody);
        modalContentWrapper.appendChild(modalFooter);
        this.modalElement.appendChild(modalContentWrapper);

        // --- Append to Body ---
        document.body.appendChild(this.overlayElement);
        document.body.appendChild(this.modalElement);
    }

    /**
     * Populates the form with dynamically generated fields based on options.
     * @param {HTMLFormElement} formElement - The target form element.
     * @private
     */
    populateForm(formElement) {
        var fieldsDone = [];
        this.fieldsDone = fieldsDone;
        this.options.fields.forEach(field => {
            const fieldWrapper = document.createElement('div');
            fieldWrapper.classList.add('modal-field-wrapper');

            // Handle standalone labels (e.g., for section titles)
            if (field.type === 'label') {
                const label = document.createElement('label');
                label.textContent = field.label;
                label.classList.add('modal-standalone-label');
                if (field.id) label.setAttribute('for', field.id);
                formElement.appendChild(label);
                return;
            }

            // Basic validation for field properties
            if (!field.name && !field.id && field.type !== 'label') {
                console.warn(`ModalBuilder Warning: Field "${field.label || 'Unnamed'}" is missing a 'name' or 'id' and is not a label. It might not be functional.`);
            }

            // Create label for most input types
            const label = document.createElement('label');
            label.textContent = field.label;
            label.classList.add('modal-label');
            if (field.id) label.setAttribute('for', field.id);

            let inputElement;

            // Create appropriate input element based on field type
            switch (field.type) {
                case 'text':
                case 'password':
                case 'email':
                case 'number':
                case 'tel':
                    inputElement = document.createElement('input');
                    inputElement.type = field.type;
                    inputElement.classList.add("modal-input")
                    if (field.id) inputElement.id = field.id;
                    if (field.name) inputElement.name = field.name; // Crucial for data submission
                    if (field.value !== undefined) inputElement.value = field.value;
                    if (field.placeholder) inputElement.placeholder = field.placeholder;
                    break;
                case 'textarea':
                    inputElement = document.createElement('textarea');
                    inputElement.classList.add("modal-input")
                    if (field.id) inputElement.id = field.id;
                    if (field.name) inputElement.name = field.name;
                    if (field.placeholder) inputElement.placeholder = field.placeholder;
                    inputElement.textContent = field.value || '';
                    break;
                case 'checkbox':
                case 'radio':
                    inputElement = document.createElement('input');
                    inputElement.type = field.type;
                    if (field.id) inputElement.id = field.id;
                    if (field.name) inputElement.name = field.name;
                    if (field.value !== undefined) inputElement.value = field.value; // Important for radio values
                    if (field.checked !== undefined) inputElement.checked = field.checked;

                    // Special handling for checkbox/radio layout (input then label)
                    fieldWrapper.classList.add(`modal-${field.type}-wrapper`);
                    fieldWrapper.appendChild(inputElement);
                    label.classList.add(`modal-${field.type}-label`);
                    if (field.id) label.setAttribute('for', field.id);
                    fieldWrapper.appendChild(label);
                    formElement.appendChild(fieldWrapper);
                    return; // Skip default append logic for these
                case 'select':
                    inputElement = document.createElement('select');
                    if (field.id) inputElement.id = field.id;
                    if (field.name) inputElement.name = field.name;
                    if (field.options && Array.isArray(field.options)) {
                        // Add a default empty option if no value is provided or if it's a required field
                        if (field.value === undefined || field.value === '' || field.fields === undefined ) {
                             const defaultOption = document.createElement('option');
                             defaultOption.value = '';
                             defaultOption.textContent = `Select ${field.label}...`;
                             defaultOption.disabled = true;
                             defaultOption.selected = true;
                             inputElement.appendChild(defaultOption);
                        }
                        field.options.forEach(option => {
                            const optionElement = document.createElement('option');
                            optionElement.value = option.value;
                            optionElement.textContent = option.text;
                            if (option.value === field.value) {
                                optionElement.selected = true;
                            }
                            inputElement.appendChild(optionElement);
                        });
                    }
                    break;
                default:
                    console.warn(`ModalBuilder Warning: Unsupported field type "${field.type}" for field "${field.name || field.id}". Skipping.`);
                    return; // Skip if type is not recognized
            }

            // Default append logic for most field types
            if (inputElement) {
                if(field.oninput) {
                    inputElement.addEventListener("input", e => {
                        field.oninput?.(e, fieldsDone)
                    })
                }
                fieldsDone[field.id] = inputElement;
                fieldWrapper.appendChild(label);
                fieldWrapper.appendChild(inputElement);
                formElement.appendChild(fieldWrapper);
            }
        });
    }

    /**
     * Attaches necessary event listeners to the modal and overlay.
     * @private
     */
    attachEventListeners() {
        // Overlay click listener
        if (this.options.closeOnClickOutside) {
            this.overlayElement.addEventListener('click', this.handleOverlayClick.bind(this));
        }

        // Form submission listener
        const formElement = this.modalElement.querySelector(`#${this.options.id}-form`);
        if (formElement) {
            console.log("GOT",formElement)
            this.formElement  = formElement;
            formElement.addEventListener('submit', async (event) => {
                event.preventDefault(); // Prevent default form submission
              
                
                if (await this.validateAndSubmitForm(formElement)) {
                    // Submission handled within validateAndSubmitForm
                }
            });
        }
    }

    /**
     * Handles the overlay click event, preventing immediate closure on open.
     * @param {Event} event - The click event object.
     * @private
     */
    handleOverlayClick(event) {
        if (event.target === this.overlayElement) {
            // Only close if the opening timeout has elapsed (meaning opening is complete)
            if (this.openingTimeout === null) {
                this.close();
            }
        }
    }

    /**
     * Validates all form fields and then handles submission.
     * @param {HTMLFormElement} formElement - The form element to validate and submit.
     * @returns {Promise<boolean>} - True if form is valid and submission was initiated, false otherwise.
     * @private
     */
    async validateAndSubmitForm(formElement) {
        console.log("Trying")
        let isFormValid = true;
        const formData = {};

        // Clear previous validation errors
        formElement.querySelectorAll('.modal-field-error').forEach(el => el.remove());
        formElement.querySelectorAll('.modal-input-error').forEach(input => input.classList.remove('modal-input-error'));
        formElement.querySelectorAll('.modal-message').forEach(el => el.remove()); // Clear previous messages

        // Iterate through each field defined in options for validation and data collection
        for (const field of this.options.fields) {
            // Skip label types as they don't have input elements to validate
            if (field.type === 'label') continue;

            // Find the corresponding input element. Prioritize by name, then ID.
            const inputElement = formElement.querySelector(`[name="${field.name}"]`) ||
                                 formElement.querySelector(`[id="${field.id}"]`);

            if (!inputElement) {
                console.warn(`ModalBuilder Warning: Input element not found for field "${field.name || field.id}". Skipping validation for this field.`);
                continue;
            }

            let value;
            // Get the value based on input type
            if (field.type === 'checkbox') {
                value = inputElement.checked;
            } else if (field.type === 'radio') {
                // Find the currently checked radio button within the same group
                const checkedRadio = formElement.querySelector(`input[name="${field.name}"]:checked`);
                value = checkedRadio ? checkedRadio.value : null;
            } else {
                value = inputElement.value.trim();
            }

            // Store data using name if available, otherwise ID. Fallback if neither exists.
            const dataKey = field.name || field.id;
            if (dataKey) {
                formData[dataKey] = value;
            } else {
                console.warn(`ModalBuilder Warning: Field "${field.label || 'Unnamed'}" has no name or ID, cannot add to form data.`);
            }

            // Perform validation if a validation function is provided
            if (field.validation && typeof field.validation === 'function') {
                try {
                    const isValid = await field.validation(value);
                    if (!isValid) {
                        isFormValid = false;
                        inputElement.classList.add('modal-input-error');
                        const errorDiv = document.createElement('div');
                        errorDiv.classList.add('modal-field-error');
                        errorDiv.textContent = field.errorMessage || `Validation failed for ${field.label || field.name}`;
                        // Append error message after the input or its wrapper for better structure
                        const parentWrapper = inputElement.closest('.modal-field-wrapper') || inputElement.parentElement;
                        if (parentWrapper) {
                            parentWrapper.appendChild(errorDiv);
                        } else {
                            inputElement.after(errorDiv); // Fallback append
                        }
                    }
                } catch (validationError) {
                    console.error(`Validation error for field ${field.name || field.id}:`, validationError);
                    isFormValid = false;
                    inputElement.classList.add('modal-input-error');
                    const errorDiv = document.createElement('div');
                    errorDiv.classList.add('modal-field-error');
                    errorDiv.textContent = `An error occurred during validation.`;
                    const parentWrapper = inputElement.closest('.modal-field-wrapper') || inputElement.parentElement;
                    if (parentWrapper) {
                        parentWrapper.appendChild(errorDiv);
                    } else {
                        inputElement.after(errorDiv);
                    }
                }
            }
        }

        this.currentFormData = formData; // Store the collected data

        if (
            
            
            isFormValid
        ) {
            this.showLoadingState(); // Show loading indicators
            try {
                const result = await this.options.onSubmit(this.currentFormData);
                this.displayMessage(result.message || (result.success ? this.options.successMessage : this.options.errorMessage), result.success);

                if (result.closeModal !== false) {
                    // Use a slight delay to allow the message to be seen before closing
                    setTimeout(() => this.close(), 2000); // Delay closing for 2 seconds
                }
            } catch (error) {
                console.error("Modal submission error:", error);
                this.displayMessage(this.options.errorMessage, false);
                setTimeout(() => this.close(), 2000); // Close after error message
            } finally {
                this.hideLoadingState();
            }
        }

        return isFormValid;
    }

    /**
     * Displays a temporary message (success or error) within the modal body.
     * @param {string} message - The message content.
     * @param {boolean} isSuccess - True for success message, false for error.
     * @private
     */
    displayMessage(message, isSuccess) {
        const modalBody = this.modalElement.querySelector('.modal-body');
        if (!modalBody) return;

        // Remove any previously displayed messages or errors
        modalBody.querySelectorAll('.modal-message, .modal-field-error').forEach(el => el.remove());

        const messageDiv = document.createElement('div');
        messageDiv.classList.add('modal-message');
        messageDiv.classList.add(isSuccess ? 'modal-message-success' : 'modal-message-error');
        messageDiv.textContent = message;
        modalBody.prepend(messageDiv); // Prepend to show at the top
    }

    /**
     * Shows loading state on the submit button and disables form elements.
     * @private
     */
    showLoadingState() {
        const submitButton = this.modalElement.querySelector('.modal-submit-button');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.classList.add('modal-loading');
            submitButton.textContent = 'Processing...';
        }
        // Disable all interactive form elements to prevent user input during submission
        const formElement = this.modalElement.querySelector(`#${this.options.id}-form`);
        if (formElement) {
            formElement.querySelectorAll('input, textarea, select, button:not(.modal-close-button)').forEach(el => {
                el.disabled = true;
                // Add a visual cue for disabled elements if desired
                el.classList.add('modal-disabled');
            });
        }
    }

    /**
     * Hides loading state and re-enables form elements.
     * @private
     */
    hideLoadingState() {
        const submitButton = this.modalElement.querySelector('.modal-submit-button');
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.classList.remove('modal-loading');
            submitButton.textContent = this.options.submitButtonText;
        }
        // Re-enable form elements
        const formElement = this.modalElement.querySelector(`#${this.options.id}-form`);
        if (formElement) {
            formElement.querySelectorAll('input, textarea, select, button').forEach(el => {
                el.disabled = false;
                el.classList.remove('modal-disabled');
            });
        }
    }

    /**
     * Opens the modal, making it visible and managing focus.
     */
    open() {
        if (this.isModalOpen) return; // Prevent opening if already open

        // --- Cleanup previous state if any ---
        if (this.openingTimeout) {
            clearTimeout(this.openingTimeout);
            this.openingTimeout = null;
        }
        // Ensure any messages/errors from previous opens are cleared
        const formElement = this.modalElement.querySelector(`#${this.options.id}-form`);
        if (formElement) {
            formElement.querySelectorAll('.modal-message, .modal-field-error').forEach(el => el.remove());
            formElement.querySelectorAll('.modal-input-error').forEach(input => input.classList.remove('modal-input-error'));
        }


        // --- Set Modal to Visible State ---
        this.isModalOpen = true;
        this.overlayElement.style.display = 'block';
        this.modalElement.style.display = 'flex';
        this.overlayElement.setAttribute('aria-hidden', 'false');
        this.modalElement.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open-body'); // Add class to body for global styles

        // --- Accessibility: Manage Focus ---
        const focusableElements = this.modalElement.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length > 0) {
            this.previouslyFocusedElement = document.activeElement; // Store the element that had focus before opening
            // Use requestAnimationFrame to ensure focus is applied after the DOM is fully rendered/updated
            requestAnimationFrame(() => {
                 // Try to focus the first focusable element
                 if (focusableElements[0].focus) {
                    focusableElements[0].focus();
                 } else {
                    // Fallback if the first element doesn't have focus capability directly
                    // (e.g., if it's a link without an href, though the selector should avoid that)
                    this.modalElement.querySelector('button, input, select, textarea').focus();
                 }
            });
        }
        this.trapFocus(); // Enable focus trapping

        // --- Overlay Click Safety Timeout ---
        // This timeout prevents the overlay click from immediately closing the modal upon opening.
        // We set it to null after a short duration to allow normal overlay click behavior.
        this.openingTimeout = setTimeout(() => {
            this.openingTimeout = null; // Clear the flag after a buffer period
        }, 300); // Increased buffer to 300ms for smoother transitions
    }

    /**
     * Closes the modal, hiding it and restoring focus.
     */
    close() {
        if (!this.isModalOpen) return; // Do nothing if modal is already closed

        // --- Clear Opening Timeout ---
        // If closing manually or via another mechanism, clear the opening safety timeout.
        if (this.openingTimeout) {
            clearTimeout(this.openingTimeout);
            this.openingTimeout = null;
        }

        // --- Set Modal to Hidden State ---
        this.isModalOpen = false;
        this.overlayElement.style.display = 'none';
        this.modalElement.style.display = 'none';
        this.overlayElement.setAttribute('aria-hidden', 'true');
        this.modalElement.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open-body'); // Remove class from body

        // --- Accessibility: Restore Focus ---
        // Ensure previouslyFocusedElement is valid and has a focus method before attempting to focus.
        if (this.previouslyFocusedElement && typeof this.previouslyFocusedElement.focus === 'function') {
            // Use requestAnimationFrame for smoother focus restoration
            requestAnimationFrame(() => {
                this.previouslyFocusedElement.focus();
            });
        }
        this.releaseFocus(); // Disable focus trapping

        // --- Cleanup ---
        // No DOM removal here; that's for the `destroy` method.
    }

    /**
     * Enables focus trapping within the modal for keyboard navigation.
     * @private
     */
    trapFocus() {
        this.focusTrapKeyDownHandler = (e) => {
            // Only act if the modal is actually open and the event listener is active
            if (!this.isModalOpen || !this.focusTrapKeyDownHandler) return;

            const focusableElements = this.modalElement.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );

            if (focusableElements.length === 0) return; // No focusable elements

            const firstFocusable = focusableElements[0];
            const lastFocusable = focusableElements[focusableElements.length - 1];

            // Handle Tab key for cycling focus
            if (e.key === 'Tab') {
                if (e.shiftKey) { // Shift + Tab: Move focus backward
                    if (document.activeElement === firstFocusable) {
                        e.preventDefault();
                        lastFocusable.focus();
                    }
                } else { // Tab: Move focus forward
                    if (document.activeElement === lastFocusable) {
                        e.preventDefault();
                        firstFocusable.focus();
                    }
                }
            } else if (e.key === 'Escape') { // Handle Escape key for closing
                this.close();
            }
        };
        document.addEventListener('keydown', this.focusTrapKeyDownHandler);
    }

    /**
     * Removes the focus trapping event listener.
     * @private
     */
    releaseFocus() {
        if (this.focusTrapKeyDownHandler) {
            document.removeEventListener('keydown', this.focusTrapKeyDownHandler);
            this.focusTrapKeyDownHandler = null;
        }
    }

    /**
     * Removes the modal and overlay elements from the DOM and cleans up.
     */
    destroy() {
        // Remove event listeners if they exist
        this.releaseFocus();
        if (this.overlayElement && this.options.closeOnClickOutside) {
            this.overlayElement.removeEventListener('click', this.handleOverlayClick.bind(this));
        }
        // Remove DOM elements if they exist
        if (this.modalElement && this.modalElement.parentNode) {
            this.modalElement.parentNode.removeChild(this.modalElement);
        }
        if (this.overlayElement && this.overlayElement.parentNode) {
            this.overlayElement.parentNode.removeChild(this.overlayElement);
        }

        // Nullify references to prevent memory leaks
        this.modalElement = null;
        this.overlayElement = null;
        this.previouslyFocusedElement = null;
        this.focusTrapKeyDownHandler = null;
        this.currentFormData = null;
        this.isModalOpen = false;
        this.openingTimeout = null;
        // Ensure body class is removed if modal is destroyed while open
        if (document.body.classList.contains('modal-open-body')) {
            document.body.classList.remove('modal-open-body');
        }
    }
}

// Export the class for use in other modules
export default ModalBuilder;