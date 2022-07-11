require('./config/env.config');
const app = require('./app.js');
/* launching app and running on port 3000 */

console.log(process.env.DB_NAME);
console.log("DB_NAME");
app.listen(process.env.PORT, ()=>{
   console.log("listening on port 3000")
});
