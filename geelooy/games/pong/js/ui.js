//B"H
// js/ui.js

function drawNet(context, canvas) {
    context.beginPath();
    context.setLineDash([5, 15]);
    context.moveTo(canvas.width / 2, 0);
    context.lineTo(canvas.width / 2, canvas.height);
    context.strokeStyle = '#fff';
    context.stroke();
    context.setLineDash([]); // Reset to solid line
}

function drawScore(context, x, y, score) {
    context.fillStyle = '#fff';
    context.font = '32px Arial';
    context.fillText(score, x, y);
}

function displayWinner(context, canvas, winner) {
    context.fillStyle = '#fff';
    context.font = '48px Arial';
    context.textAlign = 'center';
    context.fillText(winner + " Wins!", canvas.width / 2, canvas.height / 2);
}

/**
 * Helper function to convert a number to its Gematria representation.
 * Follows the user's specific rules for 15 and 16.
 * @param {number} num The number to convert (0-59).
 * @returns {string} The Hebrew numeral string.
 */
function toGematria(num) {
    if (num === 0) return 'אפס';
    if (num < 0 || num >= 60) return ''; // Handles timer values only

    // User-specified special cases
    if (num === 15) return 'א"ו'; // As requested: Aleph + Vav
    if (num === 16) return 'ט"ז'; // As requested: Tet + Zayin

    const ones = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
    const tens = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];

    const tensDigit = Math.floor(num / 10);
    const onesDigit = num % 10;

    let str = tens[tensDigit] + ones[onesDigit];

    // Add Gershayim (") before the last letter for multi-letter numbers to denote it as a number
    if (str.length > 1) {
        str = str.slice(0, -1) + '"' + str.slice(-1);
    }

    return str;
}


/**
 * Draws the timer in both English and Hebrew.
 * @param {CanvasRenderingContext2D} context The canvas context.
 * @param {HTMLCanvasElement} canvas The canvas element.
 * @param {string} time The formatted time string "mm:ss".
 */
function drawTimer(context, canvas, time) {
    const [minutesStr, secondsStr] = time.split(':');
    const minutes = parseInt(minutesStr, 10);
    const seconds = parseInt(secondsStr, 10);

    context.fillStyle = '#fff';
    context.textAlign = 'center';

    // 1. Draw the standard English Timer
    context.font = '24px Arial';
    context.fillText(time, canvas.width / 2, 30);

    // 2. Convert and draw the Hebrew Gematria Timer underneath
    const hebrewTime = `${toGematria(minutes)} : ${toGematria(seconds)}`;
    context.font = '22px Arial'; // Slightly smaller font
    context.fillText(hebrewTime, canvas.width / 2, 60); // Positioned 30px below
}