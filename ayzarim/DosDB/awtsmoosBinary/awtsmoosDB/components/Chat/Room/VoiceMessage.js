
// B"H
/**
 * B"H
 * components/Chat/Room/VoiceMessage.js
 */
import { AppStore } from '../../../state/store.js';

export function VoiceMessage(m) {
    const isMe = m.sender === 'me';
    const bars = Array.from({ length: 25 }).map(() => Math.floor(Math.random() * 80) + 10);
    const isPlaying = AppStore.audioState.currentId === m.id && AppStore.audioState.isPlaying;

    return {
        tag: 'div',
        className: `message-bubble-container ${isMe ? 'me' : 'them'} animate-fade-in-up`,
        children: [
            {
                tag: 'div',
                className: `chat-bubble ${isMe ? 'me' : 'them'}`,
                style: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px' },
                children: [
                    {
                        tag: 'button',
                        className: 'voice-play-btn',
                        style: { width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,0,0,0.05)', fontSize: '20px' },
                        on: { 
                            click: () => {
                                if (window.AppGlobals.Actions) window.AppGlobals.Actions.toggleAudio(m.id, 'chat');
                            }
                        },
                        text: isPlaying ? '⏸️' : '▶️'
                    },
                    {
                        tag: 'div',
                        className: 'waveform-vessel',
                        style: { flex: '1', display: 'flex', alignItems: 'center', gap: '2px', height: '32px', overflow: 'hidden' },
                        children: bars.map(h => ({
                            tag: 'div',
                            style: { 
                                width: '2px', 
                                height: `${h}%`, 
                                backgroundColor: isPlaying ? 'var(--c-primary)' : '#9ca3af', 
                                borderRadius: '1px' 
                            }
                        }))
                    },
                    {
                        tag: 'div',
                        className: 'chat-bubble-meta',
                        style: { alignSelf: 'flex-end', marginLeft: '8px' },
                        children: [
                            { tag: 'span', className: 'chat-bubble-time', text: m.time },
                            isMe ? { tag: 'span', className: `chat-bubble-status ${m.status==='read' ? 'read' : ''}`, text: '✓✓' } : null
                        ].filter(Boolean)
                    }
                ]
            }
        ]
    };
}
