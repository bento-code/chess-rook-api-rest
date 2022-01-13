const User=require('../models/user');
const pool=require('../database');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');

const encryptPassword = async(password)=>
{
    const salt=await bcrypt.genSalt(10);
    const pass = await bcrypt.hash(password, salt);
    return pass;
}

const checkPassword = async(password, hash)=>
{
    const result= await bcrypt.compare(password, hash);
    return result;
}

const getUsers=('/users', (req, res,next) => 
{
    let sql;
    if(req.query.online===true)
    {
        //sql="SELECT * FROM User JOIN Rating WHERE online = true";
    }
    else
    {
        sql=`SELECT * FROM User`;
    }
    let params=[];
    console.log(sql);
    pool.query(sql, (err, data)=>
    {
        if((data!=null)&&(data!==undefined))
        {
            console.log("data: ");
            console.log(data);
            return res.status(200).json({message: data})
        }
        else
        {
            next(err);
        }   
    });
})


const checkToken = (req, res) => 
{
    return new Promise((resolve, reject) => 
    {
        console.log("verifying...");
        const bearerHeader =req.headers['authorization'];

        if(typeof bearerHeader !== 'undefined')
        {
            const bearerToken =bearerHeader.split(" ")[1];
            req.token = bearerToken;
            return resolve("token checked")
        }
        else
        {
            res.status(403).json({message: "forbidden!"}) 
            res.send();
            reject("invalid token");
        }
    });
 };

//Authorization: Bearer <token>


const getUser=('/user', (req, res,next) => 
{
    checkToken(req, res)
    .then(()=>
    {
        jwt.verify(req.token, '1234', (error, authData) => 
        {
            console.log("verify 1");
            console.log(req.token);
            if(error)
            {
                res.status(403).json({message: "forbidden!"})
            }
            else
            {
                let sql;
                if(req.query.online===true)
                {
                    //sql="SELECT * FROM User JOIN Rating WHERE online = true";
                }
                else
                {
                    sql=`SELECT * FROM User WHERE username=?`;
                }
                let params=[req.query.username];
                console.log(sql + "params["+params+"]");
                pool.query(sql, params, (err, data)=>
                {
                    if((data!=null)&&(data!==undefined)&&(data.length==1))
                    {
                        console.log("data: ");
                        console.log(data);
                        return res.status(200).json
                        ({
                            user: data[0],
                            failed:false
                        })
                    }
                    else
                    {
                        next(err);
                    }   
                });
            }
        })
    })
    .catch((err)=>
    {
        
    })
    
})

const checkUserCreatedQuery = (username) => 
{
    return new Promise((resolve, reject) => 
    {
        let params=[username];
        console.log('SELECT * FROM User WHERE username=?    ' +params[0])
        pool.query('SELECT * FROM User WHERE username=?', params, (error, data) => {
            if (error) 
            {
                return reject(error);
            }
            return resolve(data);
       });
    });
 };

const signUp=('/signup', (req, res,next) => 
{
    const {username, password, name, surname, email}=req.body 
    const bulletActualRating=1200; 
    const bulletMaxRating=1200;
    const blitzActualRating=1200;
    const blitzMaxRating=1200;
    const rapidActualRating=1200;
    const rapidMaxRating=1200;
    let userExists = false;

    checkUserCreatedQuery(username)
    .then((data) =>
    {
        if(data.length == 1)
            userExists=true;

        return encryptPassword(password); 
    })
    .then((encryptedPassword) =>
    {
        console.log(userExists)
        if(!userExists)
        {
            console.log("creating new user...")       
            //let params=[username, password, name, surname, email, bulletActualRating, bulletMaxRating, blitzActualRating, blitzMaxRating, rapidActualRating, rapidMaxRating];
            let params=[username, encryptedPassword, name, surname, email, bulletActualRating, bulletMaxRating, blitzActualRating, blitzMaxRating, rapidActualRating, rapidMaxRating];
            let sql=`INSERT INTO User(username, password, name, surname, email,         
                                    bulletActualRating, bulletMaxRating, blitzActualRating,      
                                    blitzMaxRating, rapidActualRating, rapidMaxRating)         
                                    VALUES(?,?,?,?,?,?,?,?,?,?,?)`;   
                    console.log(sql + "params["+params+"]");     
            pool.query(sql, params, (err, userSaved)=>        
            {
                if((userSaved!=null)&&(userSaved!==undefined)) 
                {
                    console.log("userSaved: ");
                    console.log(userSaved);
                    res.status(201).json({message: "User Saved!"}) 
                }
                else
                {
                    next(err);
                }   
    
            });
        }
        else res.status(400).json(
        {
            message: "user already exists!",
            failed:true
        }) 
        //return res.status(403).json({message: "user already exists!"}) 
    })
    
})



const signIn=('/signin', (req, res,next) => 
{

    const {username, password} =req.body;
    let userData;
    let userExists = false;

    checkUserCreatedQuery(username)
    .then((data) =>
    {
        if(data.length == 1)
        {
            console.log("checking password...");
            console.log(data[0]);
            return checkPassword(password, data[0].password); 
        }
        else
        {
            res.status(400).json(
            {
                message: "User not found!",
                failed:true
            });
            res.send();
            throw new Error("User not found!");
        }
        
    })
    .then((isValidPassword) =>
    {
        if(isValidPassword)
        {
            jwt.sign({username}, '1234', (err, token) => 
            {
                res.status(200).json(
                {
                    message: "Signed in!",
                    jwt:token,
                    username:username,
                    logged:true
                }) 
            })

        }
        else
        {
            res.status(400).json(
            {
                message: "Incorrect password!",
                logged:false,
                failed:true
            });
            res.send();
            throw new Error("Invalid password");
        }
    })
    .catch((err)=>
    {
        console.log(err);
    });

    
})










module.exports={getUsers, getUser, signUp, signIn};