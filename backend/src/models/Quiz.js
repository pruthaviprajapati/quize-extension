import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  videoTitle: {
    type: String,
    default: ''
  },
  isEducational: {
    type: Boolean,
    required: true
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    options: [{
      type: String,
      required: true
    }],
    correctAnswer: {
      type: Number,
      required: true,
      min: 0,
      max: 3
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 2592000 // Auto-delete after 30 days (TTL index)
  },
  accessCount: {
    type: Number,
    default: 0
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  }
});

// Index for faster lookups
quizSchema.index({ videoId: 1 });
quizSchema.index({ createdAt: 1 });

// Method to increment access count
quizSchema.methods.recordAccess = function() {
  this.accessCount += 1;
  this.lastAccessed = new Date();
  return this.save();
};

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;
