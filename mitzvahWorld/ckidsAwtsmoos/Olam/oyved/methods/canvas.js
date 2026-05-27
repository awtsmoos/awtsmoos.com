
/**
 * B"H
 * Canvas Methods for Worker
 */
export default function(me) {
    return {
        async takeInCanvas({ canvas, devicePixelRatio }) {
            me.olam.takeInCanvas(canvas, devicePixelRatio);
            await me.olam.heesHawvoos();
        },
        async getBitmap(toRender=false) {
            if(me.olam && me.olam.renderer && me.olam.renderer.domElement) {
                var can = me.olam.renderer.domElement;
                if(toRender) {
                    me.olam.heesHawvoos();
                }
                var bit = can.transferToImageBitmap();
                return { tawchlees: bit, transfer: true };
            }
        },
        async getCanvas() {
            if(me.olam && me.olam.renderer && me.olam.renderer.domElement) {
                return me.olam.renderer.domElement;
            }
        },
        async getOlam() {
            if(me.olam !== null && me.olam.serialize) {
                return { tawchlees: me.olam.serialize() };
            }
        }
    };
}
