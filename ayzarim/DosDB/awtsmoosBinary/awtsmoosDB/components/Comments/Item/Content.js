
// B"H
/**
 * @module CommentContent
 */
import { AppStore } from '../../../state/store.js';
import { MentionParser } from '../Mention/Parser.js';

export function CommentContent(c, authorId) {
    const displayName = c.author === 'Me' ? AppStore.currentUser.name : c.author;

    return {
        tag: 'div',
        className: 'comment-speech-vessel relative transition-all',
        children: [
            {
                tag: 'div',
                className: 'flex items-center gap-2 mb-1',
                children: [
                    { 
                        tag: 'span', 
                        className: 'comment-author-name profile-click-trigger cursor-pointer', 
                        dataset: { userid: authorId }, 
                        text: displayName 
                    },
                    { tag: 'span', className: 'text-[10px] text-gray-400 ml-auto', text: c.time }
                ]
            },
            { 
                tag: 'div', 
                className: 'comment-text-content', 
                children: MentionParser.parse(c.text) 
            },
            c.image ? { 
                tag: 'div', 
                className: 'mt-2 rounded-xl overflow-hidden border', 
                children: [{ tag: 'img', src: c.image, style: { maxWidth: '100%', display: 'block' } }] 
            } : null
        ].filter(Boolean)
    };
}
