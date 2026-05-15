
// B"H
import {getQuadrantLidMesh,getDefaultLidRotation,getBlinkKeyframes} from "./eyelids.js";

export function getLookAtRotation(eyePos,targetPos){
    const dx=targetPos[0]-eyePos[0];
    const dy=targetPos[1]-eyePos[1];
    const dz=targetPos[2]-eyePos[2];

    const distXZ=Math.sqrt(dx*dx+dz*dz);
    const yaw=Math.atan2(dx,dz);
    const pitch=Math.atan2(-dy,distXZ);

    return[pitch,yaw,0];
}

export function createLivingEye(config){

    const{
        id,
        position=[0,0,0],
        scale=[1,1,1],
        irisColor=[0.1,0.4,0.9],
        lookAtTarget
    }=config;

    const lookRot=lookAtTarget
        ?getLookAtRotation(position,lookAtTarget)
        :[0,0,0];

    const topLid=getQuadrantLidMesh(true);
    const bottomLid=getQuadrantLidMesh(false);

    return{
        id:id+"_sclera",

        primitive:"sphere",

        parameters:{
            radius:1,
            widthSegments:64,
            heightSegments:48,
            color:[0.98,0.98,1,1],
            smooth:true
        },

        keyframes:[
            {time:0,position:position,rotation:[0,0,0],scale:scale}
        ],

        children:[

            {
                id:id+"_iris",

                primitive:"sphere",

                parameters:{
                    radius:0.53,
                    widthSegments:48,
                    heightSegments:36,
                    color:[...irisColor,1],
                    smooth:true
                },

                keyframes:[
                    {time:0,position:[0,0,0.55],rotation:lookRot,scale:[1,1,1]}
                ]
            },

            {
                id:id+"_lid_top",

                ...topLid,

                keyframes:[
                    {time:0,rotation:getDefaultLidRotation(true)}
                ],

                animations:[
                    {
                        track:"blink_top",
                        loop:true,
                        duration:3.2,
                        keyframes:getBlinkKeyframes(true)
                    }
                ]
            },

            {
                id:id+"_lid_bottom",

                ...bottomLid,

                keyframes:[
                    {time:0,rotation:getDefaultLidRotation(false)}
                ],

                animations:[
                    {
                        track:"blink_bottom",
                        loop:true,
                        duration:3.2,
                        keyframes:getBlinkKeyframes(false)
                    }
                ]
            }

        ]
    };
}
