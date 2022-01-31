const User=require('../models/user');


const Rating=require('../models/rating');
const pool=require('../database');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');

const checkPassword = async(password, hash)=>
{
    const result= await bcrypt.compare(password, hash);
    console.log("password correct: "+result)
    return result;
}

const encryptPassword = async(password)=>
{
    const salt=await bcrypt.genSalt(10);
    const pass = await bcrypt.hash(password, salt);
    return pass;
}

const checkTokenStructure = (req, res) => 
{
    return new Promise((resolve, reject) => 
    {
        console.log("verifying...");
        const bearerHeader =req.headers['authorization'];

        if(typeof bearerHeader !== 'undefined')
        {
            console.log("header recieved!");
            const bearerToken =bearerHeader.split(" ")[1];
            req.token = bearerToken;
            console.log("token: "+req.token);
            return resolve("token checked")
        }
        else
        {
            console.log("missing header!");
            res.status(403).json({message: "forbidden!"}) 
            res.send();
            reject("invalid token");
        }
    });
};

//const verifyAdmin=('/')

/*const getUserFromJwt = (jwt, username)
{

}*/

const verifyToken=('/verifyToken', (req, res,next) => 
{
    checkTokenStructure(req, res)
    .then(()=>
    {
        console.log("validTokenStructure=true");
        jwt.verify(req.token, '1234', (error, authData) => 

        {
            console.log("*********************************")
            console.log(authData);
            console.log("*********************************")
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
                    /*sql=`SELECT username, 
                        bulletActualRating, 
                        bulletMaxRating, 
                        blitzActualRating, 
                        blitzMaxRating, 
                        apidActualRating, 
                        rapidMaxRating 
                        FROM User WHERE username=?`;*/
                        sql=`SELECT username, bulletActualRating, bulletMaxRating, blitzActualRating, blitzMaxRating, rapidActualRating, rapidMaxRating FROM User WHERE username=?`;
                }
                let params=[req.query.username];
                console.log(sql + "params["+params+"]");
                pool.query(sql, params, (err, data)=>
                {
                    console.log('\x1b[33m%s\x1b[0m', "query made");
                    if((data!=null)&&(data!==undefined)&&(data.length==1))
                    {
                        console.log("data: ");
                        console.log(data);
                        console.log(req.token);
                        return res.status(200).json
                        ({
                            user: new User(
                                data[0].username,
                                new Rating(
                                    data[0].bulletActualRating, 
                                    data[0].bulletMaxRating, 
                                    data[0].blitzActualRating, 
                                    data[0].blitzMaxRating, 
                                    data[0].rapidActualRating, 
                                    data[0].rapidMaxRating),
                                req.token
                            ),
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
        console.log("Invalid token!")
        console.log(err);
        res.status(403).json({message: "forbidden!"});

    })
    
})

module.exports={verifyToken, checkPassword, encryptPassword};