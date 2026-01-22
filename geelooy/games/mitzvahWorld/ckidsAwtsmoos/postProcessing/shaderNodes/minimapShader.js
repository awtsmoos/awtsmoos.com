/**B"H
 * @file minimapShader.js
 * Optimized TSL Shader for Minimap rendering.
 * Hardened to prevent 'length of undefined' crash by initializing uniform array values.
 */
import { 
    uniform, vec3, dot, float, radians, tan, vec2, tslFn, length, normalize, 
    If, cos, sin, mat2, sub, vec4, mix, int, distance, loop, uv, texture 
} from 'three/nodes';

const opacity = uniform( 'float' );
const tDiffuse = uniform( 'sampler2D' );
const cameraPos = uniform( 'vec3' );
const cameraDirection = uniform( 'vec3' );
const cameraFOV = uniform( 'float' );
const cameraAspect = uniform( 'float' );

// B"H: Initializing with a TypedArray ensures the internal renderer sees a valid length
const objectPositions = uniform( new Float32Array( 64 * 3 ), 'vec3' ); 
const numberOfDvarim = uniform( 'int' );
const playerPos = uniform( 'vec3' );
const playerRot = uniform( 'float' );
const minimapRadius = uniform( 'float' );

const calculateMinimapPosition = tslFn( ( [ worldPos_immutable ] ) => {
	const worldPos = vec3( worldPos_immutable ).toVar();
	const relativePosition = vec3( worldPos.sub( cameraPos ) ).toVar();
	const depthVal = float( dot( relativePosition, cameraDirection ) ).toVar();
	const fovFactor = float( tan( radians( cameraFOV ).div( 2.0 ) ) ).toVar();
	const aspectFactor = float( cameraAspect ).toVar();
	const adjustedX = float( relativePosition.x.div( depthVal ).div( fovFactor.mul( aspectFactor ) ) ).toVar();
	const adjustedZ = float( relativePosition.z.div( depthVal ).negate().div( fovFactor.mul( aspectFactor ) ) ).toVar();

	return vec2( adjustedX, adjustedZ );
} );

const normalizeVec2 = tslFn( ( [ v_immutable ] ) => {
	const v = vec2( v_immutable ).toVar();
	const r = vec2( vec2( v.add( 1.0 ) ).div( 2.0 ) ).toVar();
	return r;
} );

const clampToCircle = tslFn( ( [ position_immutable ] ) => {
	const position = vec2( position_immutable ).toVar();
	const radius = float( 0.5 ).toVar();
	const circleSpacePos = vec2( position.sub( vec2( 0.5, 0.5 ) ) ).toVar();
	const dst = float( length( circleSpacePos ) ).toVar();

	If( dst.greaterThan( radius ), () => {
		circleSpacePos.assign( normalize( circleSpacePos ).mul( radius ) );
	} );

	return circleSpacePos.add( vec2( 0.5, 0.5 ) );
} );

const isPointInRotatedTriangle = tslFn( ( [ point_immutable, center_immutable, rotation_immutable, size_immutable ] ) => {
	const size = float( size_immutable ).toVar();
	const rotation = float( rotation_immutable ).toVar();
	const center = vec2( center_immutable ).toVar();
	const point = vec2( point_immutable ).toVar();
	const p1 = vec2( vec2( 0.0, - 1.0 ).mul( size ) ).toVar();
	const p2 = vec2( vec2( - 0.866, 0.5 ).mul( size ) ).toVar();
	const p3 = vec2( vec2( 0.866, 0.5 ).mul( size ) ).toVar();
	const cosA = float( cos( rotation ) ).toVar();
	const sinA = float( sin( rotation ) ).toVar();
    
	const rotMat = mat2( cosA, sinA.negate(), sinA, cosA );
    
	const v1 = vec2( rotMat.mul( p1 ) ).add( center );
	const v2 = vec2( rotMat.mul( p2 ) ).add( center );
	const v3 = vec2( rotMat.mul( p3 ) ).add( center );

	const alpha = float( v2.y.sub( v3.y ).mul( point.x.sub( v3.x ) ).add( v3.x.sub( v2.x ).mul( point.y.sub( v3.y ) ) ).div( v2.y.sub( v3.y ).mul( v1.x.sub( v3.x ) ).add( v3.x.sub( v2.x ).mul( v1.y.sub( v3.y ) ) ) ) ).toVar();
	const beta = float( v3.y.sub( v1.y ).mul( point.x.sub( v3.x ) ).add( v1.x.sub( v3.x ).mul( point.y.sub( v3.y ) ) ).div( v2.y.sub( v3.y ).mul( v1.x.sub( v3.x ) ).add( v3.x.sub( v2.x ).mul( v1.y.sub( v3.y ) ) ) ) ).toVar();
	const gamma = float( sub( 1.0, alpha.add( beta ) ) ).toVar();

	return alpha.greaterThan( 0.0 ).and( beta.greaterThan( 0.0 ).and( gamma.greaterThan( 0.0 ) ) );
} );

