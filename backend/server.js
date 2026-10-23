const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const multer = require('multer');
const { Furniture, Feedback, WorkInfo, TeamMember, Video, CustomOrder, Stat } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'bhavesh@admin123';

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

// ─── Real-Time Server-Sent Events (SSE) Engine ────────────────
const sseClients = new Set();

function broadcastChange(collection, action = 'update', meta = {}) {
  const payload = JSON.stringify({
    type: 'CHANGE',
    collection,
    action,
    meta,
    timestamp: Date.now()
  });

  const deadClients = [];
  for (const client of sseClients) {
    try {
      client.write(`data: ${payload}\n\n`);
    } catch (_) {
      deadClients.push(client);
    }
  }
  for (const dead of deadClients) {
    sseClients.delete(dead);
  }
}

// SSE Live Sync Endpoint for immediate frontend updates
app.get('/api/live-sync', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  // Send initial connected payload
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'Live database sync connected', timestamp: Date.now() })}\n\n`);

  sseClients.add(res);

  // Keep-alive heartbeat every 15s to prevent timeouts
  const heartbeat = setInterval(() => {
    try {
      res.write(`: heartbeat ${Date.now()}\n\n`);
    } catch (_) {
      clearInterval(heartbeat);
      sseClients.delete(res);
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
});

// ─── MongoDB Connection & Seed ────────────────────────────────
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/bhavesh_furniture';
mongoose.connect(mongoUri)
  .then(async () => {
    console.log('✅  MongoDB connected →', mongoUri);
    await seedDefaults();
    // Start background watcher after initial connect and seed
    startMongoDirectWatcher();
  })
  .catch(err => console.error('❌  MongoDB error:', err.message));

// ─── Seed default data if DB is empty ─────────────────────────
async function seedDefaults() {
  const count = await Furniture.countDocuments();
  if (count === 0) {
    console.log('🌱  Seeding default furniture items…');
    const defaults = [

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
      { title: 'Full Team On-Site Crafting', description: 'Once confirmed, our entire specialized artisan team visits your home with materials to build and complete furniture on-site.', icon: '👥', order: 2 },
      { title: '100% Custom Tailored Furniture', description: 'Every furniture piece is built specifically for your room layout, dimensions, and preferred wood.', icon: '🪑', order: 3 },
      { title: 'Premium Termite-Treated Wood', description: 'Grade-A Sheesham, Teak, and Pine with heavy-duty Italian hardware and luxury finishes.', icon: '🌳', order: 4 },
      { title: 'Fine Artisan Woodworking', description: 'Handcrafted with traditional joinery, premium hardware, and durable multi-coat polish finish.', icon: '🪵', order: 5 },
      { title: 'Transparent Honest Quotation', description: 'Clear upfront pricing with no hidden surprises. Complete material and labour breakdown.', icon: '📋', order: 6 },
    ]);
  }

  const tmCount = await TeamMember.countDocuments();
  if (tmCount === 0) {
    console.log('🌱  Seeding default team members…');
    await TeamMember.insertMany([
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

  const statCount = await Stat.countDocuments();
  if (statCount === 0) {
    console.log('🌱  Seeding default stats…');
    await Stat.insertMany([
      { value: '15+', label: 'Years Experience', order: 1 },
      { value: '5000+', label: 'Happy Clients', order: 2 },
      { value: '200+', label: 'Furniture Designs', order: 3 },
      { value: '50+', label: 'Cities Delivered', order: 4 }
    ]);
  }
  console.log('✅  Seed complete.');
}

// ─── Direct MongoDB Change Detector (Compass, Mongo Shell, etc.) ─
const MONITORED_MODELS = {
  furniture: Furniture,
  workinfo: WorkInfo,
  team: TeamMember,
  videos: Video,
  'custom-orders': CustomOrder,
  feedback: Feedback,
  stats: Stat
};

const collectionFingerprints = {};

async function pollDirectMongoChanges() {
  for (const [name, Model] of Object.entries(MONITORED_MODELS)) {
    try {
      const docs = await Model.find({}, { _id: 1, __v: 1, updatedAt: 1, name: 1, title: 1, order: 1 }).lean();
      const currentFingerprint = JSON.stringify(docs);

      if (collectionFingerprints[name] !== undefined && collectionFingerprints[name] !== currentFingerprint) {
        console.log(`⚡ Direct MongoDB change detected in [${name}] collection! Broadcasting live update…`);
        broadcastChange(name, 'direct_db_change', { count: docs.length });
      }
      collectionFingerprints[name] = currentFingerprint;
    } catch (_) { }
  }
}

function startMongoDirectWatcher() {
  // Initialize fingerprints
  pollDirectMongoChanges().then(() => {
    // Poll every 1000ms for live external database updates
    setInterval(pollDirectMongoChanges, 1000);
  });
}

// ─── Helper: Admin Auth ───────────────────────────────────────
function adminAuth(req, res, next) {
  const pwd = req.headers['x-admin-password'] ||
    (req.headers['authorization'] && req.headers['authorization'].replace(/^Bearer\s+/i, '')) ||
    req.query.adminPassword;
  if (!pwd || pwd !== ADMIN_PASSWORD) {
    console.warn(`🔒 Unauthorized admin request to ${req.method} ${req.url}`);
    return res.status(401).json({ error: 'Unauthorized: Invalid admin credentials' });
  }
  next();
}

// ─── Helper: Robust MongoDB Operations ────────────────────────
async function safeDelete(Model, id, extraFilter = null) {
  let deleted = null;

  // 1. Match by standard 24-char ObjectId
  if (id && mongoose.Types.ObjectId.isValid(id)) {
    try {
      deleted = await Model.findByIdAndDelete(id);
      if (deleted) return deleted;
    } catch (_) { }
  }

  // 2. Match by custom string _id
  if (id) {
    try {
      deleted = await Model.findOneAndDelete({ _id: id });
      if (deleted) return deleted;
    } catch (_) { }
  }

  // 3. Match by numeric order or custom numeric id
  const num = Number(id);
  if (!isNaN(num)) {
    try {
      deleted = await Model.findOneAndDelete({ $or: [{ order: num }, { id: num }] });
      if (deleted) return deleted;
    } catch (_) { }
  }

  // 4. Fallback: match by extra filter (e.g. name or title)
  if (extraFilter && Object.keys(extraFilter).length > 0) {
    try {
      deleted = await Model.findOneAndDelete(extraFilter);
      if (deleted) return deleted;
    } catch (_) { }
  }

  return null;
}

async function safeUpdate(Model, id, update, extraFilter = null, options = { new: true, returnDocument: 'after' }) {
  const cleanUpdate = { ...update };
  delete cleanUpdate._id;
  delete cleanUpdate.__v;
  delete cleanUpdate.id;

  let updated = null;

  // 1. Match by standard 24-char ObjectId
  if (id && mongoose.Types.ObjectId.isValid(id)) {
    try {
      updated = await Model.findByIdAndUpdate(id, cleanUpdate, options);
      if (updated) return updated;
    } catch (_) { }
  }

  // 2. Match by custom string _id
  if (id) {
    try {
      updated = await Model.findOneAndUpdate({ _id: id }, cleanUpdate, options);
      if (updated) return updated;
    } catch (_) { }
  }

  // 3. Match by numeric order or custom numeric id
  const num = Number(id);
  if (!isNaN(num)) {
    try {
      updated = await Model.findOneAndUpdate({ $or: [{ order: num }, { id: num }] }, cleanUpdate, options);
      if (updated) return updated;
    } catch (_) { }
  }

  // 4. Fallback: match by extra filter
  if (extraFilter && Object.keys(extraFilter).length > 0) {
    try {
      updated = await Model.findOneAndUpdate(extraFilter, cleanUpdate, options);
      if (updated) return updated;
    } catch (_) { }
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
    const itemData = { ...req.body };
    delete itemData._id;
    delete itemData.id;
    const item = await Furniture.create(itemData);
    const origin = req.get('origin') || req.get('referer') || '';
    const cleanOrigin = origin.replace(/\/$/, '');
    item.shareableLink = cleanOrigin ? `${cleanOrigin}/gallery?id=${item._id}` : `/gallery?id=${item._id}`;
    await item.save();

    console.log(`🛋️  Furniture created: "${item.name}" [${item._id}]`);
    broadcastChange('furniture', 'create', item);
    res.status(201).json(item);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.put('/api/furniture/:id', adminAuth, async (req, res) => {
  try {
    const origin = req.get('origin') || req.get('referer') || '';
    const cleanOrigin = origin.replace(/\/$/, '');
    const update = { ...req.body };
    if (!update.shareableLink && cleanOrigin) {
      update.shareableLink = `${cleanOrigin}/gallery?id=${req.params.id}`;
    }
    const name = req.query.name || req.body?.name;
    const item = await safeUpdate(Furniture, req.params.id, update, name ? { name } : null);

    console.log(`🛋️  Furniture updated: "${item ? item.name : req.params.id}"`);
    broadcastChange('furniture', 'update', item || { _id: req.params.id });
    res.json(item || { success: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.delete('/api/furniture/:id', adminAuth, async (req, res) => {
  try {
    const name = req.query.name;
    const deleted = await safeDelete(Furniture, req.params.id, name ? { name } : null);
    console.log(`🗑️  Furniture deleted from MongoDB: ${req.params.id}`, deleted ? deleted.name : '(deleted)');
    broadcastChange('furniture', 'delete', { id: req.params.id, item: deleted });
    res.json({ success: true, deleted: !!deleted, item: deleted });
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
    console.log(`🔧  WorkInfo created: "${item.title}" [${item._id}]`);
    broadcastChange('workinfo', 'create', item);
    res.status(201).json(item);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.put('/api/workinfo/:id', adminAuth, async (req, res) => {
  try {
    const title = req.query.title || req.body?.title;
    const item = await safeUpdate(WorkInfo, req.params.id, req.body, title ? { title } : null);
    console.log(`🔧  WorkInfo updated: "${item ? item.title : req.params.id}"`);
    broadcastChange('workinfo', 'update', item || { _id: req.params.id });
    res.json(item || { success: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.delete('/api/workinfo/:id', adminAuth, async (req, res) => {
  try {
    const title = req.query.title;
    const deleted = await safeDelete(WorkInfo, req.params.id, title ? { title } : null);
    console.log(`🗑️  WorkInfo deleted from MongoDB: ${req.params.id}`, deleted ? deleted.title : '(deleted)');
    broadcastChange('workinfo', 'delete', { id: req.params.id, item: deleted });
    res.json({ success: true, deleted: !!deleted, item: deleted });
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
    console.log(`👥  TeamMember created in MongoDB: "${item.name}" [${item._id}]`);
    broadcastChange('team', 'create', item);
    res.status(201).json(item);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.put('/api/team/:id', adminAuth, async (req, res) => {
  try {
    const name = req.query.name || req.body?.name;
    const item = await safeUpdate(TeamMember, req.params.id, req.body, name ? { name } : null);
    console.log(`👥  TeamMember updated in MongoDB: "${item ? item.name : req.params.id}"`);
    broadcastChange('team', 'update', item || { _id: req.params.id });
    res.json(item || { success: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.delete('/api/team/:id', adminAuth, async (req, res) => {
  try {
    const name = req.query.name;
    const deleted = await safeDelete(TeamMember, req.params.id, name ? { name } : null);
    console.log(`🗑️  TeamMember deleted from MongoDB: ID=${req.params.id}`, deleted ? `Name="${deleted.name}"` : '(deleted by fallback)');
    broadcastChange('team', 'delete', { id: req.params.id, item: deleted });
    res.json({ success: true, deleted: !!deleted, item: deleted });
  } catch (e) {
    console.error('Error deleting team member:', e);
    res.status(500).json({ error: e.message });
  }
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
    console.log(`🎬  Video created: "${item.title}" [${item._id}]`);
    broadcastChange('videos', 'create', item);
    res.status(201).json(item);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.put('/api/videos/:id', adminAuth, async (req, res) => {
  try {
    const title = req.query.title || req.body?.title;
    const item = await safeUpdate(Video, req.params.id, req.body, title ? { title } : null);
    console.log(`🎬  Video updated: "${item ? item.title : req.params.id}"`);
    broadcastChange('videos', 'update', item || { _id: req.params.id });
    res.json(item || { success: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.delete('/api/videos/:id', adminAuth, async (req, res) => {
  try {
    const title = req.query.title;
    const deleted = await safeDelete(Video, req.params.id, title ? { title } : null);
    console.log(`🗑️  Video deleted from MongoDB: ${req.params.id}`, deleted ? deleted.title : '(deleted)');
    broadcastChange('videos', 'delete', { id: req.params.id, item: deleted });
    res.json({ success: true, deleted: !!deleted, item: deleted });
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
    console.log(`⭐  Feedback received from "${fb.name}"`);
    broadcastChange('feedback', 'create', fb);
    res.status(201).json(fb);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.patch('/api/feedback/:id/read', adminAuth, async (req, res) => {
  try {
    const fb = await safeUpdate(Feedback, req.params.id, { status: 'read' });
    broadcastChange('feedback', 'update', fb);
    res.json(fb || { success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/feedback/:id', adminAuth, async (req, res) => {
  try {
    const deleted = await safeDelete(Feedback, req.params.id);
    broadcastChange('feedback', 'delete', { id: req.params.id });
    res.json({ success: true, deleted: !!deleted });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════════════
// CUSTOM ORDER ROUTES (User Furniture Requests)
// ════════════════════════════════════════════════════════════════
app.post('/api/custom-orders', async (req, res) => {
  try {
    const order = await CustomOrder.create(req.body);
    console.log(`📦  New Custom Order placed by "${order.name}" [${order.furnitureType}]`);
    broadcastChange('custom-orders', 'create', order);
    res.status(201).json(order);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.get('/api/custom-orders', adminAuth, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const orders = await CustomOrder.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

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

app.patch('/api/custom-orders/:id', adminAuth, async (req, res) => {
  try {
    const update = { ...req.body, updatedAt: new Date() };
    const order = await safeUpdate(CustomOrder, req.params.id, update);
    console.log(`📦  Custom Order updated: [${req.params.id}] status=${order ? order.status : 'updated'}`);
    broadcastChange('custom-orders', 'update', order);
    res.json(order || { success: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.delete('/api/custom-orders/:id', adminAuth, async (req, res) => {
  try {
    const deleted = await safeDelete(CustomOrder, req.params.id);
    console.log(`🗑️  Custom Order deleted from MongoDB: ${req.params.id}`);
    broadcastChange('custom-orders', 'delete', { id: req.params.id });
    res.json({ success: true, deleted: !!deleted });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════════════
// SITE STATS ROUTES
// ════════════════════════════════════════════════════════════════
app.get('/api/stats', async (req, res) => {
  try {
    let stats = await Stat.find().sort({ order: 1, _id: 1 });
    if (stats.length === 0) {
      const defaults = [
        { value: '15+', label: 'Years Experience', order: 1 },
        { value: '5000+', label: 'Happy Clients', order: 2 },
        { value: '200+', label: 'Furniture Designs', order: 3 },
        { value: '50+', label: 'Cities Delivered', order: 4 }
      ];
      stats = await Stat.insertMany(defaults);
    }
    res.json(stats);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/stats', adminAuth, async (req, res) => {
  try {
    const { value, label, order } = req.body;
    if (!value || !label) return res.status(400).json({ error: 'Value and label are required' });
    const stat = await Stat.create({
      value,
      label,
      order: order !== undefined ? Number(order) : 0
    });
    broadcastChange('stats', 'create', stat);
    res.status(201).json(stat);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.put('/api/stats/:id', adminAuth, async (req, res) => {
  try {
    const { value, label, order } = req.body;
    const update = {};
    if (value !== undefined) update.value = value;
    if (label !== undefined) update.label = label;
    if (order !== undefined) update.order = Number(order);
    const updated = await safeUpdate(Stat, req.params.id, update);
    broadcastChange('stats', 'update', updated);
    res.json(updated || { success: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.put('/api/stats', adminAuth, async (req, res) => {
  try {
    const items = req.body;
    if (Array.isArray(items)) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item._id && mongoose.Types.ObjectId.isValid(item._id)) {
          await Stat.findByIdAndUpdate(item._id, {
            value: item.value,
            label: item.label,
            order: item.order !== undefined ? item.order : i + 1
          });
        }
      }
      const all = await Stat.find().sort({ order: 1, _id: 1 });
      broadcastChange('stats', 'update_all', all);
      return res.json(all);
    }
    res.status(400).json({ error: 'Expected array of stats' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/stats/:id', adminAuth, async (req, res) => {
  try {
    const deleted = await safeDelete(Stat, req.params.id);
    broadcastChange('stats', 'delete', { id: req.params.id });
    res.json({ success: true, deleted: !!deleted });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Admin Login ──────────────────────────────────────────────
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, token: ADMIN_PASSWORD });
  } else {
    res.status(401).json({ error: 'Wrong admin password' });
  }
});

// ─── Health Check ─────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ status: 'ok', connectedClients: sseClients.size, time: new Date() }));

// ─── Static Frontend Serving (Live Deployment) ────────────────
const clientDist = path.join(__dirname, '../furniture-website/dist/furniture-website/browser');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// ─── Start Server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀  Bhavesh Furniture API running at http://localhost:${PORT}`);
  console.log(`⚡  Live Database Real-Time SSE Stream active at http://localhost:${PORT}/api/live-sync`);
});
