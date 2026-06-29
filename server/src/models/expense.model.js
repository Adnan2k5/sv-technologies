import mongoose from "mongoose";

const { Schema } = mongoose;

const ExpenseSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project is required"],
      index: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    billImage: {
      type: String,
      default: null,
    },
    vendor: {
      type: String,
      trim: true,
    },
    expenseDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Fast lookups by project + category for the detail page
ExpenseSchema.index({ project: 1, category: 1, expenseDate: -1 });
ExpenseSchema.index({ user: 1, expenseDate: -1 });

export default mongoose.model("Expense", ExpenseSchema);