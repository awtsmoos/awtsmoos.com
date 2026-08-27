// B"H
export class JitterComponent { 
    static update(value, intensity) { 
        return value + (Math.random() - 0.5) * intensity; 
    } 
}
