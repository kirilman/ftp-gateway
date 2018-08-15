var Client = require('ftp');
var fs = require('fs');
var parseString = require('xml2js').parseString;

function getListOfFiles(){
  c.list(function(err, list){
    if (err) throw err;
    for (i in list){
      console.log(list[i].name)
      //console.log(list[i])
    }
    c.end();
  });
}


var c = new Client();

// Список файлов на FTP
//c.on('ready',getListOfFiles);

var config = { host: '127.0.0.1',
                 user: 'kirilman',
                 password: '606613'};
c.connect(config);

//Скачивание файла с сервера
c.on('ready', function() {
  c.get('file', function(err, stream) {
    if (err) throw err;
    stream.once('close', function() { c.end(); });
    stream.pipe(fs.createWriteStream('file.local-copy'));
  });
})

var readData = ''; 
var readerStream = fs.createReadStream('file for ftp');

readerStream.setEncoding('UTF8');

readerStream.on('data', function (chunk) {
    readData += chunk; 
});

readerStream.on('end', function () {
    console.log(readData); 
});

//Закачка файла на сервер
c.on('ready', function() {
  c.put('file for ftp', 'file for ftp.copy', function(err) {
    if (err) throw err;
    c.end();
  });
});
// console.log(require.cache)


var evt = require('events');
var emt = new evt();
var products = [];

fs.readFile('/home/kirilman/ftp/products_2.xml','utf-8',function(err,data){
  if (err) throw err;
  parseString(data, function(err, result){
    if (err) throw err;
    console.dir(JSON.stringify(result));
    console.dir(result);
    products = result.catalog.product;
    emt.emit('parse');
    // console.log(result.business.employee[1].lastname)
  });
});

emt.on('parse',function(){
  products.forEach(function(a){
    console.log(a.name,a.price);
  })
})
// parseString(xml, function (err, result) {
//     console.dir(result);
// });

c.on('ready',function() {
  c.pwd(function(err,path) {
    if (err) throw err;
    console.log(path);
    console.log('a');
  });
  
});

c.on('ready',function(){
  c.cwd('Qt',function(err,currentDir){
    if (err) throw err;
    console.log("CurrentDir",currentDir);
  });
});
c.on('ready',function() {
  c.pwd(function(err,path) {
    if (err) throw err;
    console.log(path);
    console.log('a');
  });
  
});




