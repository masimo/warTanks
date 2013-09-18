function Asteroid(_x,_y){

	this.img = new Image();
	this.img.src = "./Asteroid.png";

	this.loc = new Location(_x,_y);
	
	this.draw = FiltoidDrawable;
	this.update = astUpdate;
	
	this.rotation = 0;
	this.size = 10; // The size of the collision circle around the object
}

function astUpdate(){
	// Do any animation etc
}

