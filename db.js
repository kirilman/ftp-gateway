var evt = require('events');
var mysql      = require('mysql');


var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '606613',
  database : 'data'
});
 
connection.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
   
console.log('connected as id ' + connection.threadId);
  });
var id = Math.round(Math.random()*50000);
connection.query('INSERT INTO Product VALUES ('+id+',"Балтика 8", 13.14, 125)',
                 function (error, results, filds){
    if (error) throw error;
    console.log(results);
});





// function InsertDB(connect, item){
//     console.log(item);
//     var query = 'INSERT INTO Product VALUES ('+item.id+',"'+item.name+'",'+item.amount+','+item.price+')';
//     console.log(query);
//     connect.query(query);
// }

// function testexport(){
//     console.log('Работает модуль test export')
// }
// var x = 100
// module.exports = InsertDB;
// module.exports.func = testexport();
// module.exports = x;


// product = {
//     id: 21321,
//     name: "Помидор краснодарский",
//     amount: 200,
//     price: 100
// }
// console.log(product)

// InsertDB(connection, product )

connection.end();