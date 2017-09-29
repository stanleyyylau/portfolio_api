var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');

var options = {
    auth: {
        api_user: 'mmldigi',  // to do get this from env
        api_key: 'mmlrocks10000' // to do get this from env
    }
}

var client = nodemailer.createTransport(sgTransport(options));

var email = {
  from: 'awesome@bar.com',
  to: 'stanleyyylau@gmail.com',
  subject: 'Hello',
  text: 'Hello test',
  html: '<b>Hello world</b>'
};

client.sendMail(email, function(err, res) {
	if (err) { 
		console.log(err) 
	}
	console.log(res);
});