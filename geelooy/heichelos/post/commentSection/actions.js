// B"H
/**
 * @module CommentActions
 * @description
 * Chapter 5: Cancel and transmit buttons are forged here, small and obedient,
 * so the main comment class can remain a clear conductor of intention.
 */

/** @param {object} owner CommentSection instance. */
export function createButtons(owner) {
    owner.buttonContainer = document.createElement("div");
    owner.buttonContainer.className = "awtsmoos-comment-actions-bar";
    owner.addCommentArea.appendChild(owner.buttonContainer);

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "btn awtsmoos-action-cancel";
    cancelBtn.textContent = "Cancel";
    cancelBtn.onclick = () => owner.resetForm();

    owner.submitBtn = document.createElement("button");
    owner.submitBtn.className = "btn awtsmoos-action-submit";
    const span = document.createElement("span");
    span.textContent = "Transmit";
    owner.submitBtn.appendChild(span);
    owner.submitBtn.disabled = true;
    owner.submitBtn.onclick = () => owner.submitComment();

    owner.buttonContainer.append(cancelBtn, owner.submitBtn);
}

/** @param {HTMLButtonElement} button @param {string} text */
export function setSubmitText(button, text) {
    button.replaceChildren();
    const span = document.createElement("span");
    span.textContent = text;
    button.appendChild(span);
}
