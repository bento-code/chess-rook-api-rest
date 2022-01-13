const Rating=require("./rating");

class User
{
    constructor(username, rating)
    {
        this.username=username;
        this.rating=rating;
    }
}
module.exports={User}