const isPointInCircle = tslFn( ( [ point_immutable, center_immutable, radius_immutable ] ) => {
	const radius = float( radius_immutable ).toVar();
	const center = vec2( center_immutable ).toVar();
	const point = vec2( point_immutable ).toVar();
	return length( point.sub( center ) ).lessThan( radius );
} );

const main = tslFn( () => {
    const uUv = uv();
	const borderSize = float( 0.01 ).toVar();
	const texel = vec4( texture( tDiffuse, uUv ) ).toVar();
	const v = vec2( calculateMinimapPosition( playerPos ) ).toVar();
	const u = vec2( normalizeVec2( v ) ).toVar();
	const triangleSize = float( 0.05 ).toVar();
	const triangleColor = vec4( 0.0, 0.0, 1.0, 0.5 ).toVar();
	const outerTriangleSize = float( triangleSize.add( borderSize ) ).toVar();
    
	const cosA = float( cos( playerRot.negate() ) ).toVar();
	const sinA = float( sin( playerRot.negate() ) ).toVar();
	const rotMat = mat2( cosA, sinA.negate(), sinA, cosA );
    
	const frontPoint = vec2( rotMat.mul( vec2( 0.0, - 0.03 ) ) ).toVar();
	const frontPointPosition = vec2( u.add( frontPoint ) ).toVar();
	const circleRadius = float( 0.01 ).toVar();

	If( isPointInRotatedTriangle( uUv, u, playerRot.negate(), outerTriangleSize ), () => {
		If( isPointInRotatedTriangle( uUv, u, playerRot.negate(), triangleSize ).not(), () => {
			texel.assign( vec4( 0.0, 0.0, 0.0, 1.0 ) );
		} ).else( () => {
			texel.assign( mix( texel, triangleColor, triangleColor.a ) );
		} );
	} );

	If( isPointInCircle( uUv, frontPointPosition, circleRadius ), () => {
		texel.assign( vec4( 1.0, 1.0, 1.0, 1.0 ) );
	} );

	loop( { start: int( 0 ), end: numberOfDvarim }, ( { i } ) => {
		const objV = vec2( calculateMinimapPosition( objectPositions.element( i ) ) ).toVar();
		const objU = vec2( normalizeVec2( objV ) ).toVar();
		const clampedU = vec2( clampToCircle( objU ) ).toVar();
		const distVal = float( distance( uUv, clampedU ) ).toVar();

		If( distVal.lessThan( 0.03 ), () => {
			texel.assign( vec4( 1.0, 1.0, 0.0, 1.0 ) );
		} );
	} );

    return texel.mul( opacity );
} );

calculateMinimapPosition.setLayout( { name: 'calculateMinimapPosition', type: 'vec2', inputs: [ { name: 'worldPos', type: 'vec3' } ] } );
normalizeVec2.setLayout( { name: 'normalizeVec2', type: 'vec2', inputs: [ { name: 'v', type: 'vec2' } ] } );
clampToCircle.setLayout( { name: 'clampToCircle', type: 'vec2', inputs: [ { name: 'position', type: 'vec2' } ] } );
isPointInRotatedTriangle.setLayout( { name: 'isPointInRotatedTriangle', type: 'bool', inputs: [ { name: 'point', type: 'vec2' }, { name: 'center', type: 'vec2' }, { name: 'rotation', type: 'float' }, { name: 'size', type: 'float' } ] } );
isPointInCircle.setLayout( { name: 'isPointInCircle', type: 'bool', inputs: [ { name: 'point', type: 'vec2' }, { name: 'center', type: 'vec2' }, { name: 'radius', type: 'float' } ] } );
main.setLayout( { name: 'main', type: 'void', inputs: [] } );

export { opacity, tDiffuse, cameraPos, cameraDirection, cameraFOV, cameraAspect, objectPositions, numberOfDvarim, playerPos, playerRot, minimapRadius, calculateMinimapPosition, normalizeVec2, clampToCircle, isPointInRotatedTriangle, isPointInCircle, main };
