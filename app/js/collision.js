 var collision = {

   colisionObj: {},

   canvas: null,

   updateCollection: function(newObj, canvas) {

     this.colisionObj = this.extending(this.colisionObj, newObj);


     if (canvas) {
       this.canvas = canvas;
     };


   },

   extending: function(destination, source) {

     for (var property in source)
       destination[property] = source[property];
     return destination;
   },

   //Check for collision
   checkCollision: function(_x2, _y2, activeBot) {
     var canvHeight = 600;
     var canvWidth = 600;

     var collision = false;
     var self = this;


     var _size2 = activeBot.getHeight() / 2;


     if (_y2 + _size2 >= canvHeight || 0 > _y2 - _size2 ||
       _x2 + _size2 >= canvWidth || 0 > _x2 - _size2) {

       collision = true;
     }

     for (var prop in this.colisionObj) {



       this.colisionObj[prop].forEach(function(value) {


         if (activeBot === value.bot) {
           return false
         };

         //Get dimentions of obj
         var x1 = value.bot.getLeft(),
           y1 = value.bot.getTop(),
           size1 = value.bot.getHeight() / 2;

         //Distanse
         var dist = size1 + _size2 - 4;

         var xDist = x1 - _x2;
         var yDist = y1 - _y2;

         var hyp = Math.sqrt((xDist * xDist) + (yDist * yDist));

         if (hyp < dist) {
           collision = true;
           console.log('bum');
         }

       });

     }

     return collision;

   }
 };