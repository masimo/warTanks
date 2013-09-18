/* Filtoid's Helpful Javascript Functions - FiltoidUtils.js

This is hopefully some helpful javascript functions for misc purposes.

Please feel free to do whatever the hell you like with this code. It is free as in beer
and free as in speech. If you use this code you do so at your own risk and I accept no responsibility
whatsoever for it. 

Thanks and have fun at LD25 :)
*/

/*
A FiltoidDrawable has a var called rotation and a Location() called loc.
*/
function FiltoidDrawable(ctx){
	// We need to move the drawing context so the center of the image will be 0,0
	ctx.translate(this.loc.x,this.loc.y);
	// Do the rotation
	ctx.rotate(this.rotation);
	// We need to draw the image center at  0,0
	ctx.drawImage(this.img,-this.img.width/2,-this.img.height/2);
	
	// Undo the transformations we have applied so the next thing will draw in the right place
	ctx.rotate((Math.PI*2)-this.rotation);
	ctx.translate(-this.loc.x,-this.loc.y);
}

function FiltoidCollisionCheck(obj){
	// If the two objects are less the sum of their collision radii apart then they have collided
	// Note that one obj is obj (with a loc and a size) and the other is this.
	// Returns true if the objects are touching
	var dist = this.size + obj.size; // The distance they must be apart to be not touching
	if(obj.loc.x-this.loc.x>dist || obj.loc.x-this.loc.x<-dist)
		return false; // Too far apart in x plane
	if(obj.loc.y-this.loc.y>dist || obj.loc.y-this.loc.y<-dist)
		return false; // Too far apart in y plane
	
	var xDist = Math.abs(obj.loc.x-this.loc.x);
	var yDist = Math.abs(obj.loc.y-this.loc.y);
	
	var hyp = Math.sqrt((xDist*xDist)+(yDist*yDist));

	if(hyp<dist)
		return true;

	return false;
	
}