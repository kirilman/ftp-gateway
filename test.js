var fs = require('fs');
var parseString = require('xml2js').parseString;

// // fs.readFile('XML copy/local_products.xml','utf-8',function(err,data){
// //     if (err) throw error;
// //     parseString(data, function(err, result){
// //         console.dir(result);
// //     });
// // });

// var b = 100;

// function f1(){
//     console.log('main');

//     function f2(a){
//         console.log(a);
//     }
// }
// var d = 1;
// f1()

// // const db = require('./dbclient');
// // db.test();

// // product = {
// //     id: 1323131,
// //     name: "Помидор краснодарский",
// //     amount: 200,
// //     price: 100
// // }
// // console.log(product)

// // db.insertProduct(product);
// a = 100 
// console.log(a)

// var evt = require('events');
// var emt = new evt.EventEmitter();
// var constlen = 500;


// circle();
// console.log('after circle')

// t();
// console.log('Main print')
// function t(){
//     var a = [1,2,3,4,5];
//     a.forEach(function(element){
//         a.forEach(elem =>{
//             let b = a*a*a*a/1000*a+1000*a/1000/a*a*3/(a*a*a);
//             var c = a*b;
//             for(i = 0; i<constlen; i++){
//                 g = a*i;
//             }
//         });
//         console.log(element);        
//     })
//     console.log('Print')
//     setTimeout(function(){
//         console.log('SetTime');
//     }, 200);

//     console.log('a');
//     emt.emit('emit1',1000);
//     // setTimeout(emt.emit('emit1'),1000);
    
// }

// emt.on('emit1',g1);

// function g1(){
//     console.log("Function work");
// }
// constlen = 20000;
// function circle(){
//     for (i=0;i<constlen; i++){
//         var b = i*i;
//         for (j=0; j<constlen/2;j++){
//             b = i*j;

//         }
//     }
//     console.log('circle')
// }
// arr = [1,2,3,4]

// arr.forEach(element => {
//     console.log('1');
//     circle();
//     console.log('2');
// });
// for (k=0; k < 5; k++){
//     console.log('1');
//     circle();
//     console.log('2');
// }



// var Client = require('ftp');
// var fs = require('fs')
// var evt = require('events');

// var emt = new evt.EventEmitter();
// var c = new Client();
// // const dbclient = require('./dbclient');

// var config = { host: '127.0.0.1',
//                 user: 'kirilman',
//                 password: '606613'};

// c.connect(config);

// emt.on('dirComplite',function(path){
//     c.list(function(err, list){
//         if (err) throw err;
//         list.forEach(elem => {
//             c.delete(path + '/'+ elem.name, err => {if(err) throw err})
//         })
//         c.emit('end');
//     })
// })
// c.on('ready',function(){
//     c.cwd('delete',function(error, currentdir){
//         c.pwd(function(err, path){
//             if (err) throw err;
//             console.log(path);
//             emt.emit('dirComplite',path);
//         });
//     });
    
// })
// c.on('end',c.end)
function readConfig(){
    config = JSON.parse(fs.readFileSync('config.json','utf8'));
    console.log(config);
    return config;
}

config = readConfig();
config.host = 1;