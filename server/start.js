//var PORT = process.argv[2] && parseInt(process.argv[2], 10) || 3000;
var PORT = process.env.PORT || 3000;
var STATIC_DIR = __dirname + '/../app';

require('./index').start(PORT, STATIC_DIR);
