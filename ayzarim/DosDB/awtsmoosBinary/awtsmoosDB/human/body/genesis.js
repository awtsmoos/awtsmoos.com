
import { Maamar } from '../../core/creation/maamar.js';
import { AttachmentPoint } from '../head/attachment_point.js';

/**
 * @function manifestHumanWithHat
 * @description
 * The total manifestation procedure. 
 * 1. Creates the Body.
 * 2. Creates the Head.
 * 3. Adds the Attachment Point.
 * 4. Places the Yarmulke.
 *
 * This follows the pattern of the ten statements, where each stage 
 * creates the environment for the next.
 */
export function manifestHumanWithHat(containerId) {
    const root = document.getElementById(containerId);
    if (!root) return;

    // The primordial body blueprint
    const bodyBlueprint = {
        tag: 'div',
        className: 'human-body',
        style: {
            position: 'relative',
            width: '200px',
            height: '400px',
            margin: '50px auto',
            backgroundColor: '#f0f0f0',
            border: '2px solid #ccc'
        },
        children: [
            {
                tag: 'div',
                id: 'human-head',
                className: 'human-head',
                style: {
                    position: 'absolute',
                    top: '-60px',
                    left: '50px',
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    backgroundColor: '#ffe0bd',
                    border: '2px solid #d4a373'
                }
            }
        ]
    };

    // 1 & 2: Speak the body and head into existence
    const bodyDom = Maamar.speak(bodyBlueprint);
    root.appendChild(bodyDom);

    const headDom = bodyDom.querySelector('#human-head');
    
    // 3: Initialize the attachment point (the foundation for the hat)
    const anchors = new AttachmentPoint(headDom);

    // 4: Attach the Yarmulke (The Crown of awareness)
    anchors.attach('my-yarmulke', 'yarmulke', {
        color: 'velvet',
        size: '50px',
        x: '50%',
        y: '5%',
        type: 'rounded'
    });

    console.log('B"H: The Human with the Yarmulke is manifested.');
}
