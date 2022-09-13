// w is a scalar, v is vector [x,y,z]
// Returns Quaternion [w,v]
function Quaternion(w, v){
	return [w,v];
}

// Returns the product of two quaternions (composition of rotations)
function multQuaternion(q1, q2){
    var v1w2 = VecXScalar(q1[1], q2[0]);
    var v2w1 = VecXScalar(q2[1], q1[0]);
    var v1v2 = cross(q1[1], q2[1]);
    var sum1 = sum(v1w2, v2w1);
    var sum2 = sum(sum1, v1v2);

    var ret = Quaternion(q1[0]*q2[0]-scalarProduct(q1[1],q2[1]), sum2);
    return ret;
}

// Return quaternion rapresenting rotation around "axis" of "deg"
function AxisAngle2Quaternion(axis, deg){
    var alpha = deg/2 ; // * 3.1415 / 180
    var w = Math.cos(alpha);
    var v = vec3( axis[0]*Math.sin(alpha),
                  axis[1]*Math.sin(alpha),
                  axis[2]*Math.sin(alpha) );
    return Quaternion(w, v);
}

// Returns the rotation matrix equivalent to the quaternion
function Quaternion2Matrix(quat){
    var w = quat[0];
    var x = quat[1][0];
    var y = quat[1][1];
    var z = quat[1][2];
    return [
	   1-(2*y*y)-(2*z*z), (2*x*y)-(2*w*z),   (2*x*z)+(2*w*y),    0,
	   (2*x*y)+(2*w*z),   1-(2*x*x)-(2*z*z), (2*y*z)-(2*w*x),    0,
	   (2*x*z)-(2*w*y),   (2*y*z)+(2*w*x),   1-(2*x*x)-(2*y*y),  0,
	   0,                 0,                 0,                  1,
	];
}

function normalizeQuat(q){
    k = Math.sqrt( q[0]*q[0] + q[1][0]*q[1][0] + q[1][1]*q[1][1] + q[1][2]*q[1][2] );
	return Quaternion(q[0]/k, vec3(q[1][0]/k,q[1][1]/k,q[1][2]/k));
}

function printQuat(q){
    var norm = q[0]*q[0] + q[1][0]*q[1][0] + q[1][1]*q[1][1] + q[1][2]*q[1][2];
    console.log('W: ' + q[0] + ', Vx: ', q[1][0]+ ', Vy: ', q[1][1]+ ', Vz: ', q[1][2], ' norm: ', norm);
}