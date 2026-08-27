// B"H
export class NaturalArmSway {
    static update(angle, time) {
        const sway = Math.sin(time * 0.003) * 5;
        return angle + sway;
    }
}
