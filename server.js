require('./config/config');

// Third party or built in modules
var express = require('express');
var bodyParser = require('body-parser');
var nodemailer = require('nodemailer');
var cors = require('cors')

// Custom modules here
var {mongoose} = require('./db/mongoose');
var {Work} = require('./models/work');

var app = express();
const port = process.env.PORT;

// Global middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));


app.get('/', function(req, res){
  res.send(index.html);
})

app.post('/all_work', function(req, res){
    Work.find(function(err, allWorks){
      if (err) return console.error(err);
      res.send(allWorks);
    })
})

app.post('/add_work', function(req, res){
  if(typeof req.body.title === 'string' && typeof req.body.imgUrl === 'string'){
      var newWorkItem = new Work({title: req.body.title , imgUrl:req.body.imgUrl});
      newWorkItem.save(function(err,newWorkItem){
        if(err) {
          return console.error(err);
        }else{
          res.json(newWorkItem);
        }
      });
  }
});

app.post('/update_work', function(req, res){
  if(typeof req.body._id === 'string'){
    var query = {'_id': req.body._id};
    var updates = {title: req.body.title, imgUrl: req.body.imgUrl};
    Work.findOneAndUpdate(query, updates, function(err, work){
      if (err) {
        return console.error(err);
      }else{
        res.json(work);
      }
    })
  }
})

app.post('/delete_work', function(req, res){
  if(typeof req.body._id === 'string'){
    Work.remove({_id: req.body._id}, function(err){
      if(err) {
        return console.error(err);
      }else{
        res.json({
          isRemove: true
        })
      }
    })
  }
})

app.post('/message', function(req, res){
  var transporter = nodemailer.createTransport('smtps://stanleyyylauserver%40gmail.com:stanley2016@smtp.gmail.com');
  var text = JSON.stringify(req.body.message);
  var mailOptions = {
      from: 'stanleyyylauserver@gmail.com', // sender address
      to: 'stanleyyylau@gmail.com', // list of receivers
      subject: 'U just receive a message from your fortfolio website...', // Subject line
      text: text //, // plaintext body
      // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
  };
  transporter.sendMail(mailOptions, function(error, info){
      if(error){
          res.json({yo: 'error'});
      }else{
          res.json({yo: info.response, status: 200});
      };
  });
})


app.listen(port, function () {
  console.log('Example app listening on port ' + port);
});
