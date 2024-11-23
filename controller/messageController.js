const Conversation = require("../model/conversationModel");
const Message = require("../model/messageModel");

const sendMessage = async (req, res) => {
  try {
    console.log("sendMessage");
    const { from: senderId, to: recieverId, message } = req.body;

    console.log(req.body);

    // Find or create a conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recieverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, recieverId],
      });
    }

    // Create a new message
    const newMessage = await Message.create({
      conversationId: conversation._id,
      senderId,
      recieverId,
      message,
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getMessages = async (req, res) => {
  try {
    const { from: senderId, to: userToChatId } = req.query;

    console.log("in get all messages=====>", userToChatId, senderId);
    console.log(req.query);

    // Find the conversation
    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, userToChatId] },
    });

    if (!conversation) return res.status(200).json([]);

    // Get all messages for this conversation
    const messages = await Message.find({ conversationId: conversation._id });

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