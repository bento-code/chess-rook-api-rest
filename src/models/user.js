const Rating=require("./rating");

class User
{
    constructor(username, rating, jwt)
    {
        this.username=username;
        this.rating=rating;
        this.jwt=jwt;
    }
}
module.exports={User}