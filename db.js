var evt = require('events');
var mysql      = require('mysql');
var datetime = require('node-datetime')


var connection = mysql.createConnection({
  host     : '192.168.2.116',
  user     : 'kiril',
  password : '1234',
  database : 'shop'
});
 
connection.connect(function(err) {
    if (err) {
      console.error('!error connecting: ' + err.stack);
      return;
    }
    product = {
      id: 50,
      amount: 200,
      price: 777,
      store_id: 0
    }
    console.log(product)
    UpdateDB(connection, product)
  
   
    console.log('connected as id ' + connection.threadId);
    connection.end();
  });


// function Go(con){
//   var p = new Promise(function(resolve,reject){
//       sql = "SELECT Count(id) as count FROM Product WHERE id = 2";
//       con.query(sql,function(err,result,fields){
//         if (err) {
//             reject(new Error('Error'+ sql))
//         }else{
//             resolve(result);   
//         }
//       })
//     })
//     return p;
//   };

//   Go(connection).then(function(result){
//       console.log(result);
//       sql = "SELECT Count(id) as count FROM Product WHERE id = 12";
//       connection.query(sql,function(err,res,fields){
//            if (err) throw err;
//           console.log(res);
//       })
//     }, function(){
//       console.log('a');
//     }
// )












function InsertDB(connect, item){
    console.log(item);
    var query = 'INSERT INTO Product VALUES ('+item.id+',"'+item.name+'",'+item.amount+','+item.price+')';
    console.log(query);
    connect.query(query);
}

function UpdateDB(connect, item){

  data = datetime.create().format('Y-m-d H:M:S');
  let query = 'UPDATE oc_product_to_multistore SET quantity=' + product.amount +', price =' +product.price + 
              ', date_modified = "'+ data +'" WHERE product_id='+ product.id +' AND store_id = ' +product.store_id;
  console.log(query);
  connect.query(query);
}


function testexport(){
    console.log('Работает модуль test export')
}
var x = 100
module.exports = InsertDB;
module.exports.func = testexport();
module.exports = x;



// InsertDB(connection, product )
