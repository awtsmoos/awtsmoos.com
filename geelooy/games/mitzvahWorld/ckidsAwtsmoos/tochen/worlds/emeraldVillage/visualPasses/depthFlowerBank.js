// B"H
/**
 * @file depthFlowerBank.js
 * @description Chapter 341: One bank of flowers creates color depth at the
 * village edge.
 */
import { flower } from './shapeKit.js';
export function addDepthFlowerBank(n, bank) {
  flower(n, bank.id, bank.x, bank.z, bank.radius, bank.count, bank.type);
}
