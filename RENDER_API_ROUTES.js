// API Routes للباكند على Render
// هذا الملف يحتوي على جميع المسارات المطلوبة

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { MongoClient, ObjectId } = require('mongodb');

const router = express.Router();

// MongoDB Connection
const client = new MongoClient(process.env.MONGODB_URI);
let db;

client.connect().then(() => {
  db = client.db('infinitybox');
  console.log('Connected to MongoDB');
});

// Generate unique 6-digit player ID
function generatePlayerId() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Auth middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Access denied' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// ========== AUTH ROUTES ==========

// Login
router.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await db.collection('users').findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate session token to prevent multiple logins
    const sessionToken = `${Date.now()}-${Math.random().toString(36)}`;
    
    const token = jwt.sign(
      { userId: user._id, sessionToken },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    );
    
    // Update user with new session token (invalidates other sessions)
    await db.collection('users').updateOne(
      { _id: user._id },
      { 
        $set: { 
          lastActive: new Date(), 
          status: 'online',
          activeSessionToken: sessionToken
        }
      }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        playerId: user.playerId,
        isAdmin: user.isAdmin || false
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Register
router.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user exists
    const existingUser = await db.collection('users').findOne({
      $or: [{ username }, { email }]
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Generate unique player ID
    let playerId;
    let isUnique = false;
    while (!isUnique) {
      playerId = generatePlayerId();
      const existing = await db.collection('users').findOne({ playerId });
      if (!existing) isUnique = true;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const newUser = {
      playerId,
      username,
      email,
      password: hashedPassword,
      avatar: null,
      profileImage: null,
      gender: 'male',
      isAdmin: false,
      coins: 0,
      goldCoins: 10000, // Welcome bonus
      pearls: 1, // Welcome bonus (1 pearl = $1)
      level: 1,
      experience: 0,
      joinedAt: new Date(),
      lastActive: new Date(),
      status: 'online'
    };
    
    const result = await db.collection('users').insertOne(newUser);
    
    // Create welcome transaction
    await db.collection('transactions').insertOne({
      userId: result.insertedId,
      transactionType: 'welcome_bonus',
      goldAmount: 10000,
      pearlsAmount: 1,
      description: 'Welcome to INFINITY BOX! Enjoy your bonus.',
      createdAt: new Date()
    });
    
    const token = jwt.sign(
      { userId: result.insertedId },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    );
    
    res.status(201).json({
      token,
      user: {
        id: result.insertedId,
        username,
        playerId,
        isAdmin: false
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/api/user', auth, async (req, res) => {
  try {
    const user = await db.collection('users').findOne(
      { _id: req.user._id },
      { projection: { password: 0 } }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== FRIENDS ROUTES ==========

// Send friend request
router.post('/api/friends/request', auth, async (req, res) => {
  try {
    const { friendPlayerId } = req.body;
    
    const friend = await db.collection('users').findOne({ playerId: friendPlayerId });
    if (!friend) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (friend._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot add yourself' });
    }
    
    // Check if friendship already exists
    const existing = await db.collection('friendships').findOne({
      $or: [
        { userId: req.user._id, friendId: friend._id },
        { userId: friend._id, friendId: req.user._id }
      ]
    });
    
    if (existing) {
      return res.status(400).json({ message: 'Friend request already exists' });
    }
    
    const friendship = {
      userId: req.user._id,
      friendId: friend._id,
      status: 'pending',
      createdAt: new Date()
    };
    
    await db.collection('friendships').insertOne(friendship);
    res.json({ message: 'Friend request sent' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept friend request
router.post('/api/friends/accept/:id', auth, async (req, res) => {
  try {
    const friendshipId = req.params.id;
    
    const result = await db.collection('friendships').updateOne(
      { 
        _id: new ObjectId(friendshipId),
        friendId: req.user._id,
        status: 'pending'
      },
      { 
        $set: { 
          status: 'accepted',
          acceptedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Friend request not found' });
    }
    
    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get friends
router.get('/api/friends', auth, async (req, res) => {
  try {
    const friendships = await db.collection('friendships').aggregate([
      {
        $match: {
          $or: [
            { userId: req.user._id, status: 'accepted' },
            { friendId: req.user._id, status: 'accepted' }
          ]
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'friendId',
          foreignField: '_id',
          as: 'friendInfo'
        }
      }
    ]).toArray();
    
    const friends = friendships.map(friendship => {
      const friend = friendship.userId.toString() === req.user._id.toString() 
        ? friendship.friendInfo[0] 
        : friendship.userInfo[0];
      
      return {
        id: friend._id,
        playerId: friend.playerId,
        username: friend.username,
        avatar: friend.avatar,
        level: friend.level,
        status: friend.status,
        lastActive: friend.lastActive
      };
    });
    
    res.json(friends);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get friend requests
router.get('/api/friends/requests', auth, async (req, res) => {
  try {
    const requests = await db.collection('friendships').aggregate([
      {
        $match: {
          friendId: req.user._id,
          status: 'pending'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userInfo'
        }
      }
    ]).toArray();
    
    const friendRequests = requests.map(request => ({
      id: request._id,
      user: {
        id: request.userInfo[0]._id,
        playerId: request.userInfo[0].playerId,
        username: request.userInfo[0].username,
        avatar: request.userInfo[0].avatar,
        level: request.userInfo[0].level
      },
      createdAt: request.createdAt
    }));
    
    res.json(friendRequests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== GIFTS ROUTES ==========

// Send gift
router.post('/api/gifts/send', auth, async (req, res) => {
  try {
    const { toUserId, giftType, amount, message } = req.body;
    
    const recipient = await db.collection('users').findOne({ _id: new ObjectId(toUserId) });
    if (!recipient) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if users are friends
    const friendship = await db.collection('friendships').findOne({
      $or: [
        { userId: req.user._id, friendId: new ObjectId(toUserId), status: 'accepted' },
        { userId: new ObjectId(toUserId), friendId: req.user._id, status: 'accepted' }
      ]
    });
    
    if (!friendship) {
      return res.status(400).json({ message: 'Can only send gifts to friends' });
    }
    
    // Check if sender has enough currency
    if (giftType === 'gold' && req.user.goldCoins < amount) {
      return res.status(400).json({ message: 'Insufficient gold coins' });
    }
    
    if (giftType === 'pearls' && req.user.pearls < amount) {
      return res.status(400).json({ message: 'Insufficient pearls' });
    }
    
    // Deduct from sender
    const updateQuery = {};
    if (giftType === 'gold') {
      updateQuery.goldCoins = req.user.goldCoins - amount;
    } else if (giftType === 'pearls') {
      updateQuery.pearls = req.user.pearls - amount;
    }
    
    await db.collection('users').updateOne(
      { _id: req.user._id },
      { $set: updateQuery }
    );
    
    // Create gift
    const gift = {
      fromUserId: req.user._id,
      toUserId: new ObjectId(toUserId),
      giftType,
      amount,
      message: message || '',
      status: 'pending',
      sentAt: new Date()
    };
    
    await db.collection('gifts').insertOne(gift);
    
    // Record transaction for sender
    await db.collection('transactions').insertOne({
      userId: req.user._id,
      transactionType: 'gift_sent',
      goldAmount: giftType === 'gold' ? -amount : 0,
      pearlsAmount: giftType === 'pearls' ? -amount : 0,
      description: `Gift sent to ${recipient.username}`,
      createdAt: new Date()
    });
    
    res.json({ message: 'Gift sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user gifts
router.get('/api/gifts', auth, async (req, res) => {
  try {
    const gifts = await db.collection('gifts').aggregate([
      {
        $match: {
          $or: [
            { fromUserId: req.user._id },
            { toUserId: req.user._id }
          ]
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'fromUserId',
          foreignField: '_id',
          as: 'fromUser'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'toUserId',
          foreignField: '_id',
          as: 'toUser'
        }
      },
      {
        $sort: { sentAt: -1 }
      }
    ]).toArray();
    
    res.json(gifts.map(gift => ({
      id: gift._id,
      fromUser: {
        id: gift.fromUser[0]._id,
        username: gift.fromUser[0].username,
        playerId: gift.fromUser[0].playerId
      },
      toUser: {
        id: gift.toUser[0]._id,
        username: gift.toUser[0].username,
        playerId: gift.toUser[0].playerId
      },
      giftType: gift.giftType,
      amount: gift.amount,
      message: gift.message,
      status: gift.status,
      sentAt: gift.sentAt,
      claimedAt: gift.claimedAt
    })));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Claim gift
router.post('/api/gifts/claim/:id', auth, async (req, res) => {
  try {
    const giftId = req.params.id;
    
    const gift = await db.collection('gifts').findOne({
      _id: new ObjectId(giftId),
      toUserId: req.user._id,
      status: 'pending'
    });
    
    if (!gift) {
      return res.status(404).json({ message: 'Gift not found' });
    }
    
    // Add to recipient's balance
    const updateQuery = {};
    if (gift.giftType === 'gold') {
      updateQuery.goldCoins = req.user.goldCoins + gift.amount;
    } else if (gift.giftType === 'pearls') {
      updateQuery.pearls = req.user.pearls + gift.amount;
    }
    
    await db.collection('users').updateOne(
      { _id: req.user._id },
      { $set: updateQuery }
    );
    
    // Mark gift as claimed
    await db.collection('gifts').updateOne(
      { _id: new ObjectId(giftId) },
      { 
        $set: { 
          status: 'claimed',
          claimedAt: new Date()
        }
      }
    );
    
    // Record transaction for recipient
    await db.collection('transactions').insertOne({
      userId: req.user._id,
      transactionType: 'gift_received',
      goldAmount: gift.giftType === 'gold' ? gift.amount : 0,
      pearlsAmount: gift.giftType === 'pearls' ? gift.amount : 0,
      description: `Gift received from sender`,
      createdAt: new Date()
    });
    
    res.json({ message: 'Gift claimed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;