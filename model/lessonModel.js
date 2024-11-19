const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
  lessontitle: {
    type: String,
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'courses',
    required: true,
  },
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  Video: {
    type: String,
    required: true,
  },
  pdfnotes:{
    type: String,
    required: true,
  }
},{
  timestamps: true,
 });

 const Lesson = mongoose.model('lessons', LessonSchema);
 module.exports =Lesson;                     