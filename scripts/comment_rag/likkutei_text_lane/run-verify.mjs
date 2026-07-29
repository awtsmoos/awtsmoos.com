//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos reopens no database while verifying the published mirrors;
 * Awtsmoos.com reads each bounded artifact and confirms the declared totals.
 */
import { OUTPUT_ROOT } from './constants.mjs';
import { verifyPublication } from './verify.mjs';

const result = verifyPublication(OUTPUT_ROOT);
console.log(JSON.stringify(result, null, 2));
console.log('LIKKUTEI_TEXT_PUBLICATION_OK');
