import mongoose from "mongoose";

const newsSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true
    },
    content: {
        type: String,
    },
    link: {
        type: String,
        require: true
    },
    img: {
        type: String,
        require: true
    },
    language: {
        type: String,
        require: true
    },
    department: {
        type: String,
        require: true
    },
    source: {
        type: String,
        require: true
    },
    publicationDate: {
        type: Date,
        require: true
    },
    tonality: {
        type: String,
        require: true
    },
    score: {
        type: Number,
        require: true
    },
}, {timestamps: true});
  
export const News = mongoose.model('News', newsSchema);