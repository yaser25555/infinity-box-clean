import React, { useState, useEffect } from 'react';
import { 
  User, 
  Users, 
  Gift, 
  MessageCircle, 
  Shield, 
  CreditCard, 
  TrendingUp,
  Star,
  Crown,
  Zap,
  Send,
  Check,
  X,
  Plus,
  ArrowLeftRight
} from 'lucide-react';

interface UserProfileProps {
  userData: any;
}

const UserProfileSimple: React.FC<UserProfileProps> = ({ userData }) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'friends' | 'gifts' | 'items' | 'charge' | 'exchange' | 'shield'>('overview');
  const [friends, setFriends] = useState<any[]>([]);
  const [gifts, setGifts] = useState<any[]>([]);
  const [userItems, setUserItems] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friendId, setFriendId] = useState('');
  const [giftAmount, setGiftAmount] = useState(100);
  const [chargeAmount, setChargeAmount] = useState(1000);
  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  const [showGiftDialog, setShowGiftDialog] = useState(false);
  const [exchangeAmount, setExchangeAmount] = useState(10000);
  const [exchangeDirection, setExchangeDirection] = useState<'goldToPearl' | 'pearlToGold' | 'pearlToUSD'>('goldToPearl');
  const [usdAmount, setUsdAmount] = useState(1);
  const [userShield, setUserShield] = useState<any>(null);
  const [isShieldLoading, setIsShieldLoading] = useState(false);

  // محاكاة بيانات تجريبية للعرض
  useEffect(() => {
    // بيانات الأصدقاء التجريبية
    setFriends([
      { id: 2, username: 'أحمد_اللاعب', playerId: '123456', level: 15, status: 'online' },
      { id: 3, username: 'فاطمة_المحترفة', playerId: '789012', level: 22, status: 'offline' }
    ]);

    // بيانات الهدايا التجريبية
    setGifts([
      { id: 1, fromUserId: 2, giftType: 'gold', amount: 500, message: 'تهانينا على فوزك!', sentAt: new Date().toISOString() },
      { id: 2, fromUserId: 3, giftType: 'pearls', amount: 5, message: 'هدية صداقة', sentAt: new Date().toISOString() }
    ]);

    // بيانات العناصر التجريبية
    setUserItems([
      { id: 1, itemType: 'shield', itemName: 'درع الحماية الذهبي', quantity: 1, isActive: true, expiresAt: null },
      { id: 2, itemType: 'energy_boost', itemName: 'معزز الطاقة', quantity: 3, isActive: false, expiresAt: '2024-12-31' },
      { id: 3, itemType: 'score_multiplier', itemName: 'مضاعف النقاط', quantity: 2, isActive: false, expiresAt: '2024-12-15' }
    ]);

    // بيانات المعاملات التجريبية
    setTransactions([
      { id: 1, transactionType: 'purchase', goldAmount: 1000, pearlsAmount: 0, description: 'شحن رصيد', createdAt: new Date().toISOString() },
      { id: 2, transactionType: 'gift_received', goldAmount: 500, pearlsAmount: 0, description: 'هدية من أحمد_اللاعب', createdAt: new Date().toISOString() },
      { id: 3, transactionType: 'game_reward', goldAmount: 150, pearlsAmount: 2, description: 'مكافأة لعبة قطف الفواكه', createdAt: new Date().toISOString() }
    ]);
  }, []);

  const handleSendGift = (friendId: number, type: 'gold' | 'pearls') => {
    const amount = type === 'gold' ? giftAmount : Math.floor(giftAmount / 100);
    // محاكاة إرسال الهدية
    alert(`تم إرسال ${amount} ${type === 'gold' ? 'ذهب' : 'لؤلؤ'} بنجاح!`);
    setShowGiftDialog(false);
    setSelectedFriend(null);
  };

  const handleClaimGift = (giftId: number) => {
    // محاكاة استلام الهدية
    setGifts(gifts.filter(g => g.id !== giftId));
    alert('تم استلام الهدية بنجاح!');
  };

  const handleActivateItem = (itemId: number) => {
    // محاكاة تفعيل العنصر
    setUserItems(items => items.map(item => ({
      ...item,
      isActive: item.id === itemId ? true : (item.itemType === userItems.find(i => i.id === itemId)?.itemType ? false : item.isActive)
    })));
    alert('تم تفعيل العنصر بنجاح!');
  };

  const handleChargeBalance = (amount: number, usdPrice?: number) => {
    if (usdPrice) {
      // شحن بالدولار - التحويل للواتساب
      const whatsappMessage = `مرحباً، أريد شحن رصيد في INFINITY BOX
معرف اللاعب: ${userData?.playerId}
اسم المستخدم: ${userData?.username}
المبلغ المطلوب: ${amount} ذهب
السعر: ${usdPrice} دولار أمريكي`;
      
      const whatsappUrl = `https://wa.me/+972123456789?text=${encodeURIComponent(whatsappMessage)}`;
      window.open(whatsappUrl, '_blank');
    } else {
      // شحن عادي
      alert(`تم شحن ${amount} ذهب بنجاح!`);
    }
  };

  const handleExchange = () => {
    if (exchangeDirection === 'goldToPearl') {
      const requiredGold = exchangeAmount;
      const pearlsToGet = Math.floor(requiredGold / 10000);
      if (userData?.goldCoins >= requiredGold) {
        alert(`تم تبديل ${requiredGold} ذهب إلى ${pearlsToGet} لؤلؤ بنجاح!`);
      } else {
        alert('لا يوجد رصيد ذهب كافي!');
      }
    } else if (exchangeDirection === 'pearlToGold') {
      const requiredPearls = Math.ceil(exchangeAmount / 10000);
      const goldToGet = requiredPearls * 10000;
      if (userData?.pearls >= requiredPearls) {
        alert(`تم تبديل ${requiredPearls} لؤلؤ إلى ${goldToGet} ذهب بنجاح!`);
      } else {
        alert('لا يوجد رصيد لؤلؤ كافي!');
      }
    } else if (exchangeDirection === 'pearlToUSD') {
      const requiredPearls = usdAmount * 10;
      const currentUsdValue = Math.floor((userData?.pearls || 0) / 10);
      
      if (currentUsdValue < 25) {
        alert('يجب أن يكون لديك 25 دولار على الأقل (250 لؤلؤة) للسحب!');
        return;
      }
      
      if (usdAmount < 25) {
        alert('الحد الأدنى للسحب هو 25 دولار!');
        return;
      }
      
      if (userData?.pearls >= requiredPearls) {
        const whatsappMessage = `مرحباً، أريد سحب ${usdAmount} دولار من رصيد اللؤلؤ الخاص بي في INFINITY BOX
معرف اللاعب: ${userData?.playerId}
اسم المستخدم: ${userData?.username}
المبلغ المطلوب: ${usdAmount} دولار (${requiredPearls} لؤلؤة)`;
        
        const whatsappUrl = `https://wa.me/+972123456789?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(whatsappUrl, '_blank');
      } else {
        alert('لا يوجد رصيد لؤلؤ كافي!');
      }
    }
  };

  const handleActivateShield = async (shieldType: 'gold' | 'usd') => {
    setIsShieldLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/profile/activate-shield', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ shieldType })
      });

      const data = await response.json();
      
      if (response.ok) {
        setUserShield(data.shield);
        alert(data.message);
      } else {
        alert(data.message || 'فشل في تفعيل الدرع الواقي');
      }
    } catch (error) {
      console.error('Error activating shield:', error);
      alert('حدث خطأ في تفعيل الدرع الواقي');
    } finally {
      setIsShieldLoading(false);
    }
  };

  const fetchUserShield = async () => {
    try {
      const response = await fetch(`/api/profile/shield/${userData?.id}`);
      const data = await response.json();
      setUserShield(data.shield);
    } catch (error) {
      console.error('Error fetching shield:', error);
    }
  };

  // تحديث حالة الدرع عند تحميل الصفحة
  useEffect(() => {
    if (userData?.id && activeSection === 'shield') {
      fetchUserShield();
    }
  }, [userData?.id, activeSection]);

  const getItemIcon = (itemType: string) => {
    switch (itemType) {
      case 'shield': return <Shield className="w-4 h-4" />;
      case 'energy_boost': return <Zap className="w-4 h-4" />;
      case 'score_multiplier': return <TrendingUp className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getItemColor = (itemType: string) => {
    switch (itemType) {
      case 'shield': return 'bg-blue-500';
      case 'energy_boost': return 'bg-yellow-500';
      case 'score_multiplier': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* بطاقة البروفايل الرئيسية */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg p-6 mb-6">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
            <User className="w-10 h-10" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{userData?.username || 'اللاعب'}</h1>
            <p className="text-purple-100">رقم اللاعب: {userData?.playerId || '000000'}</p>
            <div className="flex items-center space-x-4 rtl:space-x-reverse mt-2">
              <span className="bg-white/20 px-3 py-1 rounded-full flex items-center">
                <Crown className="w-3 h-3 mr-1" />
                المستوى {userData?.level || 1}
              </span>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <span className="text-yellow-300">🪙 {userData?.goldCoins || 0}</span>
                <span className="text-blue-300">🦪 {userData?.pearls || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* شريط التنقل */}
      <div className="flex space-x-1 rtl:space-x-reverse mb-6 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'overview', label: 'نظرة عامة', icon: User },
          { id: 'friends', label: 'الأصدقاء', icon: Users },
          { id: 'gifts', label: 'الهدايا', icon: Gift },
          { id: 'items', label: 'العناصر', icon: Star },
          { id: 'shield', label: 'الدرع الواقي', icon: Shield },
          { id: 'charge', label: 'الشحن', icon: CreditCard },
          { id: 'exchange', label: 'التبديل', icon: ArrowLeftRight }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as any)}
            className={`flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-md transition-colors ${
              activeSection === tab.id
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* المحتوى */}
      <div className="space-y-6">
        {activeSection === 'overview' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                الأصدقاء
              </h3>
              <p className="text-3xl font-bold text-blue-600">{friends.length}</p>
              <p className="text-gray-500">صديق</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Gift className="w-5 h-5 mr-2" />
                الهدايا
              </h3>
              <p className="text-3xl font-bold text-green-600">{gifts.length}</p>
              <p className="text-gray-500">هدية في الانتظار</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                العناصر
              </h3>
              <p className="text-3xl font-bold text-purple-600">{userItems.length}</p>
              <p className="text-gray-500">عنصر متاح</p>
            </div>

            <div className="md:col-span-2 lg:col-span-3 bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                آخر المعاملات
              </h3>
              <div className="space-y-3">
                {transactions.slice(0, 3).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString('ar')}
                      </p>
                    </div>
                    <div className="text-right">
                      {transaction.goldAmount !== 0 && (
                        <p className={transaction.goldAmount > 0 ? 'text-green-600' : 'text-red-600'}>
                          {transaction.goldAmount > 0 ? '+' : ''}{transaction.goldAmount} 🪙
                        </p>
                      )}
                      {transaction.pearlsAmount !== 0 && (
                        <p className={transaction.pearlsAmount > 0 ? 'text-green-600' : 'text-red-600'}>
                          {transaction.pearlsAmount > 0 ? '+' : ''}{transaction.pearlsAmount} 🦪
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'friends' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">أصدقائي ({friends.length})</h3>
                <button 
                  onClick={() => setShowAddFriend(!showAddFriend)}
                  className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  إضافة صديق
                </button>
              </div>
              
              {showAddFriend && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="text"
                    placeholder="رقم اللاعب أو اسم المستخدم"
                    value={friendId}
                    onChange={(e) => setFriendId(e.target.value)}
                    className="w-full p-2 border rounded-md mb-2"
                  />
                  <button 
                    onClick={() => {
                      alert('تم إرسال طلب الصداقة!');
                      setFriendId('');
                      setShowAddFriend(false);
                    }}
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                  >
                    إرسال طلب
                  </button>
                </div>
              )}

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {friends.map((friend) => (
                  <div key={friend.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {friend.username[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{friend.username}</p>
                        <p className="text-sm text-gray-500">#{friend.playerId}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          friend.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {friend.status === 'online' ? 'متصل' : 'غير متصل'}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      <button 
                        onClick={() => {
                          setSelectedFriend(friend);
                          setShowGiftDialog(true);
                        }}
                        className="bg-yellow-500 text-white p-2 rounded-md hover:bg-yellow-600"
                      >
                        <Gift className="w-4 h-4" />
                      </button>
                      <button className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600">
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">طلبات الصداقة</h3>
              <div className="space-y-3">
                {friendRequests.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">لا توجد طلبات صداقة</p>
                ) : (
                  friendRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{request.username}</p>
                        <p className="text-sm text-gray-500">#{request.playerId}</p>
                      </div>
                      <div className="flex space-x-2 rtl:space-x-reverse">
                        <button className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600">
                          <Check className="w-4 h-4" />
                        </button>
                        <button className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'gifts' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">الهدايا المستلمة</h3>
            <div className="space-y-3">
              {gifts.map((gift) => (
                <div key={gift.id} className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Gift className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {gift.giftType === 'gold' ? '🪙' : '🦪'} {gift.amount} 
                        {gift.giftType === 'gold' ? ' ذهب' : ' لؤلؤ'}
                      </p>
                      {gift.message && (
                        <p className="text-sm text-gray-600">"{gift.message}"</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {new Date(gift.sentAt).toLocaleDateString('ar')}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleClaimGift(gift.id)}
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-4 py-2 rounded-md"
                  >
                    استلام
                  </button>
                </div>
              ))}
              {gifts.length === 0 && (
                <p className="text-center text-gray-500 py-8">لا توجد هدايا</p>
              )}
            </div>
          </div>
        )}

        {activeSection === 'items' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">عناصري ودروعي</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userItems.map((item) => (
                <div 
                  key={item.id} 
                  className={`p-4 border rounded-lg ${item.isActive ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getItemColor(item.itemType)}`}>
                      {getItemIcon(item.itemType)}
                    </div>
                    {item.isActive && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">فعال</span>
                    )}
                  </div>
                  <h4 className="font-medium">{item.itemName}</h4>
                  <p className="text-sm text-gray-600">الكمية: {item.quantity}</p>
                  {item.expiresAt && (
                    <p className="text-xs text-red-500">
                      ينتهي: {new Date(item.expiresAt).toLocaleDateString('ar')}
                    </p>
                  )}
                  {!item.isActive && (
                    <button 
                      onClick={() => handleActivateItem(item.id)}
                      className="w-full mt-2 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
                    >
                      تفعيل
                    </button>
                  )}
                </div>
              ))}
              {userItems.length === 0 && (
                <div className="col-span-full text-center text-gray-500 py-8">
                  لا توجد عناصر
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'charge' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">شحن الرصيد</h3>
            <p className="text-gray-600 mb-6">اختر مبلغ الشحن وسيتم توجيهك للواتساب لإتمام عملية الدفع</p>
            
            <div className="grid md:grid-cols-3 gap-4">
              {/* خيار 1: 5000 ذهب = 1 دولار */}
              <div className="border-2 border-green-200 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                <div className="text-3xl mb-3">🪙</div>
                <div className="text-2xl font-bold text-gray-800 mb-2">5,000</div>
                <div className="text-sm text-gray-600 mb-3">ذهب</div>
                <div className="text-lg font-semibold text-green-600 mb-4">$1 USD</div>
                <button
                  onClick={() => handleChargeBalance(5000, 1)}
                  className="w-full bg-green-500 text-white py-3 rounded-md hover:bg-green-600 flex items-center justify-center"
                >
                  <CreditCard className="w-4 h-4 ml-2" />
                  شحن الآن
                </button>
              </div>

              {/* خيار 2: 27200 ذهب = 5 دولار */}
              <div className="border-2 border-blue-200 rounded-lg p-6 text-center hover:border-blue-400 transition-colors bg-blue-50">
                <div className="text-3xl mb-3">🪙</div>
                <div className="text-2xl font-bold text-gray-800 mb-2">27,200</div>
                <div className="text-sm text-gray-600 mb-3">ذهب</div>
                <div className="text-lg font-semibold text-blue-600 mb-4">$5 USD</div>
                <div className="text-xs text-green-600 mb-2">توفير 8%!</div>
                <button
                  onClick={() => handleChargeBalance(27200, 5)}
                  className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 flex items-center justify-center"
                >
                  <CreditCard className="w-4 h-4 ml-2" />
                  شحن الآن
                </button>
              </div>

              {/* خيار 3: 65000 ذهب = 10 دولار */}
              <div className="border-2 border-purple-200 rounded-lg p-6 text-center hover:border-purple-400 transition-colors bg-purple-50">
                <div className="text-3xl mb-3">🪙</div>
                <div className="text-2xl font-bold text-gray-800 mb-2">65,000</div>
                <div className="text-sm text-gray-600 mb-3">ذهب</div>
                <div className="text-lg font-semibold text-purple-600 mb-4">$10 USD</div>
                <div className="text-xs text-green-600 mb-2">توفير 30%!</div>
                <button
                  onClick={() => handleChargeBalance(65000, 10)}
                  className="w-full bg-purple-500 text-white py-3 rounded-md hover:bg-purple-600 flex items-center justify-center"
                >
                  <CreditCard className="w-4 h-4 ml-2" />
                  شحن الآن
                </button>
              </div>
            </div>
            
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">كيفية الشحن:</h4>
              <ol className="text-sm text-yellow-700 space-y-1">
                <li>1. اختر مبلغ الشحن المناسب</li>
                <li>2. سيتم توجيهك للواتساب مع تفاصيل الطلب</li>
                <li>3. ستتلقى تعليمات الدفع من فريق الدعم</li>
                <li>4. بعد إتمام الدفع سيتم إضافة الذهب لحسابك</li>
              </ol>
            </div>
          </div>
        )}

        {/* قسم الدرع الواقي - للمالك فقط */}
        {activeSection === 'shield' && userData?.id && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              الدرع الواقي
            </h3>
            
            {/* معلومات الدرع الحالي */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium mb-3">حالة الدرع الحالية</h4>
              {userShield && userShield.isActive ? (
                <div className="flex items-center justify-between bg-green-100 p-3 rounded">
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-green-800">الدرع نشط</span>
                  </div>
                  <div className="text-sm text-green-600">
                    ينتهي في: {new Date(userShield.expiresAt).toLocaleDateString('ar-EG')}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-red-100 p-3 rounded">
                  <div className="flex items-center">
                    <X className="w-5 h-5 text-red-600 mr-2" />
                    <span className="text-red-800">لا يوجد درع نشط</span>
                  </div>
                  <span className="text-sm text-red-600">غير محمي</span>
                </div>
              )}
            </div>

            {/* خيارات تفعيل الدرع */}
            <div className="space-y-4">
              <h4 className="font-medium">تفعيل الدرع الواقي</h4>
              <p className="text-sm text-gray-600 mb-4">
                الدرع الواقي يحميك من الهدايا التي تقطع من رصيدك مثل القنابل والفخاخ
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* درع الذهب */}
                <div className="border rounded-lg p-4 hover:border-yellow-400 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium flex items-center">
                      🪙 درع الذهب
                    </h5>
                    <span className="text-sm text-gray-500">يومي</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-600 mb-2">2,000 ذهب</div>
                  <p className="text-sm text-gray-600 mb-4">حماية لمدة 24 ساعة</p>
                  <button
                    onClick={() => handleActivateShield('gold')}
                    disabled={isShieldLoading || (userData?.goldCoins || 0) < 2000}
                    className="w-full bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isShieldLoading ? 'جاري التفعيل...' : 'تفعيل درع الذهب'}
                  </button>
                  {(userData?.goldCoins || 0) < 2000 && (
                    <p className="text-xs text-red-500 mt-2">رصيد الذهب غير كافي</p>
                  )}
                </div>

                {/* درع الدولار */}
                <div className="border rounded-lg p-4 hover:border-green-400 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium flex items-center">
                      💵 درع الدولار
                    </h5>
                    <span className="text-sm text-gray-500">أسبوعي</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600 mb-2">$1</div>
                  <p className="text-sm text-gray-600 mb-4">حماية لمدة 7 أيام</p>
                  <button
                    onClick={() => handleActivateShield('usd')}
                    disabled={isShieldLoading || (userData?.pearls || 0) < 10}
                    className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isShieldLoading ? 'جاري التفعيل...' : 'تفعيل درع الدولار'}
                  </button>
                  {(userData?.pearls || 0) < 10 && (
                    <p className="text-xs text-red-500 mt-2">رصيد اللؤلؤ غير كافي (يحتاج 10 لؤلؤ)</p>
                  )}
                </div>
              </div>

              {/* فوائد الدرع */}
              <div className="bg-blue-50 rounded-lg p-4 mt-6">
                <h5 className="font-medium text-blue-800 mb-2">فوائد الدرع الواقي:</h5>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• حماية من الهدايا السلبية (القنابل، الفخاخ)</li>
                  <li>• منع خصم الذهب واللؤلؤ من الهدايا الضارة</li>
                  <li>• استمرار اللعب بدون قلق من فقدان الرصيد</li>
                  <li>• حماية أثناء النوم أو عدم التواجد</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* قسم تبديل العملات */}
        {activeSection === 'exchange' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">تبديل العملات</h3>
            
            {/* عرض الرصيد الحالي والقيم بالدولار */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium mb-3">رصيدك الحالي</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between bg-white p-3 rounded">
                  <span>🪙 الذهب</span>
                  <span className="font-bold">{userData?.goldCoins || 0}</span>
                </div>
                <div className="flex items-center justify-between bg-white p-3 rounded">
                  <span>🦪 اللؤلؤ</span>
                  <span className="font-bold">{userData?.pearls || 0}</span>
                </div>
                <div className="flex items-center justify-between bg-green-100 p-3 rounded">
                  <span>💵 قيمة بالدولار</span>
                  <span className="font-bold text-green-600">${Math.floor((userData?.pearls || 0) / 10)}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                معدل التبديل: 10,000 ذهب = 1 لؤلؤ | 10 لؤلؤ = 1 دولار | الحد الأدنى للسحب: 25 دولار
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* تبديل الذهب إلى لؤلؤ */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-4 flex items-center">
                  <ArrowLeftRight className="w-4 h-4 mr-2" />
                  تبديل الذهب إلى لؤلؤ
                </h4>
                <div className="space-y-3">
                  <input
                    type="number"
                    value={exchangeAmount}
                    onChange={(e) => setExchangeAmount(Number(e.target.value))}
                    placeholder="أدخل كمية الذهب"
                    min="10000"
                    step="10000"
                    className="w-full p-3 border rounded-md"
                  />
                  <div className="text-sm text-gray-600">
                    ستحصل على: {Math.floor(exchangeAmount / 10000)} لؤلؤ
                  </div>
                  <button 
                    onClick={() => {
                      setExchangeDirection('goldToPearl');
                      handleExchange();
                    }}
                    disabled={(userData?.goldCoins || 0) < exchangeAmount}
                    className="w-full bg-yellow-500 text-white py-3 rounded-md hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    🪙➜🦪 تبديل الذهب
                  </button>
                </div>
              </div>

              {/* تبديل اللؤلؤ إلى ذهب */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-4 flex items-center">
                  <ArrowLeftRight className="w-4 h-4 mr-2" />
                  تبديل اللؤلؤ إلى ذهب
                </h4>
                <div className="space-y-3">
                  <input
                    type="number"
                    value={Math.ceil(exchangeAmount / 10000)}
                    onChange={(e) => setExchangeAmount(Number(e.target.value) * 10000)}
                    placeholder="أدخل كمية اللؤلؤ"
                    min="1"
                    className="w-full p-3 border rounded-md"
                  />
                  <div className="text-sm text-gray-600">
                    ستحصل على: {Math.ceil(exchangeAmount / 10000) * 10000} ذهب
                  </div>
                  <button 
                    onClick={() => {
                      setExchangeDirection('pearlToGold');
                      handleExchange();
                    }}
                    disabled={(userData?.pearls || 0) < Math.ceil(exchangeAmount / 10000)}
                    className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    🦪➜🪙 تبديل اللؤلؤ
                  </button>
                </div>
              </div>
            </div>

            {/* سحب الدولارات */}
            <div className="mt-6 border-2 border-green-200 rounded-lg p-4 bg-green-50">
              <h4 className="font-medium mb-4 flex items-center text-green-700">
                <CreditCard className="w-4 h-4 mr-2" />
                سحب الدولارات (واتساب)
              </h4>
              <div className="space-y-3">
                <input
                  type="number"
                  value={usdAmount}
                  onChange={(e) => setUsdAmount(Number(e.target.value))}
                  placeholder="أدخل المبلغ بالدولار"
                  min="25"
                  className="w-full p-3 border rounded-md"
                />
                <div className="text-sm text-gray-600">
                  مطلوب: {usdAmount * 10} لؤلؤ | متوفر: {Math.floor((userData?.pearls || 0) / 10)} دولار
                </div>
                <button 
                  onClick={() => {
                    setExchangeDirection('pearlToUSD');
                    handleExchange();
                  }}
                  disabled={Math.floor((userData?.pearls || 0) / 10) < 25 || usdAmount < 25 || (userData?.pearls || 0) < usdAmount * 10}
                  className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  💵 سحب عبر الواتساب
                </button>
                {Math.floor((userData?.pearls || 0) / 10) < 25 && (
                  <p className="text-red-600 text-sm">
                    تحتاج إلى 250 لؤلؤة على الأقل (25 دولار) للسحب
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* حوار إرسال الهدية */}
      {showGiftDialog && selectedFriend && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">إرسال هدية إلى {selectedFriend.username}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">المبلغ</label>
                <input
                  type="number"
                  value={giftAmount}
                  onChange={(e) => setGiftAmount(Number(e.target.value))}
                  min="1"
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => handleSendGift(selectedFriend.id, 'gold')}
                  className="flex items-center justify-center gap-2 p-3 border rounded-md hover:bg-yellow-50"
                >
                  🪙 {giftAmount} ذهب
                </button>
                <button 
                  onClick={() => handleSendGift(selectedFriend.id, 'pearls')}
                  className="flex items-center justify-center gap-2 p-3 border rounded-md hover:bg-blue-50"
                >
                  🦪 {Math.floor(giftAmount / 100)} لؤلؤ
                </button>
              </div>
              <div className="flex space-x-2 rtl:space-x-reverse">
                <button 
                  onClick={() => setShowGiftDialog(false)}
                  className="flex-1 bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileSimple;