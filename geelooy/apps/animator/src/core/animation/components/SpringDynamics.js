// B"H
export class SpringDynamics { 
    static update(pos, target, vel) { 
        return (target - pos) * 0.1 + vel * 0.9; 
    } 
}
