// B"H
export function createGridMesh(params) {
    const size = params.size || 10;
    const divisions = params.divisions || 10;
    const color = params.color || [0.5, 0.5, 0.5, 1.0];
    const step = size / divisions;
    const half = size / 2;
    
    const positions = [];
    const colors = [];
    const normals = [];
    const indices = [];
    
    for (let i = 0; i <= divisions; i++) {
        const k = -half + i * step;
        positions.push(-half, 0, k); colors.push(...color); normals.push(0,1,0);
        positions.push(half, 0, k);  colors.push(...color); normals.push(0,1,0);
        positions.push(k, 0, -half); colors.push(...color); normals.push(0,1,0);
        positions.push(k, 0, half);  colors.push(...color); normals.push(0,1,0);
    }
    
    for (let i = 0; i < positions.length / 3; i++) {
        indices.push(i);
    }
    return { positions, colors, normals, indices, drawMode: 'LINES' }; 
}