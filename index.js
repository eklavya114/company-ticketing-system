const express=require('express');
const app=express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const userRoutes = require('./routes/userRoute');
const ticketRoutes = require('./routes/ticketRoutes');
const compilenceRoutes =require('./routes/compilenceRoute');
const departmentAssignmentRoutes =require('./routes/departmentAssignmentRoute');
const teamLeadRoutes =require('./routes/teamLeadRoutes');
const dbConfig = require('./config/db');
const port=3123;    

app.get('/',(req,res)=>{
    res.send('Hello World!');
});

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5174',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/user', userRoutes);
app.use('/api', ticketRoutes);
app.use('/api/admin', compilenceRoutes);
app.use('/api/department', departmentAssignmentRoutes);
app.use('/api/tl', teamLeadRoutes);

dbConfig().then(()=>{
    console.log('Database connected successfully');
    app.listen(port,()=>{
    console.log(`Server is running at http://localhost:${port}`);
});
}).catch((err)=>{
    console.error('Database connection failed:', err);
});   
