const mongoose = require('mongoose');

const ChatRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  }],
 }, {
  timestamps: true,
 });

 const ChatRoom= mongoose.model('chatroom', ChatRoomSchema);
 module.exports =ChatRoom;                     