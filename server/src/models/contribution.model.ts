import mongoose from "mongoose";

const contributionSchema = new mongoose.Schema(
	{
		flat: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Flat",
			required: true,
		},
		month: {
			type: Number,
			required: true,
		},
		year: {
			type: Number,
			required: true,
		},
		amount: {
			type: Number,
			required: true,
		},
	},
	{ timestamps: true }
);

contributionSchema.index({ flat: 1, month: 1, year: 1 }, { unique: true });

const Contribution =
	mongoose.models.Contribution || mongoose.model("Contribution", contributionSchema);
export default Contribution;
