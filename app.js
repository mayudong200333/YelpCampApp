if (process.env.NODE_ENV !== "production"){
    require('dotenv').config()
}

const express = require('express');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');
const ExpressError = require('./utils/ExpressError');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
// const helmet = require('helmet');

const usersRoutes = require('./routes/user')
const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');

// const MongoStore = require('connect-mongo');
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
// const dbUrl = 'mongodb://localhost:27017/yelp-camp';
const secret = process.env.SECRET || 'thisshouldbeabetters!'

// 'mongodb://localhost:27017/yelp-camp'

mongoose.connect(dbUrl,{
    useNewUrlParser: true,
});

const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"))
db.once("open",()=>{
    console.log("Database connected");
});

const app = express();

app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')))
app.use(mongoSanitize())

const sessionConfig = {
    name:'session',
    secret: secret,
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        // secure:true,
        expires: Date.now() + 1000 * 60 *60 * 24 * 7,
        maxAge:1000 * 60 *60 * 24 * 7
    },
    store:MongoStore.create(
        {mongoUrl:dbUrl,touchAfter: 24 * 3600}
    )
}
app.use(session(sessionConfig));
app.use(flash());
// app.use(
//     helmet({
//       contentSecurityPolicy: false,
//     })
//   );


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/',usersRoutes);
app.use("/campgrounds",campgroundsRoutes)
app.use("/campgrounds/:id/reviews",reviewsRoutes)

app.get('/',(req,res)=>{
    res.render('home')
})

app.all('*',(req,res,next)=>{
    next(new ExpressError('Page Not Found',404))
})

app.use((err,req,res,next)=>{
    const {statusCode=500} = err;
    // if (!err.message) err.message = 'Oh No,Something Went Wrong!'
    res.status(statusCode).render('error',{err});
    res.send('Oh boy, something went wrong!')
})


app.listen(3000,()=>{
    console.log('Serving on port 3000')
})