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
    var fileCount;
    var closeCount=0;
    config = readConfig();
    var ftpconfig = { 
                    host: config.ftpconfig.host,
                    user: config.ftpconfig.user,
                    password: config.ftpconfig.password
    };
    c.connect(ftpconfig);
    //xml
    
    c.status((err,status)=>{
        if (err) throw err;
        console.log('status',status);
    });

    var parseString = require('xml2js').parseString;
    //Копирование файла на локальный диск
    emt.on('cwdComplete', function(){
        c.list(function(err, list){
            if (err) throw err;
            c.pwd(function(err,path) {
                if (err) throw err;
                console.log("Current path:",path);
                fileCount = list.length;
                list.forEach(function(item,index){
                    c.get(item.name, function(err, stream) {
                        if (err) throw err;
                        stream.once('close', function() { 
                                // c.end(); 
                                closeCount++;
                                emt.emit('FileComplite', item.name);
                                console.log('FileComplite',item.name)
                            });
                        stream.pipe(fs.createWriteStream('./XML copy/' + 'local_'+item.name));
                        // circle();
                    });
                    console.log('index',index);

                    
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
                    console.log('Parsing file')
                    // console.log(result);
                    try{
                        products = result.catalog.product;      //? 
                        console.log('ObjectComplite',fileName)

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
        console.log(fileName);
        console.log(p);
        
        products.forEach(function(item,i){
            product = {
                id: item.id,
                name: item.name,
                amount: item.amount,
                price: item.price,
            }
            // console.log('Product for update',product)
            // dbclient.insertProduct(product);
             dbclient.updateProduct(product);
             if (i==products.length - 1){
                 console.log(i, products.length)
                 emt.emit('updateDBComplite')
             }
        ;});
        
        //Удаление файла с FTP
        //c.delete(fileName, err => {if(err) throw err})
        emt.on('updateDBComplite',function(){
            fileCount--;
            
            console.log('After circle',fileCount);
            if (fileCount==0){
                dbclient.connection.end();
                c.end();
                console.log('fileCount',fileCount);
                console.log('closeCount',closeCount);
                //Удаление локальных файлов
                fs.readdir('./XML copy',(err,files)=>{
                    files.forEach( file => {
                        if (file.indexOf('.xml')>0){
                            fs.unlink('./XML copy/'+file,err=> {if (err) throw err})
                        }
                    })
                })
               
            }
            console.log('a',fileCount);
        })

    });

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
c.on('close',()=>{
    console.log('Соединение с ftp успешно закрыто')
})
module.exports.updateProduct = run;
