const mongoose = require("mongoose");

const serviceStockCounterSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["semi-pret-base", "semi-pret-bargataire", "final-base", "final-bargataire"],
      required: true,
      unique: true,
    },
    totalKg: { type: Number, default: 0 },
  },
  { timestamps: true }
);

serviceStockCounterSchema.statics.getOrCreate = async function (type) {
  let counter = await this.findOne({ type });
  if (!counter) {
    counter = await this.create({ type, totalKg: 0 });
  }
  return counter;
};

module.exports = mongoose.model("ServiceStockCounter", serviceStockCounterSchema);
