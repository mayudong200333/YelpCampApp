const mongoose = require('mongoose');
const cities = require('./cities');
const {places,descriptors} = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser: true,
});

const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"))
db.once("open",()=>{
    console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random()*array.length)]

const seedDb = async() => {
    await Campground.deleteMany({});
    for (let i=0; i<50; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random()*20) + 10;
        const camp = new Campground({
            author: '63e36f70abf3fb597898aae1',
            location:`${cities[random1000].city},${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Its a good place',
            price: price,
            geometry:{ type: 'Point', coordinates: [ -113.133115, 47.020078 ] },
            images:[
                {
                    url: 'https://res.cloudinary.com/dq0lgr8ks/image/upload/v1675955003/YelpCamp/ttdasbczxbn6e18eo3ck.png',
                    filename: 'YelpCamp/ttdasbczxbn6e18eo3ck',
                  },
                  {
                    url: 'https://res.cloudinary.com/dq0lgr8ks/image/upload/v1675955003/YelpCamp/jcdy2w7hz7sleh7arztp.png',
                    filename: 'YelpCamp/jcdy2w7hz7sleh7arztp',
                  }
            ]
        })
        await camp.save()
    }
}

seedDb().then(()=>{
    mongoose.connection.close();
});