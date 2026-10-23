const mongoose = require('mongoose');

const FurnitureSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  category:      { type: String, required: true },
  description:   { type: String, default: '' },
  imageUrl:      { type: String, required: true },
  videoUrl:      { type: String, default: '' },
  price:         { type: String, default: '' },
  shareableLink: { type: String },
  dateAdded:     { type: Date, default: Date.now }
});

const FeedbackSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  email:   { type: String, required: true },
  message: { type: String, required: true },
  rating:  { type: Number, min: 1, max: 5, default: 5 },
  date:    { type: Date, default: Date.now },
  status:  { type: String, enum: ['new', 'read', 'replied'], default: 'new' }
});

const WorkInfoSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, required: true },
  icon:        { type: String, default: '🪑' },
  imageUrl:    { type: String, default: '' },
  videoUrl:    { type: String, default: '' },
  order:       { type: Number, default: 0 }
});

const TeamMemberSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  role:        { type: String, required: true },
  experience:  { type: String, default: '' },
  description: { type: String, default: '' },
  specialty:   { type: String, default: '' },
  emoji:       { type: String, default: '👨‍💼' },
  imageUrl:    { type: String, default: '' },
  phone:       { type: String, default: '' },
  order:       { type: Number, default: 0 }
});

const VideoSchema = new mongoose.Schema({
  title:        { type: String, required: true },
  description:  { type: String, default: '' },
  videoUrl:     { type: String, required: true },
  thumbnailUrl: { type: String, default: '' },
  category:     { type: String, default: 'Workshop' },
  dateAdded:    { type: Date, default: Date.now }
});

const CustomOrderSchema = new mongoose.Schema({
  // Customer details
  name:         { type: String, required: true },
  email:        { type: String, required: true },
  phone:        { type: String, required: true },
  address:      { type: String, default: '' },
  city:         { type: String, default: '' },

  // Furniture requirements
  furnitureType:  { type: String, required: true },   
  woodType:       { type: String, default: '' },       
  dimensions:     { type: String, default: '' },       
  colorFinish:    { type: String, default: '' },      
  description:    { type: String, required: true },   
  budgetRange:    { type: String, default: '' },       
  urgency:        { type: String, enum: ['flexible', 'within_month', 'urgent'], default: 'flexible' },
  homeVisitNeeded: { type: Boolean, default: true },

  // Reference image URL (optional)
  referenceImageUrl: { type: String, default: '' },

  // Status & admin tracking
  status:       { type: String, enum: ['new', 'contacted', 'quoted', 'in_progress', 'completed', 'cancelled'], default: 'new' },
  adminNotes:   { type: String, default: '' },
  quotedPrice:  { type: String, default: '' },
  createdAt:    { type: Date, default: Date.now },
  updatedAt:    { type: Date, default: Date.now }
});

const StatSchema = new mongoose.Schema({
  value: { type: String, required: true },
  label: { type: String, required: true },
  order: { type: Number, default: 0 }
});

module.exports = {
  Furniture:    mongoose.model('Furniture', FurnitureSchema),
  Feedback:     mongoose.model('Feedback', FeedbackSchema),
  WorkInfo:     mongoose.model('WorkInfo', WorkInfoSchema),
  TeamMember:   mongoose.model('TeamMember', TeamMemberSchema),
  Video:        mongoose.model('Video', VideoSchema),
  CustomOrder:  mongoose.model('CustomOrder', CustomOrderSchema),
  Stat:         mongoose.model('Stat', StatSchema)
};
