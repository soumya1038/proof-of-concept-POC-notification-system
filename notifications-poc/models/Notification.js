import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["new_post", "new_comment", "new_like", "new_follower"],
      required: true
    },
    message: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
