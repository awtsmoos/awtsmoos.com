/**
 * @module modalBuilder
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
     *   - {string} type: 'text', 'textarea', 'checkbox', 'radio', 'select', 'label'.
     *   - {string} name: The name attribute for input elements.
     *   - {string} label: The text for the label.
     *   - {string} id: The ID for the input/label, useful for associations.
     *   - {string} [value]: The initial or default value for input elements.
     *   - {boolean} [checked]: The initial checked state for checkboxes/radios.
     *   - {Array<object>} [options]: For 'select' type, an array of { value: string, text: string } objects.
     *   - {string} [placeholder]: Placeholder text for input fields.
     *   - {function} [validation]: A function that takes the field's value and returns true if valid, false otherwise.
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
        // Basic validation for essential options
        if (!options || !options.id || !options.title || !Array.isArray(options.fields)) {
            console.error("ModalBuilder Error: 'id', 'title', and 'fields' (as an array) are required options.");
            return;
        }

        // Merge user options with defaults
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

        // Ensure the CSS is loaded only once
        if (!document.querySelector(`link[href*="modalBuilder.css"]`)) {
            const linkElement = document.createElement('link');
            linkElement.rel = 'stylesheet';
            linkElement.type = 'text/css';
            // IMPORTANT: Adjust this path if your CSS file is in a different location
            linkElement.href = '/style/modalBuilder.css'; // Assuming CSS is in /style/
            document.head.appendChild(linkElement);
        }

        this.modalElement = null;
        this.overlayElement = null;
        this.isModalOpen = false;
        
        this.justOpened = false; // Add this line
        this.init();
    }

    /**
     * Initializes the modal by creating DOM elements and attaching event listeners.
     * @private
     */
    init() {
        this.createModalStructure();
        this.attachEventListeners();
    }

    /**
     * Creates the core DOM structure for the modal and overlay.
     * @private
     */
    createModalStructure() {
        // Create overlay element
        this.overlayElement = document.createElement('div');
        // Crucially, use the provided ID to ensure CSS scoping!
        this.overlayElement.id = `${this.options.id}-overlay`;
        this.overlayElement.classList.add('modal-overlay-base'); // Use a base class for the overlay

        // Create modal container element
        this.modalElement = document.createElement('div');
        // Crucially, use the provided ID to ensure CSS scoping!
        this.modalElement.id = this.options.id;
        this.modalElement.classList.add('modal-container-base'); // Use a base class for the modal
        this.modalElement.setAttribute('aria-hidden', 'true'); // Accessibility

        // Create modal content wrapper for internal padding and layout
        const modalContentWrapper = document.createElement('div');
        modalContentWrapper.classList.add('modal-content-wrapper');

        // Create modal header
        const modalHeader = document.createElement('div');
        modalHeader.classList.add('modal-header');

        const modalTitle = document.createElement('h2');
        modalTitle.classList.add('modal-title');
        modalTitle.textContent = this.options.title;
        modalHeader.appendChild(modalTitle);

        // Create modal body (holds the form)
        const modalBody = document.createElement('div');
        modalBody.classList.add('modal-body');
        const formElement = document.createElement('form');
        formElement.id = `${this.options.id}-form`; // Specific ID for the form itself
        formElement.noValidate = true; // Disable native validation for custom handling
        modalBody.appendChild(formElement);

        // Dynamically populate the form with fields
        this.populateForm(formElement);

        // Create modal footer
        const modalFooter = document.createElement('div');
        modalFooter.classList.add('modal-footer');

        // Submit button
        const submitButton = document.createElement('button');
        submitButton.classList.add('modal-submit-button');
        submitButton.textContent = this.options.submitButtonText;
        modalFooter.appendChild(submitButton);

        // Optional explicit close button
        if (this.options.showCloseButton) {
            const closeButton = document.createElement('button');
            closeButton.classList.add('modal-close-button');
            closeButton.textContent = this.options.closeButtonText;
            modalFooter.appendChild(closeButton);
        }

        // Assemble the modal structure
        modalContentWrapper.appendChild(modalHeader);
        modalContentWrapper.appendChild(modalBody);
        modalContentWrapper.appendChild(modalFooter);
        this.modalElement.appendChild(modalContentWrapper);

        // Append the overlay and modal to the document body
        document.body.appendChild(this.overlayElement);
        document.body.appendChild(this.modalElement);
    }

    /**
     * Populates the form with dynamically generated fields based on options.
     * @param {HTMLFormElement} formElement - The target form element.
     * @private
     */
    populateForm(formElement) {
        this.options.fields.forEach(field => {
            const fieldWrapper = document.createElement('div');
            fieldWrapper.classList.add('modal-field-wrapper');

            // Handle standalone labels separately
            if (field.type === 'label') {
                const label = document.createElement('label');
                label.textContent = field.label;
                label.classList.add('modal-standalone-label');
                if (field.id) label.setAttribute('for', field.id); // Associate if ID is provided
                formElement.appendChild(label);
                return; // Move to the next field
            }

            // Create a label for most input types
            const label = document.createElement('label');
            label.textContent = field.label;
            label.classList.add('modal-label');
            // Associate label with input using ID
            if (field.id) label.setAttribute('for', field.id);

            let inputElement; // Variable to hold the input element

            // Create the appropriate input element based on field type
            switch (field.type) {
                case 'text':
                case 'password':
                case 'email':
                case 'number':
                case 'tel':
                    inputElement = document.createElement('input');
                    inputElement.type = field.type;
                    if (field.id) inputElement.id = field.id;
                    if (field.name) inputElement.name = field.name;
                    if (field.value) inputElement.value = field.value;
                    if (field.placeholder) inputElement.placeholder = field.placeholder;
                    break;
                case 'textarea':
                    inputElement = document.createElement('textarea');
                    if (field.id) inputElement.id = field.id;
                    if (field.name) inputElement.name = field.name;
                    if (field.placeholder) inputElement.placeholder = field.placeholder;
                    inputElement.textContent = field.value || ''; // Set content for textarea
                    break;
                case 'checkbox':
                    inputElement = document.createElement('input');
                    inputElement.type = 'checkbox';
                    if (field.id) inputElement.id = field.id;
                    if (field.name) inputElement.name = field.name;
                    if (field.checked) inputElement.checked = field.checked;

                    // Checkboxes have a specific layout: input then label
                    fieldWrapper.appendChild(inputElement);
                    label.classList.add('modal-checkbox-label'); // Style for checkbox label
                    if (field.id) label.setAttribute('for', field.id);
                    fieldWrapper.appendChild(label);
                    formElement.appendChild(fieldWrapper); // Append the wrapper
                    return; // Skip the default appending logic
                case 'radio':
                    inputElement = document.createElement('input');
                    inputElement.type = 'radio';
                    if (field.id) inputElement.id = field.id;
                    if (field.name) inputElement.name = field.name;
                    if (field.value) inputElement.value = field.value;
                    if (field.checked) inputElement.checked = field.checked;

                    // Radios also have a specific layout: input then label
                    fieldWrapper.appendChild(inputElement);
                    label.classList.add('modal-radio-label'); // Style for radio label
                    if (field.id) label.setAttribute('for', field.id);
                    fieldWrapper.appendChild(label);
                    formElement.appendChild(fieldWrapper); // Append the wrapper
                    return; // Skip the default appending logic
                case 'select':
                    inputElement = document.createElement('select');
                    if (field.id) inputElement.id = field.id;
                    if (field.name) inputElement.name = field.name;
                    // Populate options for the select element
                    if (field.options && Array.isArray(field.options)) {
                        field.options.forEach(option => {
                            const optionElement = document.createElement('option');
                            optionElement.value = option.value;
                            optionElement.textContent = option.text;
                            if (option.value === field.value) { // Set default selected option
                                optionElement.selected = true;
                            }
                            inputElement.appendChild(optionElement);
                        });
                    }
                    break;
                default:
                    console.warn(`ModalBuilder Warning: Unsupported field type "${field.type}". Skipping.`);
                    return; // Skip if the type is not recognized
            }

            // Append label and input to the wrapper for most field types
            if (inputElement) {
                fieldWrapper.appendChild(label);
                fieldWrapper.appendChild(inputElement);
                formElement.appendChild(fieldWrapper); // Append the wrapper to the form
            }
        });
    }

    /**
     * Attaches necessary event listeners to the modal and overlay.
     * @private
     */
    attachEventListeners() {
        // Close modal when clicking the overlay background (if enabled)
        if (this.options.closeOnClickOutside) {
            // Add the listener, but we'll manage its immediate firing
            this.overlayElement.addEventListener('click', this.handleOverlayClick.bind(this));
        }

        // Handle form submission
        const formElement = this.modalElement.querySelector(`#${this.options.id}-form`);
        formElement.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission
            if (await this.validateForm(formElement)) { // Validate before submitting
                this.handleSubmission(formElement);
            }
        });

        // Attach listener for the explicit close button if it exists
        const closeButton = this.modalElement.querySelector('.modal-close-button');
        if (closeButton) {
            closeButton.addEventListener('click', () => this.close());
        }
    }

    /**
     * Handles the overlay click event, with safety to prevent immediate closure on open.
     * @param {Event} event - The click event object.
     * @private
     */
    handleOverlayClick(event) {
        // IMPORTANT: Ensure the click is directly on the overlay itself, not its children.
        // This prevents clicks on elements *within* the modal from closing it.
        if (event.target === this.overlayElement) {
            // Use the openingTimeout to ensure we don't close immediately after opening.
            // If the modal was just opened, the timeout will clear this click.
            if (!this.openingTimeout) {
                this.close();
            }
        }
    }

    /**
     * Validates all form fields based on their `validation` functions.
     * @param {HTMLFormElement} formElement - The form element to validate.
     * @returns {Promise<boolean>} - True if the form is valid, false otherwise.
     * @private
     */
    async validateForm(formElement) {
        let isFormValid = true;
        const formData = {}; // Object to store the collected data

        // Clear previous error messages and styles
        formElement.querySelectorAll('.modal-field-error').forEach(errorEl => errorEl.remove());
        formElement.querySelectorAll('.modal-input-error').forEach(input => input.classList.remove('modal-input-error'));

        // Iterate through each field defined in the options
        for (const field of this.options.fields) {
            // Find the corresponding input element
            const inputElement = formElement.querySelector(`[name="${field.name}"]`) || formElement.querySelector(`[id="${field.id}"]`);
            if (!inputElement) continue; // Skip if element not found for some reason

            let value = ''; // Variable to hold the current field's value
            // Get the value based on input type
            if (field.type === 'checkbox') {
                value = inputElement.checked; // Boolean for checkbox
            } else if (field.type === 'radio') {
                // Find the currently checked radio button within the same group
                const checkedRadio = formElement.querySelector(`input[name="${field.name}"]:checked`);
                value = checkedRadio ? checkedRadio.value : null; // Store value of checked radio or null
            } else {
                value = inputElement.value.trim(); // Trim whitespace for text-based inputs
            }

            formData[field.name || field.id] = value; // Store the collected data

            // If a validation function is provided for this field
            if (field.validation && typeof field.validation === 'function') {
                const isValid = await field.validation(value); // Execute the validation
                if (!isValid) {
                    isFormValid = false; // Mark the entire form as invalid
                    inputElement.classList.add('modal-input-error'); // Add error class for styling
                    // Create and append an error message element
                    const errorDiv = document.createElement('div');
                    errorDiv.classList.add('modal-field-error');
                    errorDiv.textContent = field.errorMessage || 'Invalid input'; // Use provided or default message
                    // Append error message after the input or its wrapper for better structure
                    const parentWrapper = inputElement.closest('.modal-field-wrapper') || inputElement.parentElement;
                    if (parentWrapper) {
                        parentWrapper.appendChild(errorDiv);
                    } else {
                        inputElement.after(errorDiv); // Fallback appending
                    }
                }
            }
        }
        // Store the validated form data to be passed to the onSubmit handler
        this.currentFormData = formData;
        return isFormValid; // Return the overall form validity
    }

    /**
     * Handles the submission process, calling the onSubmit callback.
     * @param {HTMLFormElement} formElement - The form element.
     * @private
     */
    async handleSubmission(formElement) {
        this.showLoadingState(); // Show loading indicators
        try {
            // Execute the custom onSubmit function with the collected data
            const result = await this.options.onSubmit(this.currentFormData);
            // Display the message returned by onSubmit, or default messages
            this.displayMessage(result.message || (result.success ? this.options.successMessage : this.options.errorMessage), result.success);
            // Close the modal if the result indicates so (or if no specific instruction)
            if (result.closeModal !== false) {
                this.close();
            }
        } catch (error) {
            console.error("Modal submission error:", error);
            // Display generic error message on exception
            this.displayMessage(this.options.errorMessage, false);
            // Optionally close modal on error, or keep it open to show the error message
            if (this.options.closeModal !== false) {
                 this.close();
            }
        } finally {
            this.hideLoadingState(); // Hide loading indicators
        }
    }

    /**
     * Displays a temporary message (success or error) within the modal body.
     * @param {string} message - The message content.
     * @param {boolean} isSuccess - True for success message, false for error.
     * @private
     */
    displayMessage(message, isSuccess) {
        const modalBody = this.modalElement.querySelector('.modal-body');
        if (!modalBody) return; // Exit if modal body is not found

        // Remove any previously displayed messages
        modalBody.querySelectorAll('.modal-message').forEach(el => el.remove());

        // Create a new message element
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('modal-message');
        // Add specific class for styling based on success/error
        messageDiv.classList.add(isSuccess ? 'modal-message-success' : 'modal-message-error');
        messageDiv.textContent = message;

        // Prepend the message to the modal body so it appears at the top
        modalBody.prepend(messageDiv);
    }

    /**
     * Shows loading state on the submit button and disables inputs.
     * @private
     */
    showLoadingState() {
        const formElement = this.modalElement.querySelector(`#${this.options.id}-form`);
        // Find the submit button within the current modal's scope
        const submitButton = this.modalElement.querySelector('.modal-submit-button');
        if (submitButton) {
            submitButton.disabled = true; // Disable button
            submitButton.classList.add('modal-loading'); // Add class for styling
            submitButton.textContent = 'Processing...'; // Change text
        }
        // Disable all interactive form elements
        formElement.querySelectorAll('input, textarea, select').forEach(el => el.disabled = true);
    }

    /**
     * Hides loading state and re-enables form elements.
     * @private
     */
    hideLoadingState() {
        const formElement = this.modalElement.querySelector(`#${this.options.id}-form`);
        const submitButton = this.modalElement.querySelector('.modal-submit-button');
        if (submitButton) {
            submitButton.disabled = false; // Re-enable button
            submitButton.classList.remove('modal-loading'); // Remove loading class
            submitButton.textContent = this.options.submitButtonText; // Restore original text
        }
        // Re-enable all interactive form elements
        formElement.querySelectorAll('input, textarea, select').forEach(el => el.disabled = false);
    }

    /**
     * Opens the modal, making it visible and managing focus.
     */
    open() {
        if (this.isModalOpen) return; // Prevent opening if already open

        // Clear any pending timeouts from previous close/open cycles
        if (this.openingTimeout) {
            clearTimeout(this.openingTimeout);
            this.openingTimeout = null;
        }

        this.isModalOpen = true;
        this.modalElement.style.display = 'flex';
        this.overlayElement.style.display = 'block';
        this.modalElement.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open-body');

        // Accessibility: Manage focus
        const focusableElements = this.modalElement.querySelectorAll(
            'input, select, textarea, button, a[href], [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
            this.previouslyFocusedElement = document.activeElement; // Store the element that had focus before opening
            // Small delay before focusing to ensure DOM is ready and avoid immediate blur
            requestAnimationFrame(() => {
                 focusableElements[0].focus();
            });
        }
        this.trapFocus(); // Enable focus trapping

        // Set a short timeout for the overlay click handler safety.
        // This ensures that if the modal was just opened, the immediate click
        // on the overlay doesn't trigger the close.
        this.openingTimeout = setTimeout(() => {
            this.openingTimeout = null; // Clear the flag after the timeout
        }, 100); // A small delay, adjust if needed
    }

    /**
     * Closes the modal, hiding it and restoring focus.
     */
    close() {
        // Add a check to ensure we are actually closing an open modal
        if (!this.isModalOpen) return;

        // Clear the opening timeout immediately if closing manually or via other means
        if (this.openingTimeout) {
            clearTimeout(this.openingTimeout);
            this.openingTimeout = null;
        }

        this.isModalOpen = false;
        this.modalElement.style.display = 'none';
        this.overlayElement.style.display = 'none';
        this.modalElement.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open-body');

        // Accessibility: Restore focus
        // Ensure previouslyFocusedElement is valid before attempting to focus
        if (this.previouslyFocusedElement && typeof this.previouslyFocusedElement.focus === 'function') {
            // Use requestAnimationFrame for smoother focus restoration
            requestAnimationFrame(() => {
                this.previouslyFocusedElement.focus();
            });
        }
        this.releaseFocus(); // Disable focus trapping

        // Clean up the DOM elements if the modal is being destroyed permanently
        // (This method is for closing, not necessarily destroying, so we don't remove elements here)
    }

    /**
     * Enables focus trapping within the modal for keyboard navigation.
     * @private
     */
    trapFocus() {
        // Handler for keydown events
        this.focusTrapKeyDownHandler = (e) => {
            if (!this.isModalOpen) return; // Only act if modal is open

            // Get all focusable elements within the modal
            const focusableElements = this.modalElement.querySelectorAll(
                'input, select, textarea, button, a[href], [tabindex]:not([tabindex="-1"])'
            );
            const firstFocusable = focusableElements[0]; // First focusable element
            const lastFocusable = focusableElements[focusableElements.length - 1]; // Last focusable element

            // Handle Tab key press
            if (e.key === 'Tab') {
                if (e.shiftKey) { // Shift + Tab (moving backwards)
                    if (document.activeElement === firstFocusable) {
                        e.preventDefault(); // Prevent default backward tab
                        lastFocusable.focus(); // Move focus to the last element
                    }
                } else { // Tab (moving forwards)
                    if (document.activeElement === lastFocusable) {
                        e.preventDefault(); // Prevent default forward tab
                        firstFocusable.focus(); // Move focus to the first element
                    }
                }
            } else if (e.key === 'Escape') { // Handle Escape key press
                this.close(); // Close the modal
            }
        };
        // Add the keydown event listener to the document
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
     * Removes the modal and overlay elements from the DOM.
     */
    destroy() {
        // Remove the modal element if it exists
        if (this.modalElement && this.modalElement.parentNode) {
            this.modalElement.parentNode.removeChild(this.modalElement);
        }
        // Remove the overlay element if it exists
        if (this.overlayElement && this.overlayElement.parentNode) {
            this.overlayElement.parentNode.removeChild(this.overlayElement);
        }
        this.releaseFocus(); // Ensure focus listeners are cleaned up
        // Nullify references
        this.modalElement = null;
        this.overlayElement = null;
        this.isModalOpen = false;
    }
}

// Export the class for use in other modules
export default ModalBuilder;