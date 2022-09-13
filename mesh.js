/* GpuMesh:
  (indices to buffers holding) a mesh on video card RAM */
var GpuMesh = {
   bufferVerts : 0,
   bufferTris : 0,

   nTris: 0,
    minX: 0,                  // ABB limits
    maxX: 0,
    minY: 0,
    maxY: 0,
    minZ: 0,
    maxZ: 0,
   
   init : function(gl) {
       this.bufferVerts = gl.createBuffer();
       this.bufferTris = gl.createBuffer();

       this.nTris = 0;
   },
    
   draw : function(gl) {    
       
      gl.bindBuffer(
         gl.ARRAY_BUFFER, 
         this.bufferVerts 
      );
      
      
      gl.enableVertexAttribArray(posAttributeIndex);
      gl.vertexAttribPointer(posAttributeIndex , 
               3, gl.FLOAT , false , 11*4, 0);

      gl.enableVertexAttribArray(normAttributeIndex);
      gl.vertexAttribPointer(normAttributeIndex , 
               3, gl.FLOAT , false , 11*4, 3*4);
               
      gl.enableVertexAttribArray(textAttributeIndex);
      gl.vertexAttribPointer(textAttributeIndex , 
               2, gl.FLOAT , false , 11*4, 6*4); 
      
      gl.enableVertexAttribArray(tangAttributeIndex);
      gl.vertexAttribPointer(tangAttributeIndex , 
               3, gl.FLOAT , false , 11*4, 8*4);
           
      gl.bindBuffer( 
         gl.ELEMENT_ARRAY_BUFFER, 
         this.bufferTris 
      );
      
      gl.drawElements( 
         gl.TRIANGLES, 
 //         gl.POINTS,
         this.nTris*3, 
         gl.UNSIGNED_SHORT, 
         0
      );
      
      
   },
   
   storeFromCpu : function( gl, mesh ) {
        this.nTris = mesh.tris.length / 3;
        this.minX = mesh.minX;
        this.maxX = mesh.maxX;
        this.minY = mesh.minY;
        this.maxY = mesh.maxY;
        this.minZ = mesh.minZ;
        this.maxZ = mesh.maxZ;
  
        this.bufferVerts = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferVerts );
        gl.bufferData(
           gl.ARRAY_BUFFER, 
           mesh.verts, 
           gl.STATIC_DRAW
        );
        
        this.bufferTris = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufferTris );
        gl.bufferData(
           gl.ELEMENT_ARRAY_BUFFER, 
           mesh.tris, 
           gl.STATIC_DRAW
        );
       
   }
}

