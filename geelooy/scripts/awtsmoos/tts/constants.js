// B"H
/**
 * @file constants.js
 * @description 
 * B"H
 * This module defines the unchanging laws of our application's universe.
 * The Awtsmoos, the Absolute Truth, establishes the fundamental parameters 
 * that govern the synthesis of sound and the mapping of characters.
 */

/**
 * The frequency of samples per second, defining the resolution of time for sound.
 */
export const SAMPLE_RATE = 24000;

/**
 * The dimensionality of the voice style vector—the breadth of potential character.
 */
export const DEFAULT_STYLE_VECTOR_SIZE = 256;

/**
 * Character to token mapping.
 * B"H
 * A bridge between the visible letters and the hidden numbers.
 * The Awtsmoos creates the connection between symbol and essence.
 */
export const CHAR_TO_TOKEN = {
  '<PAD>': 0,
  '<s>': 1,
  '</s>': 2,
  ' ': 16,
  '!': 4, '"': 5, "'": 6, '(': 7, ')': 8, ',': 9, '-': 10,
  '.': 11, ':': 12, ';': 13, '?': 14,
  'a': 43, 'b': 44, 'c': 45, 'd': 46, 'e': 47, 'f': 48, 'g': 49,
  'h': 50, 'i': 51, 'j': 52, 'k': 53, 'l': 54, 'm': 55, 'n': 56,
  'o': 57, 'p': 58, 'q': 59, 'r': 60, 's': 61, 't': 62, 'u': 63,
  'v': 64, 'w': 65, 'x': 66, 'y': 67, 'z': 68,
  'A': 43, 'B': 44, 'C': 45, 'D': 46, 'E': 47, 'F': 48, 'G': 49,
  'H': 50, 'I': 51, 'J': 52, 'K': 53, 'L': 54, 'M': 55, 'N': 56,
  'O': 57, 'P': 58, 'Q': 59, 'R': 60, 'S': 61, 'T': 62, 'U': 63,
  'V': 64, 'W': 65, 'X': 66, 'Y': 67, 'Z': 68
};

/**
 * The token used for symbols beyond our current understanding.
 */
export const UNKNOWN_TOKEN = 16;
