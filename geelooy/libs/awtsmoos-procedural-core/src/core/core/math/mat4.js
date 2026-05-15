// B"H
/** @file mat4.js - 4x4 Matrix Operations */

export const mat4 = {
    identity: () => [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1],

    perspective: (fov, aspect, near, far) => {
        const out = new Array(16).fill(0);
        const f = 1.0 / Math.tan(fov * 0.5);
        const invRange = 1.0 / (near - far);
        out[0] = f / aspect; out[5] = f;
        out[10] = (near + far) * invRange; out[11] = -1;
        out[14] = (2 * near * far) * invRange;
        return out;
    },

    translate: (m, v) => {
        const x=v[0], y=v[1], z=v[2];
        const a00=m[0], a01=m[1], a02=m[2], a03=m[3];
        const a10=m[4], a11=m[5], a12=m[6], a13=m[7];
        const a20=m[8], a21=m[9], a22=m[10], a23=m[11];
        m[12] = a00*x + a10*y + a20*z + m[12];
        m[13] = a01*x + a11*y + a21*z + m[13];
        m[14] = a02*x + a12*y + a22*z + m[14];
        m[15] = a03*x + a13*y + a23*z + m[15];
        return m;
    },

    rotateX: (m, angle) => {
        const s = Math.sin(angle), c = Math.cos(angle);
        const a10=m[4], a11=m[5], a12=m[6], a13=m[7];
        const a20=m[8], a21=m[9], a22=m[10], a23=m[11];
        m[4] = a10*c + a20*s; m[5] = a11*c + a21*s;
        m[6] = a12*c + a22*s; m[7] = a13*c + a23*s;
        m[8] = a20*c - a10*s; m[9] = a21*c - a11*s;
        m[10]= a22*c - a12*s; m[11]= a23*c - a13*s;
        return m;
    },

    rotateY: (m, angle) => {
        const s = Math.sin(angle), c = Math.cos(angle);
        const a00=m[0], a01=m[1], a02=m[2], a03=m[3];
        const a20=m[8], a21=m[9], a22=m[10], a23=m[11];
        m[0] = a00*c - a20*s; m[1] = a01*c - a21*s;
        m[2] = a02*c - a22*s; m[3] = a03*c - a23*s;
        m[8] = a00*s + a20*c; m[9] = a01*s + a21*c;
        m[10]= a02*s + a22*c; m[11]= a03*s + a23*c;
        return m;
    },

    rotateZ: (m, angle) => {
        const s = Math.sin(angle), c = Math.cos(angle);
        const a00=m[0], a01=m[1], a02=m[2], a03=m[3];
        const a10=m[4], a11=m[5], a12=m[6], a13=m[7];
        m[0] = a00*c + a10*s; m[1] = a01*c + a11*s;
        m[2] = a02*c + a12*s; m[3] = a03*c + a13*s;
        m[4] = a10*c - a00*s; m[5] = a11*c - a01*s;
        m[6] = a12*c - a02*s; m[7] = a13*c - a03*s;
        return m;
    },

    scale: (m, v) => {
        const x=v[0], y=v[1], z=v[2];
        m[0]*=x; m[1]*=x; m[2]*=x; m[3]*=x;
        m[4]*=y; m[5]*=y; m[6]*=y; m[7]*=y;
        m[8]*=z; m[9]*=z; m[10]*=z; m[11]*=z;
        return m;
    },

    multiply: (out, a, b) => {
        const a00=a[0], a01=a[1], a02=a[2], a03=a[3];
        const a10=a[4], a11=a[5], a12=a[6], a13=a[7];
        const a20=a[8], a21=a[9], a22=a[10], a23=a[11];
        const a30=a[12], a31=a[13], a32=a[14], a33=a[15];
        let b0=b[0], b1=b[1], b2=b[2], b3=b[3];
        out[0]=b0*a00+b1*a10+b2*a20+b3*a30; out[1]=b0*a01+b1*a11+b2*a21+b3*a31;
        out[2]=b0*a02+b1*a12+b2*a22+b3*a32; out[3]=b0*a03+b1*a13+b2*a23+b3*a33;
        b0=b[4]; b1=b[5]; b2=b[6]; b3=b[7];
        out[4]=b0*a00+b1*a10+b2*a20+b3*a30; out[5]=b0*a01+b1*a11+b2*a21+b3*a31;
        out[6]=b0*a02+b1*a12+b2*a22+b3*a32; out[7]=b0*a03+b1*a13+b2*a23+b3*a33;
        b0=b[8]; b1=b[9]; b2=b[10]; b3=b[11];
        out[8]=b0*a00+b1*a10+b2*a20+b3*a30; out[9]=b0*a01+b1*a11+b2*a21+b3*a31;
        out[10]=b0*a02+b1*a12+b2*a22+b3*a32; out[11]=b0*a03+b1*a13+b2*a23+b3*a33;
        b0=b[12]; b1=b[13]; b2=b[14]; b3=b[15];
        out[12]=b0*a00+b1*a10+b2*a20+b3*a30; out[13]=b0*a01+b1*a11+b2*a21+b3*a31;
        out[14]=b0*a02+b1*a12+b2*a22+b3*a32; out[15]=b0*a03+b1*a13+b2*a23+b3*a33;
        return out;
    },

    inverse: (out, a) => {
        const a00=a[0], a01=a[1], a02=a[2], a03=a[3];
        const a10=a[4], a11=a[5], a12=a[6], a13=a[7];
        const a20=a[8], a21=a[9], a22=a[10], a23=a[11];
        const a30=a[12], a31=a[13], a32=a[14], a33=a[15];
        const b00=a00*a11-a01*a10, b01=a00*a12-a02*a10, b02=a00*a13-a03*a10;
        const b03=a01*a12-a02*a11, b04=a01*a13-a03*a11, b05=a02*a13-a03*a12;
        const b06=a20*a31-a21*a30, b07=a20*a32-a22*a30, b08=a20*a33-a23*a30;
        const b09=a21*a32-a22*a31, b10=a21*a33-a23*a31, b11=a22*a33-a23*a32;
        let det=b00*b11-b01*b10+b02*b09+b03*b08-b04*b07+b05*b06;
        if(!det) return null;
        det=1.0/det;
        out[0]=(a11*b11-a12*b10+a13*b09)*det; out[1]=(a02*b10-a01*b11-a03*b09)*det;
        out[2]=(a31*b05-a32*b04+a33*b03)*det; out[3]=(a22*b04-a21*b05-a23*b03)*det;
        out[4]=(a12*b08-a10*b11-a13*b07)*det; out[5]=(a00*b11-a02*b08+a03*b07)*det;
        out[6]=(a32*b02-a30*b05-a33*b01)*det; out[7]=(a20*b05-a22*b02+a23*b01)*det;
        out[8]=(a10*b10-a11*b08+a13*b06)*det; out[9]=(a01*b08-a00*b10-a03*b06)*det;
        out[10]=(a30*b04-a31*b02+a33*b00)*det; out[11]=(a21*b02-a20*b04-a23*b00)*det;
        out[12]=(a11*b07-a10*b09-a12*b06)*det; out[13]=(a00*b09-a01*b07+a02*b06)*det;
        out[14]=(a31*b01-a30*b03-a33*b00)*det; out[15]=(a20*b03-a21*b01+a22*b00)*det;
        return out;
    },

    transpose: (out, a) => {
        if(out===a) {
            let a01=a[1], a02=a[2], a03=a[3], a12=a[6], a13=a[7], a23=a[11];
            out[1]=a[4]; out[2]=a[8]; out[3]=a[12];
            out[4]=a01; out[6]=a[9]; out[7]=a[13];
            out[8]=a02; out[9]=a12; out[11]=a[14];
            out[12]=a03; out[13]=a13; out[14]=a23;
        } else {
            out[0]=a[0]; out[1]=a[4]; out[2]=a[8]; out[3]=a[12];
            out[4]=a[1]; out[5]=a[5]; out[6]=a[9]; out[7]=a[13];
            out[8]=a[2]; out[9]=a[6]; out[10]=a[10]; out[11]=a[14];
            out[12]=a[3]; out[13]=a[7]; out[14]=a[11]; out[15]=a[15];
        }
        return out;
    },

    lookAt: (out, eye, center, up) => {
        let x0,x1,x2, y0,y1,y2, z0,z1,z2, len;
        const ex=eye[0], ey=eye[1], ez=eye[2];
        const ux=up[0], uy=up[1], uz=up[2];
        const cx=center[0], cy=center[1], cz=center[2];
        z0=ex-cx; z1=ey-cy; z2=ez-cz;
        len=1/Math.sqrt(z0*z0+z1*z1+z2*z2); z0*=len; z1*=len; z2*=len;
        x0=uy*z2-uz*z1; x1=uz*z0-ux*z2; x2=ux*z1-uy*z0;
        len=Math.sqrt(x0*x0+x1*x1+x2*x2);
        if(!len){x0=0;x1=0;x2=0;}else{len=1/len;x0*=len;x1*=len;x2*=len;}
        y0=z1*x2-z2*x1; y1=z2*x0-z0*x2; y2=z0*x1-z1*x0;
        len=Math.sqrt(y0*y0+y1*y1+y2*y2);
        if(!len){y0=0;y1=0;y2=0;}else{len=1/len;y0*=len;y1*=len;y2*=len;}
        out[0]=x0; out[1]=y0; out[2]=z0; out[3]=0;
        out[4]=x1; out[5]=y1; out[6]=z1; out[7]=0;
        out[8]=x2; out[9]=y2; out[10]=z2; out[11]=0;
        out[12]=-(x0*ex+x1*ey+x2*ez); out[13]=-(y0*ex+y1*ey+y2*ez);
        out[14]=-(z0*ex+z1*ey+z2*ez); out[15]=1;
        return out;
    }
};
