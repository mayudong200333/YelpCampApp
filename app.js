const express = require('express');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const methodOverride = require('method-override');
const path = require('path');
const Campground = require('./models/campground');
const ExpressError = require('./utils/ExpressError');
const {campgroundSchema,reviewSchema} = require('./schemas')
const Review = require('./models/review');

const campgrounds = require('./routes/campgrounds');

mongoose.connect('mongodb://localhost:27017/yelp-camp',{
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



const validateReview = (req,res,next) => {
    const {error} = reviewSchema.validate(req.body)
    if (error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg,400)
    } else {
        next();
    }
}

app.use("/campgrounds",campgrounds)

app.get('/',(req,res)=>{
    res.render('home')
})



app.post('/campgrounds/:id/reviews',validateReview,catchAsync(async(req,res)=>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review)
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.delete('/campgrounds/:id/reviews/:reviewId',catchAsync(async(req,res)=>{
    const {id,reviewId} = req.params;
    await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}})
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}))

app.all('*',(req,res,next)=>{
    next(new ExpressError('Page Not Found',404))
})

app.use((err,req,res,next)=>{
    const {statusCode=500} = err;
    if (!err.message) err.message = 'Oh No,Something Went Wrong!'
    res.status(statusCode).render('error',{err});
    res.send('Oh boy, something went wrong!')
})


app.listen(3000,()=>{
    console.log('Serving on port 3000')
})