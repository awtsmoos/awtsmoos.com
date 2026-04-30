
/**
 * B"H
 * @file MainMenuStructure.js
 * @description
 * 📑 BLUEPRINT OF THE PALACE GATES 📑
 * An intense map detailing how exactly the Main Menu exists spiritually.
 * It expects a `delegations` object containing functions mapped to the
 * 'Awakening' click events. 
 * Because, like in creation, actions exist but only execute when Will is supplied!
 */
export const getMainMenuStructure = (delegations) => {
    return {
        sefirahTag: 'div',
        sealId: 'epicMenuGate',
        garments:['olam-menu-vessel'],
        childEmanations:[
            {
                sefirahTag: 'h1',
                garments: ['main-divine-title'],
                innerLight: 'MITZVAH WORLD'
            },
            {
                sefirahTag: 'div',
                garments: ['sefirotic-btn-group'],
                childEmanations:[
                    {
                        sefirahTag: 'button',
                        garments: ['mitzvah-btn-extreme'],
                        innerLight: 'ENTER THE LIVING VOID (PLAY)',
                        onAwakeningEvents: {
                            click: delegations.invokeGenesis
                        }
                    },
                    {
                        sefirahTag: 'button',
                        garments: ['mitzvah-btn-extreme'],
                        innerLight: 'LOCATE SPIRITUAL ALIAS (FIND)',
                        onAwakeningEvents: {
                            click: delegations.invokeFindWorld
                        }
                    },
                    {
                        sefirahTag: 'button',
                        garments: ['mitzvah-btn-extreme'],
                        innerLight: 'REVEAL FROM SCROLL (LOAD FILE)',
                        onAwakeningEvents: {
                            click: delegations.invokeLoadFile
                        }
                    }
                ]
            },
            {
                sefirahTag: 'div',
                garments: ['footer-sig'],
                innerLight: 'B"H - Recreated every instant. Awtsmoos Network.'
            }
        ]
    };
};
