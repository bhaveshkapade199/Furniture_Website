require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const path     = require('path');
const fs       = require('fs');
const multer   = require('multer');
const { Furniture, Feedback, WorkInfo, TeamMember, Video, CustomOrder } = require('./models');

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Ensure uploads folder exists ─────────────────────────────
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ─── Multer Storage for Photos & Videos ───────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = file.originalname.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1E6)}-${safeName}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit for photos & videos
});

// ─── Middleware ───────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(uploadDir));

// ─── MongoDB ──────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅  MongoDB connected →', process.env.MONGODB_URI);
    await seedDefaults();
  })
  .catch(err => console.error('❌  MongoDB error:', err.message));

// ─── Seed default data if DB is empty ─────────────────────────
async function seedDefaults() {
  const count = await Furniture.countDocuments();
  if (count === 0) {
    console.log('🌱  Seeding default furniture items…');
    const defaults = [
      { name: 'Royal Sofa Set 5-Seater', category: 'Sofa Set', description: 'Premium 5-seater sofa set with velvet finish.', imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600', price: '₹45,000' },
      { name: 'L-Shape Corner Sofa',     category: 'Sofa Set', description: 'Modern L-shaped sectional sofa with premium fabric.', imageUrl: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600', price: '₹62,000' },
      { name: '3-Seater Recliner Sofa',  category: 'Sofa Set', description: 'Luxury 3-seater recliner sofa with cup holders.', imageUrl: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=600', price: '₹55,000' },
      { name: 'Fabric Sofa Set',         category: 'Sofa Set', description: 'Elegant 6-seater fabric sofa in ash grey.', imageUrl: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=600', price: '₹38,000' },
      { name: 'King Size Bed',           category: 'Bedroom',  description: 'Luxurious king-size bed with hydraulic storage.', imageUrl: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=600', price: '₹38,000' },
      { name: '4-Door Wardrobe',         category: 'Bedroom',  description: 'Spacious 4-door wardrobe with mirror & shelves.', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600', price: '₹28,000' },
      { name: 'Modern TV Unit',          category: 'TV Unit',  description: 'Sleek wall-mounted TV unit with LED backlight.', imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f4e62a?w=600', price: '₹18,500' },
      { name: 'Modular Kitchen',         category: 'Kitchen',  description: 'Full modular kitchen with granite top.', imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600', price: '₹1,20,000' },
      { name: 'Pooja Mandir',            category: 'Temple / Mandir', description: 'Hand-carved wooden temple with LED lighting.', imageUrl: 'https://images.unsplash.com/photo-1609766418204-94aae0ecfdfc?w=600', price: '₹15,000' },
      { name: 'Dining Table 6-Seater',   category: 'Dining Room', description: 'Solid sheesham wood dining table for 6 persons.', imageUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600', price: '₹28,000' },
    ];
    for (const item of defaults) {
      const saved = await Furniture.create(item);
      saved.shareableLink = `http://localhost:4200/gallery?id=${saved._id}`;
      await saved.save();
    }
  }

  const wiCount = await WorkInfo.countDocuments();
  if (wiCount === 0) {
    await WorkInfo.insertMany([
      { title: 'Home Space Visit & Measurement', description: 'Our specialist visits your house, inspects the exact space, and provides a customized quotation for just ₹200 visit charge.', icon: '🏠', order: 1 },
      { title: 'Full Team On-Site Crafting',     description: 'Once confirmed, our entire specialized artisan team visits your home with materials to build and complete furniture on-site.', icon: '👥', order: 2 },
      { title: '100% Custom Tailored Furniture', description: 'Every furniture piece is built specifically for your room layout, dimensions, and preferred wood.', icon: '🪑', order: 3 },
      { title: 'Premium Termite-Treated Wood',   description: 'Grade-A Sheesham, Teak, and Pine with heavy-duty Italian hardware and luxury finishes.', icon: '🌳', order: 4 },
      { title: 'Fine Artisan Woodworking',     description: 'Handcrafted with traditional joinery, premium hardware, and durable multi-coat polish finish.', icon: '🪵', order: 5 },
      { title: 'Transparent Honest Quotation',   description: 'Clear upfront pricing with no hidden surprises. Complete material and labour breakdown.', icon: '📋', order: 6 },
    ]);
  }

  const tmCount = await TeamMember.countDocuments();
  if (tmCount === 0) {
    console.log('🌱  Seeding default team members…');
    await TeamMember.insertMany([
      { name: 'Bhavesh Patel',  role: 'Founder & Master Craftsman',   experience: '15+ Years', specialty: 'All Custom Woods', emoji: '👨‍🔨', description: 'Visionary behind every piece of furniture we craft. 15+ years of master woodworking experience.', phone: '+91 92255 76095', order: 1 },
      { name: 'Ramesh Kumar',   role: 'Head of Design',                experience: '12 Years',  specialty: 'Sofa & Bedroom',   emoji: '🎨', description: 'Expert in modern sofa sets, luxury recliners, and contemporary bedroom furniture.', phone: '+91 98765 43211', order: 2 },
      { name: 'Sunita Devi',    role: 'Kitchen & Interior Specialist', experience: '10 Years',  specialty: 'Modular Kitchens', emoji: '🍳', description: 'Specializes in ergonomic modular kitchens, storage solutions, and TV entertainment units.', phone: '+91 98765 43212', order: 3 },
      { name: 'Kiran Shah',     role: 'Temple & Decor Artisan',        experience: '8 Years',   specialty: 'Hand Carving',     emoji: '🛕', description: 'Master carver of sacred wooden temples, mandirs, and intricate artistic wood carvings.', phone: '+91 98765 43213', order: 4 },
      { name: 'Mahesh Parmar',  role: 'Sales & Client Relations',      experience: '6 Years',   specialty: 'Custom Orders',    emoji: '🤝', description: 'Your personal advisor for quotes, site visits, custom requirements, and timely delivery.', phone: '+91 98765 43214', order: 5 },
      { name: 'Deepa Joshi',    role: 'Quality Control Manager',       experience: '9 Years',   specialty: 'Quality Assurance',emoji: '✅', description: 'Thoroughly inspects every joint, polish finish, fabric quality, and packaging before dispatch.', phone: '+91 98765 43215', order: 6 }
    ]);
  }

  const vidCount = await Video.countDocuments();
  if (vidCount === 0) {
    console.log('🌱  Seeding default videos…');
    await Video.insertMany([
      {
        title: 'Master Sofa Crafting Process',
        description: 'Watch how our skilled artisans handcraft our bestselling Royal Sofa from solid wood frame to premium fabric stitching.',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600',
        category: 'Workshop'
      },
      {
        title: 'Modular Kitchen Installation Walkthrough',
        description: 'Complete walkthrough of a luxury modular kitchen installed with hydraulic hinges and granite countertop.',
        videoUrl: 'https://www.w3schools.com/html/movie.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600',
        category: 'Installation'
      }
    ]);
  }
  console.log('✅  Seed complete.');
}

// ─── Helper: Admin auth ───────────────────────────────────────
function adminAuth(req, res, next) {
  const pwd = req.headers['x-admin-password'] ||
              (req.headers['authorization'] && req.headers['authorization'].replace(/^Bearer\s+/i, '')) ||
              req.query.adminPassword;
  if (pwd !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// ─── Helper: Safe MongoDB Operations ──────────────────────────
async function safeDelete(Model, id) {
  try {
    if (mongoose.Types.ObjectId.isValid(id)) {
      const res = await Model.findByIdAndDelete(id);
      if (res) return res;
    }
  } catch (_) {}
  const num = Number(id);
  if (!isNaN(num)) {
    try {
      const res = await Model.findOneAndDelete({ order: num });
      if (res) return res;
    } catch (_) {}
  }
  return null;
}

async function safeUpdate(Model, id, update, options = { new: true }) {
  try {
    if (mongoose.Types.ObjectId.isValid(id)) {
      const res = await Model.findByIdAndUpdate(id, update, options);
      if (res) return res;
    }
  } catch (_) {}
  const num = Number(id);
  if (!isNaN(num)) {
    try {
      const res = await Model.findOneAndUpdate({ order: num }, update, options);
      if (res) return res;
    } catch (_) {}
  }
  return null;
}

// ════════════════════════════════════════════════════════════════
// FILE UPLOAD ROUTE (Photos & Videos)
// ════════════════════════════════════════════════════════════════
app.post('/api/upload', adminAuth, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const protocol = req.protocol;
    const host = req.get('host');
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    res.json({
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ════════════════════════════════════════════════════════════════
// FURNITURE ROUTES
// ════════════════════════════════════════════════════════════════
app.get('/api/furniture', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const items = await Furniture.find(filter).sort({ dateAdded: -1 });
    res.json(items);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/furniture/:id', async (req, res) => {
  try {
    let item = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      item = await Furniture.findById(req.params.id);
    }
    if (!item) {
      const num = Number(req.params.id);
      if (!isNaN(num)) item = await Furniture.findOne({ order: num });
    }
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/furniture', adminAuth, async (req, res) => {
  try {
    const item = await Furniture.create(req.body);
    item.shareableLink = `http://localhost:4200/gallery?id=${item._id}`;
    await item.save();
    res.status(201).json(item);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.put('/api/furniture/:id', adminAuth, async (req, res) => {
  try {
    const item = await safeUpdate(Furniture, req.params.id, req.body);
    res.json(item || { success: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.delete('/api/furniture/:id', adminAuth, async (req, res) => {
  try {
    await safeDelete(Furniture, req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════════════
// WORK INFO ROUTES
// ════════════════════════════════════════════════════════════════
app.get('/api/workinfo', async (req, res) => {
  try {
    const items = await WorkInfo.find().sort({ order: 1 });
    res.json(items);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/workinfo', adminAuth, async (req, res) => {
  try {
    const item = await WorkInfo.create(req.body);
    res.status(201).json(item);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.put('/api/workinfo/:id', adminAuth, async (req, res) => {
  try {
    const item = await safeUpdate(WorkInfo, req.params.id, req.body);
    res.json(item || { success: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.delete('/api/workinfo/:id', adminAuth, async (req, res) => {
  try {
    await safeDelete(WorkInfo, req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════════════
// TEAM ROUTES
// ════════════════════════════════════════════════════════════════
app.get('/api/team', async (req, res) => {
  try {
    const items = await TeamMember.find().sort({ order: 1 });
    res.json(items);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/team', adminAuth, async (req, res) => {
  try {
    const item = await TeamMember.create(req.body);
    res.status(201).json(item);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.put('/api/team/:id', adminAuth, async (req, res) => {
  try {
    const item = await safeUpdate(TeamMember, req.params.id, req.body);
    res.json(item || { success: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.delete('/api/team/:id', adminAuth, async (req, res) => {
  try {
    await safeDelete(TeamMember, req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════════════
// VIDEO ROUTES
// ════════════════════════════════════════════════════════════════
app.get('/api/videos', async (req, res) => {
  try {
    const items = await Video.find().sort({ dateAdded: -1 });
    res.json(items);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/videos', adminAuth, async (req, res) => {
  try {
    const item = await Video.create(req.body);
    res.status(201).json(item);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.put('/api/videos/:id', adminAuth, async (req, res) => {
  try {
    const item = await safeUpdate(Video, req.params.id, req.body);
    res.json(item || { success: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.delete('/api/videos/:id', adminAuth, async (req, res) => {
  try {
    await safeDelete(Video, req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════════════
// FEEDBACK ROUTES
// ════════════════════════════════════════════════════════════════
app.get('/api/feedback', adminAuth, async (req, res) => {
  try {
    const items = await Feedback.find().sort({ date: -1 });
    res.json(items);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/feedback', async (req, res) => {
  try {
    const fb = await Feedback.create(req.body);
    res.status(201).json(fb);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.patch('/api/feedback/:id/read', adminAuth, async (req, res) => {
  try {
    const fb = await safeUpdate(Feedback, req.params.id, { status: 'read' });
    res.json(fb || { success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/feedback/:id', adminAuth, async (req, res) => {
  try {
    await safeDelete(Feedback, req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════════════
// CUSTOM ORDER ROUTES (User Furniture Requests)
// ════════════════════════════════════════════════════════════════

// POST - any user can submit a custom order request
app.post('/api/custom-orders', async (req, res) => {
  try {
    const order = await CustomOrder.create(req.body);
    res.status(201).json(order);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// GET all custom orders - admin only
app.get('/api/custom-orders', adminAuth, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const orders = await CustomOrder.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET single custom order - admin only
app.get('/api/custom-orders/:id', adminAuth, async (req, res) => {
  try {
    let order = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      order = await CustomOrder.findById(req.params.id);
    }
    if (!order) return res.status(404).json({ error: 'Not found' });
    res.json(order);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PATCH update status / admin notes / quoted price - admin only
app.patch('/api/custom-orders/:id', adminAuth, async (req, res) => {
  try {
    const update = { ...req.body, updatedAt: new Date() };
    const order = await safeUpdate(CustomOrder, req.params.id, update);
    res.json(order || { success: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// DELETE custom order - admin only
app.delete('/api/custom-orders/:id', adminAuth, async (req, res) => {
  try {
    await safeDelete(CustomOrder, req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Admin Login ──────────────────────────────────────────────
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    res.json({ success: true, token: process.env.ADMIN_PASSWORD });
  } else {
    res.status(401).json({ error: 'Wrong password' });
  }
});

// ─── Health Check ─────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date() }));

// ─── Start Server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀  Bhavesh Furniture API running at http://localhost:${PORT}`);
});
