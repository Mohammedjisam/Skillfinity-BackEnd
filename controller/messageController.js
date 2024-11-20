const Conversation = require("../model/conversationModel");
const Message = require("../model/messageModel");

const sendMessage = async (req, res) => {
  console.log("sendMessage");
  const { from : senderId, to : recieverId, message } = req.body;

  console.log(req.body)


  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, recieverId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, recieverId],
    });
  }

  const newMessage = new Message({
    senderId,
    recieverId,
    message,
  });

  if (newMessage) {
    conversation.messages.push(newMessage._id);
  }

  await Promise.all([conversation.save(), newMessage.save()]);
  return  true

  // res.status(201).json(newMessage);
};

const getMessages = async (req, res) => {
  try {
    const { from :senderId, to: userToChatId } = req.query;

    console.log("in gett all messages=====>", userToChatId, senderId);
    console.log(req.query)

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, userToChatId] },
    }).populate("messages");

    if (!conversation) return res.status(200).json([]);

    const messages = conversation.messages;

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  sendMessage,
  getMessages
}