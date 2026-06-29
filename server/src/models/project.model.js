import mongoose from "mongoose";

const { Schema } = mongoose;

const ProjectSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      maxlength: [100, "Project name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    clientName: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "on_hold"],
      default: "active",
    },
    // Total funds allocated (transferred from main balance)
    allocatedFunds: {
      type: Number,
      default: 0,
      min: [0, "Allocated funds cannot be negative"],
    },
    // Sum of all expenses added to this project
    spentAmount: {
      type: Number,
      default: 0,
      min: [0, "Spent amount cannot be negative"],
    },
  },
  { timestamps: true }
);

// Virtual: remaining budget
ProjectSchema.virtual("remainingAmount").get(function () {
  return this.allocatedFunds - this.spentAmount;
});

// Ensure virtuals are included in JSON
ProjectSchema.set("toJSON", { virtuals: true });
ProjectSchema.set("toObject", { virtuals: true });

ProjectSchema.index({ user: 1, status: 1 });
ProjectSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Project", ProjectSchema);