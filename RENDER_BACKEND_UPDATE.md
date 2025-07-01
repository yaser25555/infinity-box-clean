# إصلاح خطأ Render Backend

## المشكلة:
```
ReferenceError: require is not defined in ES module scope
```

## السبب:
ملف `server.js` يستخدم `require` لكن package.json محدد كـ `"type": "module"`

## الحل - خادم محدث بـ ES modules:

### 1. server.js جديد:
```javascript
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

// CORS configuration
app.use(cors({
  origin: ['https://infinity-box25.netlify.app', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json());

// User Schema
const userSchema = new mongoose.Schema({
  playerId: { type: String, unique: true, required: true },
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  email: { type: String, unique: true },
  avatar: String,
  profileImage: String,
  gender: String,
  isAdmin: { type: Boolean, default: false },
  level: { type: Number, default: 1 },
  gold: { type: Number, default: 10000 },
  pearls: { type: Number, default: 10 },
  status: String,
  lastActive: { type: Date, default: Date.now },
  activeSessionToken: String,
  createdAt: { type: Date, default: Date.now }
});

// Generate unique Player ID
function generatePlayerId() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

userSchema.pre('save', async function(next) {
  if (this.isNew && !this.playerId) {
    let playerId;
    let isUnique = false;
    while (!isUnique) {
      playerId = generatePlayerId();
      const existingUser = await mongoose.model('User').findOne({ playerId });
      if (!existingUser) {
        isUnique = true;
      }
    }
    this.playerId = playerId;
  }
  next();
});

const User = mongoose.model('User', userSchema);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ متصل بـ MongoDB'))
  .catch(err => console.error('❌ خطأ MongoDB:', err));

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'INFINITY BOX Backend يعمل بنجاح! 🎮',
    status: 'active',
    version: '2.0',
    features: ['Authentication', 'Games', 'Social System']
  });
});

// Register endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'اسم المستخدم أو البريد الإلكتروني مستخدم بالفعل' 
      });
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    const sessionToken = jwt.sign({ timestamp: Date.now() }, 'session-secret');
    
    const user = new User({
      username,
      password: hashedPassword,
      email,
      activeSessionToken: sessionToken
    });
    
    await user.save();
    
    const token = jwt.sign({ userId: user._id }, 'jwt-secret');
    
    res.status(201).json({
      token,
      user: {
        id: user._id,
        playerId: user.playerId,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        level: user.level,
        gold: user.gold,
        pearls: user.pearls
      }
    });
  } catch (error) {
    console.error('خطأ التسجيل:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }
    
    // Generate new session token
    const sessionToken = jwt.sign({ timestamp: Date.now() }, 'session-secret');
    user.activeSessionToken = sessionToken;
    user.lastActive = new Date();
    await user.save();
    
    const token = jwt.sign({ userId: user._id }, 'jwt-secret');
    
    res.json({
      token,
      user: {
        id: user._id,
        playerId: user.playerId,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        level: user.level,
        gold: user.gold,
        pearls: user.pearls
      }
    });
  } catch (error) {
    console.error('خطأ تسجيل الدخول:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// Save game score
app.post('/api/save-score', async (req, res) => {
  try {
    const { userId, score, gold, pearls } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }
    
    user.gold += gold || 0;
    user.pearls += pearls || 0;
    user.lastActive = new Date();
    
    await user.save();
    
    res.json({
      message: 'تم حفظ النتيجة بنجاح',
      newGold: user.gold,
      newPearls: user.pearls
    });
  } catch (error) {
    console.error('خطأ حفظ النتيجة:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// Get all users (admin)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password -activeSessionToken');
    res.json(users);
  } catch (error) {
    console.error('خطأ جلب المستخدمين:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 الخادم يعمل على المنفذ ${PORT}`);
});
```

### 2. package.json محدث:
```json
{
  "name": "infinity-box-backend",
  "version": "1.0.0",
  "type": "module",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "cors": "^2.8.5",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2"
  }
}
```

ارفع هذين الملفين إلى GitHub وسيعمل Render بشكل صحيح.