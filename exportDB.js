
var evt = require('events');
var fs = require('fs');
var datatime = require('node-datetime')
function readConfig(){
    config = JSON.parse(fs.readFileSync('config.json','utf8'));
    return config;
}
function exportDB(){
    var dbclient = require('./dbclient');
    const emt = new evt.EventEmitter();
    var windows1251 = require('windows-1251');
    return new Promise( (resolve, reject) => {
        const ftpClient = require('ftp');
        var client = new ftpClient();
        config = readConfig();
        var ftpconfig = { 
            host: config.host,
            user: config.user,
            password: config.password,
        };
        client.connect(ftpconfig);
        client.on('error', error =>{
            console.log('Неудалось подключиться к ftp при экспорте БД');

            reject(error);
        })

        client.on('close',()=>{
            console.log('Соединение с ftp успешно закрыто при экспорте БД')
        })

        client.on('ready',()=>{
            client.cwd('./Export',(err,dir)=>{
                if (err) reject(err);
                emt.emit('dirComplite');
            })
        })
        var j = 0;

        emt.on('posComplite',()=>{
            fs.readdir('public/',(err,files)=>{
                var ls = ['category.txt','position.txt','position_and_category.txt']
                if (err) reject(err);
                files.forEach((file)=>{
                    if (ls.indexOf(file)>=0){
                        console.log('put '+file)
                        client.put('public/'+file,file,(err)=>{
                            if (err) {
                                reject(err);
                                client.end();
                                console.log('Неудалось скопировать файл ', file);
                                
                            };
                            j++;
                            if (j == 2){
                                client.end();
                                resolve();
                            }
                        })
                    }
                })
                    // resolve();
                })
            })               
        
        var cat_stream = fs.WriteStream('./public/category.txt',{encoding:'binary'});
        var pos_cat_stream = fs.WriteStream('./public/position_and_category.txt',{encoding:'binary'});
        var pos_stream = fs.WriteStream('./public/position.txt',{encoding:'binary'});
        pos_stream.on('close',()=>{
            console.log('pos_steam close');
        })
        emt.on('dirComplite',()=>{

            emt.on('posCatComplite',()=>{
                console.log(windows1251.encode('position_id||name\n'))
                pos_stream.write(windows1251.encode('position_id||name\n'));
                dbclient.query('SELECT product_id,name FROM shop.oc_product_description')
                    .then((rows)=>{
                        var str='';
                        let name = '';
                        rows.forEach( (row, ind)=>{
                            name = row.name.split('&quot;').join('\"');
                            str = row.product_id +'||'+name+'\n';
                            pos_stream.write(windows1251.encode(str));
                            if (ind == rows.length - 1){
                                emt.emit('posComplite','position.txt');
                            }
                            })
                        },
                    error => {
                        reject(error);
                    })
                })
    
            emt.on('catComplite',()=>{
                pos_cat_stream.write(windows1251.encode('position_id||category_id\n'));
                
                dbclient.query('SELECT * FROM shop.oc_product_to_category')
                    .then((rows) =>{
                        var str = '';
                        rows.forEach( (row, ind)=>{
                            str = row.product_id+'||'+row.category_id + '\n';
                            pos_cat_stream.write(windows1251.encode(str));
                            if (ind == rows.length - 1){
                                emt.emit('posCatComplite','position_and_category.txt');
                            }
                        })
                    },
                    error => {
                        reject(error);
                    })
            })

            cat_stream.write(windows1251.encode('category_id||name||parent_id||sort_order\n'));
            dbclient.query('SELECT cat.category_id,decs.name, cat.parent_id,cat.sort_order FROM shop.oc_category_description as decs JOIN shop.oc_category as cat '+
            'on decs.category_id = cat.category_id')
            .then( (rows) =>{
                var str = '';
                rows.forEach( (row, ind) =>{
                    str = row.category_id+'||'+row.name+'||'+row.parent_id+'||'+row.sort_order+'\n';
                    cat_stream.write(windows1251.encode(str));
                    if (ind == rows.length - 1){
                        emt.emit('catComplite','category.txt');
                    }
                })
            },
            error => {
                reject(error);
            })
        })
    })
}
module.exports.exportDB = exportDB;