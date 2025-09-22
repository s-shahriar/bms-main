import mongoose from "mongoose";

const serviceChargeSchema = new mongoose.Schema(
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

serviceChargeSchema.index({ flat: 1, month: 1, year: 1 }, { unique: true });

const ServiceCharge =
	mongoose.models.ServiceCharge || mongoose.model("ServiceCharge", serviceChargeSchema);
export default ServiceCharge;
