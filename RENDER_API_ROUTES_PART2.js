// الجزء الثاني من API Routes للباكند على Render
// إضافة هذا للملف الأساسي RENDER_API_ROUTES.js

// ========== MESSAGES ROUTES ==========

// Send message
router.post('/api/messages/send', auth, async (req, res) => {
  try {
    const { toUserId, message } = req.body;
    
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
      return res.status(400).json({ message: 'Can only message friends' });
    }
    
    const newMessage = {
      fromUserId: req.user._id,
      toUserId: new ObjectId(toUserId),
      message,
      isRead: false,
      sentAt: new Date()
    };
    
    await db.collection('privateMessages').insertOne(newMessage);
    res.json({ message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages with a friend
router.get('/api/messages/:userId', auth, async (req, res) => {
  try {
    const otherUserId = new ObjectId(req.params.userId);
    
    const messages = await db.collection('privateMessages').aggregate([
      {
        $match: {
          $or: [
            { fromUserId: req.user._id, toUserId: otherUserId },
            { fromUserId: otherUserId, toUserId: req.user._id }
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
        $sort: { sentAt: 1 }
      }
    ]).toArray();
    
    res.json(messages.map(msg => ({
      id: msg._id,
      fromUser: {
        id: msg.fromUser[0]._id,
        username: msg.fromUser[0].username,
        avatar: msg.fromUser[0].avatar
      },
      message: msg.message,
      isRead: msg.isRead,
      sentAt: msg.sentAt,
      isFromCurrentUser: msg.fromUserId.toString() === req.user._id.toString()
    })));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark message as read
router.put('/api/messages/:id/read', auth, async (req, res) => {
  try {
    await db.collection('privateMessages').updateOne(
      { 
        _id: new ObjectId(req.params.id),
        toUserId: req.user._id
      },
      { $set: { isRead: true } }
    );
    
    res.json({ message: 'Message marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== ITEMS ROUTES ==========

// Get user items
router.get('/api/items', auth, async (req, res) => {
  try {
    const items = await db.collection('userItems').find({
      userId: req.user._id
    }).toArray();
    
    // Group items by type and count quantities
    const itemCounts = {
      gem: 0,
      star: 0,
      coin: 0,
      bomb: 0,
      bat: 0,
      snake: 0
    };
    
    items.forEach(item => {
      if (itemCounts.hasOwnProperty(item.itemType)) {
        itemCounts[item.itemType] += item.quantity || 1;
      }
    });
    
    res.json({
      items,
      itemCounts
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add item to user (from game rewards)
router.post('/api/items/add', auth, async (req, res) => {
  try {
    const { itemType, itemName, quantity = 1 } = req.body;
    
    // Check if item already exists
    const existingItem = await db.collection('userItems').findOne({
      userId: req.user._id,
      itemType,
      itemName
    });
    
    if (existingItem) {
      // Update quantity
      await db.collection('userItems').updateOne(
        { _id: existingItem._id },
        { $inc: { quantity: quantity } }
      );
    } else {
      // Create new item
      await db.collection('userItems').insertOne({
        userId: req.user._id,
        itemType,
        itemName,
        quantity,
        isActive: false,
        obtainedAt: new Date()
      });
    }
    
    res.json({ message: 'Item added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== SHIELDS ROUTES ==========

// Activate shield
router.post('/api/shields/activate', auth, async (req, res) => {
  try {
    const { shieldType } = req.body; // 'gold' or 'usd'
    
    // Check if user already has an active shield
    const existingShield = await db.collection('userShields').findOne({
      userId: req.user._id,
      isActive: true,
      expiresAt: { $gt: new Date() }
    });
    
    if (existingShield) {
      return res.status(400).json({ message: 'Shield already active' });
    }
    
    let cost = 0;
    let duration = 0;
    let costType = '';
    
    if (shieldType === 'gold') {
      cost = 2000;
      duration = 24 * 60 * 60 * 1000; // 24 hours
      costType = 'goldCoins';
      
      if (req.user.goldCoins < cost) {
        return res.status(400).json({ message: 'Insufficient gold coins' });
      }
    } else if (shieldType === 'usd') {
      cost = 20000;
      duration = 7 * 24 * 60 * 60 * 1000; // 7 days
      costType = 'goldCoins';
      
      if (req.user.goldCoins < cost) {
        return res.status(400).json({ message: 'Insufficient gold coins' });
      }
    } else {
      return res.status(400).json({ message: 'Invalid shield type' });
    }
    
    // Deduct cost
    await db.collection('users').updateOne(
      { _id: req.user._id },
      { $inc: { [costType]: -cost } }
    );
    
    // Create shield
    const expiresAt = new Date(Date.now() + duration);
    await db.collection('userShields').insertOne({
      userId: req.user._id,
      shieldType,
      isActive: true,
      activatedAt: new Date(),
      expiresAt
    });
    
    // Record transaction
    await db.collection('transactions').insertOne({
      userId: req.user._id,
      transactionType: 'shield_purchase',
      goldAmount: -cost,
      pearlsAmount: 0,
      description: `${shieldType} shield activated`,
      createdAt: new Date()
    });
    
    res.json({ 
      message: 'Shield activated successfully',
      expiresAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get shield status
router.get('/api/shields/status', auth, async (req, res) => {
  try {
    const shield = await db.collection('userShields').findOne({
      userId: req.user._id,
      isActive: true,
      expiresAt: { $gt: new Date() }
    });
    
    res.json({
      hasActiveShield: !!shield,
      shield: shield || null
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== TRANSACTIONS ROUTES ==========

// Get user transactions
router.get('/api/transactions', auth, async (req, res) => {
  try {
    const transactions = await db.collection('transactions').find({
      userId: req.user._id
    }).sort({ createdAt: -1 }).limit(50).toArray();
    
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add transaction (for game rewards, etc.)
router.post('/api/transactions', auth, async (req, res) => {
  try {
    const { transactionType, goldAmount = 0, pearlsAmount = 0, description } = req.body;
    
    const transaction = {
      userId: req.user._id,
      transactionType,
      goldAmount,
      pearlsAmount,
      description,
      createdAt: new Date()
    };
    
    await db.collection('transactions').insertOne(transaction);
    res.json({ message: 'Transaction recorded' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== CURRENCY ROUTES ==========

// Update user currency (for game rewards)
router.post('/api/currency/update', auth, async (req, res) => {
  try {
    const { goldDelta = 0, pearlsDelta = 0, levelIncrease = 0 } = req.body;
    
    const updateQuery = {};
    if (goldDelta !== 0) {
      updateQuery.goldCoins = req.user.goldCoins + goldDelta;
    }
    if (pearlsDelta !== 0) {
      updateQuery.pearls = req.user.pearls + pearlsDelta;
    }
    if (levelIncrease > 0) {
      updateQuery.level = req.user.level + levelIncrease;
    }
    
    const result = await db.collection('users').updateOne(
      { _id: req.user._id },
      { $set: updateQuery }
    );
    
    // Record transaction if currency changed
    if (goldDelta !== 0 || pearlsDelta !== 0) {
      await db.collection('transactions').insertOne({
        userId: req.user._id,
        transactionType: 'game_reward',
        goldAmount: goldDelta,
        pearlsAmount: pearlsDelta,
        description: 'Game reward',
        createdAt: new Date()
      });
    }
    
    res.json({ message: 'Currency updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Exchange pearls to USD (simulation)
router.post('/api/currency/exchange', auth, async (req, res) => {
  try {
    const { pearlsAmount } = req.body;
    
    if (req.user.pearls < pearlsAmount) {
      return res.status(400).json({ message: 'Insufficient pearls' });
    }
    
    const usdAmount = pearlsAmount / 10; // 10 pearls = 1 USD
    
    if (usdAmount < 25) {
      return res.status(400).json({ message: 'Minimum withdrawal is $25 USD' });
    }
    
    // Deduct pearls
    await db.collection('users').updateOne(
      { _id: req.user._id },
      { $inc: { pearls: -pearlsAmount } }
    );
    
    // Record transaction
    await db.collection('transactions').insertOne({
      userId: req.user._id,
      transactionType: 'usd_withdrawal',
      goldAmount: 0,
      pearlsAmount: -pearlsAmount,
      description: `USD withdrawal: $${usdAmount}`,
      createdAt: new Date()
    });
    
    res.json({ 
      message: 'Exchange processed successfully',
      usdAmount,
      whatsappMessage: `USD withdrawal request: $${usdAmount} for player ${req.user.playerId}`
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== GAME ROUTES ==========

// Save game score
router.post('/api/games/score', auth, async (req, res) => {
  try {
    const { gameName, score, level = 1 } = req.body;
    
    await db.collection('gameScores').insertOne({
      userId: req.user._id,
      gameName,
      score,
      level,
      playedAt: new Date()
    });
    
    res.json({ message: 'Score saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's best scores
router.get('/api/games/scores', auth, async (req, res) => {
  try {
    const scores = await db.collection('gameScores').aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$gameName',
          bestScore: { $max: '$score' },
          totalPlays: { $sum: 1 },
          lastPlayed: { $max: '$playedAt' }
        }
      }
    ]).toArray();
    
    res.json(scores);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== ADMIN ROUTES ==========

// Get all users (admin only)
router.get('/api/admin/users', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const users = await db.collection('users').find(
      {},
      { projection: { password: 0 } }
    ).toArray();
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user (admin only)
router.put('/api/admin/users/:id', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const userId = req.params.id;
    const updates = req.body;
    
    // Remove sensitive fields
    delete updates.password;
    delete updates._id;
    
    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: updates }
    );
    
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;