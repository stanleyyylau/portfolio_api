var mongoose = require('mongoose');

mongoose.connect('mongodb://stanley:stanley@ds029426.mlab.com:29426/portfolio');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
var workSchema = mongoose.Schema({
    title: String,
    imgUrl: String
});


db.on('connected', function(){
    console.log('connectd..')
    var leadSchema = mongoose.Schema({
        ip: String,
        msg: Object
    });

    var Lead = mongoose.model('leads', leadSchema);

    var test = new Lead({
        ip: 'somewoij',
        msg: {
            ha: "fjweifj"
        }
    })

    test.save(function(err, doc){
        if(err){
            console.log(err)
        }else{
            console.log('save to db...')
        }
    })


})

