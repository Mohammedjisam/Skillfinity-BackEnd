const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    items: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "courses",
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        }
      },
    ],
    totalCartPrice: {
      type: Number,
      required: true,
      default: function () {
        return this.items.reduce(
          (total, item) => total + item.totalCoursePrice,
          0
        );
      },
    },
  },
  {
    timestamps: true,
  }
);

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;