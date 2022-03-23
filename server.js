const express = require('express');
const connectDB=require('./config/db');

const app=express();

// connect database
connectDB();

// init middleware
app.use(express.json({extended:false})) 
// parsing the json body

app.get('/', (req, res) => res.send('API is running'));
// const port=3000

// define routes
app.use('/api/users',require('./routes/api/users'));
app.use('/api/auth',require('./routes/api/auth'));
app.use('/api/profile',require('./routes/api/profile'));
app.use('/api/post',require('./routes/api/post'));

const port =process.env.PORT ||5000
app.listen(port, () => console.log(`Example app listening on port ${port}!`))

