
// B"H
/**
 * @file domElements.js
 * @brief The Census of the Browser: Locating the living vessels of interaction.
 */
export function getDOMElements() {
    return {
        container: document.getElementById('ui-container'),
        consolePanel: document.getElementById('console-panel'),
        consoleLogArea: document.getElementById('console-log-area'),
        controlsArea: document.getElementById('console-controls'),
        toggleButton: document.getElementById('console-toggle-button'),
        copyButton: document.getElementById('copy-log-button'),
        hideLogButtonInner: document.getElementById('hide-log-button-inner'),
        testScriptListElement: document.getElementById('test-scripts-list'),
        customControlsArea: document.getElementById('custom-controls-area')
    };
}
