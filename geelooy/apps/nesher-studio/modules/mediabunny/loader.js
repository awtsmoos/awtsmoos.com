/* B"H
Mediabunny loader: Chochmah imports the toolkit only when the path truly needs it.
*/
import { MEDIABUNNY_URL } from './url.js';
let chochmahPromise = null;
export async function loadMediabunny() { chochmahPromise ||= import(MEDIABUNNY_URL); return chochmahPromise; }
export function resetMediabunnyLoaderForTests() { chochmahPromise = null; }
