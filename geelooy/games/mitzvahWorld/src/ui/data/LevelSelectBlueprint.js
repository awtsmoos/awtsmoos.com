
import { DivineActionMap } from '../actions/DivineActionMap.js';

/**
 * @constant LevelSelectBlueprint
 * @description
 * B"H
 * The blueprint for the secondary dimension.
 * When the soul chooses to "Play", it must refine its desire.
 * Will it enter the boundless Emerald World, a pristine vessel,
 * or the Village Level, where the letters form structures and homes?
 * 
 * @type {Object}
 */
export const LevelSelectBlueprint = {
    tag: 'div',
    className: 'awtsmoos-overlay',
    id: 'awtsmoos-level-select-menu',
    children:[
        {
            tag: 'div',
            className: 'awtsmoos-title-container',
            children:[
                {
                    tag: 'h1',
                    className: 'awtsmoos-main-title',
                    text: 'Choose World'
                }
            ]
        },
        {
            tag: 'div',
            className: 'awtsmoos-button-grid',
            children:[
                {
                    tag: 'button',
                    className: 'awtsmoos-btn',
                    text: 'Default Emerald World',
                    events: {
                        click: () => DivineActionMap.execute('LOAD_WORLD', 'emerald_world')
                    }
                },
                {
                    tag: 'button',
                    className: 'awtsmoos-btn',
                    text: 'The Village Level',
                    events: {
                        click: () => DivineActionMap.execute('LOAD_WORLD', 'village_world')
                    }
                },
                {
                    tag: 'button',
                    className: 'awtsmoos-btn',
                    text: 'Return to Source (Back)',
                    events: {
                        click: () => DivineActionMap.execute('GO_TO_MAIN_MENU')
                    }
                }
            ]
        }
    ]
};
