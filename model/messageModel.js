const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  reciever:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  chatroom:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'chatroom',
    required: true,
  },
  message:{
    type:String,
    require:true,
  },
  isRead:{
    type:Boolean,
    default:false
  },
 }, {
  timestamps: true,
 });

 const Message= mongoose.model('message', MessageSchema);
 module.exports =Message;                     