const {Router} =require("express");

const router=Router();

const usersController=require('../controllers/users.controller')

router.get('/users', usersController.getUsers);
router.get('/user', usersController.getUser);
router.put('/user', usersController.putUser);
router.post('/signup', usersController.signUp);
router.post('/signin', usersController.signIn);

module.exports=router;

/*router.get('/users', (req,res, next) => 
{
    res.setHeader("Content-Type", "application/json");
    let sql;
    if(req.query.online===true)
    {
        sql="SELECT * FROM User WHERE online = true";
    }
    else
    {
        sql="SELECT * FROM User";
    }
    let params=[];
    
    querySender(res, sql, params);  
})


app.get('/users', (req,res) => 
{
    
    res.setHeader("Content-Type", "application/json");
    let sql;

    if(req.query.online===true)
    {
        sql="SELECT * FROM User WHERE online = true";
    }
    else
    {
        sql="SELECT * FROM User";
    }
    let params=[];
    
    querySender(res, sql, params);  
})

app.get('/user/:username', (req,res) => 
{
    res.setHeader("Content-Type", "application/json");
    let sql="SELECT * FROM User WHERE username = ?";
    
    let params=[req.params.username];
    
    querySender(res, sql, params);  
})
*/




