var fs = require('fs')
// stream = fs.createWriteStream('file')
// var a = ' test'
// stream.write('hello world'+ a)
// for(i=0; i<50; i++){
//     console.log(i.toString());

//     stream.write(i.toString()+'\n');
// }
// stream.on('finish',function(){
//     console.log('finish');
// });
var fileName = 'products.xml'

//var path = "./XML copy/"+"local_" + fileName;
var path = "XML copy/local_products.xml";
// var path = "/home/kirilman/Projects/JS/Learn JS/test ftp/XML copy/local_products.xml";

// var path = "products.xml"
var data = fs.readFileSync( path, "utf8");

console.log(data);

// var data = fs.readFileSync( fileName, "utf8");
// console.log(data);

fs.readFile(path,"utf8",function(err,data){
    if (err) throw err;
    console.log(data)
})