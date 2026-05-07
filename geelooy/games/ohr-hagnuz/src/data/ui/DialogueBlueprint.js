
/**
 * B"H
 * @file DialogueBlueprint.js
 * @description The structural DNA for the conversational vessel, now equipped to handle branching choices.
 */
export const DialogueBlueprint = {
    tag: 'div', 
    id: 'awtsmoos-dialogue',
    attrs: { class: 'awtsmoos-dialogue-vessel' },
    style: {
        position: 'absolute', bottom: '5%', left: '10%', width: '80%', minHeight: '160px',
        color: '#e0f7fa', padding: '25px', fontSize: '22px', lineHeight: '1.5',
        display: 'none', flexDirection: 'column', zIndex: '9000', boxSizing: 'border-box'
    },
    children: [
        {
            tag: 'div',
            style: { flexGrow: '1' },
            children: [
                { 
                    tag: 'div', 
                    id: 'awtsmoos-dialogue-text', 
                    text: '',
                    style: { display: 'inline' }
                },
                { 
                    tag: 'span', 
                    id: 'awtsmoos-dialogue-cursor',
                    attrs: { class: 'awtsmoos-cursor' }
                }
            ]
        },
        // The Multi-Verse Choices Container
        {
            tag: 'div',
            id: 'awtsmoos-dialogue-options',
            style: { display: 'none', flexDirection: 'column', gap: '8px', marginTop: '15px' }
        },
        // The Advance Indicator
        { 
            tag: 'div', 
            id: 'awtsmoos-dialogue-prompt',
            text: '▼ NEXT [A/E/ENTER]', 
            style: { 
                alignSelf: 'flex-end', marginTop: '10px',
                fontSize: '14px', color: '#00e5ff', opacity: '0.8',
                letterSpacing: '2px'
            } 
        }
    ]
};