/*  CpuMesh: a mesh in main memory */
var CpuMesh = {

   /* fields */
    verts: new Float32Array,  // geo + norms
    tris: new Uint16Array,    // connectivity
    minX: 0,                  // ABB limits
    maxX: 0,
    minY: 0,
    maxY: 0,
    minZ: 0,
    maxZ: 0,
   
   /* methods */  
  
	// shortcuts
	vx: function (i){ return  this.verts[i*11+0]; },
	vy: function (i){ return  this.verts[i*11+1]; },
	vz: function (i){ return  this.verts[i*11+2]; },

	nx: function (i){ return  this.verts[i*11+3]; },
	ny: function (i){ return  this.verts[i*11+4]; },
	nz: function (i){ return  this.verts[i*11+5]; },
	
	nv: function (){ return this.verts.length/6; },
	nf: function (){ return this.tris.length/3; },
	
	// returns position of vert number i
	posOfVert: function( i ){
		return [ this.vx(i), this.vy(i), this.vz(i) ];
	},

	// returns normal of vert number i
	normalOfVert: function( i ){
		return [ this.nx(i), this.ny(i), this.nz(i) ];
	},
	
	// sets the normal of vert i
	setNormalOfVert: function( i , n ){
		this.verts[i*11+3] = n[0];
		this.verts[i*11+4] = n[1];
		this.verts[i*11+5] = n[2];
	},
	
	// returns normal of face number i
	normalOfFace: function(i){
		var vi, vj, vk;
		vi = this.tris[ i*3 + 0 ];
		vj = this.tris[ i*3 + 1 ];
		vk = this.tris[ i*3 + 2 ];
		var pi,pj,pk;
		pi = this.posOfVert( vi );
		pj = this.posOfVert( vj );
		pk = this.posOfVert( vk );
		var norm = cross( subtract( pi, pk ), subtract( pj, pk ) );
		return normalize(norm);
	},
	
    // input mesh from OFF format - tris only
	importOFFfromString:function (string){
        string.replace("\n ","\n");
//		var tokens = string.split(/[\n' ']/);
		var tokens = string.split(/\s+/);
		// tokens[0] == "OFF"
		var ti = 0; // token index
		ti++;  // skip "OFF"
		var nv = tokens[ti++]; // number of vertices
		var nf = tokens[ti++]; // number of faces
		ti++;  // skip number of edges
        console.log(tokens[1] + ", " + tokens[2] + ", " + tokens[3]);
        console.log(tokens[4] + ", " + tokens[5] + ", " + tokens[6]);
		
		this.verts = new Float32Array( nv*11 );
			
		for (var i=0; i<nv; i++) {
			this.verts[ i*11 + 0  ] = tokens[ti++]; // X
			this.verts[ i*11 + 1  ] = tokens[ti++]; // Y
			this.verts[ i*11 + 2  ] = tokens[ti++]; // Z
//            console.log(this.verts[ i*6 + 0  ] + ", " +
//                       this.verts[ i*6 + 1  ] + ", " +
//                       this.verts[ i*6 + 2  ]);
		}

		this.tris = new Uint16Array( nf*3 );
		for (var i=0; i<nf; i++) {
			if (tokens[ti++]!=3) { // number of edges (3?) 
                console.log("At face " + i + ": Non triangular face! file input failed.");
                return;
            }
			this.tris[ i*3 + 0 ] = tokens[ti++]; // v0
			this.tris[ i*3 + 1 ] = tokens[ti++]; // v1
			this.tris[ i*3 + 2 ] = tokens[ti++]; // v2
		}
		console.log("Loaded "+nf+" faces and "+nv+" vertices");
	},
	
	updateAABB: function(){
		if (this.nv()==0) return;
		this.minX = this.maxX = this.vx(0);
		this.minY = this.maxY = this.vy(0);
		this.minZ = this.maxZ = this.vz(0);
		for (var i=1; i<this.nv(); i++) {
			if (this.minX>this.vx(i)) this.minX = this.vx(i);
			if (this.maxX<this.vx(i)) this.maxX = this.vx(i);
			if (this.minY>this.vy(i)) this.minY = this.vy(i);
			if (this.maxY<this.vy(i)) this.maxY = this.vy(i);
			if (this.minZ>this.vz(i)) this.minZ = this.vz(i);
			if (this.maxZ<this.vz(i)) this.maxZ = this.vz(i);
		}
	},
	
	updateNormals: function(){
		// 1: clear all normals
		for (var i=0; i<this.nv(); i++) this.setNormalOfVert(i, [0,0,0] );
		
		// 2: cumulate normals of all faces on their three vertices
		for (var i=0; i<this.nf(); i++)  {
			var n = this.normalOfFace(i);
			
			var vi, vj, vk; // indices of the three vertices of face i
			vi = this.tris[ i*3 + 0 ];
			vj = this.tris[ i*3 + 1 ];
			vk = this.tris[ i*3 + 2 ];
			
			this.setNormalOfVert( vi, sum( n, this.normalOfVert(vi) ) );
			this.setNormalOfVert( vj, sum( n, this.normalOfVert(vj) ) );
			this.setNormalOfVert( vk, sum( n, this.normalOfVert(vk) ) );
		}
		
		// ciclo 3: normalize all normals
		for (var i=0; i<this.nv(); i++) 
			this.setNormalOfVert( i, normalize( this.normalOfVert(i) )  );
	},

	// centers and rescales the mesh
	// invoke AFTER updating AABB
	autocenterNormalize: function(){
		var tr = translationMatrix( 
		    -(this.minX+this.maxX)/2.0,
		    -(this.minY+this.maxY)/2.0,
		    -(this.minZ+this.maxZ)/2.0
		);
		var dimX = this.maxX-this.minX;
		var dimY = this.maxY-this.minY;
		var dimZ = this.maxZ-this.minZ;
		var dimMax = Math.max( dimZ, dimY, dimX );
        for (var i=0; i<this.nv(); i++) {
			this.verts[ i*11 + 0  ] = (this.verts[i*11+0]-(this.minX+this.maxX)/2.0)*2.0/dimMax; // X
			this.verts[ i*11 + 1  ] = (this.verts[i*11+1]-(this.minY+this.maxY)/2.0)*2.0/dimMax; // Y
			this.verts[ i*11 + 2  ] = (this.verts[i*11+2]-(this.minZ+this.maxZ)/2.0)*2.0/dimMax; // Z
		}
        this.minX = (this.minX-this.maxX)/dimMax;
        this.maxX = (this.maxX-this.minX)/dimMax;
        this.minY = (this.minY-this.maxY)/dimMax;
        this.maxY = (this.maxY-this.minY)/dimMax;
        this.minZ = (this.minZ-this.maxZ)/dimMax;
        this.maxZ = (this.maxZ-this.minZ)/dimMax;
    },

	// returns the matrix which centers the mesh and scales it 
	// invoke AFTER updating AABB
	autocenteringMatrix: function(){
		var tr = translationMatrix( 
		    -(this.minX+this.maxX)/2.0,
		    -(this.minY+this.maxY)/2.0,
		    -(this.minZ+this.maxZ)/2.0
		);
		var dimX = this.maxX-this.minX;
		var dimY = this.maxY-this.minY;
		var dimZ = this.maxZ-this.minZ;
		var dimMax = Math.max( dimZ, dimY, dimX );
		var sc = scalingMatrix( 2.0/dimMax );
		
		return multMatrix( sc , tr );
	},

       
    
    
    
    /* Procedural meshes */
    
    makeCube: function() {
      this.allocate( 8 , 12 );
      this.setVert( 0, -1,-1,+1 );
      this.setVert( 1, +1,-1,+1 );
      this.setVert( 2, -1,-1,-1 );
      this.setVert( 3, +1,-1,-1 );
      this.setVert( 4, -1,+1,+1 );
      this.setVert( 5, +1,+1,+1 );
      this.setVert( 6, -1,+1,-1 );
      this.setVert( 7, +1,+1,-1 );
      
      this.setQuad( 0, 0,1,5,4 ); // setta anche 1
      this.setQuad( 2, 3,2,6,7 );
      this.setQuad( 4, 2,0,4,6 );
      this.setQuad( 6, 1,3,7,5 );
      this.setQuad( 8, 5,7,6,4 );
      this.setQuad(10, 1,0,2,3 );

     
   },
   
   makeCubeWithSeams: function() {
		this.allocate(24, 12);
        // front
		this.setVert(0, -1, -1, 1);
		this.setVert(1, 1, -1, 1);
		this.setVert(2, -1, 1, 1);
		this.setVert(3, 1, 1, 1);
        
        this.setTextCoord(0, 0, 0);
        this.setTextCoord(1, 0.10, 0);
        this.setTextCoord(2, 0, 0.10);
        this.setTextCoord(3, 0.15, 0.10);  

		// right
		this.setVert(4, 1, -1, 1);
		this.setVert(5, 1, -1, -1);
		this.setVert(6, 1, 1, 1);
		this.setVert(7, 1, 1, -1);
        
        this.setTextCoord(4, 0.10, 0);        
        this.setTextCoord(5, 0, 0);
        this.setTextCoord(6, 0.10, 0.10);
        this.setTextCoord(7, 0, 0.10); 
		// back
		this.setVert(8, 1, -1, -1);
		this.setVert(9, -1, -1, -1);
        this.setVert(10, 1, 1, -1);
		this.setVert(11, -1, 1, -1);
        
        this.setTextCoord(8, 0.10, 0);
		this.setTextCoord(9, 0, 0);
        this.setTextCoord(10, 0.10, 0.10);
        this.setTextCoord(11, 0, 0.10);  
        
		// left
		this.setVert(12, -1, -1, -1);
		this.setVert(13, -1, -1, 1);
		this.setVert(14, -1, 1, -1); 
		this.setVert(15, -1, 1, 1);
        
        this.setTextCoord(12, 0, 0);
        this.setTextCoord(13, 0.10, 0);
        this.setTextCoord(14, 0, 0.10);
        this.setTextCoord(15, 0.10, 0.10);  
        
		// top
		this.setVert(16, -1, 1, 1);
		this.setVert(17, 1, 1, 1);
		this.setVert(18, -1, 1, -1);
		this.setVert(19, 1, 1, -1);
        
        this.setTextCoord(16, 0.5, 1);
        this.setTextCoord(17, 1, 1);
        this.setTextCoord(18, 0.5, 0);
        this.setTextCoord(19, 1, 0);  

		// bottom
		this.setVert(20, -1, -1, -1);
		this.setVert(21, 1, -1, -1);
		this.setVert(22, -1, -1, 1);
		this.setVert(23, 1, -1, 1);
        
        this.setTextCoord(20, 0, 0);
		this.setTextCoord(21, 0.5, 0);
        this.setTextCoord(22, 0, 0.5);
        this.setTextCoord(23, 0.5, 0.5); 
        
		// indices
		this.setQuad(0, 0,1,3,2);
		this.setQuad(2, 4,5,7,6);
		this.setQuad(4, 8,9,11,10);
		this.setQuad(6, 12,13,15,14);
		this.setQuad(8, 16,17,19,18);
		this.setQuad(10, 20,21,23,22);
        
        this.calculateTangQuad(0,1,3,2);
		this.calculateTangQuad(4,5,7,6);
		this.calculateTangQuad(8,9,11,10);
		this.calculateTangQuad(12,13,15,14);
		this.calculateTangQuad(16,17,19,18);
		this.calculateTangQuad(20,21,23,22);
		
		// normals
		for(var i=0;i<24;i++){
			ni = parseInt(i/4,10);
			nx = (ni === 1) ? 1 : (ni === 3) ? -1 : 0;
			ny = (ni === 4) ? 1 : (ni === 5) ? -1 : 0; 
			nz = (ni === 0) ? 1 : (ni === 2) ? -1 : 0; 
			this.setNorm(i, nx, ny, nz);
		}
        
    },

   makeCone: function( /*int*/ res ) {
      this.allocate( res*2, res*2 );
      
      for (var i=0; i<res; i++) {
         var a = 2 * Math.PI * i/res;
         var s = Math.sin(a);
         var c = Math.cos(a);
         this.setVert( i     ,  c,-1, s );
         this.setVert( i+res ,  0,+1, 0 );
         const k = 1.0 / Math.sqrt(1.25);
         this.setNorm( i     ,  c*k, 0.5*k, s*k );
         this.setNorm( i+res ,  c*k, 0.5*k, s*k );
      }
      
      for (var i=0; i<res; i++) {
         var j = (i+1)%res;
         this.setQuad( i*2,  i, j, j+res, i+res );
      }      
   },

   makeCylinder: function( /*int*/ res ) {
      this.allocate( res*2, res*2 );
      
      for (var i=0; i<res; i++) {
         var a = 2 * Math.PI * i/res;
         var s = Math.sin(a);
         var c = Math.cos(a);
         this.setVert( i     ,  c,-1, s );
         this.setVert( i+res ,  c,+1, s );
         this.setNorm( i     ,  c, 0, s );
         this.setNorm( i+res ,  c, 0, s );
      }
      
      for (var i=0; i<res; i++) {
         var j = (i+1)%res;
         this.setQuad( i*2,  i, j, j+res, i+res );
      }      
   },

    makeTorus: function( /*int*/ res ) {
      this.allocate( res*4, res*8 );
      var width = 0.003;
      for (var i=0; i<res; i++) {
         var a = 2 * Math.PI * i/res;
         var s = Math.sin(a);
         var c = Math.cos(a);
         this.setVert( i     ,  c, width, s );
         this.setVert( i+res ,  c*(1-width), width, s*(1-width) );
         this.setVert( i+2*res ,  c, -width, s );
         this.setVert( i+3*res ,  c*(1-width), -width, s*(1-width) );
         
         this.setNorm( i     ,  -1, 1, 0 );
         this.setNorm( i+res ,  1, 1, 0);
         this.setNorm( i+2*res ,  -1, -1, 0 );
         this.setNorm( i+3*res ,  1, -1, 0);
      }
      
      for (var i=0; i<res; i++) {
         var j = (i+1)%res;
         this.setQuad( i*6,    i, j, j+res, i+res );
         this.setQuad( i*6+2,  i+2*res, j+2*res, j+3*res, i+3*res );
         this.setQuad( i*6+4,  i, j, j+2*res, i+2*res );
         this.setQuad( i*6+4,  i, j, j+2*res, i+2*res );


      }      
   },

    calculateTangQuad: function(v1, v2, v3, v4){
        this.calculateTangTri( v1, v2, v4 );
        this.calculateTangTri( v4, v2, v3 );
    },
    
    calculateTangTri: function(v1, v2, v3){
        this.calculateTang( v1, v2, v3 );
        this.calculateTang( v2, v3, v1 );
        this.calculateTang( v3, v2, v1 );
    },
   
    calculateTang: function(i0, i1, i2){

        var v0 = vec3(this.verts[ i0*11 ], this.verts[ i0*11+1], this.verts[ i0*11+2]);
        var v1 = vec3(this.verts[ i1*11 ], this.verts[ i1*11+1], this.verts[ i1*11+2]);
        var v2 = vec3(this.verts[ i2*11 ], this.verts[ i2*11+1], this.verts[ i2*11+2]);

        var Edge1 = subtract( v1, v0 );
        var Edge2 = subtract(v2, v0);

        var DeltaU1 = this.verts[i1*11+6] - this.verts[ i0*11 +6];
        var DeltaV1 = this.verts[i1*11+7] - this.verts[ i0*11 +7];
        var DeltaU2 = this.verts[i2*11+6] - this.verts[ i0*11 +6];
        var DeltaV2 = this.verts[i2*11+7] - this.verts[ i0*11 +7];

        var f = 1.0 / (DeltaU1 * DeltaV2 - DeltaU2 * DeltaV1);
        
        var Tangent_x = f * (DeltaV2 * Edge1[0] - DeltaV1 * Edge2[0]);
        var Tangent_y = f * (DeltaV2 * Edge1[1] - DeltaV1 * Edge2[1]);
        var Tangent_z = f * (DeltaV2 * Edge1[2] - DeltaV1 * Edge2[2]);

        this.setTang(i0, Tangent_x,Tangent_y,Tangent_z);       
   },
   
   allocate: function( nverts, ntris ) {
      this.verts = new Float32Array( nverts*11 ); 
      this.tris = new Uint16Array( ntris*3 );
   },

   setTri: function( i, va, vb, vc ){
      this.tris[ i*3 +0 ] = va;
      this.tris[ i*3 +1 ] = vb;
      this.tris[ i*3 +2 ] = vc;
   },
   
   setTextCoord: function( i, x, y ){
      this.verts[ i*11+6 ] = x;
      this.verts[ i*11+7 ] = y;
   },
   
   setQuad: function( i, va, vb, vc, vd){
      // diagonal split!
      this.setTri( i+0, va, vb, vd );
      this.setTri( i+1, vd, vb, vc );
   },
   
   setVert: function( i, x,y,z ){
      this.verts[ i*11+0 ] = x;
      this.verts[ i*11+1 ] = y;
      this.verts[ i*11+2 ] = z;
   },
   
   setNorm: function( i, nx,ny,nz ){
      this.verts[ i*11+3 ] = nx;
      this.verts[ i*11+4 ] = ny;
      this.verts[ i*11+5 ] = nz;
   },
   
   setTang: function( i, tx,ty,tz ){
      this.verts[ i*11+8 ] = tx;
      this.verts[ i*11+9 ] = ty;
      this.verts[ i*11+10 ] = tz;
   },
   
   
}