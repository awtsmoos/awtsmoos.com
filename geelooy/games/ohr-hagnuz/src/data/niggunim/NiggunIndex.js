
import { NiggunSimcha } from './NiggunSimcha.js';
import { NiggunHisorerus } from './NiggunHisorerus.js';
import { NiggunDeveikus } from './NiggunDeveikus.js';

/**
 * B"H
 * @module NiggunIndex
 * @description
 * The collected sheet music of the soul. All modular Niggunim are registered here.
 */
export const NiggunIndex = {
    [NiggunSimcha.id]: NiggunSimcha,
    [NiggunHisorerus.id]: NiggunHisorerus,
    [NiggunDeveikus.id]: NiggunDeveikus
};
