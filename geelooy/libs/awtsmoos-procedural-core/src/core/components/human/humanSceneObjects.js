
// B"H
/**
 * @file humanSceneObjects.js
 * @chapter THE GATHERING OF FORMS
 * 
 * We place the house and the eyes directly into the path of the Golem 
 * to ensure their presence is clear and undeniable.
 */
import { createRiggedHuman } from './humanGenerator.js';
import { createMarchingCloudCluster } from '../clouds/marchingCloudGenerator.js';
import { createEyeAssembly } from '../eye/eyeAssembly.js';
import { createCSGHouse } from '../../house/houseGenerator.js';

export function getHumanSceneObjects() {
    const human = createRiggedHuman('golem_manifest');
    
    // B"H - Manifesting the Eyes
    const leftEye = createEyeAssembly('eye_l');
    const rightEye = createEyeAssembly('eye_r');
    
    // Bone Attachment: Parented to the 'head' joint.
    // Offset moved significantly forward (Z=1.2) to protrude from the new spherical head.
    leftEye.attachment = { bone: 'head', offset: [-0.4, 0.4, 1.2] };
    rightEye.attachment = { bone: 'head', offset: [0.4, 0.4, 1.2] };
    
    human.children.push(leftEye, rightEye);

    human.animations =[
        { boneId: 'hip_l', track: 'walk_hip_l' },
        { boneId: 'knee_l', track: 'walk_knee_l' },
        { boneId: 'hip_r', track: 'walk_hip_r' },
        { boneId: 'knee_r', track: 'walk_knee_r' },
        { boneId: 'shoulder_l', track: 'walk_arm_l' },
        { boneId: 'shoulder_r', track: 'walk_arm_r' },
        { boneId: 'elbow_l', track: 'walk_elbow_l' },
        { boneId: 'elbow_r', track: 'walk_elbow_r' },
        { boneId: 'pelvis', track: 'walk_pelvis' },
        { boneId: 'hip_l', track: 'idle_legs_l' }, 
        { boneId: 'hip_r', track: 'idle_legs_r' }, 
        { boneId: 'shoulder_l', track: 'idle_arm_l' },
        { boneId: 'shoulder_r', track: 'idle_arm_r' },
        { boneId: 'pelvis', track: 'idle_breathing' },
        { boneId: 'spine_1', track: 'idle_spine_1' },
        { boneId: 'spine_2', track: 'idle_spine_2' },
        { boneId: 'neck', track: 'idle_neck' },
        { boneId: 'pelvis', track: 'fall_pelvis' },
        { boneId: 'hip_l', track: 'fall_legs' },
        { boneId: 'hip_r', track: 'fall_legs' },
        { boneId: 'shoulder_l', track: 'fall_arms' },
        { boneId: 'shoulder_r', track: 'fall_arms' },
        { boneId: 'pelvis', track: 'jump_start_pelvis' },
        { boneId: 'hip_l', track: 'jump_start_legs' },
        { boneId: 'hip_r', track: 'jump_start_legs' },
        { boneId: 'knee_l', track: 'jump_start_knees' },
        { boneId: 'knee_r', track: 'jump_start_knees' }
    ];

    const continent = {
        id: 'physics_terrain',
        primitive: 'plane',
        parameters: { size: 1.0, color:[1.0, 1.0, 1.0, 1.0] },
        modifiers:[
            { type: 'scaleMesh', scale: [2200, 1, 2200] },
            { type: 'subdivide', levels: 6 },
            { type: 'sculpt', params: { center:[0, 0, -250], radius: 200, amount:[0, 45, 0], falloff: 'dome', noise: 0.0 } },
            { type: 'sculpt', params: { center:[500, 0, 150], radius: 180, amount:[0, 35, 0], falloff: 'smooth', noise: 0.0 } },
            { type: 'sculpt', params: { center:[-450, 0, -100], radius: 150, amount:[0, 30, 0], falloff: 'sharp', noise: 0.0 } },
            { type: 'smoothNormals' }
        ],
        shaderVars: { 
            uMaterialType: 'reflective', 
            uTexture: 'dirt',       
            uUseTriplanar: 1.0,     
            uRoughness: 1.0, 
            uMetallic: 0.0,
            uTextureScale: 150.0 
        },
        simulation: { type: 'static_collider' },
        keyframes: [{ time: 0, position:[0, 15, 0] }] 
    };

    // B"H - House placed near the player spawn for immediate visual confirmation.
    const house = createCSGHouse('mansion_of_peace', [15, 15, -150]);

    return[
        continent,
        human,
        house,
        {
            id: 'ocean_master',
            primitive: 'plane', 
            parameters: { size: 10 },
            shaderVars: { uMaterialType: 'ocean' },
            keyframes:[{ time: 0, position: [0, 0, 0] }] 
        },
        createMarchingCloudCluster('god_cloud_1',[35000, 15000, -40000], 85.0),
    ];
}
