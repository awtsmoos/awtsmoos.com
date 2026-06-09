// B"H
/**
 * @file depthTreePass.js
 * @description Chapter 342: The depth pass now adds flower banks through data;
 * extra trees remain off to preserve the mobile budget.
 */
import { DEPTH_FLOWERS } from './depthFlowerConfig.js';
import { addDepthFlowerBank } from './depthFlowerBank.js';
export function addDepthTrees(n) {
  DEPTH_FLOWERS.forEach(bank => addDepthFlowerBank(n, bank));
}
