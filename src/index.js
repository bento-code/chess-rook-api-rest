
const app=require("./app");
app.listen(process.env.PORT || 3000, () => console.log("server listening on port: "+ app.get("port")));

