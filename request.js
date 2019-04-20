
// function run_request(){
//     var evt = require('events');
//     var fs = require('fs');
//     var datatime = require('node-datetime');
//     var Client = require('ftp');
//     var c = new Client();
//     fs.exists('log_file_request.txt',(exists) =>{
//         if (exists){
//             var fd = fs.openSync('log_file_request.txt', 'r')
//             fs.readFile('log_file_request.txt',{encoding:'utf-8'},(err,data) => {
//                 if (err) throw err;    
//                 var arr = data.split('\n')              
//                 var length = arr.length;
//                 if (length > 7000){
//                     logStream = fs.createWriteStream('log_file_request.txt',{encoding:'utf-8'});
//                     arr.slice(arr.length - 4000,arr.length).forEach((item,index) => {
//                         logStream.write(item.toString() +'\n');
//                         }
//                     )
//                     emt.emit('logComplite')
//                 }else{
//                     logStream = fs.createWriteStream('log_file_request.txt',{encoding:'utf-8',flags:'a'})
//                     emt.emit('logComplite')
//                 }
//             })
//         }else{
//             fs.createWriteStream('log_file_request.txt',{encoding:'utf-8',flags:'a'})
//             emt.emit('logComplite')

//         }
//     })

//     function readConfig(){
//         config = JSON.parse(fs.readFileSync('config.json','utf8'));
//         console.log(config);
//         return config;
//     }
//     var emt = new evt.EventEmitter();
//     var c = new Client();
        

//     var fileCount;
//     var closeCount=0;

//     var config = readConfig();

//     var ftpconfig = { 
//                     host: config.host,
//                     user: config.user,
//                     password: config.password,
//     };


//     emt.on('logComplite',() => {
//         try{
//             c.connect(ftpconfig)
//             c.status((err,status) => {
//                 if (err) throw err;
//                 console.log(err,status);
//             })
//         }catch(err){
//             // не работает
//             console.log('Неудалось подключиться к ftp серверу \n');
//             logStream.write('Неудалось подключиться к ftp серверу \n');
//         }
//         }
//     )
//     c.on('close',()=>{
//         console.log('Соединение с ftp успешно закрыто')
//     })

//     c.on('ready',function(){
//         c.pwd( (err,dir)=>{
//             if (err) throw err;
//             console.log('Dir=',dir)
//             if (dir.indexOf('ftpRequest')>0){
//                 console.log(dir)
//                 emt.emit('cwdComplete')
//             }else{
//                 c.cwd('ftpRequest',function(err,currentDir){
//                     try{
//                         if (err) throw err;
//                         emt.emit('cwdComplete');
//                     }catch(err){
//                         console.log('Неудалось изменить папку')
//                     }
//                 })
//             }
//         });
//     });

//     c.on('greeting', (msg) => {
//         console.log('Приветствие',msg);
//     })
//     c.on('error', (err) => {
//         console.log('Ошибка ftp', err);
//         if (err == 'Login incorrect.'){
//             console.log('login')
//         }
//     })


//     emt.on('fileComplete',(filename) =>{ 
//         console.log("Фаил готов к копированию")
//         c.put(filename, filename, function(err) {
//             try{
//                 if (err) throw err;
//                 c.end();
//             }catch(err){
//                 logStream.write("Неудалось скопировать файл "+filename+' на ftp сервер.\n')
//             }
//         })
//     })


//     var dbclient = require('./dbclient')
//     var xml =  require('xml2js');
//     var fs = require('fs');
//     var builder = new xml.Builder( { rootName : 'Order', headless : true });

//     emt.on('cwdComplete',() =>{
//         dbclient.selectOrder((res)=>{
//             var str = '<root>\n';
//             res.forEach((element, i) => {
//                 var x = builder.buildObject(element); 
//                 str = str + x + '\n';
//                 if (i == res.length - 1){
//                     str = str + '</root>\n';
//                     var data = datatime.create().format('Y-m-d H:M:S')
//                     var filename = 'orders'+data+'.xml' 
//                     fs.writeFile('Orders/' + filename,str,(err) =>{
//                         try{
//                             if (err) throw err;
//                             emt.emit('fileComplete',filename)
//                         }catch(err){
//                             logStream.write('Неудалось сформировать XML файл. \n')
//                         }
//                     })
//                     console.log(str)
//                 }
//             });


//         })
//         }
//     )
// }

// var logStream = require('./parsing').logStream;

