
/**
 * B"H
 * @chapter The UI of Gevurah
 * @description
 * This JSON blueprint dictates the physical shell of the debate screen.
 * It is completely reconstructed every time the Awtsmoos desires it!
 */
export const BattleBlueprint = {
    tag: 'div',
    id: 'awtsmoos-battle-ui',
    attrs: { class: 'awtsmoos-battle-shell' },
    style: {
        position: 'absolute', inset: '0',
        color: '#fff', fontFamily: '"Share Tech Mono", monospace',
        display: 'none', flexDirection: 'column',
        padding: '30px', zIndex: '9500',
        overflow: 'hidden'
    },
    children:[
        /* The Chaotic Backdrop - Separated so it doesn't spin the UI! */
        { tag: 'div', id: 'awtsmoos-battle-bg', style: { position: 'absolute', inset: '-50%', width: '200%', height: '200%', zIndex: '0' } },
        
        { tag: 'div', id: 'awtsmoos-battle-flash', attrs: { class: 'flash-overlay' }, style: { zIndex: '1000' } },
        { tag: 'div', id: 'awtsmoos-battle-slash', attrs: { class: 'slash-effect' }, style: { zIndex: '900' } },

        { tag: 'div', attrs: { class: 'battle-floor-grid' }, style: { zIndex: '2' } },

        {
            tag: 'div',
            style: { display: 'flex', justifyContent: 'flex-end', marginBottom: '20px', position: 'relative', zIndex: '200' },
            children:[
                {
                    tag: 'div',
                    attrs: { class: 'battle-hud-panel' },
                    style: { width: '320px', padding: '15px', borderRight: '6px solid #d500f9', background: 'rgba(20, 0, 30, 0.85)' },
                    children:[
                        { tag: 'div', style: { display: 'flex', justifyContent: 'space-between' }, children:[
                            { tag: 'div', text: 'OPPONENT', style: { fontWeight: 'bold', fontSize: '20px', color: '#ea80fc', letterSpacing: '2px', textAlign: 'right' } },
                            { tag: 'div', id: 'enemy-lvl-label', text: 'LVL 1', style: { fontWeight: 'bold', fontSize: '18px', color: '#ffd54f' } }
                        ]},
                        { tag: 'div', style: { width: '100%', height: '10px', background: '#222', marginTop: '10px', borderRadius: '5px', boxShadow: 'inset 0 0 10px #000', overflow: 'hidden' }, children:[
                            { tag: 'div', id: 'enemy-hp-bar', style: { width: '100%', height: '100%', background: 'linear-gradient(90deg, #aa00ff, #f50057)', transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)' } }
                        ]},
                        { tag: 'div', id: 'enemy-hp-label', text: '100/100', style: { color: '#ffb74d', marginTop: '5px', textAlign: 'right', fontSize: '16px' } }
                    ]
                }
            ]
        },
        
        { 
            tag: 'div', 
            style: { flexGrow: '1', position: 'relative', width: '100%', zIndex: '10' }, 
            children:[
                { tag: 'div', id: 'sprite-klipah', attrs: { class: 'battle-sprite-klipah' }, text: '🌑' },
                { tag: 'div', id: 'sprite-tzaddik', attrs: { class: 'battle-sprite-tzaddik' }, text: '✡' }
            ]
        },
        
        {
            tag: 'div',
            style: { display: 'flex', justifyContent: 'flex-start', marginBottom: '15px', position: 'relative', zIndex: '200' },
            children:[
                {
                    tag: 'div',
                    attrs: { class: 'battle-hud-panel' },
                    style: { width: '350px', padding: '15px', borderLeft: '6px solid #00e5ff', background: 'rgba(0, 20, 40, 0.85)' },
                    children:[
                        { tag: 'div', style: { display: 'flex', justifyContent: 'space-between' }, children:[
                            { tag: 'div', text: 'TZADDIK', style: { fontWeight: 'bold', fontSize: '20px', color: '#84ffff', letterSpacing: '2px' } },
                            { tag: 'div', id: 'player-lvl-label', text: 'LVL 1', style: { fontWeight: 'bold', fontSize: '18px', color: '#ffd54f', textShadow: '0 0 10px #ffc107' } }
                        ]},
                        /* Health Bar */
                        { tag: 'div', style: { width: '100%', height: '12px', background: '#222', marginTop: '10px', borderRadius: '6px', boxShadow: 'inset 0 0 10px #000', overflow: 'hidden' }, children:[
                            { tag: 'div', id: 'player-hp-bar', style: { width: '100%', height: '100%', background: 'linear-gradient(90deg, #00b0ff, #1de9b6)', transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)' } }
                        ]},
                        /* XP Bar! */
                        { tag: 'div', style: { width: '100%', height: '4px', background: '#111', marginTop: '4px', borderRadius: '2px', overflow: 'hidden' }, children: [
                            { tag: 'div', id: 'player-xp-bar', style: { width: '0%', height: '100%', background: 'linear-gradient(90deg, #ffca28, #ffd54f)', transition: 'width 0.5s ease-out' } }
                        ]},
                        { tag: 'div', id: 'player-hp-label', text: '100/100', style: { color: '#b2ebf2', marginTop: '6px', textAlign: 'left', fontSize: '16px' } }
                    ]
                }
            ]
        },
        
        {
            tag: 'div',
            style: { display: 'flex', gap: '25px', height: '160px', position: 'relative', zIndex: '200' },
            children:[
                {
                    tag: 'div',
                    id: 'battle-log-text',
                    attrs: { class: 'battle-hud-panel' },
                    text: 'The encounter begins...',
                    style: { flex: 2, padding: '25px', fontSize: '22px', display: 'flex', alignItems: 'center', color: '#e0f7fa', textShadow: '0 0 5px #00e5ff', background: 'rgba(5, 10, 15, 0.9)' }
                },
                {
                    tag: 'div',
                    id: 'battle-action-menu',
                    style: { flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
                    children: [] 
                }
            ]
        }
    ]
};
