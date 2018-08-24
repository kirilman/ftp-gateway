
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

var evt = require('events');
var fs = require('fs');
var datatime = require('node-datetime')



function run(){
    
    // var logStream = fs.createWriteStream('log_file.txt',{encoding:'utf-8',flags:'a'})
    // fs.readFile('log_file.txt',{encoding:'utf-8'},(err,data) => {
    //     if (err) throw err;                  
    //     var l = data.split('\n').length;
    //     console.log(l);
    // })
    

    
    var Client = require('ftp');
    function readConfig(){
        config = JSON.parse(fs.readFileSync('config.json','utf8'));
        console.log(config);
        return config;
    }
    

    var emt = new evt.EventEmitter();
    var c = new Client();
    const dbclient = require('./dbclient');

    var fd = fs.openSync('log_file.txt', 'r')
    fs.readFile('log_file.txt',{encoding:'utf-8'},(err,data) => {
        if (err) throw err;    
        var arr = data.split('\n')              
        var length = arr.length;
        if (length > 7000){
            logStream = fs.createWriteStream('log_file.txt',{encoding:'utf-8'});
            arr.slice(arr.length - 4000,arr.length).forEach((item,index) => {
                logStream.write(item.toString() +'\n');
                }
            )
            emt.emit('logComplite')
        }else{
            logStream = fs.createWriteStream('log_file.txt',{encoding:'utf-8',flags:'a'})
            emt.emit('logComplite')
        }
    })
    

    var fileCount;
    var closeCount=0;
    config = readConfig();
    var ftpconfig = { 
                    host: config.host,
                    user: config.user,
                    password: config.password,
    };
    
    emt.on('logComplite',() => {
        try{
            c.connect(ftpconfig);
            c.status((err,status) => {
            
                console.log(err,status);
            })
        }catch(err){
            logStream('Неудалось подключиться к ftp серверу \n');
        }
        module.exports.logStream = logStream;    
    })

    c.on('close',()=>{
        console.log('Соединение с ftp успешно закрыто')
    })
    //xml
    
    // c.status((err,status)=>{
    //     if (err) throw err;
    //     console.log('status',status);
    // });

    var parseString = require('xml2js').parseString;
    //Копирование файла на локальный диск
    emt.on('cwdComplete', function(){
        c.list(function(err, list){
            try{
                if (err) throw err;
                c.pwd(function(err,path) {
                    if (err) throw err;
                    console.log("Current path:",path);
                    fileCount = list.length;
                    list.forEach(function(item,index){
                        c.get(item.name, function(err, stream) {
                            try{
                                if (err) throw err;
                                stream.once('close', function() { 
                                    if (index == list.length-1){
                                        emt.emit('filesComplite')
                                        c.end();
                                    }
                                });
                                stream.pipe(fs.createWriteStream('./XML copy/' + 'local_'+item.name));
                                
                            }catch(error){
                                logStream.write('Неудалось скопировать файл '+item.name + ' c ftp сервера. Код ошибки: ' +
                                error + '\n');
                            }
                        });                        
                    });
                });
            }catch(error){
                logStream.write('Невозможно получить список файлов на ftp сервере.' + ' Код ошибки: ' + error + '\n')
            }   
        });
    });

    emt.on('filesComplite', ()=>{
        console.log('complite');
        fs.readdir('./XML copy', (err,files)=>{
            files.forEach( (fileName) =>{
                if (fileName.indexOf('.xml')>0){
                    fs.readFile('XML copy/'+fileName, 'utf-8', (err,data)=>{
                        try{
                            if (err) throw err;
                            if (data.length == 0){ throw new Error('Невозможно прочитать файл')}
                            parseString(data, function(err, result){
                                try{
                                    if (err) throw err;
                                    var products = [];
                                    console.log('Parsing file')
                                    // console.log(result);
                                    products = result.catalog.product;      //? 
                                    emt.emit('ObjectComplite',products, fileName);
                                }
                                catch(error){
                                        logStream.write('Ошибка в XML структуре файла ' + fileName + ' Код ошибки: ' + error +'\n');
                                        console.log('I see error into',error);
                                }
                            })
                        }
                        catch (error){
                            logStream.write("Файл "+fileName+" на локальном диске не может быть прочитан"+ 
                            ' Код ошибки: ' + error +'\n')
                        };
                    });
                }
            })
        })
    })


    //Парсинг локальных файлов
    // emt.on('FileComplite', function(fileName){
    //         console.log('File for reading ',fileName);
    //         fs.readFile('XML copy/'+'local_' + fileName,'utf-8',function(err,data){
    //             if (err){ 
    //                 console.log(data)
    //                 throw err
    //             };
    //             // var data = fs.readFileSync("./XML copy/"+"local_" + fileName, "utf8");
    //             if (data.length == 0){
    //                  console.log('Error: in readFile, ' + fileName + ' not read')
    //             }
    //             console.log(data.slice(0,100));
    //             parseString(data, function(err, result){
    //                 if (err) throw err;
    //                 var products = [];
    //                 console.log('Parsing file')
    //                 // console.log(result);
    //                 try{
    //                     products = result.catalog.product;      //? 
    //                     console.log('ObjectComplite',fileName)

    //                     emt.emit('ObjectComplite',products, fileName);
    //                 }
    //                 catch(error){
    //                     console.log('Error result = NULL\n');
    //                     console.log('Reading data:',data);
    //                     console.log('Parsing result:',result);
    //                     throw error;
    //                 }
    //             });
    //          });
    // });

    //Закрытие соединений
    emt.on('updateDBComplite',function(){
        fileCount--;
        
        console.log('After circle',fileCount);
        if (fileCount==0){
            dbclient.closeDb();
            c.end();
            console.log('fileCount',fileCount);
            console.log('closeCount',closeCount);
            logStream.cs
            //Удаление локальных файлов
            // fs.readdir('./XML copy',(err,files)=>{
            //     files.forEach( file => {
            //         if (file.indexOf('.xml')>0){
            //             fs.unlink('./XML copy/'+file,err=> {if (err) throw err})
            //         }
            //     })
            // })
           
        }
        console.log('a',fileCount);
    })

    //Обновление БД
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
            //   dbclient.insertProduct(product);
             dbclient.updateProduct(product, fileName);
             
             if (i==products.length - 1){
                 console.log('DB',i, products.length)
                 emt.emit('updateDBComplite')
                
                 logStream.write(datatime.create().format('Y-m-d H:M:S')+': Записи из файла '+fileName+' добавлены в БД \n');
             }
        ;});
        
        //Удаление файла с FTP
        //c.delete(fileName, err => {if(err) throw err})


    });

    //Переход в папку ftp
    c.on('ready',function(){
        c.pwd( (err,dir)=>{
            if (err) throw err;
            console.log('Dir=',dir)
            if (dir.indexOf('ftp')>0){
                console.log(dir)
                emt.emit('cwdComplete')
            }else{
                c.cwd('ftp',function(err,currentDir){
                    console.log(currentDir)
                    if (err) console.log(err);
                    emt.emit('cwdComplete');
                })
            }
        });
    });
}
var sleep = require('system-sleep');

var schedule = require('node-schedule');
function autoRun(period){
    console.log('autoRun start');
    var online = true;
    module.exports.online = online;
    var countCircle = 0;
    var job1 = schedule.scheduleJob('0-59/8 * * * * *',() =>{
        console.log(datatime.create().format('Y-m-d H:M:S'));
        run();
        countCircle++;
        console.log('№',countCircle);
    })
    module.exports.job = job1;
    // var T = period*60000;
    // data = datatime.create().format('Y-m-d H:M:S');
    // console.log("Автоматическое обновление с периодом "+period+" минут.");
    // logStream.write(data + ': Сервис автобновления запущен\n');
    // timer1 = setInterval(run,T);
    // module.exports.timer = timer1;

}

module.exports.autoRun = autoRun;
module.exports.updateProduct = run;

