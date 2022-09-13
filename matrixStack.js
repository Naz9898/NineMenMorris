
/* the MODEL stack of matrices */
var model = {

   // field: a dynamic vector of matrices
   data: [],
 
   init: function() {
     this.data.push( identityMatrix() );
   },
   
   // methods  
   top: function() {
     return this.data[ this.data.length-1 ];
   },
   
   push: function() {
     var tmp = this.top();     
     this.data.push( tmp ); 
   },
   
   pop: function() {
     if (this.data.length>0) this.data.pop();
   },
   
   // functions that add a new transformation at TOP
   scale: function( sx, sy, sz ) {
        if (typeof sy == 'undefined' ) sy = sx;
        if (typeof sz == 'undefined' ) sz = sx;
        var m = scalingMatrix(sx,sy,sz);
        this.data[ this.data.length-1 ] = multMatrix( this.data[ this.data.length-1 ], m );
   },

   translate: function( tx, ty, tz ) {
        var m = translationMatrix( tx,ty,tz ); 
        this.data[ this.data.length-1 ] = multMatrix( this.data[ this.data.length-1 ], m );
   },
   
   mult: function(m){
		this.data[ this.data.length-1 ] = multMatrix( this.data[ this.data.length-1 ], m );
   }
}

