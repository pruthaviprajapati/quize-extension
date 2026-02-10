import mongoose from 'mongoose';

const generatedContentSchema = new mongoose.Schema({
  contentId: {
    type: String,
    required: true,
    unique: true,
  },
  videoIdentifier: {
    type: String,
    required: true,
    index: true,
  },
  pageTitle: {
    type: String,
    required: true,
  },
  domain: {
    type: String,
    required: true,
  },
  pageUrl: {
    type: String,
    required: true,
  },
  videoSrc: {
    type: String,
    required: true,
  },
  contentType: {
    type: String,
    enum: ['quiz', 'qa'],
    required: true,
  },
  generatedData: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Create compound unique index for caching
generatedContentSchema.index({ videoIdentifier: 1, contentType: 1 }, { unique: true });

const GeneratedContent = mongoose.model('GeneratedContent', generatedContentSchema);

export default GeneratedContent;
