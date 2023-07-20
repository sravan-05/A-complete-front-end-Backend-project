
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const winston  = require('winston');
const {createLogger, format, transports} = winston;
// const {combine, timestamp, label, printf} = format;
const User = require('./User');
const port=3004;
const cors = require('cors');
const path = require('path')
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');


app.use(express.urlencoded({extended: true}));
app.set('view engine','ejs')
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname,'frontend', 'pages')));
app.use(cookieParser());
app.set('views',path.join(__dirname, 'views'));


const mongoHost=process.env.MONGO_HOST ||'nifty_mclaren';
const mongoPort = process.env.MONGO_PORT || 27017;
const mongoDB = process.env.MONGO_DB ||'mydatabase';
const mongoURI ='mongodb://localhost:27017/mydatabse';
// const SessionToken = '123456'
const jwtSecret = 'sravan123@';

const logger= createLogger({
    level:'info',
    format:format.combine(
        format.timestamp({format:'DD-MM-YYYY HH:mm:ss'}),
        format.printf(({timestamp,level, message})=>{
            return `${timestamp} ${level} : ${message}`;

        })
       
    ),
    transports:[
        new transports.Console(),
        new transports.File({filename:'error.log', level:'error'}),
        new transports.File({filename: 'combined.log'}),
    ],
       
});


function generateSessionToken(user){
    const payload = { userId: user._id };  
    const sessionToken = jwt.sign(payload, jwtSecret,{expiresIn : '1h'});
    logger.info(`SessionToken generated for user with email:${user.email}`);
    return sessionToken;
}

// app.use((req,res, next)=>{
//     logger.info(`Received ${req.method}request to ${req.url}`);
//     next();
// });
const connectDB = async() =>{
    try{
        await mongoose.connect(mongoURI,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        logger.info('connected to MongoDB');
    }catch(error){
         logger.error('Failed to connect:',error);
    }
}; 
connectDB()



// app.use((req,res,next)=>{
//     logger.info(`Received ${req.method}request to ${req.url}`);
// });




app.post('/register',async (req,res)=>{ 
     try{
    const {firstName, lastName, phoneNumber,email,password,address} = req.body;
    logger.info(`Recived registeration request for user with email: ${email}`);
    if(!firstName|| !lastName || !phoneNumber || !email || !password || !address){
      return res.status(400).json({error:'All fields are required'});
  
    }
    const existingUser = await User.findOne({email});
    if(existingUser){
        logger.error('User already exists');
        return res.status(400).json({ error: 'User already exists' });
    }
    const newUser = new User({
        firstName,
        lastName,
        phoneNumber,
        email,
        password,
        address,
    });
    await newUser.save()
            logger.info(`Registeration succesfull for user with email: ${email}`);
            res.status(200).json({ message: 'Registration successful',redirect:'/login' });
        }
        catch (error) {
            logger.error('Error during registration:', error);
            res.status(500).json({ error: 'Error during registration' });
        }
    
    });

app.post('/login', async (req, res)=>{
    try{
    const {email ,password }= req.body;
    const user = await User.findOne({email});

     if(!user || user.password !== password){
            logger.error('Invalid login credentials');
            return res.status(401).json({ error: 'Invalid login credentials' });
            }
                logger.info(`User ${user.email} logged in `);
                const sessionToken = generateSessionToken(user);
                res.cookie('sessionToken', sessionToken,{httpOnly:true});
                res.status(200).json({ message: 'Login successful',redirect:'/home',sessionToken });
            }catch(error){
            logger.error('Error during login:', error);
           res.status(500).json({error:'Error durin login'});
        }
    });
    app.get('/logout', async (req, res) => {
        const sessionToken = req.cookies.sessionToken;
        if (!sessionToken) {
          logger.error('No session Token found during logout');
          return res.status(401).json({ error: 'No session token found', redirect: '/login' });
        }
      
        try {
          const decoded = jwt.verify(sessionToken, jwtSecret);
          const userId = decoded.userId;
          const user = await User.findById(userId);
      
          if (user) {
            logger.info(`User ${user.email} logged out`);
            res.clearCookie('sessionToken');
            res.status(200).json({ message: 'Logout successful', redirect: '/login' });
          } else {
            logger.error('User not found during logout');
            res.clearCookie('sessionToken');
            return res.status(401).json({ error: 'User not found or session expired', redirect: '/login' });
          }
        } catch (error) {
          logger.error('Error during logout', error);
          res.clearCookie('sessionToken');
          res.status(401).json({ error: 'Invalid session Token', redirect: '/login' });
        }
    });

  function validateSessionMiddleware(req,res,next){
    const sessionToken=req.cookies.sessionToken;
     if(!sessionToken){
        return res.status(401).json({error:'Session token missing', redirect:'/login'});
     }
     try{
         const decoded =  jwt.verify(sessionToken, jwtSecret);
         req.userId=decoded.userId;
         next();
    }
     catch(error){
        logger.error('Error during session token validation:', error);
        res.clearCookie('sessionToken');
        res.status(401).json({error:'Invalid session token', redirect:'/login'});
     }
  }

  app.get('/home', validateSessionMiddleware, (req, res) => {
    res.status(200).json({message:'Welocme to home Page'});
  });

  app.use((err,req,res,next)=>{
    logger.error(err.stack);
    res.status(500).json({error:'Internal server error'});
  });

  app.use((req,res)=>{
    logger.error(`404 Not found- ${req.method} request to ${req.url}`);
    res.status(404).json({error:'Not found'});
  });
  

app.listen(port, () => {
    console.log("Application server started");

});