import mongoose from "mongoose";

const { Schema } = mongoose;

const CategorySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: [50, "Category name cannot exceed 50 characters"],
    },
    color: {
      type: String,
      default: "#6B7280",
    },
    icon: {
      type: String,
      default: "tag",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Compound unique index: no duplicate category names per user
CategorySchema.index({ user: 1, name: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });

export default mongoose.model("Category", CategorySchema);