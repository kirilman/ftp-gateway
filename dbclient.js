var evt = require('events');
var mysql = require('mysql');
var async = require('async');
var datetime = require('node-datetime')
var main = require('./parsing')
var fs = require('fs')

const TABLE = 'oc_product_to_multistore'
// const TABLE = 'Product'

var connection = mysql.createConnection({
    host     : 'localhost',
    port     : '3306',
    user     : 'test',
    password : 'testpassword',
    database : 'shop'
  });

dbClient.prototype = new evt.EventEmitter;
// emt = new evt.EventEmitter;
function dbClient(){
    console.log('Db constuct start');
    var self = this;
    // this.connection.connect(function(err) {
    //     if (err) {
    //       console.error('Error connecting with DB: ' + err.stack);
    //       return;
    //     };
    // })
    
    connection.connect(function(err) {
        if (err) {
          console.error('Error connecting with DB: ' + err.stack);
          return;
        };
    })
    this.connection = connection
};

dbClient.prototype.insertProduct = function insertProduct( product){
    var query = 'INSERT INTO'+TABLE+'VALUES ('+product.product_id+','+product.price+','+product.quantity+')';
    console.log(query);
    this.connection.query(query);
}

// Довабление скидочной акции на товар в таблицу oc_product_special_multistore
dbClient.prototype.updateDiscount = function updateDiscount( product, filename){
    //1. Получить id города
    // console.log('Запуск обновления акции')
    var store_name = filename.slice(0,filename.indexOf('.xml'));
    store_ids = {'tomsk': 1,
                'asino': 16,
                'bakchar': 24,
                'kargasok': 25,
                'kolpashevo': 15,
                'kozhevnikovo': 29,
                'melnikovo': 11,
                'molchanovo': 14,
                'parabel': 26,
                'podgornoe': 50,
                'ziryanka': 18,
                }
    var store_id = store_ids[store_name];
    //2. Сгенерировать период действия акции (текущая дата + 1 день)
    var date_start = datetime.create().format('Y-m-d')
    var tempDate = datetime.create(date_start).getTime()+86400000;
    var date_end = datetime.create(tempDate).format('Y-m-d')
    
    //3. Вставить в БД
    // sql = 'INSERT INTO shop.oc_product_special_multistore (product_id, store_id, price, date_start, date_end, customer_group_id) '+
    // 'VALUES('+product.product_id+','+store_id+','+product.price+',"'+date_start+'","'+ date_end +'",1)';
    
    date_end = product.date[0]

    sql = 'INSERT INTO shop.oc_product_special_multistore (product_id, store_id, price, date_start, date_end, customer_group_id) '+
          'VALUES('+product.product_id+','+store_id+','+product.price+',"'+date_start+'","'+date_end +'",1)';

    
    connection.query(sql,function(err, result, fields){
        try{
            // if(err) throw Error
            // console.log(err)

        }
        catch(error){
            console.log(error);
            main.logStream.write("Ошибка добавления скидочной акции: product_id="+product.product_id +
                                ', quantity =' + product.quantity + ', price=' + product.price + ' из файла '+filename +
                                '. Код ошибки: ' + error +'\n');
        }
    })

}

dbClient.prototype.deleteFromShopMultistore = function deleteFromShopMultistore(){
    return new Promise( (resolve,reject)=>{

        sql = 'DELETE from shop.oc_product_special_multistore where product_special_id > 0'
        connection.query(sql, (err, result, fields)=>{
            if (err) {return reject('Неудалось удалить записи из multistore')}
                resolve(result);
        })
    })
}

