var express = require('express');
const bodyParser = require("body-parser");
var router = express.Router();
var db = require('./dbclient');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }))
var evt = require('events');
var fs = require('fs')
const main = require('./parsing');

const request = require('./request');

const exportDB = require('./exportDB');

const updateStatus = require('./orderStatus');
// Запуск работы обработки заказа

function readConfig(){
    config = JSON.parse(fs.readFileSync('config.json','utf8'));
    return config;
}

router.get('/config',(req,res)=>{

    temp_config = readConfig();
    temp_config.password = ''
    temp_config.user = ''

    ans = {
        config: temp_config,
        status: "ОК"
    }

    res.send(ans);
});

function cheackFilds(fields, obj){
    ans = true;
    if(obj==undefined)
        return false
    for(var i=0;i<fields.length;i++){
        if(!(fields[i] in obj)){
            ans=false;
            break;
        }
    }
    return ans;
}

router.post('/saveConfig',(req,res)=>{
    console.log('saveConfig',req.body);
    fileds = ['host','port','user','password','period'];
    if (!cheackFilds(fileds,req.body)){
        var ans = { status: 'error',
                commet: 'Настройки конфигурации введены неверно'}
        res.send(ans);
    }else{
        ans = {status:'ОК'};
        res.send(ans);
        data = JSON.stringify(req.body);

        fs.writeFileSync('config.json',data);
    }

  
})


//Обновление остатков 
router.post('/update',(req,res) => {
    
    console.log(res.body);
    main.updateProduct();
    // request.run_request(req.body);
    ans = { status:'ОК'}
    res.send(ans);
})

router.post('/autoUpdate',(req,res) => {
    ans = { status:'ОК'};
    config = readConfig();
    main.autoRun(config.period);
    res.send(ans);
})

router.post('/stop', (req,res) => {
    ans = { status:'OK'};
    var emt = new evt.EventEmitter();
    emt.emit('stopUpdate');
    console.log('stop');
    clearTimeout(main.timer);
    main.job.cancel();
   // main.logStream.write(datatime.create().format('Y-m-d H:M:S'))
    //main.logStream.write('Процедура автообновления остановлена \n')
    main.online = false;
})


router.post('/sendOrders', (req, res) => {
    db.selectOrder((orders)=>{
        ans = { status: 'ОК',
                orders: orders        
        }
        res.send(ans);
    })
})

//Отправка заказа на ftp сервер
router.post('/updateOrder', (req, res) => {
    var ans = '123';
    res.send(ans);
    request.run_request(req.body);
})

router.get('/getStatus', (req,res) => {
    console.log(main.online)
    if (main.online){
        ans = { status:'OK',
                serviceStatus: "Включен"};
    }else{
        ans = { status:'OK',
        serviceStatus: "Отключен"};
    }
    res.send(ans);
})

router.get('/getLogfile', (req,res) => {
    fs.readFile('log_file.txt',{encoding:'utf-8'},(err,data) =>{
        if (err) throw err;
        var arr = data.toString().split('\n');
        ans = { status:'OK',
                array : arr, 
            };
        res.send(ans);
    })

})



router.get('/getLogfileRequest', (req,res) => {
    fs.readFile('log_file_request.txt',{encoding:'utf-8'},(err,data) =>{
        if (err) throw err;
        var arr = data.toString().split('\n');
        ans = { status:'OK',
                array : arr, 
            };
        res.send(ans);
    })

})

router.get('/configform', (req,res) => {
    fs.readFile('configform.html','utf8',(err,data) =>{
        res.send(data);
    })
})


router.get('/exportDb', (req,res) => {
    //main.exportDB().then(
    exportDB.exportDB().then( () => {
            var ans = { status: "OK"};
            res.send(ans);
        }, 
        error => {
            var ans = { status: "error", commet: error };
            console.log(ans)
            console.log(error)
            res.send(ans);
        }
    )

})
exports.route=router;