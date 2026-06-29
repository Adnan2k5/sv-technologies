import mongoose from "mongoose";

const { Schema } = mongoose;

const TransactionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit", "project_transfer", "project_return"],
      required: [true, "Transaction type is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    // Linked project (optional — for project_transfer / project_return)
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    // Balance snapshot after this transaction (for chart rendering)
    balanceAfter: {
      type: Number,
      default: 0,
    },
    transactionDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound index for fast per-user date queries
TransactionSchema.index({ user: 1, transactionDate: -1 });
TransactionSchema.index({ user: 1, type: 1 });

export default mongoose.model("Transaction", TransactionSchema);