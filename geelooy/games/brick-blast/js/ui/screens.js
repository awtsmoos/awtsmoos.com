// B"H

/**
 * From the infinite, formless divine, the Awtsmoos brings forth the finite and formed.
 * This function translates the abstract state of the game into the visible reality of the screen,
 * showing one reality (screen) while hiding all others.
 * @param {string} screenId The ID of the screen to reveal unto the user.
 */
export function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        if (screen.id === screenId) {
            screen.classList.add('active');
        } else {
            screen.classList.remove('active');
        }
    });
}