dbClient.prototype.updateProduct = function updateProduct ( product , filename, callback, iter, productLength){
    countError = require('./parsing').countError;
    var store_name = filename.slice(0,filename.indexOf('.xml'));
    store_ids = {'tomsk': 1,
                'asino': 16,
                'bakchar': 24,
                'kargasok': 25,
                'kolpashevo': 15,
                'kozhevnikovo': 29,
                'melnikovo': 11,
                'molchanovo': 14,
                'parabel': 26,
                'podgornoe': 50,
                'ziryanka': 18,
                }

    var store_id = store_ids[store_name];



    sql = "SELECT Count(product_id) as count FROM " +TABLE + " WHERE product_id = "+ product.product_id + ' AND store_id = ' + store_id;
    connection.query(sql,function(err,result,fields){
        store_id = store_ids[store_name];
        try{
            
            if (!(store_name in store_ids)) throw Error(store_name+' отсутсвует в базе.\n')
            if (err) throw err;
                // emt.emit('queryCount',result,product);
                if (result[0].count>0){
                    data = datetime.create().format('Y-m-d H:M:S');
                    var sqlw = 'UPDATE '+ TABLE + ' SET quantity =' + product.quantity +', price =' +product.price + 
                                    ', date_modified = "' + data +
                                    '" WHERE product_id='+ product.product_id +' AND store_id = ' + store_id;
                    // console.log(sqlw);
                    
                   

                    connection.query(sqlw,function(err,result,fields){
                        try{
                            if (err) throw err;
                            if (result.changedRows!=1){
                                console.log('SQL waring!')
                                console.log(result);
                            }
                            if (iter == productLength - 1 ){
                                callback(filename);
                            }
                            
                            // console.log(result);
                            // console.log(fields);
                            // console.log(sqlw);    
                        }catch(error){
                            main.logStream.write("Ошибка обновления записи: product_id="+product.product_id +
                                ', quantity =' + product.quantity + ', price=' + product.price + ' из файла '+filename +
                                '. Код ошибки: ' + error +'\n');  

            //!!!Вывести в лог информацию о данных которые не удолось обновить и имя файла откуда взяты данные
                        }
                        }
                    );

                }else{
                        main.logStream.write('Запись с product_id = '+product.product_id+' и store_id = '+store_id+ ' отсутсвует в БД. Невозможно обновить запись. \n')
                }
            
            }catch(error){
                main.logStream.write('Ошибка обновления из файла '+ filename+' '+error+'\n');

            }
        });
}

dbClient.prototype.test = function test(){
    console.log('test');
}
dbClient.prototype.closeDb = function closeDb(){
    //this.connection.end();
    console.log("Db destroy");
}


dbClient.prototype.export = function(){
    return new Promise ( (resolve, reject) =>{
        var sql = 'SELECT DISTINCT(p.product_id),d.name FROM shop.oc_product_to_multistore as p JOIN shop.oc_product_description as d '+
        'ON p.product_id = d.product_id'
        this.connection.query(sql, (err, result, filds)=>{ 
            if(err) {return reject(err);}
            resolve( result);
    })
})
}

dbClient.prototype.query = function(sql){
    return new Promise( (resolve,reject)=>{

        this.connection.query(sql, (err, result, filds) =>{
            if (err) {return  reject(err);}
            resolve(result);
        })
    })
}

dbClient.prototype.exportTree = function(){
    return new Promise( (resolve,reject)=>{
        var sql = 'SELECT cat.category_id,decs.name, cat.parent_id FROM shop.oc_category_description as decs JOIN shop.oc_category as cat '+
        'on decs.category_id = cat.category_id';
        this.connection.query(sql, (err, result, filds) =>{
            if (err) {return  reject(err);}
            resolve(result);
        })
    })
}


dbClient.prototype.selectOrder = function selectOrder(callback){
    var sql = 'SELECT firstname, lastname, telephone, payment_address_1 FROM oc_order'
    this.connection.query(sql, function(err, results, filds){
        if (err) throw err;
        // console.log(results.RowDataPacket);
        // console.log(results[0].firstname);
        // console.log(results[1].lastname);
        if(typeof callback == 'function'){
            callback(results);
        }
    })
}

module.exports = new dbClient();

