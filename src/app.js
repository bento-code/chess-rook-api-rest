const express=require("express");
const app= express();
const cors=require("cors");
const pool=require('./database');


const errorHandler=require('./errors/errorHandler')
const usersRoutes=require('./routes/users.routes');
const authRoutes=require('./routes/auth.routes');

const activeUsersId=[];
const challenges=[];

app.set("port", process.env.PORT || 3000);

app.use(cors());


app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use((req, res, next) => {
    console.log("New request");
    console.log("METHOD: "+req.method);
    console.log("URL: "+req.url);  
    console.log("USER AGENT: "+req.headers["user-agent"]);
    console.log();
    next();
})

app.use(authRoutes);
app.use(usersRoutes);
app.use((req, res, next)=>
{
    res.status(404).json(
    {
        message: "endpoint not found",
        failed:true
    });
})
app.use(errorHandler);

module.exports=app;


/*


app.get('/discos/:id', (req,res) => 
{
    res.setHeader("Content-Type", "application/json");
    let sql;
    let params=[];

    console.log("Getting disk by id...");
    sql="SELECT * FROM discos WHERE id=?";
    params.push(req.params.id);

    querySender(res, sql, params);  
})


app.post('/discos', (req,res) => 
{
    res.setHeader("Content-Type", "application/json");
    let sql=`INSERT INTO discos (titulo, interprete, anyoPublicacion) VALUES (?, ?, ?)`;
    let params=[req.body.titulo, req.body.interprete, req.body.anyoPublicacion];

    querySender(res, sql, params, (res, result)=>
    {
        if(result.insertId)
            res.send(String(result.insertId));
        else
            res.send("failed");
    }); 
})

app.put('/discos', (req,res) => 
{
    res.setHeader("Content-Type", "application/json");
    let sql=`UPDATE discos 
             SET titulo=?, interprete=?, anyoPublicacion=? 
             WHERE id=?;`;
    let params=[req.body.titulo, req.body.interprete, req.body.anyoPublicacion, req.body.id];

    querySender(res, sql, params, (res, result)=>
                                    {
                                        console.log(result.affectedRows)
                                        if(result.affectedRows>0)
                                            res.send(String(result.insertId));
                                        else
                                            res.send("failed");
                                    }, 
                                    (res, result)=>
                                    {
                                        console.log(result.affectedRows)
                                        if(result.affectedRows>0)
                                            res.send(String(result.insertId));
                                        else
                                            res.send("failed");
                                    }); 
})


app.delete('/discos', (req,res) => 
{
    res.setHeader("Content-Type", "application/json");
    let sql=`DELETE FROM discos 
             WHERE id=?;`;
    let params=[req.body.id];
    querySender(res, sql, params); 
})
*/

