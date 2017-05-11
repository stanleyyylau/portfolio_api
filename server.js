var mongoose = require('mongoose');
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');

var nodemailer = require('nodemailer');
var cors = require('cors')
var request = require('request');
var crypto = require('crypto');

var https = require("https");
setInterval(function() {
    https.get("https://st-portfolio-on.herokuapp.com/");
}, 300000); // every 5 minutes (300000)

var mailInfo = {
	host: "smtp.gmail.com",
	domains: ["gmail.com", "googlemail.com"],
	port: 465,
	userAcount: "stanleyyylauserver@gmail.com",
	userPassword: "stanleyyylau"
}

mongoose.connect('mongodb://stanley:stanley@ds029426.mlab.com:29426/portfolio');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
var workSchema = mongoose.Schema({
    title: String,
    imgUrl: String
});

var leadSchema = mongoose.Schema({
    ip: String,
    createdAt: {type: Date, default: Date.now},
    msg: Object
});

var Work = mongoose.model('works', workSchema);

var Lead = mongoose.model('leads', leadSchema);

var app = express();
app.use(cors());
var port = process.env.PORT || 5000;
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(express.static('public'));

const requestIp = require('request-ip');

var clientIp;

// inside middleware handler
const ipMiddleware = function(req, res, next) {
    clientIp = requestIp.getClientIp(req);
    request.post(
          'https://api.ip138.com/query/',
          { form: { 
            ip: clientIp,
            datatype: "json",
            sign: crypto.createHash('md5').update(`ip=${clientIp}&token=a169a8207f92718bba62fe3b982bfce6`).digest('hex'),
            oid: "9245",
            mid: "72126"
           } },
          function (error, response, body) {
              if (!error && response.statusCode == 200) {
                  console.log(body)
                  clientIp = body;
                  clientIp = clientIp.replace('\t', ' From ');
                  clientIp = clientIp.replace(/[ \f\t\v]+$/g, '');
                  next();
              } else {
                next();
              }
          }
      );
    
};

app.use(ipMiddleware)

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

  var newLead = new Lead({
    ip: clientIp,
    msg: req.body
  })  

  newLead.save(function(err, doc){
    if(err){
      console.log(err)
    } else {
      console.log('save to db')
    }
  })  

  // if this msg is from mml website, send SNS also
  if(req.body.mml) {
    request.post(
        'https://sms.yunpian.com/v2/sms/batch_send.json',
        { form: {
          apikey: '07a08fdf8a3a2bf62359e86ab9ffa207',
          mobile: '18819105993,13798656121',
          text: '【慢慢来】您的网站收到一条新的留言'
        } },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body)
            }
        }
    );

    // if this is an inquiry from mmldigi, make the leads email more human readable
    var transporter = nodemailer.createTransport({
            host: mailInfo.host,      //mail service mail host
            domains: mailInfo.domains,
            secureConnection:true,      //secureConnection 使用安全连接
            port: mailInfo.port,                   //port STMP端口号
            auth:{
              user: mailInfo.userAcount, //Email address
              pass: mailInfo.userPassword //Email pw
          },
          debug: true
      });

      // clientIP should contain real address info

      var contentFromUser = {
            ip: clientIp,
            message: req.body
          }

      

      var text = contentFromUser;
      console.log("the message is " + text);
      if(text.message.location.indexOf('contact.html') > 1 && !text.message.clientInfo){
        // if this is sent from contact.html page
        var emailHtml = `<h2>联系我们页面收到留言，客户信息如下</h2>
                        <p>姓名: ${text.message.message.name}</br>
                          手机: ${text.message.message.phone}</br>
                          给我们的留言: ${text.message.message.msg}</br>
                          询盘发送页面: ${text.message.location}</br>
                          询盘发送IP: ${text.ip}</p>
                        `
        var mailOptions = {
            from: 'stanleyyylauserver@gmail.com', // sender address
            to: 'stanleyyylau@gmail.com, info@mmldigi.com', // list of receivers
            subject: '慢慢来官网收到一条询盘...', // Subject line
            //text: text //, // plaintext body
            html: emailHtml
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

      } else {
        
        var emailHtml = `<h2>官网收到询盘，问答题如下</h2>
                        <p>问：${text.message.message.qa1.question}</br>
                          <b>答：${text.message.message.qa1.answer}</b></br>
                          问：${text.message.message.qa2.question}</br>
                          <b>答：${text.message.message.qa2.answer}</b></br>
                          问：${text.message.message.qa3.question}</br>
                          <b>答：${text.message.message.qa3.answer}</b></br>
                          问：${text.message.message.qa4.question}</br>
                          <b>答：${text.message.message.qa4.answer}</b>
                          </p>
                        <h2>客户信息如下</h2>
                        <p>目前的网站：${text.message.message.clientInfo.website}</br>
                          姓名: ${text.message.message.clientInfo.name}</br>
                          邮件: ${text.message.message.clientInfo.email}</br>
                          号码: ${text.message.message.clientInfo.phone}</br>
                          给我们的留言: ${text.message.message.clientInfo.msgToUs}</br>
                          询盘发送页面: ${text.message.location}</br>
                          询盘发送IP: ${text.ip}</p>
                        `
        var mailOptions = {
            from: 'stanleyyylauserver@gmail.com', // sender address
            to: 'stanleyyylau@gmail.com, info@mmldigi.com', // list of receivers
            subject: '慢慢来官网收到一条询盘...', // Subject line
            //text: text //, // plaintext body
            html: emailHtml
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
      }
      // end function for mml enqury
      return;
  }

  console.log('about to send email to you');
  // var transporter = nodemailer.createTransport({
  //       service: 'Gmail',
  //       auth: {
  //           user: 'stanleyyylauserver@gmail.com', // Your email id
  //           pass: 'stanley2016' // Your password
  //       }
  //   });

  var transporter = nodemailer.createTransport({
        host: mailInfo.host,      //mail service mail host
        domains: mailInfo.domains,
        secureConnection:true,      //secureConnection 使用安全连接
        port: mailInfo.port,                   //port STMP端口号
        auth:{
          user: mailInfo.userAcount, //Email address
          pass: mailInfo.userPassword //Email pw
       },
       debug: true
  });

  var contentFromUser = {
        ip: clientIp,
        message: req.body
      }



  var text = JSON.stringify(contentFromUser, null, 2) || JSON.stringify(contentFromUser, null, 2);
  console.log("the message is " + text);
  var mailOptions = {
      from: 'stanleyyylauserver@gmail.com', // sender address
      to: 'stanleyyylau@gmail.com, info@mmldigi.com', // list of receivers
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
