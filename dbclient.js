var evt = require('events');
var mysql = require('mysql');
var async = require('async');
var datetime = require('node-datetime')
var main = require('./parsing')

// var connection = mysql.createConnection({
//     host     : 'localhost',
//     user     : 'root',
//     password : '606613',
//     database : 'data'
//   });

//Pool 
var connection = mysql.createPool({
    host     : 'localhost',
    user     : 'root',
    password : '606613',
    database : 'data',
    connectionLimit: 20,
  });


dbClient.prototype = new evt.EventEmitter;
emt = new evt.EventEmitter;
function dbClient(){
    console.log('Db constuct start');
    this.connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : '606613',
        database : 'data'
      });


    //   this.connection = mysql.createConnection({
    //     host     : '192.168.2.116',
    //     user     : 'root',
    //     password : '',
    //     database : 'shope'
    //   });

    var self = this;
    this.connection.connect(function(err) {
        if (err) {
          console.error('Error connecting with DB: ' + err.stack);
          return;
        };
    })
    
};

dbClient.prototype.insertProduct = function insertProduct( product){
    var query = 'INSERT INTO Product VALUES ('+product.id+','+product.price+','+product.amount+')';
    console.log(query);
    this.connection.query(query);
}

dbClient.prototype.updateProduct = function updateProduct ( product , filename ){

    //Основное
    // let sql = 'UPDATE Product SET amount =' + product.amount +', price =' +product.price + 'WHERE id='+ product.id;
    // this.connection.query(sql);
    // console.log(sql);

    // function test(product){
    //     var promise = new Promise( function(resolve, reject) {
    //             sql = "SELECT Count(id) as count FROM Product WHERE id = "+ product.id;
    //             this.connection.query(sql,function(err,result,fields){
    //                 if (err) {
    //                     reject(new Error('Error'+ sql))
    //                 }else{
    //                     resolve(result);   
    //                 }
    //             })
    //             return promise;
    //     })
    // }
    
    // test(product).then(function(){console.log('Promise work',result)})
    // sql = "SELECT Count(id) as count FROM Product WHERE id = "+ product.id;
    // this.connection.query(sql,function(err,result,fields){
    //         if (err) throw err;
    //             console.log(sql);
    //         });
                










    // var sql = 'UPDATE Product SET name = "'+ product.name +'", price = '+product.price+
    // ', amount =' + product.amount +' WHERE id='+ product.id;
    // emt.on('queryCount',function(result,prod){
    //     // console.log(result[0].count)
    //     if (result[0].count>0){
    //         sql = 'UPDATE Product SET amount =' + prod.amount +' WHERE id='+ prod.id;

    //         connection.query(sql,function(err,result,fields){
    //             if (err) throw err
    //             });
    //     }else{
    //         sql = 'INSERT INTO Product VALUES ('+prod.id+',"'+prod.name+'",'+
    //                         prod.price+','+prod.amount+')';
    //         connection.query(sql,(err)=>{
    //             if (err) {
    //                 console.log('Количество записей в бд',result[0].count,' Ошибка вставки в запросе',sql);
    //                 throw err;
    //             }
    //         });
    //     }
        
    // })



    sql = "SELECT Count(id) as count FROM Product WHERE id = "+ product.id;
    this.connection.query(sql,function(err,result,fields){
        // console.log(sql);
        if (err) throw err;
            
            // emt.emit('queryCount',result,product);
            if (result[0].count>0){

                data = datetime.create().format('Y-m-d H:M:S');
                let sqlw = 'UPDATE Product SET amount =' + product.amount +', price =' +product.price + 
                            ', date_modified = "'+ data +'" WHERE id='+ product.id;
                // console.log(sqlw);
                connection.query(sqlw,function(err,result,fields){
                    try{
                        if (err) throw err
                        // console.log(sqlw);    
                    }catch(error){
                        
                        main.logStream.write("Ошибка обновления записи: id="+product.id +
                            ', amount=' + product.amount + ', price=' + product.price + ' из файла '+filename +
                            '. Код ошибки: ' + error +'\n');
//!!!Вывести в лог информацию о данных которые не удолось обновить и имя файла откуда взяты данные
                    }
                    });

            }else{
                data = datetime.create().format('Y-m-d H:M:S');
                let sqlw = 'INSERT INTO Product VALUES ('+product.id+', '+
                        product.price+', '+product.amount +',"'+ data+'")';
                connection.query(sqlw,(err)=>{
                    try{
                        if (err) throw err;
                    }catch(error){
                            main.logStream.write("Ошибка добавления записи." + 
                                ' Код ошибки: ' + error +'\n')
                    }
                    // console.log(sqlw);
                    });
                }
            });
        // .on('result',function(result){
        //     console.log(result[0].count)
        //     if (result[0].count!=0){
        //         sql = 'UPDATE Product SET amount =' + product.amount +' WHERE id='+ product.id;
        //         con.query(sql,function(err,result,fields){
        //             if (err) throw err
        //             });
        //         console.log(sql);
        //     }else{
        //         sql = 'INSERT INTO Product VALUES ('+product.id+',"'+product.name+'",'+
        //                         product.price+','+product.amount+')';
        //         con.query(sql);
        //         console.log(sql);
        //     }
        // });

    
    
    // if (result[0].count!=0){
    //     sql = 'UPDATE Product SET amount =' + product.amount +' WHERE id='+ product.id;

    //     this.connection.query(sql,function(err,result,fields){
    //         if (err) throw err
    //         });
    // }else{
    //     sql = 'INSERT INTO Product VALUES ('+product.id+',"'+product.name+'",'+
    //                        product.price+','+product.amount+')';
    //         this.connection.query(sql);
    // }
    // query = "SELECT * FROM Product WHERE amount < 13";


    // console.log(sql)

    // this.connection.query(sql, function(err,result,fields){
    //     if (err) throw err;
    //     // console.log(result[0].count)
    //     if (result[0].count!=0){
    //         sql = 'UPDATE Product SET amount =' + product.amount +' WHERE id='+ product.id;
    //         self.connection.query(sql);
    //         console.log(sql)
    //         // this.connection
    //         // this.connection
    //     }
    //     else{
    //         var sql = 'INSERT INTO Product VALUES ('+product.id+',"'+product.name+'",'+
    //                    product.price+','+product.amount+')';
    //         self.connection.query(sql);

    //     }
    // })

    // query = 'UPDATE Product SET amount =' + product.amount +' WHERE id='+ product.id;
    // // console.log(query);
    // this.connection.query(query);
}

dbClient.prototype.test = function test(){
    console.log('test');
}
dbClient.prototype.closeDb = function closeDb(){
    //this.connection.end();
    console.log("Db destroy");
}

module.exports = new dbClient();
