import mongoose from "mongoose";

const cylinderPLSchema = new mongoose.Schema(
	{
		building: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Building",
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
		cylindersPurchased: {
			type: Number,
			required: true,
		},
		dealer: {
			type: String,
		},
		cost: {
			type: Number,
			required: true,
		},
		otherCost: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true }
);

cylinderPLSchema.index({ building: 1, month: 1, year: 1 }, { unique: true });

const CylinderPL = mongoose.models.CylinderPL || mongoose.model("CylinderPL", cylinderPLSchema);
export default CylinderPL;
