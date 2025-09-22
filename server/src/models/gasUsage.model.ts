import mongoose from "mongoose";

const gasUsageSchema = new mongoose.Schema(
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
		unitReadout: {
			type: Number,
			required: true,
		},
		unitCost: {
			type: Number,
			required: true,
		},
		unitsUsed: {
			type: Number,
		},
		billTotal: {
			type: Number,
			default: 0,
		},
		billPaid: {
			type: Number,
			default: 0,
		},
		status: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

gasUsageSchema.index({ flat: 1, month: 1, year: 1 }, { unique: true });
gasUsageSchema.pre("save", function (next) {
	if (this.billTotal !== undefined && this.billPaid !== undefined) {
		this.status = this.billPaid >= this.billTotal;
	}
	next();
});
gasUsageSchema.post("findOneAndUpdate", async function (doc) {
	if (doc && doc.billTotal !== undefined && doc.billPaid !== undefined) {
		const status = doc.billPaid >= doc.billTotal;
		if (doc.status !== status) {
			await doc.updateOne({ status });
		}
	}
});

const GasUsage = mongoose.models.GasUsage || mongoose.model("GasUsage", gasUsageSchema);
export default GasUsage;
