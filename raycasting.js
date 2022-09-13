class Ray{
	constructor(origin,dir){
		this.origin = origin;
		this.dir = dir;
	}
	
	getPoint(t){
		return sum(this.origin,[this.dir[0]*t,this.dir[1]*t,this.dir[2]*t])
	}
	
	toString(){
		return `origin:(${this.origin}) direction:(${this.dir})`;
	}
}

class BoundingBox{
	constructor(vmin,vmax){
		this.vmin = vmin;
		this.vmax = vmax;
	}
	
	toString(){
		return `vmin:(${this.vmin}) vmax:(${this.vmax})`;
	}
}

class Intersection{
	constructor(ray,tmin,tmax){
		this.min = ray.getPoint(tmin);
		this.max = ray.getPoint(tmax);
	}
	
	toString(){
		return `min:(${this.min}) max:(${this.max})`;
	}
}

function rayFromMouse(mouseX,mouseY,view,projection){
	let ray_clip = [mouseX,mouseY,-1,1];
	let invView = invMatrix4(view);
	let invProjection = invMatrix4(projection);
	ray_clip = multMatrixVec(invProjection,ray_clip);
	ray_clip[2]=-1;
	ray_clip[3]=0;
	ray_clip = multMatrixVec(invView,ray_clip);
	// Direction of the ray
	let dir = normalize(ray_clip);
	// Origin
	let origin = multMatrixVec(invView,[0,0,0,1]);
	return new Ray(origin,dir);
}

function checkIntersection(ray,bounding_box){
	return getIntersection(ray,bounding_box) !== null;
}

function getIntersection(ray,bounding_box,model_matrix){
	let tmin = 0.0, tmax = Infinity;
	let t1,t2,j,axis,e,f, temp;
	// Oriented Bounding Box Position
	let pos = vec3(model_matrix[12],model_matrix[13],model_matrix[14]);
	// Difference between OBB Position and Ray Origin
	let delta = subtract(pos, ray.origin);
	// Test intersection with the 2 planes perpendicular to the OBB's axis (i=x,y,z or 0,1,2)
	for(let i=0;i<3;i++){
		j = i*4;
		axis = vec3(model_matrix[j],model_matrix[j+1],model_matrix[j+2]);
		e = scalarProduct(axis,delta);
		f = scalarProduct(ray.dir,axis);
		if(Math.abs(f) > 0.001){
			// Intersection with the "left" plane
			t1 = (e+bounding_box.vmin[i])/f; 
			// Intersection with the "right" plane
			t2 = (e+bounding_box.vmax[i])/f; 
			// t1 and t2 now contain distances betwen ray origin and ray-plane intersections
			// t1 should be the nearest intersection, 
			if (t1>t2){
				// swap t1 and t2
				temp=t1;
				t1=t2;
				t2=temp;
			}
			// tmax is the nearest "far" intersection (amongst the X,Y and Z planes pairs)
			if ( t2 < tmax )
				tmax = t2;
			// tmin is the farthest "near" intersection (amongst the X,Y and Z planes pairs)
			if ( t1 > tmin )
				tmin = t1;
			// If "far" is closer than "near", then there is NO intersection.
			if (tmax < tmin )
				return null;
		}else if(-e+bounding_box.vmin[i] > 0 || -e+bounding_box.vmax[i] < 0){
			// Rare case : the ray is almost parallel to the planes, so they don't have any "intersection"
			return null;
		}
	}
	return new Intersection(ray,tmin,tmax); 
}