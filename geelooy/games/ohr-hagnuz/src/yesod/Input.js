
/**
 * B"H
 * @class Input
 * @chapter The Channel of Intention
 * @description
 * Bridges the gap between the physical user and the internal engine.
 */
export class Input {
    static bind() {
        const map = {
            'ArrowUp': 'U', 'w': 'U',
            'ArrowDown': 'D', 's': 'D',
            'ArrowLeft': 'L', 'a': 'L',
            'ArrowRight': 'R', 'd': 'R',
            'z': 'A', 'Enter': 'A', ' ': 'A'
        };

        window.addEventListener('keydown', e => {
            const key = map[e.key];
            if (key) {
                window.AwtsmoosIntents[key] = 1;
                if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                    e.preventDefault();
                }
            }
        });

        window.addEventListener('keyup', e => {
            const key = map[e.key];
            if (key) window.AwtsmoosIntents[key] = 0;
        });
    }
}
