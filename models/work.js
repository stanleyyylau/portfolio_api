var mongoose = require('mongoose');

var workSchema = mongoose.Schema({
    title: String,
    imgUrl: String
});

var Work = mongoose.model('works', workSchema);

module.exports = {Work};
