
// B"H
/**
 * @module ChatHeaderIdentity
 */
import { HolyAvatar } from '../../../Common/HolyAvatar.js';

export function ChatHeaderIdentity(user, typing) {
    return {
        tag: 'div',
        className: 'chat-header-identity',
        on: { 
            click: () => {
                if (window.AppGlobals.Actions) {
                    window.AppGlobals.Actions.viewUserProfile(user.id);
                }
            }
        },
        children: [
            {
                tag: 'div',
                className: 'chat-header-avatar',
                children: [HolyAvatar.render({ src: user.avatar, size: '40px' })]
            },
            {
                tag: 'div',
                className: 'chat-header-info',
                children: [
                    { tag: 'span', className: 'chat-header-name', text: user.name },
                    { 
                        tag: 'span', 
                        className: `chat-header-status ${typing ? 'typing' : ''}`, 
                        text: typing ? 'typing...' : 'Online' 
                    }
                ]
            }
        ]
    };
}
