const errorHandler=(err, req, res, next)=>
{
    res.sendStatus(500).json(
    {
        message: err.message,
        failed:true
    });
}

module.exports=errorHandler;