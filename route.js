var express = require('express');
const bodyParser = require("body-parser");
var router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }))

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
    ans = {
        config: readConfig(),
        status: "ОК"
    }
    res.send(ans);
});

router.post('/saveConfig',(req,res)=>{
    console.log(req.body);
    fileds = ['host','port','user','password'];
    if (!cheackFilds(fileds,req.body)){
        var ans = { status: 'error',
                commet: 'Настройки конфигурации введены неверно'}
        res.send(ans);
    }else{
        ans = {status:'ОК'};
        res.send(ans);
        data = JSON.stringify({ ftpconfig: req.body});

        fs.writeFileSync('config.json',data);
    }

  
})

router.post('/update',(req,res) => {
    console.log(res.body);
    main.updateProduct();
    ans = { status:'ОК'}
    res.send(ans);
})

exports.route=router;