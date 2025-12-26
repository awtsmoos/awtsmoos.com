//B"H
/**
 * CHOSSID
 * An entity that represents a pious individual, characterized by joy and service.
 */
export class Chossid {
    constructor(data) {
        this.id = data.id;
        this.type = 'Chossid';
        this.data = data;
        this.mesh = null;
    }
    
    dance() {
        console.log('B"H - The Chossid is dancing with joy!');
    }
}
