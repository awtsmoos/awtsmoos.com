
// B"H
/**
 * @file waterMaterial.js
 * @brief A shader for flowing, undulating water. Now containing its draw execution.
 */
import { mat4_core } from '../../math/mat4/core.js';

export const VS_SOURCE_WATER = `
    attribute vec3 aVertexPosition;
    attribute vec3 aVertexNormal;
    attribute vec4 aVertexColor;

    uniform mat4 uProjectionMatrix;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uModelMatrix;
    uniform highp float uTime; 

    varying highp vec3 vWorldPos;
    varying highp vec3 vNormal;
    varying mediump vec4 vColor;

    void main(void) {
        vec3 pos = aVertexPosition;
        float wave1 = sin(pos.x * 0.02 + uTime * 0.8);
        float wave2 = cos(pos.z * 0.03 + uTime * 0.6);
        float wave3 = sin((pos.x + pos.z) * 0.01 + uTime * 0.4);
        
        float height = (wave1 + wave2 + wave3) * 2.5; 
        pos.y += height;

        vec3 offsetNormal = normalize(vec3(-wave1*0.05, 1.0, -wave2*0.05));
        vWorldPos = (uModelMatrix * vec4(pos, 1.0)).xyz;
        vNormal = normalize(mat3(uModelMatrix) * offsetNormal);
        vColor = aVertexColor + vec4(height * 0.05);

        gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(pos, 1.0);
    }
`;

export const FS_SOURCE_WATER = `
    precision mediump float;
    varying highp vec3 vWorldPos;
    varying highp vec3 vNormal;
    varying mediump vec4 vColor;

    uniform highp vec3 uLightDirection; 
    uniform highp vec3 uCameraPos; 
    uniform highp vec3 uAmbientLightColor; 
    uniform highp vec3 uDirectionalLightColor; 
    uniform highp float uTime; 

    void main(void) {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(uCameraPos - vWorldPos);
        vec3 lightDir = normalize(uLightDirection);
        vec3 reflectDir = reflect(-lightDir, normal);

        float spec = pow(max(dot(viewDir, reflectDir), 0.0), 128.0);
        vec3 specular = uDirectionalLightColor * spec * 1.5;
        float diff = max(dot(normal, lightDir), 0.0);
        vec3 diffuse = uDirectionalLightColor * diff * vColor.rgb * 0.5;

        vec3 deepBlue = vec3(0.0, 0.1, 0.3);
        vec3 ambient = uAmbientLightColor * deepBlue;

        float flowScale = 0.05;
        float flow = sin(vWorldPos.x * flowScale + uTime) * sin(vWorldPos.z * flowScale + uTime * 0.9);
        vec3 flowColor = vec3(0.0, 0.3, 0.6) * (0.8 + flow * 0.2);

        float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 4.0);
        vec3 rim = vec3(0.4, 0.7, 0.9) * fresnel;

        vec3 finalColor = ambient + diffuse + specular + rim;
        finalColor = mix(finalColor, flowColor, 0.4);

        gl_FragColor = vec4(finalColor, 0.9); 
    }
`;

export class WaterMaterial {
    constructor(gl) { this.gl = gl; }
    setProgram(programInfo) { 
        this.program = programInfo.program; 
    }

    draw(obj, context) {
        const { projectionMatrix, viewMatrix, worldModelMatrix, cameraPos, globalShaderVars } = context;
        const gl = this.gl;

        if (!this.program) return;

        let modelViewMatrix = mat4_core.identity();
        mat4_core.multiply(modelViewMatrix, viewMatrix, worldModelMatrix);

        gl.useProgram(this.program);
        gl.uniformMatrix4fv(gl.getUniformLocation(this.program, 'uProjectionMatrix'), false, projectionMatrix);
        gl.uniformMatrix4fv(gl.getUniformLocation(this.program, 'uModelViewMatrix'), false, modelViewMatrix);
        gl.uniformMatrix4fv(gl.getUniformLocation(this.program, 'uModelMatrix'), false, worldModelMatrix);
        
        gl.uniform1f(gl.getUniformLocation(this.program, 'uTime'), performance.now() / 1000);
        gl.uniform3fv(gl.getUniformLocation(this.program, 'uCameraPos'), cameraPos);
        gl.uniform3fv(gl.getUniformLocation(this.program, 'uLightDirection'), globalShaderVars.uLightDirection || [0,1,0]);
        gl.uniform3fv(gl.getUniformLocation(this.program, 'uDirectionalLightColor'), globalShaderVars.uDirectionalLightColor || [1,1,1]);
        gl.uniform3fv(gl.getUniformLocation(this.program, 'uAmbientLightColor'), globalShaderVars.uAmbientLightColor ||[0.2,0.2,0.2]);

        const posLoc = gl.getAttribLocation(this.program, 'aVertexPosition');
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffers.position);
        gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(posLoc);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.buffers.indices);
        const indexType = obj.buffers.indexType || gl.UNSIGNED_SHORT;
        gl.drawElements(gl.TRIANGLES, obj.indicesCount, indexType, 0);
    }
}
