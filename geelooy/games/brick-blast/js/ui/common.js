// B"H

/**
 * Shows or hides a modal by its ID.
 * @param {boolean} show Whether to show the modal.
 * @param {string} modalId The ID of the modal element.
 */
export function toggleModal(show, modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = show ? 'flex' : 'none';
    }
}

/**
 * Displays the sacred "Altar of Truth" to reveal the nature of a communication error.
 * @param {string} title The heading for the disturbance.
 * @param {string} message A mortal-friendly explanation of the error.
 * @param {string} details The full, unabridged truth of the failed communion.
 * @param {boolean} isApiKeyError If true, displays a more specific message about key restrictions.
 */
export function showErrorModal(title, message, details, isApiKeyError = false) {
    document.getElementById('error-modal-title').textContent = title;
    
    let fullMessage = message;
    if (isApiKeyError) {
        fullMessage += `\n\nThis "Not Found" error often means the API key is restricted. Please check your key's "Application restrictions" (e.g., HTTP referrers) in the Google Cloud Console.`;
        
        const instructions = document.createElement('div');
        instructions.className = 'error-instructions';
        instructions.innerHTML = `To see the exact headers your browser sent, open Developer Tools (F12), go to the "Network" tab, find the failed request (in red), and inspect its "Headers" section.`;
        
        const messageElement = document.getElementById('error-modal-message');
        messageElement.innerHTML = ''; // Clear previous content
        
        const mainMessage = document.createElement('p');
        mainMessage.textContent = fullMessage;
        
        messageElement.appendChild(mainMessage);
        messageElement.appendChild(instructions);
    } else {
        document.getElementById('error-modal-message').innerHTML = `<p>${message}</p>`;
    }

    document.getElementById('error-modal-details').textContent = details;
    toggleModal(true, 'error-modal');
}