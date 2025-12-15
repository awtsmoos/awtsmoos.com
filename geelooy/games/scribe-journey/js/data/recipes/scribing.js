
// B"H
// js/data/recipes/scribing.js

export const scribingRecipes = [
    {
        id: 'write_mezuzah',
        result: 'mezuzah_scroll',
        ingredients: [{itemId: 'mystic_ink', count: 1}, {itemId: 'parchment_klaf', count: 1}, {itemId: 'feather_bedikah', count: 1}] 
    },
    {
        id: 'write_tefillin',
        result: 'tefillin_pair',
        ingredients: [{itemId: 'mystic_ink', count: 2}, {itemId: 'leather_hide', count: 2}, {itemId: 'parchment_klaf', count: 2}]
    },
    {
        id: 'write_sefer_torah',
        result: 'letter_in_torah',
        ingredients: [{itemId: 'mystic_ink', count: 10}, {itemId: 'parchment_klaf', count: 50}, {itemId: 'maamar_5715', count: 1}]
    }
];
