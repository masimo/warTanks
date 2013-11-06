var Game = function($scope) {

    "use strict"

    var self = this;

    //Index of player
    var clientIndex = 0;

    // Clients and bots
    self.objCollection = [];
    self.botStart = [20, 282, 575];

    self.isMoving = false;

    self.botCount = 20;

    //Random angles
    self.rdAngArr = [0, 90, 180, 270];

    //default changes
    self.defChang = {
        _id: null,
        left: null,
        top: null,
        angle: null,
        playMode: false,
        isNew: true,
        isCrashed: null
    };

    // Cnvas 
    self.canvas = new fabric.Canvas('playRoomField');
    self.canvas2 = new fabric.Canvas('bulletsField');

    var CANVAS_WIDTH = self.canvas.getWidth(),
        CANVAS_HEIGHT = self.canvas.getHeight();

    // Controls parametrs
    self.clientCtrl = {
        type: 1,
        speed: 2,
        appearMode: true,
        isMoving: false,
        isShoot: false,
        angle: 0,
        score: 0
    };

    self.botCtrl = {
        type: 2,
        speed: 1,
        appearMode: true,
        isMoving: true,
        isShoot: false,
        angle: 180,
        score: 0
    };

    self.bulletCtrl = {
        type: 3,
        speed: 10,
        isMoving: true,
        angle: 180
    };

    //User interaction 
    window.onkeyup = function(e) {
        var key = e.keyCode;

        var curentBot = self.objCollection[clientIndex].newAttribute;

        if (key >= 37 && key <= 40) {

            // Switch move flag
            curentBot.isMoving = false;
        }
    };

    //User interaction 
    window.onkeydown = function(e) {
        var key = e.keyCode;

        var curentBot = self.objCollection[clientIndex].newAttribute;

        //Check if it move is moving
        if (curentBot.isMoving) return false;

        //Check if arrow pressed
        if (key === 37) {

            curentBot.isMoving = true;
            curentBot.angle = 270;
        } else if (key === 38) {

            curentBot.isMoving = true;
            curentBot.angle = 0;
        } else if (key === 39) {

            curentBot.isMoving = true;
            curentBot.angle = 90;
        } else if (key === 40) {

            curentBot.isMoving = true;
            curentBot.angle = 180;
        };

        if (key === 32 && !curentBot.isShoot) {

            curentBot.isShoot = true;
        }
    };

    /*
     *  Move client
     */
    self.update = function() {

        self.everyUnit(function(curentBot, key) {

            //does not active unit
            if (!curentBot.playMode && !curentBot.isCrashed) return false;

            if (curentBot.newAttribute.isShoot) {

                if (curentBot.blt === null) {
                    self.shoot(curentBot);
                };

                self.updateBullet(curentBot);
            };

            //If bot destroed, then skeep
            if (curentBot.isCrashed) return false;

            //If bot stoped, then skeep it
            if (!curentBot.newAttribute.isMoving) return false;

            var angle = curentBot.angle = curentBot.newAttribute.angle,
                left = curentBot.left,
                top = curentBot.top,
                topOld = top,
                leftOld = left;

            //Bots behave
            if (curentBot.newAttribute.type === 2) {

                //if true change direction
                if (0.01 > Math.random()) {
                    angle = curentBot.newAttribute.angle = self.rdAng();
                }

                //if true then shoot!
                if (0.01 > Math.random()) {
                    curentBot.newAttribute.isShoot = true;
                }
            };

            //Check the direction
            if (angle === 0 || angle === 180) {

                //Calculate top position of obj
                top = angle < 180 ? top - curentBot.newAttribute.speed : top + curentBot.newAttribute.speed;

                var collide = self.checkCollision(left, top, curentBot);


                if (!collide && curentBot.newAttribute.appearMode) {
                    curentBot.newAttribute.appearMode = false;
                };

                //Check also if it just apper on map
                if (collide.type === 2 && !curentBot.newAttribute.appearMode ||
                    collide.type === 1) {

                    top = topOld;

                    //If  this bot change the ange
                    if (curentBot.newAttribute.type === 2) {
                        curentBot.newAttribute.angle = self.rdAng(angle);
                    };
                };

            } else {

                //Calculate left position of obj
                left = angle < 180 ? left + curentBot.newAttribute.speed : left - curentBot.newAttribute.speed;

                var collide = self.checkCollision(left, top, curentBot);

                if (!collide && curentBot.newAttribute.appearMode) {
                    curentBot.newAttribute.appearMode = false;
                };

                //Check also if it just apper on map
                if (collide.type === 2 && !curentBot.newAttribute.appearMode ||
                    collide.type === 1) {

                    left = leftOld;

                    //If  this bot change the ange
                    if (curentBot.newAttribute.type === 2) {
                        curentBot.newAttribute.angle = self.rdAng(angle);
                    };
                };

            };

            //Update unit position
            curentBot.set({
                left: left,
                top: top,
                angle: curentBot.newAttribute.angle
            });
        });

    };

    self.updateBullet = function(curentBot) {

        var angle = curentBot.blt.angle,
            left = curentBot.blt.left,
            top = curentBot.blt.top;


        //Check the direction
        if (angle === 0 || angle === 180) {

            //Calculate top position of obj
            top = angle < 180 ? top - curentBot.blt.additionAttr.speed : top + curentBot.blt.additionAttr.speed;

            if (self.checkTarget(left, top, curentBot)) {

                curentBot.newAttribute.score++;
            };

        } else {

            //Calculate left position of obj
            left = angle < 180 ? left + curentBot.blt.additionAttr.speed : left - curentBot.blt.additionAttr.speed;

            if (self.checkTarget(left, top, curentBot)) {

                curentBot.newAttribute.score++;
            };

        };

        //if bullet was deleted 
        if (curentBot.blt !== null) {

            curentBot.blt.set({
                left: left,
                top: top
            });

        };



    };

    //Check for collision
    self.checkCollision = function(_x2, _y2, curentBot) {

        var collision = false;


        var _size2 = curentBot.getHeight() / 2;

        if (_y2 + _size2 >= CANVAS_HEIGHT || 0 > _y2 - _size2 ||
            _x2 + _size2 >= CANVAS_WIDTH || 0 > _x2 - _size2) {

            return {
                type: 1
            };
        }

        self.everyUnit(function(value, index) {

            if (curentBot === value || !value.playMode) {
                return false
            };

            //Get dimentions of obj
            var x1 = value.left,
                y1 = value.top,
                size1 = value.height / 2;

            //Distanse
            var dist = size1 + _size2 - 4;

            var xDist = x1 - _x2;
            var yDist = y1 - _y2;

            var hyp = Math.sqrt((xDist * xDist) + (yDist * yDist));

            if (hyp < dist) {

                collision = {
                    type: 2
                };
            };
        });

        return collision;
    };

    self.shoot = function(curentBot) {


        var left = curentBot.left,
            top = curentBot.top,
            angle = curentBot.newAttribute.angle;


        var blt = new fabric.Rect({
            left: left,
            top: top,
            width: 6,
            height: 6,
            angle: angle,
            fill: 'red',
            selectable: false
        });


        //add additional attribute to object
        blt.toObject = (function(toObject) {
            return function() {
                return fabric.util.object.extend(toObject.call(this), {
                    additionAttr: this.additionAttr
                });
            };
        })(blt.toObject);

        blt.additionAttr = $.extend({}, self.bulletCtrl);

        self.canvas2.add(blt);

        curentBot.blt = blt;

    };


    self.checkTarget = function(_x2, _y2, curentBot) {


        var _size2 = curentBot.blt.height / 2;

        if (0 > _y2 - _size2 || _y2 + _size2 >= CANVAS_HEIGHT ||
            0 > _x2 - _size2 || _x2 + _size2 >= CANVAS_WIDTH) {

            /*
             * Out of area
             */
            self.canvas2.remove(curentBot.blt);
            curentBot.blt = null;
            curentBot.newAttribute.isShoot = false;

            return false

        }

        self.everyUnit(function(unit, index) {

            if (unit.newAttribute.type === curentBot.newAttribute.type || unit.isCrashed) {
                return false;
            };

            //Get dimentions of obj
            var x1 = unit.left,
                y1 = unit.top,
                size1 = unit.height / 2;

            //Distanse
            var dist = size1 + _size2 - 4;

            var xDist = x1 - _x2;
            var yDist = y1 - _y2;

            var hyp = Math.sqrt((xDist * xDist) + (yDist * yDist));

            if (hyp < dist) {

                self.explode(unit);

                if (curentBot.newAttribute.type == 1) {
                    $scope.score = curentBot.newAttribute.score += 1;
                }

                self.canvas2.remove(curentBot.blt);
                curentBot.blt = null;
                curentBot.newAttribute.isShoot = false;

                return true;

            };

        });

        return false;

    };

    //this will explode unit
    self.explode = function(unit) {

        //change bg of tank
        unit.fill.offsetX = -36;

        //switch flag to check if this bot crashed
        unit.isCrashed = true;

        //Delete object from canvas with some delay
        var timer = setTimeout(function() {

            self.canvas.remove(unit);

        }, 500);

    };

    self.getCanvas = function() {
        return this.canvas;
    };
    self.getCanvas2 = function() {
        return this.canvas2;
    };

    self.getBotCtrl = function() {
        return self.botCtrl;
    };

    self.getClientCtrl = function() {
        return self.clientCtrl;
    };

    self.setCollection = function(obj) {
        this.objCollection = obj;
    };

    self.getId = function(callBack) {

        var _id = Math.random().toString(36).substring(2);

        for (var prop in self.objCollection) {
            for (var i = 0, len = self.objCollection[prop].length; i < len; i++) {

                if (_id == self.objCollection[prop][i]._id) {
                    arguments.callee();
                };

            };
        };

        return _id;
    };

    self.getNewUnitId = function() {

        var obj = self.canvas.getObjects();

        var _id = Math.random().toString(36).substring(2);

        for (var i = obj.length - 1; i >= 0; i--) {

            //We need unic id to compare with new id
            var unicId = obj[i]._id.split('_').pop();

            if (_id === unicId) {
                arguments.callee();
            };


        };

        return _id;
    };

    self.everyUnit = function(callBack) {

        _(self.objCollection).forEach(function(value, index) {
            callBack(value, index);
        });
    }

    self.removeThisUnit = function(removeThis) {

        removeThis.fill.offsetX = -36;

        setTimeout(function() {
            self.canvas.remove(removeThis);
        }, 500);
    };

    self.updateThisUnit = function(destination, updateThis) {
        $.each(self.canvas.getObjects(), function(key, value) {
            if (updateThis._id === value._id) {

                var temporObj = self.extendReqiredKeys(destination, updateThis);
                $.extend(true, value, temporObj);
            };
        });
    };

    self.gameLoader = function(callBack) {
        var isLoad = true;

        setTimeout(function() {

            self.everyUnit(function(unit) {

                if (typeof unit.fill !== 'object') {
                    console.log('Das not loaded');

                    //switch thumbler
                    isLoad = false;
                };
            });

            if (isLoad) {

                //Go game!
                callBack(self.objCollection);
            };
        }, 500);
    };

    self.addThisUnit = function(newUnit) {

        newUnit.isNew = false;
        newUnit.isReady = true;

        var unit = new fabric.Rect(newUnit);

        self.objCollection.push(unit);

        //Add new tank to canvas and render it
        self.canvas.add(unit);

        //set unit visible for engine
        setTimeout(function() {
            unit.playMode = true;
        }, 500);

    };

    self.prepareThisUnit = function(unit) {

        unit.isNew = false;
        unit.isReady = true;

        //Add new tank to canvas and render it
        self.canvas.add(unit);

        //set unit visible for engine
        setTimeout(function() {
            unit.playMode = true;
        }, 500);

    };


    self.getAllChanges = function(callBack) {

        var allChanges = [],
            newUnit = {};

        //through every unit
        self.everyUnit(function(unit) {


            if (unit.playMode) {

                var defChang = $.extend({}, self.defChang);

                //get all required keys and add it to Array
                allChanges.push(self.extendReqiredKeys(defChang, unit));
            } else if (unit.isNew && typeof unit.fill === 'object') {

                /* We need to make a copy of object
                 * and send it to every client
                 */
                newUnit = $.extend({}, unit);

                allChanges.push(newUnit);
                self.prepareThisUnit(unit)
            }

            if (unit.playMode && unit.isCrashed) {
                unit.playMode = false;
            }

        });

        callBack(allChanges);
    };

    self.checkForNewUnits = function() {

        self.everyUnit(function(unit) {

            if (unit.isNew && typeof unit.fill === 'object') {
                unit.isNew = false;
                unit.isReady = true;

                self.canvas.add(unit);

                //set unit visible for engine
                setTimeout(function() {
                    unit.playMode = true;
                }, 500);
            };
        });
    };

    self.extendReqiredKeys = function(destination, source) {

        for (var property in source) {
            if (source[property] && source[property].constructor &&
                source[property].constructor === Object && property in destination) {
                destination[property] = destination[property] || {};
                self.extendReqiredKeys(destination[property], source[property]);

            } else if (property in destination) {
                destination[property] = source[property];
            }
        }
        return destination;
    };

    self.setClientIndex = function(index) {
        clientIndex = index;
    }

    self.getBltCtrl = function() {
        return $.extend({}, self.bulletCtrl);
    };

    self.rdAng = function(not) {

        var self = this;

        // Get array of posible angles
        var arr = self.rdAngArr.slice(0);

        // Cut undesirable angle
        if (not != undefined) {

            for (var i in arr) {
                if (arr[i] === not) {
                    arr.splice(i, 1);
                }
            }
        };

        //Return random angle
        return arr.sort(function() {
            return Math.random() > 0.5
        })[0];
    };


}