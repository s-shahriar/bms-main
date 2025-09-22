import mongoose from "mongoose";

const billSchema = new mongoose.Schema(
	{
		flat: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Flat",
		},
		month: {
			type: Number,
		},
		year: {
			type: Number,
		},
		billAmount: {
			type: Number,
		},
		paidAmount: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true }
);

billSchema.index({ flat: 1, month: 1, year: 1 }, { unique: true });

const Bill = mongoose.models.Bill || mongoose.model("Bill", billSchema);
export default Bill;
