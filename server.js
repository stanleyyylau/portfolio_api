var mongoose = require('mongoose');
mongoose.connect('mongodb://stanley:stanley@ds029426.mlab.com:29426/portfolio');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log("connted to database!");
  var workSchema = mongoose.Schema({
      title: String,
      imgUrl: String
  });

  var Work = mongoose.model('works', workSchema);
  var weatherApp = new Work({ title: 'My First Weather APP',
                              imgUrl: 'http//:www.baidu.com'});
  console.log(weatherApp.title); // 'Silence'
  weatherApp.save(function (err, fluffy) {
    if (err) return console.error(err);
    console.log('weatherApp saved to database');
  });

});
