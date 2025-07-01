const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// إعداد CORS
app.use(cors({
  origin: ['https://infinity-box25.netlify.app', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// اتصال MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Connected to MongoDB Atlas');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// نموذج المستخدم - تم إصلاح مشكلة email index
const userSchema = new mongoose.Schema({
  playerId: {
    type: String,
    unique: true,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // يسمح بقيم null متعددة
    trim: true,
    default: null
  },
  avatar: String,
  profileImage: String,
  gender: {
    type: String,
    enum: ['male', 'female'],
    default: 'male'
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  coins: {
    type: Number,
    default: 0
  },
  goldCoins: {
    type: Number,
    default: 10000
  },
  pearls: {
    type: Number,
    default: 10
  },
  level: {
    type: Number,
    default: 1
  },
  experience: {
    type: Number,
    default: 0
  },
  activeSessionToken: String,
  joinedAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'away'],
    default: 'offline'
  }
}, {
  timestamps: true
});

// توليد Player ID فريد عند الإنشاء
userSchema.pre('save', async function(next) {
  if (this.isNew && !this.playerId) {
    let playerId;
    let isUnique = false;
    
    while (!isUnique) {
      playerId = Math.floor(100000 + Math.random() * 900000).toString();
      const existing = await User.findOne({ playerId });
      if (!existing) {
        isUnique = true;
      }
    }
    
    this.playerId = playerId;
  }
  next();
});

const User = mongoose.model('User', userSchema);

// middleware للمصادقة
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'infinitybox_secret_key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes الأساسية

// فحص صحة الخادم
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'INFINITY BOX Backend API v2.0 - Working!',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users', 
      health: '/health'
    }
  });
});

// تسجيل مستخدم جديد
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // التحقق من وجود المستخدم
    const query = { username };
    if (email && email.trim()) {
      query.$or = [{ username }, { email: email.trim() }];
    }
    
    const existingUser = await User.findOne(query);

    if (existingUser) {
      return res.status(400).json({ 
        message: 'اسم المستخدم أو البريد الإلكتروني مُستخدم بالفعل' 
      });
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // إنشاء المستخدم الجديد
    const userData = {
      username,
      password: hashedPassword,
      goldCoins: 10000, // مكافأة الترحيب
      pearls: 1, // مكافأة الترحيب
      level: 1,
      experience: 0,
      isAdmin: false,
      status: 'online'
    };

    // إضافة email فقط إذا كان موجود ومليء
    if (email && email.trim()) {
      userData.email = email.trim();
    }

    const newUser = new User(userData);
    await newUser.save();

    // إنشاء JWT token
    const token = jwt.sign(
      { userId: newUser._id, username: newUser.username },
      process.env.JWT_SECRET || 'infinitybox_secret_key',
      { expiresIn: '24h' }
    );

    // تحديث activeSessionToken
    newUser.activeSessionToken = token;
    await newUser.save();

    res.status(201).json({
      message: 'تم إنشاء الحساب بنجاح',
      token,
      user: {
        id: newUser._id,
        playerId: newUser.playerId,
        username: newUser.username,
        email: newUser.email,
        goldCoins: newUser.goldCoins,
        pearls: newUser.pearls,
        level: newUser.level,
        isAdmin: newUser.isAdmin
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'اسم المستخدم أو البريد الإلكتروني مُستخدم بالفعل' });
    }
    res.status(500).json({ message: 'خطأ في إنشاء الحساب' });
  }
});

// تسجيل الدخول
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // البحث عن المستخدم
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ 
        message: 'المستخدم غير موجود. الرجاء التسجيل أولاً.' 
      });
    }

    // التحقق من كلمة المرور
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'كلمة المرور غير صحيحة' });
    }

    // إنشاء JWT token جديد
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'infinitybox_secret_key',
      { expiresIn: '24h' }
    );

    // تحديث الجلسة والنشاط
    user.activeSessionToken = token;
    user.lastActive = new Date();
    user.status = 'online';
    await user.save();

    res.json({
      message: 'تم تسجيل الدخول بنجاح',
      token,
      user: {
        id: user._id,
        playerId: user.playerId,
        username: user.username,
        email: user.email,
        goldCoins: user.goldCoins,
        pearls: user.pearls,
        level: user.level,
        isAdmin: user.isAdmin,
        profileImage: user.profileImage,
        gender: user.gender
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'خطأ في تسجيل الدخول' });
  }
});

// جلب بيانات المستخدم الحالي
app.get('/api/user', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    res.json({
      id: user._id,
      playerId: user.playerId,
      username: user.username,
      email: user.email,
      goldCoins: user.goldCoins,
      pearls: user.pearls,
      level: user.level,
      isAdmin: user.isAdmin,
      profileImage: user.profileImage,
      gender: user.gender,
      status: user.status,
      lastActive: user.lastActive
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'خطأ في جلب بيانات المستخدم' });
  }
});

// حفظ نتيجة اللعبة
app.post('/api/game/save-score', authenticateToken, async (req, res) => {
  try {
    const { gameName, score, level, goldEarned, pearlsEarned } = req.body;
    const userId = req.user.userId;

    // تحديث عملات المستخدم
    const user = await User.findById(userId);
    if (user) {
      user.goldCoins += goldEarned || 0;
      user.pearls += pearlsEarned || 0;
      await user.save();
    }

    res.json({ 
      message: 'تم حفظ النتيجة بنجاح',
      newBalance: {
        goldCoins: user.goldCoins,
        pearls: user.pearls
      }
    });

  } catch (error) {
    console.error('Save score error:', error);
    res.status(500).json({ message: 'خطأ في حفظ النتيجة' });
  }
});

// تحديث صورة الملف الشخصي
app.post('/api/user/update-profile-image', authenticateToken, async (req, res) => {
  try {
    const { profileImage } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    user.profileImage = profileImage;
    await user.save();

    res.json({ 
      message: 'تم تحديث الصورة الشخصية بنجاح',
      profileImage: user.profileImage
    });

  } catch (error) {
    console.error('Update profile image error:', error);
    res.status(500).json({ message: 'خطأ في تحديث الصورة' });
  }
});

// معالج الأخطاء العام
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'حدث خطأ في الخادم' });
});

// معالج الطرق غير الموجودة
app.use('*', (req, res) => {
  res.status(404).json({ message: 'الطريق غير موجود' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});