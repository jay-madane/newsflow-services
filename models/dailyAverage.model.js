import mongoose from "mongoose";

const dailyAverageSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now()
  },
  tonality: {
    type: [
      {
        name: {
          type: String,
          required: true,
          enum: ['positive', 'neutral', 'negative']
        },
        percentage: {
          type: Number,
          required: true
        }
      }
    ],
    required: true,
  } // [{positive, 98}, {...}, {...}]
}, {timestamps: true});

export const DailyAverage = mongoose.model('DailyAverage', dailyAverageSchema);