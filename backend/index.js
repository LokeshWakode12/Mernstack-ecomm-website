const express = require("express");
const cors = require("cors");
const app = express();
const User = require('./DB/users');
const Product = require('./DB/products');
const jwt = require('jsonwebtoken');
const jwtkey = 'ecomm';
require('./DB/config')();

app.use(express.json());
app.use(cors());

app.post('/register',async (req,res)=>{
    let user = new User(req.body);
    let result = await user.save();
    result = result.toObject();
    delete result.password; 
    jwt.sign({result},jwtkey,{expiresIn:'2h'},(err,token)=>{
        if(err){
            res.send({result: "Something Wents Wrong"});
        }
        res.send({result, auth: token});
    })
});

app.post('/login',async (req,res)=>{
    let user = await User.findOne(req.body).select('-password');
    if (req.body.email && req.body.password) {
        if(user){
            jwt.sign({user},jwtkey,{expiresIn:'2h'},(err,token)=>{
                if(err){
                    res.send({result: "Something Wents Wrong"});
                }
                res.send({user, auth: token});
            })
        }else{
            res.send({msg:"No user found"});
        }
    }else{
        res.send({msg:'No user found'});
    }
});

app.post('/addproduct',verifyToken,async (req,res)=>{
    const data = new Product(req.body);
    const result = data.save();
    if(result){
        res.send(data);
    }else{
        res.send({'msg':'Error in storing product details'});
    }
});

app.get('/products',verifyToken,async (req,res) =>{
    const products = await Product.find();
    if(products.length >0){
        res.send(products);
    }else{
        res.send('No Product available');
    }
});

app.delete('/product/:id',verifyToken, async (req,res) =>{
    const result = await Product.deleteOne({_id:req.params.id}); 
    res.send(result);
});

app.get('/product/:id',verifyToken, async (req,res) =>{
    const result = await Product.findOne({_id:req.params.id}); 
    res.send(result);
});

app.put('/product/:id',verifyToken, async (req,res) =>{
    const result = await Product.updateOne({_id:req.params.id},{
        $set: req.body
    }); 
    res.send(result);
});

app.get('/search/:key',verifyToken, async (req,res) =>{
    const result = await Product.find({
        "$or": [
            {name: {$regex: req.params.key} },
            {category: {$regex: req.params.key} },
            {company: {$regex: req.params.key} },
        ]
    }); 
    res.send(result);
});

function verifyToken(req,res,next){
    let token = req.headers['authorization'];
    if(token){
        token = token.split(' ')[1];
        jwt.verify(token, jwtkey, (err,valid)=>{
            if(err){
                res.status(402).send({message:'Please provide valid token'});
            }else{
                next();
            }
        })
    }else{
        res.status(403).send({message:'Please provide token'});
    }
} 

app.listen(8000,(req,res)=>{
    console.log("port is listening...");
});
