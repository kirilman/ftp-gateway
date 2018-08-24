var datetime = require('node-datetime')

function f(){
    data = datetime.create().format('Y-m-d H:M:S');
    console.log(data)
}
setInterval(f,3000)