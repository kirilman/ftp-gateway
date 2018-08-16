var Client = require('ftp');
var fs = require('fs')
var evt = require('events');

var emt = new evt.EventEmitter();
var c = new Client();

var ftpconfig = { 
    host: '127.0.0.1',
    user: 'kirilman',
    password: '606613',
};
c.status((err,status)=>{
    if (err) throw err;
    console.log('status',status);
});

// c.connect(ftpconfig);


// c.on('ready', function() {
//   c.get('foo.txt', function(err, stream) {
//     if (err) throw err;
//     stream.once('close', function() { c.end(); });
//     stream.pipe(fs.createWriteStream('foo1.local-copy.txt'));
//   });
// });
// c.on('ready', function() {
//     c.get('foo1.txt', function(err, stream) {
//       if (err) throw err;
//     //   stream.once('close', function() { c.end(); });
//       stream.pipe(fs.createWriteStream('foo11.local-copy.txt'));
//     });
//   });
// // connect to localhost:21 as anonymous
// c.on('ready', function(){
//     c.status((err,status)=>{
//         if (err) throw err;
//         console.log('status',status);
//     });
// })
// c.on('end',()=>{
//     console.log('Соединение с ftp успешно закрыто')
//     c.status((err,status)=>{
//         if (err) throw err;
//         console.log('status',status);
//     });
// })
// // dbclient.connection.end();
//         c.status((err,status)=>{
//             if (err) throw err;
//             console.log('status',status);
//         });

// c.end()