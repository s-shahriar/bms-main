import mongoose from "mongoose";

const flatSchema = new mongoose.Schema(
	{
		flatNumber: {
			type: String,
			required: true,
			unique: true,
		},
		building: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Building",
			required: true,
		},
		ownerName: {
			type: String,
		},
		ownerPhone: {
			type: String,
			required: true,
		},
		ownerEmail: {
			type: String,
		},
		renterName: {
			type: String,
		},
		renterPhone: {
			type: String,
		},
		renterEmail: {
			type: String,
		},
		status: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

flatSchema.index({ building: 1, flatNumber: 1 }, { unique: true });

const Flat = mongoose.models.Flat || mongoose.model("Flat", flatSchema);
export default Flat;
