var evt = require('events');
var random = require("random-js")(); // uses the nativeMath engine

request.prototype = new evt.EventEmitter();
var fs = require('fs');
var xml =  require('xml2js');

var a ='k'
function request(){
    
    console.log('request constructor');
    function readConfig(){
        config = JSON.parse(fs.readFileSync('config.json','utf8'));
        console.log(config);
        return config;
    }
    this.config = readConfig();
}

var queue_order = [];

request.prototype.run_request = function( res ){
    console.log('run_request', res);
    var evt = require('events');
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

    
    var emt = new evt.EventEmitter();
    var c = new Client();
        

    var fileCount;
    var closeCount=0;

    // var config = readConfig();

    var ftpconfig = { 
                    host: this.config.host,
                    user: this.config.user,
                    password: this.config.password,
    };

    c.on('error',(error)=>{
        logStream.write(datatime.create().format('Y-m-d H:M:S')+': Неудалось подключиться к FTP серверу, проверьте настройки конфигурации. Request!'+ error + '\n')
        console.log('Ошибка соединения',error);
        queue_order.push(res)
    })

    emt.on('logComplite',() => {
        try{
            c.connect(ftpconfig);
            // c.status((err,status) => {
            //     console.log(err,status);
            // })
        }catch(err){
            logStream.write(datatime.create().format('Y-m-d H:M:S')+': Неудалось подключиться к ftp серверу \n');
        }
    })

    c.on('close',()=>{
        console.log('Соединение с ftp успешно закрыто')
    })

    c.on('ready',function(){
        c.pwd( (err,dir)=>{
            try{
                if (err) throw err;
                if (dir.indexOf('ftpOrders')>0){
                    console.log(dir)
                    emt.emit('cwdComplete')
                    // if queue_order

                }else{
                    c.cwd('ftpOrders',function(err,currentDir){
                        try{
                            if (err) throw err;
                            emt.emit('cwdComplete');
                        }catch(err){
                            console.log(datatime.create().format('Y-m-d H:M:S')+ ': Неудалось изменить папку на FTP', err)
                        }
                    })
                }
            }catch(error){
                console.log(datatime.create().format('Y-m-d H:M:S')+ ': Неудалось получить текущую директорию на FTP', error)
            }
        });
    });

    // c.on('greeting', (msg) => {
    //     console.log('Приветствие',msg);
    // })


    emt.on('fileComplete',(filename) =>{ 
        console.log(filename, " Файл готов к копированию")
        c.put('Orders/' + filename, filename, function(err) {
            try{
                if (err) throw err;
                logStream.write(datatime.create().format('Y-m-d H:M:S') + " Заказ добавлен на FTP \n")
                c.end();

                //Удаление локальных файлов

                fs.unlink('./Orders/'+filename,err=> {
                    try{
                        if (err) throw err
                    }catch(error){
                        logStream.write(datatime.create().format('Y-m-d H:M:S') + 'Неудалось удалить локальный файл ' + file +' ' + error+ '\n');
                    }
                })
                // fs.readdir('./Orders',(err,files)=>{
                //     console.log('Количество локальных файлов', files.length)
                //     if (files.length > 200){
                //         files.forEach( (file, i)=> {
                //             console.log(file)
                //             if (i < 80){
                //                 fs.unlink('./Orders/'+file,err=> {
                //                     try{
                //                         if (err) throw err
                //                     }catch(error){
                //                         logStream.write(datatime.create().format('Y-m-d H:M:S') + 'Неудалось удалить локальный файл ' + file +' ' + error+ '\n');
                //                     }
                //                 })
                //             }
                //             else{
                //             }
                //         })
                //     }
                    // files.forEach( file => {
                    //     var oldDate = datatime.create(file.slice(6,16));
                    //     var nowDate = datatime.create();
                    //     console.log(nowDate.getTime() - oldDate.getTime())
                    //     if (file.indexOf('.xml')>0 && (nowDate.getTime()-oldDate.getTime())>172800000){
                    //         fs.unlink('./Orders/'+file,err=> {
                    //             try{
                    //                 if (err) throw err
                    //             }catch(error){
                    //                 logStream.write(datatime.create().format('Y-m-d H:M:S') + 'Неудалось удалить локальный файл ' + file +' ' + error+ '\n');
                    //             }
                    //         })
                    //     }
                    // })
                // })
            }catch(err){
                logStream.write("Неудалось скопировать файл "+filename+' на FTP сервер.\n')
            }
        })
    })


    var dbclient = require('./dbclient')

    var builder = new xml.Builder( { rootName : 'Order', headless : true });

    emt.on('cwdComplete',() =>{
        try{
            // var str = '<root>\n';

            console.log('Полученный заказ')
            console.log(res);

            console.log('Length =',res.length);


            let order = { 
                          order_id: res.order_id,
                          date: datatime.create().format('Y-m-d H:M:S'),
                          store_id: res.store_id,
                          store_name: res.store_name,
                          customer_id: res.customer_id,
                          firstname: res.firstname,
                          lastname:  res.lastname,
                          telephone: res.telephone,
                          shipping_company: res.shipping_company,
                          email: res.email,
                          comment: res.comment,
                        //   payment_city: res.payment_city,
                        //   payment_address_1: res.payment_address_1,
                        //   payment_address_2: res.payment_address_2,
                        //   payment_custom_field: res.payment_custom_field,
                        //   payment_postcode: res.payment_postcode,
                          shipping_city: res.shipping_city,
                          shipping_address_1: res.shipping_address_1,
                        //   shipping_address_2: res.shipping_address_2,
                        //   shipping_custom_field: res.shipping_custom_field,
                          customer_address: res.customer_address,
                          comment_for_address: res.comment_for_address,
                          shipping_postcode: res.shipping_postcode,
                          products: res.products,
                          
                          totals: res.totals,
            }
            // console.log('Order ', order);
            
            // order.forEach((element, i) => {
            var x = builder.buildObject(order); 
            // str = str + x + '\n';
                // console.log(order.lastname)
                // if (i ==order.length - 1){
                //     str = str + '</root>\n';

            

            var data = datatime.create().format('Y-m-d H:M:S');

            // Тест работы добавление заказа
            var value = random.integer(1, 1000000); 
            // var filename = 'order_'+value+'.xml';

            var filename = 'order_'+res.order_id+'.xml';
            // console.log(x);
            fs.writeFile('Orders/' + filename,x,(err) =>{
                        try{
                            if (err) throw err;
                            emt.emit('fileComplete',filename)
                        }catch(err){
                            logStream.write(datatime.create().format('Y-m-d H:M:S')+'Неудалось сформировать XML файл. '+err+'\n')
                        }
                    })
        }catch(error){
                logStream.write(datatime.create().format('Y-m-d H:M:S')+'Неудалось сформировать XML файл. \n')
        }
        }
    )
}

