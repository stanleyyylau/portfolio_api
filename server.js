var mongoose = require('mongoose');
var express = require('express');
var bodyParser = require('body-parser');

var nodemailer = require('nodemailer');
var cors = require('cors')


mongoose.connect('mongodb://stanley:stanley@ds029426.mlab.com:29426/portfolio');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
var workSchema = mongoose.Schema({
    title: String,
    imgUrl: String
});

var Work = mongoose.model('works', workSchema);

var app = express();
app.use(cors());
var port = process.env.PORT || 5000;
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(express.static('public'));



app.post('/all_work', function(req, res){
  console.log('someone wants to get all your work details!!!');
    Work.find(function(err, allWorks){
      if (err) return console.error(err);
      res.send(allWorks);
    })
})

app.get('/', function(req, res){
  res.send(index.html);
})

app.post('/add_work', function(req, res){
  console.log('Posting a new work to your portfolio...');
  console.log(req.body);
  if(typeof req.body.title === 'string' && typeof req.body.imgUrl === 'string'){
      var newWorkItem = new Work({title: req.body.title , imgUrl:req.body.imgUrl});
      newWorkItem.save(function(err,newWorkItem){
        if(err) return console.error(err);
        console.log(newWorkItem + " save to database!!!");
      });
  }
});

app.post('/update_work', function(req, res){
  console.log('Updating one of your previous work..');
  if(typeof req.body._id === 'string'){
    var query = {'_id': req.body._id};
    var updates = {title: req.body.title, imgUrl: req.body.imgUrl};
    Work.findOneAndUpdate(query, updates, function(err, work){
      if (err) return console.error(err);
      console.log("updated an item, done!!!");
      console.log(work);
    })
  }
})


app.post('/delete_work', function(req, res){
  console.log('Deleteing one of your previous work..');
  if(typeof req.body._id === 'string'){
    Work.remove({_id: req.body._id}, function(err){
      if(err) return console.error(err);
      console.log('remove one item, done');
    })
  }
})

app.post('/message', function(req, res){
  console.log('about to send email to you');
  // var transporter = nodemailer.createTransport({
  //       service: 'Gmail',
  //       auth: {
  //           user: 'stanleyyylauserver@gmail.com', // Your email id
  //           pass: 'stanley2016' // Your password
  //       }
  //   });

  var transporter = nodemailer.createTransport('smtps://stanleyyylauserver%40gmail.com:stanley2016@smtp.gmail.com');

  var text = JSON.stringify(req.body.message, null, 2) || JSON.stringify(req.body, null, 2);
  console.log("the message is " + text);
  var mailOptions = {
      from: 'stanleyyylauserver@gmail.com', // sender address
      to: 'stanleyyylau@gmail.com', // list of receivers
      subject: 'U just receive a message from your fortfolio website...', // Subject line
      text: text //, // plaintext body
      // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
  };
  transporter.sendMail(mailOptions, function(error, info){
      if(error){
          console.log(error);
          res.json({yo: 'error'});
      }else{
          console.log('Message sent: ' + info.response);
          res.json({yo: info.response, status: 200});
      };
  });
})


app.listen(port, function () {
  console.log('Example app listening on port ' + port);
});
