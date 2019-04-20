var fs = require('fs')


// var t;

// var fd = fs.openSync('log_file.txt', 'r')
// fs.readFile('log_file.txt',{encoding:'utf-8'},(err,data) => {
//     if (err) throw err;    
//     var arr = data.split('\n')              
//     var length = arr.length;
//     if (length > 8000){
//         var logStream = fs.createWriteStream('log_file.txt',{encoding:'utf-8'});
//         arr.slice(arr.length - 4000,arr.length).forEach((item,index) => {
//             logStream.write(item.toString() +'\n');
//             }
//         )
//     }else{
//         var logStream = fs.createWriteStream('log_file.txt',{encoding:'utf-8',flags:'a'})

//     }
// })
// a


// var a = '1212121.xml'
// var i = a.indexOf('.xml')
// console.log(a.slice(0,i))
// var xml =  require('xml2js');
// var fs = require('fs');
// var builder = new xml.Builder( { rootName : 'Order', headless : true });
// var element = {name: 'kirill',
//                id: 1,
//                products: {name:'iphone',
//                           quantity: 2}}
// var x = builder.buildObject(element);
// var parseString = require('xml2js').parseString;
// console.log(x)
// fs.readFile('/home/kirilman/ftpRequest/1.xml',{encoding:'utf-8'},(err,data) =>{
//     if (err) throw err;
//     console.log(data)
//     parseString(data,(err,res) => {
//         console.log(res.Order.totals[0].value)
//     })
// }
// )


// var a = require()
// var fs = require('fs')
// var datetime = require('node-datetime');
// g = datetime.create().getTime();
// var str = 'order_2018-09-09 13:55:40.xml'
// var x = str.slice(6,16)
// console.log(x)
// var d = datetime.create(x)
// console.log(datetime.create().getTime()-g)
// var main = require('./parsing')
// var req = require('./request')

// //req.exportTree();

// var db = require('./dbclient')
// // db.exportd
// // req.exportTree();
// // // db.query('SELECT cat.category_id,decs.name, cat.parent_id FROM shop.oc_category_description as decs JOIN shop.oc_category as cat '+
// // // 'on decs.category_id = cat.category_id ')
// // // .then((r)=>console.log(r))
// // db.exportTree().then((r)=>console.log(r))
// // db.query('SELECT * FROM shop.oc_category').then((res) =>{
// //     console.log(res);
// //     }
// // )
// main.exportDB().then(()=>{ console.log('end')},
//     error =>{
//         console.log(error);
//         console.log('error')
//     }
// );  

// var Client = require('ftp');
// var c = new Client();
// var ftpconfig = { 
//     host: 'ftp.planets.ru',
//     user: 'planetashop',
//     password: 'Pln322Shp',
// };
// var fs = require('fs')
// c.connect(ftpconfig);
// c.on('ready',()=>{
//         c.cwd('./ftp',(err,dir)=>{
//         fs.readdir('public/',(err,files)=>{
//             files.forEach((file)=>{
//                 c.put('public/'+file,file,(error)=>{
//                     if (error) console.log(error);
//                     console.log(file)
//                 })
//             })
//         })
//         console.log('start')
//     });
// })
// var datatime = require('node-datetime');

// var data = datatime.create().format('Y-m-d H:M:S');
//             data = data.replace(' ','_');
// console.log(data);

// // storeIds = { 'tomsk': 1,
//              'asino': 16,
//              'bakchar': 24,
//              'kargasok': 25,
//              'kolpashevo': 15,
//              'kozhevnikovo': 29,
//              'melnikovo': 11,
//              'molchanovo': 14,
//              'parabel': 26,
//              'podgornoe': 50,
//              'ziryanka': 18,
//             }
// a = 'tomsk'
// if (a in storeIds){
//     console.log('a')
// }else{
//     console.log('n')
// }
// console.log(storeIds['ziryanka'])





// fs.readFile('test.txt',{encoding:'utf-8'},(err, data) =>{
//     console.log(data);
// })

// ar = [1,2,3,4,5]
// ar.forEach( (a,i) => {
//     console.log(a,i);
// })
// console.log(ar)







//Test updateStatus

// var evt = require('events');

// var emt = new evt.EventEmitter();

// var Client = require('ftp');
// var ftp_client = new Client();



// function readConfig(){
//     config = JSON.parse(fs.readFileSync('config.json','utf8'));
//     console.log(config);
//     return config;
// } 

// var config = readConfig();

// var ftpconfig = { 
//     host: config.host,
//     user: config.user,
//     password: config.password,
// };

// // var ftpconfig = {
// //     host:'127.0.0.1',
// //     user:'kirilman',
// //     password:'606613'
// // }

// ftp_client.connect(ftpconfig);

// ftp_client.on('ready',function(){
//     ftp_client.pwd( (err,dir)=>{
//         try{
//             if (err) throw err;
//             if (dir.indexOf('OrderStatus')>0){
//                 console.log(dir)
//                 emt.emit('cwdComplete')
//             }else{
//                 ftp_client.cwd('OrderStatus',function(err,currentDir){
//                     try{
//                         if (err) throw err;
//                         emt.emit('cwdComplete');
//                     }catch(err){
//                         console.log(datetime.create().format('Y-m-d H:M:S')+ ': Неудалось изменить папку на FTP', err)
//                     }
//                 })
//             }
//         }catch(error){
//             console.log(datetime.create().format('Y-m-d H:M:S')+ ': Неудалось получить текущую директорию на FTP', error)
//         }
//     });
// });

// var Iconv  = require('iconv').Iconv;

// function toUTF8(body) {
//     var iconv = new Iconv('UTF-8', 'ISO-8859-1');
//     var message  = iconv.convert(body).toString('utf-8');
//   return message
// }

// emt.on('cwdComplete',()=>{
//     ftp_client.list( (err, filesList) =>{
//         // console.log(filesList);
//         filesList.forEach( (file) =>{
//             var a = toUTF8(file.name);
//             // fs.writeFile('russian character.txt', a, {flag:'a'},(err)=>{});
//             // console.log(file.name);
//             console.log(a);
//         })
//     })
// })


// orderStatus = require('./orderStatus')

// orderStatus.updateStatus()
var datetime = require('node-datetime')

var date_start = datetime.create().format('d-m-Y')
console.log(date_start)

var a = '20.10.10'.split('.').join('-')
a = 18
a = a.toString()  
console.log(a)
console.log(typeof(a))


var a = [1,2,3,4,5]
var a = [1]
if (a.length>0){
    console.log('re')
}