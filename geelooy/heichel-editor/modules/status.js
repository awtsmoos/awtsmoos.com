// B"H
/**
 * @module EditorStatus
 * @description
 * A quiet status line for governance forms, keeping success and failure inside
 * the work surface where the actor can keep their place.
 */

/**
 * Builds a writable inline status element.
 * @returns {{node:HTMLElement,set:(message:string,tone?:string)=>void}}
 */
export function createStatus() {
  const node = document.createElement("p");
  node.className = "editor-status";
  node.setAttribute("aria-live", "polite");
  return {
    node,
    set(message, tone = "info") {
      node.textContent = message;
      node.dataset.tone = tone;
    }
  };
}
