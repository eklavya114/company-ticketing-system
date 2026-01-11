const express=require('express');
const app=express();
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoute');
const ticketRoutes = require('./routes/ticketRoutes');
const dbConfig = require('./config/db');
const port=3123;    

app.get('/',(req,res)=>{
    res.send('Hello World!');
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/user', userRoutes);
app.use('/api', ticketRoutes);

dbConfig().then(()=>{
    console.log('Database connected successfully');
    app.listen(port,()=>{
    console.log(`Server is running at http://localhost:${port}`);
});
}).catch((err)=>{
    console.error('Database connection failed:', err);
});   
