var evt = require('events');
var mysql = require('mysql');

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '606613',
    database : 'data'
  });

dbClient.prototype = new evt.EventEmitter;

function dbClient(){
    console.log('Db constuct start');
    this.connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : '606613',
        database : 'data'
      });
    
    this.connection.connect(function(err) {
        if (err) {
          console.error('Error connecting with DB: ' + err.stack);
          return;
        };
    })
};

dbClient.prototype.insertProduct = function insertProduct( product){
    var query = 'INSERT INTO Product VALUES ('+product.id+',"'+product.name+'",'+product.price+','+product.amount+')';
    console.log(query);
    this.connection.query(query);
}

dbClient.prototype.updateProduct = function updateProduct ( product ){
    var sql = 'UPDATE Product SET name = "'+ product.name +'", price = '+product.price+
    ', amount =' + product.amount +' WHERE id='+ product.id;

    sql = "SELECT Count(id) as count FROM Product WHERE id = "+ product.id;

    // query = "SELECT * FROM Product WHERE amount < 13";

    this.connection.query(sql, function(err,result,fields){
        if (err) throw err;
        if (result[0].count!=0){
            sql = 'UPDATE Product SET amount =' + product.amount +' WHERE id='+ product.id;
            connection.query(sql);
        }
        else{
            var sql = 'INSERT INTO Product VALUES ('+product.id+',"'+product.name+'",'+
                       product.price+','+product.amount+')';
            connection.query(sql);

        }
    })

    // query = 'UPDATE Product SET amount =' + product.amount +' WHERE id='+ product.id;
    // // console.log(query);
    // this.connection.query(query);
}

dbClient.prototype.test = function test(){
    console.log('test');
}

module.exports = new dbClient();
