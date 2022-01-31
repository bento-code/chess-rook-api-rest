const User=require('../models/user');
const pool=require('../database');
const jwt=require('jsonwebtoken');
const authController=require('./auth.controller')

const getUsers=('/users', (req, res,next) => 
{
    let sql=`SELECT * FROM User`;
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

//We build the put query fields checking which ones are defined
const putFieldBuilder = async (fields) =>
{
    let queryBuilder=""
    let params=[];
    console.log("In put fnct")
    console.log(fields);

    let hasNewPassword=false;
    let newPassIndex;
    for(field in fields)
    {
        console.log("FIELD")
        console.log(field);
        console.log(fields[field])
        if(fields[field]!==undefined&&fields[field]!=="")
        {
            if(field==="password")
            {
                hasNewPassword=true;
                newPassIndex=params.length;
                /*console.log("here 1")
                let newPass=encryptPassword(fields[field])//.toPromise()
                fields[field]=newPass;
                console.log(newPass);*/
            }
            console.log("here 2")
            queryBuilder=queryBuilder+`${field} = ?, `;
            params.push(fields[field]);
        }
        console.log("here 3")
    }
    queryBuilder=queryBuilder.slice(0,-2)+" ";
    console.log(queryBuilder);

    if(hasNewPassword)
    {
        console.log("New pass on: "+newPassIndex)
        let encrypted=await authController.encryptPassword(fields[field])
        /*.then((encryptedPassword)=>
        {*/
            params[newPassIndex]=encrypted;
            console.log(params)
            return {query: queryBuilder, params: params};
        /*})*/
    }
    else
    {
        console.log(params)
        return {query: queryBuilder, params: params};
    }
        
    
}

const putUser = async (req, res, next) =>
{
    console.log("token: "+req.token);
    checkToken(req, res)
    .then(()=>
    {
        jwt.verify(req.token, '1234', async(error, authData) => 
        {
            console.log("********************")
            console.log(authData)
            console.log("********************")
            console.log("verify 1");
            console.log(req.token);
            console.log("checking...");
            if(error)
            {
                console.log("error!");
                console.log(error);
                res.status(403).json({message: "forbidden!"})
            }
            else
            {
                console.log("verified!");

                //We verify if the user updating the data is the same as signed or admin
                if((authData.username===req.body.username)||(authData.username==="admin"))
                {
                    console.log("Body:")
                    console.log(req.body);
                    const {username, name, surname, email, bulletActualRating, bulletMaxRating, blitzActualRating, blitzMaxRating, rapidActualRating, rapidMaxRating, password, newPassword} =req.body;
                    
                    let sql;
                    let params;

                    console.log("Here");

                    //Admin can update ratings while username only data.
                    //Admin should not change password under normal circumstances.

                    //Admin update

                    let admin=false;

                    if(authData.username==="admin"&&req.body.username!=="admin")
                    {
                        admin=true;
                        let queryFields= await putFieldBuilder(
                        {
                            "name":name,
                            "surname":surname,
                            "email":email,
                            "bulletActualRating":bulletActualRating,
                            "bulletMaxRating":bulletMaxRating,
                            "blitzActualRating":blitzActualRating,
                            "blitzMaxRating":blitzMaxRating, 
                            "rapidActualRating":rapidActualRating, 
                            "rapidMaxRating":rapidMaxRating
                        })
                        params=queryFields.params;
                        params.push(username);
                        sql=`UPDATE User SET ${queryFields.query} WHERE username = ?`;
                    }
                    else
                    {
                        let queryFields=await putFieldBuilder(
                        {
                            "name":name,
                            "surname":surname,
                            "email":email,
                            "password":newPassword
                        })

                        console.log("¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡")
                        console.log(queryFields);
                        console.log("¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡")
                        params=queryFields.params;
                        params.push(username);
                        sql=`UPDATE User SET ${queryFields.query} WHERE username = ?`;
                        console.log(sql)
                    }
                    checkUserCreatedQuery(username)
                    .then((data) =>
                    {
                        if(data.length == 1)
                        {
                            console.log("checking password...");
                            console.log(data[0]);
                            if(!admin)
                                return authController.checkPassword(password, data[0].password); 
                            else
                                return true;
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
                        console.log("Valid!")
                        if(isValidPassword)
                        {

                            console.log(sql+"  "+params);

                            //pool.query(sql, params, (err, data)=>     
                            pool.query(sql,params,(err, data)=> 
                            {
                                console.log("pooled");
                                if((data!=null)&&(data!==undefined)) 
                                {
                                    console.log("updated: ");
                                    console.log(data);
                                    return res.status(201).json({message: "User Updated!"}) 
                                }
                                else
                                {
                                    next(err);
                                }   
                            });
                        }
                        else
                        {
                            res.status(400).json(
                            {
                                message: "Incorrect password!",
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
                }
            }
        })
    })
    .catch((err)=>
    {
        console.log("Error on verify!");
    })
}


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
            console.log("********************")
            console.log(authData)
            console.log("********************")
            console.log("verify 1");
            console.log(req.token);
            console.log("checking...");
            if(error)
            {
                console.log("error!");
                console.log(error);
                res.status(403).json({message: "forbidden!"})
            }
            else
            {
                console.log("verified!");
                let sql;
                if(req.query.online===true)
                {
                    //sql="SELECT * FROM User JOIN Rating WHERE online = true";
                }
                else
                {
                    sql=`SELECT * FROM User WHERE username=?`;
                }
                let params=[req.query.username]
                //let params=[authData.username];
                console.log(sql + "params["+params+"]");


                if((authData.username===req.query.username)||(authData.username==="admin"))
                {
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
                else
                {
                    res.status(403).json({message: "forbidden!"})
                }
            }
        })
    })
    .catch((err)=>
    {
        console.log("Error on verify!");
    })
    
})

const checkUserCreatedQuery = (username) => 
{
    return new Promise((resolve, reject) => 
    {
        let params=[username];
        console.log("checking user created")
        console.log('SELECT * FROM User WHERE username=?    ' +params[0])
        pool.query('SELECT * FROM User WHERE username=?', params, (error, data) => 
        {
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
    console.log(req.body)
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

        return authController.encryptPassword(password); 
        //return encryptPassword(password); 
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
    console.log("username: "+username)
    console.log("password: "+password)
    let userData;
    let userExists = false;

    checkUserCreatedQuery(username)
    .then((data) =>
    {
        if(data.length == 1)
        {
            console.log("checking password...");
            console.log(data[0]);
            return authController.checkPassword(password, data[0].password); 
            //return checkPassword(password, data[0].password); 
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
            console.log("generating jwt...")
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










module.exports={getUsers, getUser, signUp, signIn, putUser};