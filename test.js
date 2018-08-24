var fs = require('fs')


var t;

var fd = fs.openSync('log_file.txt', 'r')
fs.readFile('log_file.txt',{encoding:'utf-8'},(err,data) => {
    if (err) throw err;    
    var arr = data.split('\n')              
    var length = arr.length;
    if (length > 8000){
        var logStream = fs.createWriteStream('log_file.txt',{encoding:'utf-8'});
        arr.slice(arr.length - 4000,arr.length).forEach((item,index) => {
            logStream.write(item.toString() +'\n');
            }
        )
    }else{
        var logStream = fs.createWriteStream('log_file.txt',{encoding:'utf-8',flags:'a'})

    }
})
