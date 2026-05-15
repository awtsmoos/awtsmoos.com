
// B"H
import { PINE_PRESETS } from './pine.js';
import { OAK_PRESETS } from './oak.js';
import { BIRCH_PRESETS } from './birch.js';
import { ASH_PRESETS } from './ash.js';
import { ASPEN_PRESETS } from './aspen.js';

export const TREE_PRESETS = {
    ...PINE_PRESETS.reduce((acc, p) => ({...acc, [p.name]: p}), {}),
    ...OAK_PRESETS.reduce((acc, p) => ({...acc, [p.name]: p}), {}),
    ...BIRCH_PRESETS.reduce((acc, p) => ({...acc, [p.name]: p}), {}),
    ...ASH_PRESETS.reduce((acc, p) => ({...acc, [p.name]: p}), {}),
    ...ASPEN_PRESETS.reduce((acc, p) => ({...acc, [p.name]: p}), {})
};
