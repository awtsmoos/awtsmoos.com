
/**
 * B"H
 * @file LandingScreenData.js
 * @description The abstract structural intent (Chochmah) of the Landing Screen UI.
 */
export const getLandingScreenData = () => ({
    tag: 'div',
    id: 'mitzvahWorldLanding',
    classes: ['landing-container'],
    children:[
        {
            tag: 'h1',
            classes: ['title-glow'],
            text: 'MITZVAH WORLD'
        },
        {
            tag: 'div',
            classes:['loading-bar-vessel'],
            children:[
                {
                    tag: 'div',
                    id: 'genesisProgressBar',
                    classes: ['loading-light']
                }
            ]
        },
        {
            tag: 'div',
            classes: ['status-text'],
            text: 'Drawing Down the Infinite Light...'
        },
        {
            tag: 'div',
            id: 'genesisStatusText',
            classes: ['status-text', 'status-text-highlight'],
            text: 'The Vessel is forming...'
        }
    ]
});
