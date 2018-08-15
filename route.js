var express = require('express');
const bodyParser = require("body-parser");
var router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }))

var fs = require('fs')
function readConfig(){
    config = JSON.parse(fs.readFileSync('config.json','utf8'));
    return config;
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
    console.log(req.body.host)
    ans = {status:'ОК'};
    res.send(ans)
})

exports.route=router;