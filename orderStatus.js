/*
    Реализация обновления статуса заказа
*/

var fs = require('fs');
var evt = require('events');
var datetime = require('node-datetime')
var parseString = require('xml2js').parseString;
var schedule = require('node-schedule');
var Iconv = require('iconv').Iconv;
var exportDb = require('./exportDB')

function toUTF8(body) {
    var iconv = new Iconv('UTF-8', 'ISO-8859-1');
    var message  = iconv.convert(body).toString('utf-8');
  return message
}

function copyFilesToLocaldisk(client, emitter){
    client.list((err, filesList) =>{
        if (err) console.log(err)
        // console.log(filesList);
        if (filesList.length > 0){
            filesList.forEach( (file, i) =>{
                var fileName = toUTF8(file.name);
                client.get(fileName, (err,stream) => {

                    if (err) console.log(err);
                    stream.pipe(fs.createWriteStream('./OrderStatus/'+fileName)); 
                    if (i == filesList.length-1){
                        stream.once('close', function() { //client.end(); 
                        // Удаление файлов с ftp
                        filesList.forEach( (file,i) =>{
                            client.delete( file.name, (err)=>{
                                if (err) console.log(err);
                                if (i == filesList.length){
                                    client.end();
                                }
                            })
                        })
                        // client.end();

                    });
                    emitter.emit('filesComplite');    
                    }
                })
            })
        }else{
            console.log('Close ftp при обновлении статуса\n')
            client.end()
        }
    })
}
//Парсинг локальных файлов
function getParseStatus(emitter){
    fs.readdir('./OrderStatus/', (err,files)=>{
        try{
            if (err) throw err;
            var status_ids = [1,2,3,4,5];
            files.forEach( (fileName) =>{
                fs.readFile('./OrderStatus/'+fileName, 'utf-8', (err,data)=>{
                    try{    
                        // console.log(fileName);
                        if (err) throw err;
                        if (data.length == 0){ throw new Error('Невозможно прочитать файл')}
                        parseString(data, function(err, result){
                            try{
                                if (err) throw err;
                                var parseOrder;
                                parseOrder = result.catalog;      //? 
                                // console.log(fileName+' был разобран. \n');
                                
                                if (status_ids.indexOf(Number(parseOrder.status))!=-1){
                                    emitter.emit('parseOrderComplite',parseOrder, fileName);
                                }else{
                                    fs.unlink('./OrderStatus/'+fileName, (err) =>{
                                        if (err) console.log(err);
                                    })
                                    throw Error('Некоректный статус в '+fileName+'\n')
                                }
                            }
                            catch(error){
                                    console.log('Ошибка в XML структуре файла ', error)
                            }
                        })
                    }
                    catch (error){ console.log(error)};
                });
            })
        }catch(error){ console.log(error)}
    })
}

orderStatus.prototype = new evt.EventEmitter();
// Конструктор
function orderStatus(){

    this.dbClient = require('./dbclient');

    function readConfig(){
        config = JSON.parse(fs.readFileSync('config.json','utf8'));
        // console.log(config);
        return config;
    } 
    console.log('UpdateStatus constructor');
    this.config = readConfig();

    this.updateStatusRun();
}

orderStatus.prototype.updateStatusRun = function(isRun = false){

    var job = schedule.scheduleJob('*/1 * * * *', ()=>{
        this.updateStatus();
        
        if (!isRun){ console.log('updateStatus started'); isRun = true;}
    })
    
    var job_export = schedule.scheduleJob('0 0 */3 * * * ', ()=>{
    // var job_export = schedule.scheduleJob('*/1 * * * * ', ()=>{

        exportDb.exportDB();
    })

    // var job = schedule.scheduleJob('*/10 * * * * *', ()=>{
    //     this.updateStatus();
    //     if (!isRun){ console.log('updateStatus started'); isRun = true;}
    // })
}

orderStatus.prototype.updateStatus = function (){

    var emt = new evt.EventEmitter();

    var Client = require('ftp');
    var ftp_client = new Client();

    var ftpconfig = { 
        host: this.config.host,
        user: this.config.user,
        password: this.config.password,
    };
    try{
        console.log('Подключение при обновлении статуса заказа');
        console.log(ftpconfig);
        ftp_client.connect(ftpconfig);
    }catch(err){
        console.log('Неудалось подлючиться к ftp при обновлении статуса\n')
    }
    ftp_client.on('error', (error) =>{
        ftp_client.end()
        console.log('Ошибка ftp обновление статуса ' , error)
    })

    ftp_client.on('ready',function(){
        ftp_client.pwd( (err,dir)=>{
            try{
                if (err) throw err;
                if (dir.indexOf('OrderStatus')>0){
                    emt.emit('cwdComplete')
                }else{
                    ftp_client.cwd('OrderStatus',function(err,currentDir){
                        try{
                            if (err) throw err;
                            emt.emit('cwdComplete');
                        }catch(err){
                            console.log(datetime.create().format('Y-m-d H:M:S')+ ': Неудалось изменить папку на FTP', err)
                        }
                    })
                }
            }catch(error){
                console.log(datetime.create().format('Y-m-d H:M:S')+ ': Неудалось получить текущую директорию на FTP', error)
            }
        });
    });

    emt.on('filesComplite', () => {
        getParseStatus(emt)
    })

    emt.on('cwdComplete',()=>{
        copyFilesToLocaldisk(ftp_client, emt);
    })

    emt.on('parseOrderComplite', (parseOrder, fileName)=>{
        //Обновление записи в бд

        this.dbClient.query('UPDATE shop.oc_order SET order_status_id= "'+parseOrder.status+
                    '" WHERE order_id = "'+parseOrder.order_id +'"')
            .then( (rows)=> { 

                // 1.удалить локальную запись 
                // 2.удалить запись на ftp
                fs.unlink('./OrderStatus/'+fileName, (err) =>{
                    if (err) console.log(err);
                })

                // ftp_client.delete(fileName, err =>{
                //     try{
                //         if (err) throw err;
                //     }catch(error){
                //         console.log(error);
                //     }
                // })
            },
                    error => { console.log('Error into SQL ', error)}    
            );
        this.dbClient.query('INSERT INTO shop.oc_order_history (order_id,order_status_id,notify,comment,date_added)'
    +' VALUES('+parseOrder.order_id+','+parseOrder.status+',0," ", "'+datetime.create().format('Y-m-d H:M:S')+'")')
            .then( (rows)=>{

            }, 
                error =>{ console.log('Error into insert sql', error)});

    })

}

module.exports = new orderStatus();