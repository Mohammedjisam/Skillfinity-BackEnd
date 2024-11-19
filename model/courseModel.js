const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  coursetitle: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'categories',
    required: true,
  },
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  difficulty: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  features: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  lessons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'lessons',
  }],
  courseStructure:[{
    type:String,
    required:true,
  }],
  isVisible: {
    type: Boolean,
    default: true,
  },
  reportedCount:{
    type: Number,
    default:0,
  }
},{
  timestamps: true,
 });

const Course = mongoose.model('courses', CourseSchema);
module.exports =Course;