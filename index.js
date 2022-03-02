const express = require('express');
// const connectDB=require('./config/db')
const app = express();
// connect database;
// connectDB();

const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/signup', function (req, res) {
	var data = req.body;		
	res.send(data);
});
app.post('/login', (req, res) => {
	var user_Name=req.body.user_Name;
	var password=req.body.password;
	if(password==="xyz" && user_Name==="abc"){
		res.send("successful")
	}
	else{
		res.send("faluire")
	}
	// res.send(data)
  });
app.listen(PORT, function(err){
	if (err) console.log(err);
	console.log("Server listening on PORT", PORT);
});


