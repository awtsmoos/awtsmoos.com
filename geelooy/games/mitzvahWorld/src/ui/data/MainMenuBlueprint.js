
import { DivineActionMap } from '../actions/DivineActionMap.js';

/**
 * @constant MainMenuBlueprint
 * @description
 * B"H
 * The blueprint of the highest sphere, the Main Menu.
 * Here, the user stands at the precipice of creation,
 * choosing how to engage with the digital universe.
 * 
 * @type {Object}
 */
export const MainMenuBlueprint = {
    tag: 'div',
    className: 'awtsmoos-overlay',
    id: 'awtsmoos-main-menu',
    children:[
        {
            tag: 'div',
            className: 'awtsmoos-particles',
            id: 'awtsmoos-particle-layer'
        },
        {
            tag: 'div',
            className: 'awtsmoos-title-container',
            children:[
                {
                    tag: 'h1',
                    className: 'awtsmoos-main-title',
                    text: 'Mitzvah'
                },
                {
                    tag: 'h2',
                    className: 'awtsmoos-sub-title',
                    text: 'World'
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
                    text: 'Play / Select Level',
                    events: {
                        click: () => DivineActionMap.execute('GO_TO_LEVEL_SELECT')
                    }
                },
                {
                    tag: 'button',
                    className: 'awtsmoos-btn',
                    text: 'Find Worlds by Alias',
                    events: {
                        click: () => DivineActionMap.execute('FIND_ALIAS')
                    }
                },
                {
                    tag: 'button',
                    className: 'awtsmoos-btn',
                    text: 'Load World from File',
                    events: {
                        click: () => DivineActionMap.execute('LOAD_FILE')
                    }
                }
            ]
        }
    ]
};
