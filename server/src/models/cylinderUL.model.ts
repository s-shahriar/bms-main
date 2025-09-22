import mongoose from "mongoose";

const cylinderULSchema = new mongoose.Schema(
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
		cylindersUsed: {
			type: Number,
			required: true,
		},
		unitCost: {
			type: Number,
			required: true,
		},
		totalCost: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true }
);

cylinderULSchema.index({ building: 1, month: 1, year: 1 }, { unique: true });

const CylinderUL = mongoose.models.CylinderUL || mongoose.model("CylinderUL", cylinderULSchema);
export default CylinderUL;
