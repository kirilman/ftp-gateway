var Client = require('ftp');
var fs = require('fs')
var evt = require('events');

var emt = new evt.EventEmitter();
var c = new Client();

var config = { host: '127.0.0.1',
                 user: 'kirilman',
                 password: '606613'};

c.connect(config);

//xml
var parseString = require('xml2js').parseString;

// let promise = new Promise( (resolve, reject ) => {
//     c.on('ready',function(){
//         c.cwd('ftp/',function(err,currentDir){
//             if (err) throw err;
//             c.pwd(function(err,path) {
//                 if (err) throw err;
//                 console.log("Current dir:",path);
//             });
//             console.log('Блок сwdre');
//             // resolve('are');
//         });
//     });
// }).then( a => {
//     console.log('re');
//     }
// )
// // .catch(error => {
// //     console.log('re'); // Error: Not Found
// //   });



//Парсинг локальных файлов

emt.on('TestComplite', function(filename){
    console.log('Список локальных файлов');
    fs.readdirSync('XML copy', (err,files) => {
        files.forEach(function(file){
            console.log('current file',file);
            console.log("XML copy/"+file);
            // fs.readFile('XML copy/'+file,'utf-8', function(err,data){
            //     if (err) throw error;
            //     parseString(data,function(err,result){
            //         console.dir(result.catalog);
            //     });
            // });

            fs.readFile('XML copy/'+ file,'utf-8',function(err,data){
                if (err) throw error;
                parseString(data, function(err, result){
                    console.dir(result.catalog.product);
                });
            });
        });
    });

    // fs.readFile('XML copy/local_products_1.xml','utf-8',function(err,data){
    //     if (err) throw error;
    //     parseString(data, function(err, result){
    //         console.dir(result.catalog);
    //     });
    // });
});


c.on('ready',function(){
    c.cwd('ftp/',function(err,currentDir){
        if (err) throw err;
        c.pwd(function(err,path) {
            if (err) throw err;
            console.log("Current dir:",path);
        });
        console.log('Блок сwd')
    });

    //Какая последовательность выполнения кода?

    console.log('re');
    c.list(function(err, list){
        if (err) throw err;

        c.pwd(function(err,path) {
            if (err) throw err;
            console.log("Current path:",path);
            console.log('pwd complete into');

            list.forEach(function(item){
                console.log(item.name);
                c.get(item.name, function(err, stream) {
                    if (err) throw err;
                    stream.once('close', function() { c.end(); });
                    stream.pipe(fs.createWriteStream('XML copy/'+ 'local_'+item.name));
                    console.log('Имя',item.name);
                    emt.emit('TestComplite', item.name)
                });
            });
            
            console.log('pwd complete out');

            emt.emit('downloadComplete',)
            console.log('emit');
        });
        
    });
});




// fs.readFile(list[0],'utf-8',function(err,data){
//     if (err) throw err;
//     parseString(data, function(err, result){
//     if (err) throw err;
//     console.dir(JSON.stringify(result));
//     console.dir(result);
//     });
// });
console.log('Просто вывод');