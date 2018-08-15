var Client = require('ftp');
var fs = require('fs')
var evt = require('events');

var emt = new evt.EventEmitter();
var c = new Client();
const dbclient = require('./dbclient');

function circle(){
    var constlen = 20000;
    for (i=0;i<constlen; i++){
        var b = i*i;
        for (j=0; j<constlen/2;j++){
            b = i*j;

        }
    }
    console.log('circle')
}

function readConfig(){
    config = JSON.parse(fs.readFileSync('config.json','utf8'));
    console.log(config);
    return config;
}


function run(){

    config = readConfig();

    var ftpconfig = { 
                    host: config.ftpconfig.host,
                    user: config.ftpconfig.user,
                    password: config.ftpconfig.password
    };

    c.connect(ftpconfig);

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

    //Копирование файла на локальный диск
    emt.on('cwdComplete', function(){
        c.list(function(err, list){
            if (err) throw err;
            c.pwd(function(err,path) {
                if (err) throw err;
                console.log("Current path:",path);
                list.forEach(function(item){
                    c.get(item.name, function(err, stream) {
                        if (err) throw err;
                        stream.once('close', function() { c.end(); emt.emit('FileComplite', item.name);});
                        stream.pipe(fs.createWriteStream('./XML copy/' + 'local_'+item.name));
                        // circle();
                    });
                    
                });
            });
            
        });
    });

    //Парсинг локальных файлов
    emt.on('FileComplite', function(fileName){
            console.log('File for reading ',fileName);
            fs.readFile('XML copy/'+'local_' + fileName,'utf-8',function(err,data){
                if (err){ 
                    console.log(data)
                    throw err
                };
                // var data = fs.readFileSync("./XML copy/"+"local_" + fileName, "utf8");
                if (data.length == 0){
                     console.log('Error: in readFile, ' + fileName + ' not read')
                }
                console.log(data.slice(0,100));
                parseString(data, function(err, result){
                    if (err) throw err;
                    var products = [];
                    console.log('Paring file')
                    // console.log(result);
                    try{
                        products = result.catalog.product;      //? 
                        emt.emit('ObjectComplite',products, fileName);
                    }
                    catch(error){
                        console.log('Error result = NULL\n');
                        console.log('Reading data:',data);
                        console.log('Parsing result:',result);
                        throw error;
                    }
                });
             });
    });

    //Вставка в БД
    emt.on('ObjectComplite', function(products, fileName){
        //console.log('prod',products);
        var p = products[0];
        products.forEach(function(item){
            product = {
                id: item.id,
                name: item.name,
                amount: item.amount,
                price: item.price,
            }
            // dbclient.insertProduct(product);

            dbclient.updateProduct(product);
        });
        //Удаление файла с FTP
        //c.delete(fileName, err => {if(err) throw err})

    });

        // fs.readFile('XML copy/local_products_1.xml','utf-8',function(err,data){
        //     if (err) throw error;
        //     parseString(data, function(err, result){
        //         console.dir(result.catalog);
        //     });
        // });


    //Переход в папку ftp
    c.on('ready',function(){
        c.cwd('ftp/',function(err,currentDir){
            if (err) throw err;
            c.pwd(function(err,path) {
                if (err) throw err;
                console.log("Current dir:",path);
                emt.emit('cwdComplete')
            });
        });
    });
};

module.exports.updateProduct = run;


// fs.readFile(list[0],'utf-8',function(err,data){
//     if (err) throw err;
//     parseString(data, function(err, result){
//     if (err) throw err;
//     console.dir(JSON.stringify(result));
//     console.dir(result);
//     });
// });
