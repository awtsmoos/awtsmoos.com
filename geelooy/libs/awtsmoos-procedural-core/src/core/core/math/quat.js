
// B"H
/**
 * @file quat.js
 * @brief Array-based Quaternion math [x, y, z, w] for rotational stability.
 */
import { Vec3 } from './vec3.js';

export const Quat = {
    identity: () => [0, 0, 0, 1],

    setFromAxisAngle: (axis, angle) => {
        const halfAngle = angle / 2, s = Math.sin(halfAngle);
        return [axis[0] * s, axis[1] * s, axis[2] * s, Math.cos(halfAngle)];
    },

    normalize: (q) => {
        let len = Math.sqrt(q[0]*q[0] + q[1]*q[1] + q[2]*q[2] + q[3]*q[3]);
        if (len < 0.000001) return [0, 0, 0, 1];
        len = 1.0 / len;
        return [q[0]*len, q[1]*len, q[2]*len, q[3]*len];
    },

    multiply: (a, b) => {
        const qax=a[0], qay=a[1], qaz=a[2], qaw=a[3];
        const qbx=b[0], qby=b[1], qbz=b[2], qbw=b[3];
        return [
            qax * qbw + qaw * qbx + qay * qbz - qaz * qby,
            qay * qbw + qaw * qby + qaz * qbx - qax * qbz,
            qaz * qbw + qaw * qbz + qax * qby - qay * qbx,
            qaw * qbw - qax * qbx - qay * qby - qaz * qbz
        ];
    },

    applyToVec3: (v, q) => {
        const x=v[0], y=v[1], z=v[2];
        const qx=q[0], qy=q[1], qz=q[2], qw=q[3];
        const ix = qw*x + qy*z - qz*y;
        const iy = qw*y + qz*x - qx*z;
        const iz = qw*z + qx*y - qy*x;
        const iw = -qx*x - qy*y - qz*z;
        return [
            ix*qw + iw*-qx + iy*-qz - iz*-qy,
            iy*qw + iw*-qy + iz*-qx - ix*-qz,
            iz*qw + iw*-qz + ix*-qy - iy*-qx
        ];
    },

    // B"H - Essential for branching: Rotate vector VFrom to VTo
    setFromUnitVectors: (vFrom, vTo) => {
        let r = Vec3.dot(vFrom, vTo) + 1;
        if (r < 0.000001) {
            // Anti-parallel case
            r = 0;
            if (Math.abs(vFrom[0]) > Math.abs(vFrom[2])) return [ -vFrom[1], vFrom[0], 0, 0 ];
            else return [ 0, -vFrom[2], vFrom[1], 0 ];
        } else {
            const cross = Vec3.cross(vFrom, vTo);
            const w = r; 
            // Normalize quaternion
            const len = Math.sqrt(cross[0]*cross[0] + cross[1]*cross[1] + cross[2]*cross[2] + w*w);
            return [cross[0]/len, cross[1]/len, cross[2]/len, w/len];
        }
    },

    slerp: (qa, qb, t) => {
        if (t === 0) return qa;
        if (t === 1) return qb;
        let x = qa[0], y = qa[1], z = qa[2], w = qa[3];
        let bx = qb[0], by = qb[1], bz = qb[2], bw = qb[3];
        let cosHalfTheta = w * bw + x * bx + y * by + z * bz;

        if (cosHalfTheta < 0) {
            w = -w; x = -x; y = -y; z = -z;
            cosHalfTheta = -cosHalfTheta;
        }

        if (cosHalfTheta >= 1.0) return qa;

        const sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);
        if (Math.abs(sinHalfTheta) < 0.001) {
            return [
                x * 0.5 + bx * 0.5, y * 0.5 + by * 0.5,
                z * 0.5 + bz * 0.5, w * 0.5 + bw * 0.5
            ];
        }

        const halfTheta = Math.atan2(sinHalfTheta, cosHalfTheta);
        const ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta;
        const ratioB = Math.sin(t * halfTheta) / sinHalfTheta;

        return [
            x * ratioA + bx * ratioB,
            y * ratioA + by * ratioB,
            z * ratioA + bz * ratioB,
            w * ratioA + bw * ratioB
        ];
    }
};
