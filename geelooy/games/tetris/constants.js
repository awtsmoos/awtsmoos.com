// B"H
// constants.js

const COLORS = {
    1: '#EE3377', // I (custom pink)
    2: '#00CCFF', // T
    3: '#00FF99', // S
    4: '#FF8800', // Z
    5: '#FFDD00', // L
    6: '#9933FF', // J
    7: '#FFFFFF'  // O (custom white)
};

const SHAPES = {
    1: [[1, 1, 1, 1]],         // I
    2: [[0, 1, 0], [1, 1, 1]], // T
    3: [[0, 1, 1], [1, 1, 0]], // S
    4: [[1, 1, 0], [0, 1, 1]], // Z
    5: [[1, 0, 0], [1, 1, 1]], // L
    6: [[0, 0, 1], [1, 1, 1]], // J
    7: [[1, 1], [1, 1]]          // O
};

const COLS = 10;
const LOGICAL_ROWS = 40;
const VIEWPORT_ROWS = 18;