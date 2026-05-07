
/**
 * B"H
 * @chapter The External Vessels (Canvases)
 * @description
 * These canvases are the vessels that receive the light of Tiferet.
 * We manifest them once and cache their existence.
 */
export class Speech {
    /**
     * @description Generates the three main layers of reality.
     */
    static manifest() {
        const layers = [
            { id: 'layer-bg', z: 0 },
            { id: 'layer-obj', z: 10 },
            { id: 'layer-over', z: 20 }
        ];

        const container = document.body;

        layers.forEach(meta => {
            if (!document.getElementById(meta.id)) {
                const canvas = document.createElement('canvas');
                canvas.id = meta.id;
                canvas.width = 460;
                canvas.height = 500;
                Object.assign(canvas.style, {
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: meta.z,
                    imageRendering: 'auto', // Vector-friendly
                    backgroundColor: 'transparent'
                });
                container.appendChild(canvas);
            }
        });

        // Hide the logic canvas
        const original = document.getElementById('ohr-hagnuz-vessel');
        if (original) original.style.display = 'none';

        console.log("B\"H - Visual vessels are established.");
    }
}
