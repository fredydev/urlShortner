const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 5001;
const Schema = mongoose.Schema;
const Url = mongoose.model("Url", new Schema({
    original_url: String,
    short_url: Number
}))

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(__dirname+"/public"))
mongoose.connect("mongodb://donfred:killy2883816@ds111765.mlab.com:11765/labo-principal",()=>{
    console.log("Connection to database succesful");
})

app.get("/",(req,res,next)=>{
        res.sendFile("/public/index.html")
});
app.get("/deleteall",(req,res)=>{
    Url.remove({})
    .then(resp=>{
        res.statusCode = 200;
        res.setHeader("Content-Type","application/json");
        res.json({success: true,message: "all urls have been deleted"});
    })
    .catch(err=>next(err))
})
app.post("/api/shorturl/new",(req,res)=>{
    let ur = req.body.url;
    if(ur===""||/\s/g.test(ur) || !/^https:\/\/www\./.test(ur)){
        res.statusCode = 403;
        res.setHeader("Content-Type","application/json");
        res.json({error: "invalid Url"})
    }
    else{
        Url.findOne({original_url: req.body.url})
        .then(url=>{
            if(!url){
                Url.find({})
                .then(urls=>{
                    Url.create({
                        original_url: req.body.url,
                        short_url: urls.length + 1
                    })
                    .then(url=>{
                        res.statusCode = 200;
                        res.setHeader("Content-Type","application/json");
                        res.json({original_url: url.original_url,short_url:url.short_url});
                    })
                    .catch(err=>console.log(err))
                })
            }
        })
        .catch(err=>console.log(err))
    }
        
})
app.get("/api/shorturl/:short",(req,res)=>{
    console.log("sht=> "+req.params.short)
    if(isNaN(req.params.short) || req.params.short ==0){
        res.statusCode = 403;
        res.setHeader("Content-Type","application/json");
        res.json({error: "wrong format"})
    }
    else{
        Url.findOne({short_url:req.params.short})
        .then(url=>{
            if(!url){
                res.statusCode = 403;
                res.setHeader("Content-Type","application/json");
                res.json({error: "No short url found for given input"})
            }
            else{
                res.redirect(url.original_url)
            }
        })
    }
    
})

app.listen(PORT,()=>{
    console.log("app is listening at http://localhost:"+PORT);
})