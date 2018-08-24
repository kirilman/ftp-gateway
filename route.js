var express = require('express');
const bodyParser = require("body-parser");
var router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }))
var evt = require('events');
var fs = require('fs')
const main = require('./parsing');

function readConfig(){
    config = JSON.parse(fs.readFileSync('config.json','utf8'));
    return config;
}

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

router.get('/config',(req,res)=>{
    console.log(req.url);
    console.log(readConfig())
    ans = {
        config: readConfig(),
        status: "ОК"
    }
    console.log(ans.body)
    res.send(ans);
});

router.post('/saveConfig',(req,res)=>{
    console.log(req.body);
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

router.post('/update',(req,res) => {
    console.log(res.body);
    main.updateProduct();
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
    console.log(main.job.job)
    main.job.cancel();
    main.online = false;
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
exports.route=router;