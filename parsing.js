/*
    Реализация обновления остатков продукции в БД
*/

var evt = require('events');
var fs = require('fs');
var datatime = require('node-datetime')

function readConfig(){
    config = JSON.parse(fs.readFileSync('config.json','utf8'));
    return config;
}
function run(flag_auto){
    
    var Client = require('ftp');
    var emt = new evt.EventEmitter();

    module.exports.emt = emt;
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
            // c.status((err,status) => {
            //     console.log(err,status);
            // })
        }catch(err){
            logStream.write('Неудалось подключиться к ftp серверу при обновлении остатков \n');
        }
        module.exports.logStream = logStream;    
    })
    c.on('error',(error)=>{
        logStream.write(datatime.create().format('Y-m-d H:M:S')+': Неудалось подключиться к FTP серверу, проверьте настройки конфигурации '+ error + '\n')
        console.log('Ошибка соединения',error);
    })

    c.on('close',()=>{
        console.log('Соединение с ftp успешно закрыто. Обновление остатков \n')
    })


    var parseString = require('xml2js').parseString;
    //Копирование файла на локальный диск
    emt.on('cwdComplete', function(){
        c.list(function(err, list){
            try{
                //Если файлов нет выйти
                if (list.length == 0){
                    console.log('Нет файлов \n')
                    c.end()
                }else{

                logStream.write(datatime.create().format('Y-m-d H:M:S')+': Запущен процесс обновления остатков'+'\n')
                if (err) throw err;
                fileCount = list.length;
                list.forEach(function(item,index){
                    c.get(item.name, function(err, stream) {
                        try{
                            if (err) throw err;
                            stream.once('close', function() { 
                                if (index == list.length-1){
                                    emt.emit('filesComplite')
                                    // c.end();
                                }
                            });
                            
                            //Копируем файлы на лок. машину
                            stream.pipe(fs.createWriteStream('./XML copy/' +item.name, {}));
                            
                        }catch(error){
                            logStream.write(datatime.create().format('Y-m-d H:M:S')+': Неудалось скопировать файл '+item.name + ' c ftp сервера. Код ошибки: ' +
                            error + '\n');
                        }
                    });                        
                });

                }//else
            }catch(error){
                logStream.write(datatime.create().format('Y-m-d H:M:S')+' :Невозможно получить список файлов на ftp сервере.' + ' Код ошибки: ' + error + '\n')
            }   
        });
    });

    emt.on('filesComplite', ()=>{
        console.log('complite');
        fs.readdir('./XML copy', (err,files)=>{
            try{
                if (err) throw err;
                files.forEach( (fileName) =>{
                        fs.readFile('XML copy/'+fileName, 'utf-8', (err,data)=>{
                            try{    
                                console.log(fileName);
                                if (err) throw err;
                                if (data.length == 0){ throw new Error('Невозможно прочитать файл')}
                                parseString(data, function(err, result){
                                    try{
                                        if (err) throw err;
                                        var products = [];
                                        products = result.catalog.product;      //? 
                                        
                                        emt.emit('ObjectComplite',products, fileName);
                                    }
                                    catch(error){
                                            console.log('Ошибка в XML структуре файла')
                                            logStream.write(datatime.create().format('Y-m-d H:M:S')+': Ошибка в XML структуре файла ' + fileName + ' Код ошибки: ' + error +'\n');
                                    }
                                })
                            }
                            catch (error){
                                logStream.write("Файл "+fileName+" на локальном диске не может быть прочитан"+ 
                                ' Код ошибки: ' + error +'\n')
                            };
                        });
                })
            }catch(error){
                logStream.write(datatime.create().format('Y-m-d H:M:S')+': Неудалось получить список локальный файлов. Код ошибки: ' + error +'\n');
            }
        })
    })

    //Закрытие соединений
    emt.on('updateDBComplite',function(){
        fileCount--;
        
        if (fileCount==0){
            dbclient.closeDb();
            c.end();           
            //Удаление локальных файлов (Перенес в отдельную функцию)
            // fs.readdir('./XML copy',(err,files)=>{
            //     files.forEach( file => {
            //             fs.unlink('./XML copy/'+file,err=> {
            //                 try{
            //                     if (err) throw err
            //                 }catch(error){
            //                     logStream.write('Неудалось удалить локальный файл ' + file +' ' + error+ '\n');
            //                 }
            //             })
            //     })
            // })
           
        }
    })

    function DeleteLocalFile(fileName){
        fs.unlink('./XML copy/'+fileName,err=> {
            try{
                if (err) throw err
                logStream.write(datatime.create().format('Y-m-d H:M:S')+': Обработка записей из файла '+fileName
                    +' окончена \n');
            }catch(error){
                logStream.write('Неудалось удалить локальный файл ' + fileName +' ' + error+ '\n');
            }
        })
    }

    //Обновление БД
    emt.on('ObjectComplite', function(products, fileName){
        //Удаление файла с FTP
        c.delete(fileName, err => {
            try{
                console.log('Name ' + fileName)
                if(err) throw err
            }catch(error){
                logStream.write("Неудалось удалить файл :" + fileName + " c ftp\n")
            }
        })
    
        var p = products[0];
        var countError = 0;
        module.exports.countError = countError;
        /*
            Удаление записей из таблицы БД
        */
        products.forEach(function(item,i){
            try{
                product = {
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price: item.price,
                    promo: item.promo,
                    date: item.date,
                }
                if (product.promo==0){
                    dbclient.updateProduct(product, fileName, DeleteLocalFile, i, products.length);
                }else{

                    // console.log('Передача prod', product);
                    dbclient.updateDiscount(product, fileName);
                    dbclient.updateProduct(product, fileName, DeleteLocalFile), i, products.length;
                }
                
                if (i==products.length - 1){
                    emt.emit('updateDBComplite')
                }
            }catch(error){
                logStream.write("Неудалось обновить запись: id="+product.id +
                ', amount=' + product.amount + ', price=' + product.price + ' из файла '+fileName +
                '. Код ошибки: ' + error +'\n');
            }
        });
        console.log(emt.listenerCount("updateDBComplite"))
        console.log(emt.listenerCount("filesComplite"))



    });


    //Переход в папку ftp
    c.on('ready',function(){
        c.pwd( (err,dir)=>{
            try{
                if (err) throw err;
                if (dir.indexOf('ftp')>0){
                    console.log(dir)
                    emt.emit('cwdComplete')
                }else{
                    c.cwd('ftp',function(err,currentDir){
                        try{
                            if (err) console.log(err);
                            emt.emit('cwdComplete');
                        }catch(error){
                            logStream.write(datatime.create().format('Y-m-d H:M:S')+ ': Неудалось изменить папку на FTP', error)
                        }
                    })
                }
            }catch(error){
                logStream.write(datatime.create().format('Y-m-d H:M:S')+ ': Неудалось получить текущую директорию на FTP', error)

        }
        });
    });
}
var sleep = require('system-sleep');

var request = require("./request");

var schedule = require('node-schedule');

function autoRun(period){
    // var logStream = require('./parsing').logStream;
    var config = readConfig();
    console.log(config.unitTime);
    // var dateUpdate = "";

    run();
    switch(config.unitTime){
        case '1': var dateUpdate = '0-59/'+config.period + ' * * * * *';
                // console.log('in',dateUpdate);
                break;
        case '2': var dateUpdate = '*/'+config.period + ' * * * *';
                break;
        case '3': var dateUpdate = '0 0 */'+config.period + ' * * *';
                break;
    }
    console.log('data',dateUpdate);
    // logStream.write(datatime.create().format('Y-m-d H:M:S')+': Процедура автообновление запущена.\n')
    console.log('autoRun start');
    var online = true;
    module.exports.online = online;
    var countCircle = 0;
    var job1 = schedule.scheduleJob( dateUpdate,() =>{
        console.log(datatime.create().format('Y-m-d H:M:S'));
        run();
        // request.run_request();
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






