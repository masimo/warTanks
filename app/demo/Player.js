function Player() {
	this.rotation = Math.PI;
	this.loc = new Location(20, 20); // Location is the centre

	this.draw = FiltoidDrawable;
	this.update = playerUpdate;

	this.img = new Image();
	this.img.src = "./SpaceFighter.png";

	this.size = 20; // The radius of the circle of collision around the craft
	this.collision = FiltoidCollisionCheck;
	this.SPEED = 5;
}

function playerUpdate() {
	// Do any animation stuff
	if (isKeyPressed('A')) {
		this.rotation -= 0.05;
	}
	if (isKeyPressed('D')) {
		this.rotation += 0.05;
	}
	var PI_2 = 2 * Math.PI;
	if (this.rotation > PI_2)
		this.rotation -= PI_2;
	if (this.rotation < 0)
		this.rotation += PI_2;

	if (isKeyPressed('W')) {
		var newLoc = MoveForward(this.rotation, this.SPEED);
		this.loc.x += newLoc.x;
		this.loc.y -= newLoc.y; // -ve because y is inverted
	}
	if (isKeyPressed('S')) {
		var newLoc = MoveForward(this.rotation + Math.PI, this.SPEED);
		this.loc.x += newLoc.x;
		this.loc.y -= newLoc.y; // -ve because y is inverted
	}

	// Bounding - don't let it escape the window - take into account
	// the fact that this.loc is the centre of the image
	if (this.loc.x < this.img.width / 2)
		this.loc.x = this.img.width / 2;
	if (this.loc.x > 600 - this.img.width / 2)
		this.loc.x = 600 - this.img.width / 2;
	if (this.loc.y > 400 - this.img.height / 2)
		this.loc.y = 400 - this.img.height / 2;
	if (this.loc.y < this.img.height / 2)
		this.loc.y = this.img.height / 2;


	if (this.collision(_asteroid) || this.collision(_asteroid2)) {
		this.loc.x = 20;
		this.loc.y = 20;
		this.rotation = Math.PI;
		removeAllKeysFromArray();
	}
}