function run_request( res ){
    console.log('run_request', res)
    
    var evt = require('events');
    var fs = require('fs');
    var datatime = require('node-datetime');
    var Client = require('ftp');
    var c = new Client();
    
    fs.exists('log_file_request.txt',(exists) =>{
        if (exists){
            var fd = fs.openSync('log_file_request.txt', 'r')
            fs.readFile('log_file_request.txt',{encoding:'utf-8'},(err,data) => {
                if (err) throw err;    
                var arr = data.split('\n')              
                var length = arr.length;
                if (length > 7000){
                    logStream = fs.createWriteStream('log_file_request.txt',{encoding:'utf-8'});
                    arr.slice(arr.length - 4000,arr.length).forEach((item,index) => {
                        logStream.write(item.toString() +'\n');
                        }
                    )
                    emt.emit('logComplite')
                }else{
                    logStream = fs.createWriteStream('log_file_request.txt',{encoding:'utf-8',flags:'a'})
                    emt.emit('logComplite')
                }
            })
        }else{
            fs.createWriteStream('log_file_request.txt',{encoding:'utf-8',flags:'a'})
            emt.emit('logComplite')

        }
    })

    function readConfig(){
        config = JSON.parse(fs.readFileSync('config.json','utf8'));
        console.log(config);
        return config;
    }
    var emt = new evt.EventEmitter();
    var c = new Client();
        

    var fileCount;
    var closeCount=0;

    var config = readConfig();

    var ftpconfig = { 
                    host: config.host,
                    user: config.user,
                    password: config.password,
    };

    c.on('error',(error)=>{
        logStream.write('Неудалось подключиться к FTP серверу, проверьте настройки конфигурации '+ error + '\n')
        console.log('Ошибка соединения',error);
    })

    emt.on('logComplite',() => {
        try{
            logStream.write('Запуск добавления заявки\n');
            c.connect(ftpconfig);
            // c.status((err,status) => {
            //     console.log(err,status);
            // })
        }catch(err){
            logStream.write('Неудалось подключиться к ftp серверу \n');
        }
        module.exports.logStream = logStream;    
    })


    c.on('close',()=>{
        console.log('Соединение с ftp успешно закрыто')
    })

    c.on('ready',function(){
        c.pwd( (err,dir)=>{
            if (err) throw err;
            console.log('Dir=',dir)
            if (dir.indexOf('ftpRequest')>0){
                console.log(dir)
                emt.emit('cwdComplete')
            }else{
                c.cwd('ftpRequest',function(err,currentDir){
                    try{
                        if (err) throw err;
                        emt.emit('cwdComplete');
                    }catch(err){
                        console.log('Неудалось изменить папку', err)
                    }
                })
            }
        });
    });

    c.on('greeting', (msg) => {
        console.log('Приветствие',msg);
    })


    emt.on('fileComplete',(filename) =>{ 
        console.log(filename, " Фаил готов к копированию")
        c.put('Orders/' + filename, filename, function(err) {
            try{
                if (err) throw err;
                c.end();
            }catch(err){
                logStream.write("Неудалось скопировать файл "+filename+' на ftp сервер.\n')
            }
        })
    })


    var dbclient = require('./dbclient')
    var xml =  require('xml2js');
    var fs = require('fs');
    var builder = new xml.Builder( { rootName : 'Order', headless : true });

    emt.on('cwdComplete',() =>{
            // var str = '<root>\n';
            console.log('res',res);
            console.log('0', res[0])
            console.log(res.length);
            let order = { firstname: res.firstname,
                          lastname:  res.lastname,
                          telephone: res.telephone,
                          payment_address_1: res.payment_address_1,
                          payment_address_2: res.payment_address_2,
                          payment_postcode: res.payment_postcode,
                          shipping_address_1: res.shipping_address_1,
                          shipping_address_2: res.shipping_address_2,
                          shipping_city: res.shipping_city,
                          shipping_postcode: res.shipping_postcode,
                          products: res.products,
                          totals: res.totals
            }
            console.log('Order ', order);
            
            // order.forEach((element, i) => {
            var x = builder.buildObject(order); 
            // str = str + x + '\n';
                console.log(order.lastname)
                // if (i ==order.length - 1){
                //     str = str + '</root>\n';
            var data = datatime.create().format('Y-m-d H:M:S')
            var filename = 'order_'+data+'.xml';
            console.log(x);
            fs.writeFile('Orders/' + filename,x,(err) =>{
                        try{
                            if (err) throw err;
                            emt.emit('fileComplete',filename)
                        }catch(err){
                            logStream.write('Неудалось сформировать XML файл. \n')
                        }
                    })
        
                
        // })
        }
    )
}
module.exports.run_request = run_request;