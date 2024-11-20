const express = require('express')
const verifyTutor = require('../../../middleware/verifyTutor')
const { getMessages, sendMessage } = require('../../../controller/messageController')

const messageRouter = express.Router()

messageRouter.get("/", getMessages)
messageRouter.post("/send", sendMessage)


module.exports = messageRouter
