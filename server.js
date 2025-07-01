import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup
app.use(cors({
  origin: ['https://infinity-box25.netlify.app', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Connected to MongoDB Atlas');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// User Schema
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
    sparse: true,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  profileImage: {
    type: String,
    default: null
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    default: null
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  gold: {
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
  status: {
    type: String,
    default: 'online'
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  activeSessionToken: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Generate unique Player ID
function generatePlayerId() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Pre-save middleware to generate Player ID
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

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'default-secret', async (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    try {
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if session is still valid
      if (user.activeSessionToken !== token) {
        return res.status(401).json({ message: 'Session expired - logged in from another device' });
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      username,
      password: hashedPassword,
      email,
      gold: 10000,
      pearls: 11 // Welcome bonus: 10 default + 1 welcome pearl
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );

    // Save session token
    user.activeSessionToken = token;
    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        playerId: user.playerId,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        profileImage: user.profileImage,
        gender: user.gender,
        isAdmin: user.isAdmin,
        gold: user.gold,
        pearls: user.pearls,
        level: user.level,
        status: user.status,
        lastActive: user.lastActive
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate new token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );

    // Update session token (invalidates other sessions)
    user.activeSessionToken = token;
    user.status = 'online';
    user.lastActive = new Date();
    await user.save();

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        playerId: user.playerId,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        profileImage: user.profileImage,
        gender: user.gender,
        isAdmin: user.isAdmin,
        gold: user.gold,
        pearls: user.pearls,
        level: user.level,
        status: user.status,
        lastActive: user.lastActive
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
app.get('/api/users/me', authenticateToken, (req, res) => {
  res.json({
    id: req.user._id,
    playerId: req.user.playerId,
    username: req.user.username,
    email: req.user.email,
    avatar: req.user.avatar,
    profileImage: req.user.profileImage,
    gender: req.user.gender,
    isAdmin: req.user.isAdmin,
    gold: req.user.gold,
    pearls: req.user.pearls,
    level: req.user.level,
    status: req.user.status,
    lastActive: req.user.lastActive
  });
});

// Logout
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    req.user.activeSessionToken = null;
    req.user.status = 'offline';
    await req.user.save();
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Game score endpoint
app.post('/api/game/score', authenticateToken, async (req, res) => {
  try {
    const { score, gold, pearls } = req.body;
    
    // Update user currency
    req.user.gold += gold || 0;
    req.user.pearls += pearls || 0;
    
    await req.user.save();
    
    res.json({
      message: 'Score saved successfully',
      newGold: req.user.gold,
      newPearls: req.user.pearls
    });
  } catch (error) {
    console.error('Score save error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});