import mongoose from "mongoose";

const buildingSchema = new mongoose.Schema(
	{
		buildingNumber: {
			type: String,
			required: true,
			unique: true,
		},
		name: {
			type: String,
		},
	},
	{ timestamps: true }
);

const Building = mongoose.models.Building || mongoose.model("Building", buildingSchema);
export default Building;
