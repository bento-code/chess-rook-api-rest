const mysql=require('mysql2');

const db = mysql.createPool({
    connectionLimit : 100,
    host : "chess-rook.cpagti2byajd.us-east-1.rds.amazonaws.com",
    user: 'admin',
    password: "Ch3ss22435",
    database: "App",
    debug    :  false
});

module.exports=db;