request.prototype.exportTree = function(){
    var dbclient = require('./dbclient');
    var xml =  require('xml2js');
    var builder = new xml.Builder( { rootName : 'categoryList', headless : true });

    dbclient.exportTree().then( (res) =>{
        var x = builder.buildObject(res);
        console.log(x);
    })

}

request.prototype.createXmlFileOrder = function( res ){
    var builder = new xml.Builder( { rootName : 'Order', headless : true });
            let order = { 
                          order_id: res.order_id,
                          date: datatime.create().format('Y-m-d H:M:S'),
                          store_id: res.store_id,
                          store_name: res.store_name,
                          customer_id: res.customer_id,
                          firstname: res.firstname,
                          lastname:  res.lastname,
                          telephone: res.telephone,
                          shipping_company: res.shipping_company,
                          email: res.email,
                          comment: res.comment,
                        //   payment_city: res.payment_city,
                        //   payment_address_1: res.payment_address_1,
                        //   payment_address_2: res.payment_address_2,
                        //   payment_custom_field: res.payment_custom_field,
                        //   payment_postcode: res.payment_postcode,
                          shipping_city: res.shipping_city,
                          shipping_address_1: res.shipping_address_1,
                        //   shipping_address_2: res.shipping_address_2,
                        //   shipping_custom_field: res.shipping_custom_field,
                          customer_address: res.customer_address,
                          comment_for_address: res.comment_for_address,
                          shipping_postcode: res.shipping_postcode,
                          products: res.products,
                          
                          totals: res.totals,
            }
            var x = builder.buildObject(order); 
            var data = datatime.create().format('Y-m-d H:M:S');
            var filename = 'order_'+res.order_id+'.xml';
            fs.writeFile('Orders/' + filename,x,(err) =>{
                        try{
                            if (err) throw err;
                            return filename;
                        }catch(err){
                            logStream.write(datatime.create().format('Y-m-d H:M:S')+'Неудалось сформировать XML файл. '+err+'\n')
                        }
                    })
}


module.exports = new request();