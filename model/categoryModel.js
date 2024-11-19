const mongoose = require('mongoose')

const CategorySchema = new mongoose.Schema(
   {
    title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'courses',
      }],
      tutors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
      }],
      isVisible: {
        type: Boolean,
        default: true,
      },
   },{
    timestamps: true,
   }
)


const Category = mongoose.model("categories",CategorySchema)

module.exports= Category