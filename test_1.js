// var datetime = require('node-datetime')

// // function f(){
// //     data = datetime.create().format('Y-m-d H:M:S');
// //     console.log(data)
// // }
// // setInterval(f,3000)

// var now = datetime.create().format('Y-m-d')
// var tempDate = datetime.create(now).getTime()+86400000;
// var future = datetime.create(tempDate).format('Y-m-d')
// console.log(d)
// console.log(future)

var ids = [1,2,3,4,5]

var a = 0
if (ids.indexOf(a)!=-1){
    console.log(a,' есть в ', ids)
    console.log(ids.indexOf(a))
}else{
    console.log('нет', ids)
}
