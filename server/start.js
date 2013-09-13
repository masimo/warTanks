var PORT = process.argv[2] && parseInt(process.argv[2], 10) || 3000;
var STATIC_DIR = __dirname + '/../app';
var DATA_FILE_NORMAL = __dirname + '/data/data.json';
var DATA_FILE_LARGE = __dirname + '/data/data_l.json';

require('./index').start(PORT, STATIC_DIR);
