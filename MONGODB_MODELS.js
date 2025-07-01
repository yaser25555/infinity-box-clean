// MongoDB Models للباكند على Render
// هذه الملفات تحتاج رفعها للباكند على Render

// User Model - نموذج المستخدم المحدث
const userSchema = {
  _id: ObjectId,
  playerId: String, // 6 أرقام فريدة
  username: String,
  password: String,
  email: String,
  avatar: String,
  profileImage: String, // رابط الصورة الشخصية
  gender: String, // male, female
  isAdmin: Boolean,
  coins: Number,
  goldCoins: Number, // العملة الذهبية
  pearls: Number, // الأصداف
  level: Number,
  experience: Number,
  joinedAt: Date,
  lastActive: Date,
  status: String // online, offline, away
};

// Game Scores - نتائج الألعاب
const gameScoreSchema = {
  _id: ObjectId,
  userId: ObjectId,
  gameName: String,
  score: Number,
  level: Number,
  playedAt: Date
};

// Friendships - نظام الأصدقاء
const friendshipSchema = {
  _id: ObjectId,
  userId: ObjectId,
  friendId: ObjectId,
  status: String, // pending, accepted, blocked
  createdAt: Date,
  acceptedAt: Date
};

// Gifts - نظام الهدايا
const giftSchema = {
  _id: ObjectId,
  fromUserId: ObjectId,
  toUserId: ObjectId,
  giftType: String, // gold, pearls, bomb, gem, star, coin
  amount: Number,
  message: String,
  status: String, // pending, claimed, expired
  sentAt: Date,
  claimedAt: Date
};

// Private Messages - الرسائل الخاصة
const privateMessageSchema = {
  _id: ObjectId,
  fromUserId: ObjectId,
  toUserId: ObjectId,
  message: String,
  isRead: Boolean,
  sentAt: Date
};

// User Items - عناصر المستخدمين
const userItemSchema = {
  _id: ObjectId,
  userId: ObjectId,
  itemType: String, // gem, star, coin, bomb, bat, snake
  itemName: String,
  quantity: Number,
  isActive: Boolean,
  expiresAt: Date,
  obtainedAt: Date
};

// User Shields - دروع المستخدمين
const userShieldSchema = {
  _id: ObjectId,
  userId: ObjectId,
  shieldType: String, // gold, usd
  isActive: Boolean,
  activatedAt: Date,
  expiresAt: Date
};

// Transactions - المعاملات المالية
const transactionSchema = {
  _id: ObjectId,
  userId: ObjectId,
  transactionType: String, // purchase, gift_sent, gift_received, game_reward, shield_purchase
  goldAmount: Number,
  pearlsAmount: Number,
  description: String,
  createdAt: Date
};

module.exports = {
  userSchema,
  gameScoreSchema,
  friendshipSchema,
  giftSchema,
  privateMessageSchema,
  userItemSchema,
  userShieldSchema,
  transactionSchema
};