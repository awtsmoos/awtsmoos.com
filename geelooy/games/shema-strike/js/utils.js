//B"H

const HEBREW_LETTERS = Array.from("אבגדהוזחטיכךלמםנןסעפףצץקרשת");
const COMMON_LETTERS = Array.from("אבגדהוזחטיכלמןסעפצקרשת");

function toGematria(n) {
    if (n <= 0) return '';
    if (n === 15) return 'טו';
    if (n === 16) return 'טז';

    let str = '';
    let num = n;

    const values = [
        [400, 'ת'], [300, 'ש'], [200, 'ר'], [100, 'ק'], [90, 'צ'], [80, 'פ'], [70, 'ע'],
        [60, 'ס'], [50, 'נ'], [40, 'מ'], [30, 'ל'], [20, 'כ'], [10, 'י']
    ];
    
    for (const [val, char] of values) {
        if (num >= val) {
            str += char;
            num -= val;
        }
    }
    const ones = ['','א','ב','ג','ד','ה','ו','ז','ח','ט'];
    if (num > 0) str += ones[num];

    return str;
}

function getRandomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Global screen shake variables
let screenShake = { duration: 0, magnitude: 0, x: 0, y: 0 };
function triggerScreenShake(duration, magnitude) {
    screenShake.duration = Math.max(screenShake.duration, duration);
    screenShake.magnitude = Math.max(screenShake.magnitude, magnitude);
}
function updateScreenShake(ctx) {
    if (screenShake.duration > 0) {
        screenShake.duration--;
        screenShake.x = (Math.random() - 0.5) * screenShake.magnitude;
        screenShake.y = (Math.random() - 0.5) * screenShake.magnitude;
        ctx.translate(screenShake.x, screenShake.y);
    } else {
        screenShake.x = 0;
        screenShake.y = 0;
    }
}