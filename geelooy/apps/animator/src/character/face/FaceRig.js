// B"H
export class FaceRig { constructor({ eyes = 'open', mouth = 'rest', brows = 'soft', cheeks = 'warm' } = {}) { this.eyes = eyes; this.mouth = mouth; this.brows = brows; this.cheeks = cheeks; } static happy() { return new FaceRig({ eyes: 'bright', mouth: 'smile', brows: 'lifted' }); } }
