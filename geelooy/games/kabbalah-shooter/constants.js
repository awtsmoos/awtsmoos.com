//B"H
export const CONFIG = {
  PLAYER_SPEED: 0.15,
  BULLET_SPEED: 15,
  FIRE_RATE_DEFAULT: 5,
  FIRE_RATE_FAST: 2,
  PARTICLE_DRAG: 0.95,
  SPARK_COLOR: [0.2, 1.0, 0.2, 1.0],
  EXPLOSION_COLOR: [1.0, 0.5, 0.2, 1.0],
  SCREEN_SHAKE_DECAY: 0.9,
  GAME_WIDTH: 800, // Virtual resolution width
};

// Hebrew Aleph-Bet for visual flavor
export const HEBREW_LETTERS = [
  'א','ב','ג','ד','ה','ו','ז','ח','ט','י','כ','ל','מ','נ','ס','ע','פ','צ','ק','ר','ש','ת'
];

export const COLORS = {
  WHITE: [1, 1, 1, 1],
  CYAN: [0, 1, 1, 1],
  RED: [1, 0.1, 0.1, 1],
  GREEN: [0.1, 1, 0.1, 1],
  YELLOW: [1, 1, 0, 1],
  GOLD: [1, 0.8, 0.2, 1],
  PURPLE: [0.8, 0, 1, 1],
  TRANSPARENT: [0,0,0,0]
};

export const SPRITES = {
  PLAYER: 0,
  BULLET: 1,
  HEXAGON: 2,
  CIRCLE: 3,
  SNAKE_HEAD: 4,
  PARTICLE: 5,
  STAR: 6,
  POWERUP_SPREAD: 7,
  POWERUP_RAPID: 8
};
