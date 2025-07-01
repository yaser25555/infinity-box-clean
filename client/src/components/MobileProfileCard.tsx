import React, { useState, useEffect } from 'react';
import { 
  User, 
  Users, 
  Gift, 
  Star, 
  Shield, 
  CreditCard, 
  ArrowLeftRight,
  Upload,
  Edit,
  X,
  Check,
  Camera,
  MessageCircle,
  UserPlus,
  Send
} from 'lucide-react';

interface MobileProfileCardProps {
  userData: any;
  isOwner: boolean; // هل هذا الملف الشخصي للمستخدم نفسه
  onUpdateProfile?: (updates: any) => void;
}

const MobileProfileCard: React.FC<MobileProfileCardProps> = ({ 
  userData, 
  isOwner, 
  onUpdateProfile 
}) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'friends' | 'gifts' | 'items' | 'charge' | 'exchange'>('overview');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedGender, setSelectedGender] = useState(userData?.gender || 'male');
  const [isUploading, setIsUploading] = useState(false);
  const [itemCounts, setItemCounts] = useState({
    gems: 0,
    stars: 0,
    coins: 0,
    bombs: 0,
    bats: 0,
    snakes: 0
  });
  const [isFriend, setIsFriend] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [messageText, setMessageText] = useState('');

  // ألوان حسب الجنس
  const getThemeColors = (gender: string) => {
    if (gender === 'female') {
      return {
        primary: 'from-pink-500 to-red-400',
        secondary: 'bg-pink-50',
        accent: 'text-pink-600',
        button: 'bg-pink-500 hover:bg-pink-600',
        border: 'border-pink-200'
      };
    } else {
      return {
        primary: 'from-blue-500 to-yellow-400',
        secondary: 'bg-blue-50',
        accent: 'text-blue-600',
        button: 'bg-blue-500 hover:bg-blue-600',
        border: 'border-blue-200'
      };
    }
  };

  const theme = getThemeColors(userData?.gender || 'male');

  // جلب عدد العناصر وفحص حالة الصداقة عند تحميل المكون
  useEffect(() => {
    if (userData?.id) {
      fetchUserItems();
      checkFriendshipStatus();
    }
  }, [userData?.id, isOwner]);

  const fetchUserItems = async () => {
    try {
      const response = await fetch(`/api/user-items/${userData.id}`);
      if (response.ok) {
        const data = await response.json();
        setItemCounts(data.items);
      }
    } catch (error) {
      console.error('Error fetching user items:', error);
    }
  };

  const checkFriendshipStatus = async () => {
    if (!isOwner && userData?.id) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/friends/check/${userData.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setIsFriend(data.isFriend);
        }
      } catch (error) {
        console.error("Error checking friendship:", error);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          toUserId: userData.id,
          message: messageText
        })
      });

      if (response.ok) {
        setMessageText('');
        setShowMessageDialog(false);
        alert('تم إرسال الرسالة بنجاح!');
      } else {
        alert('فشل في إرسال الرسالة');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('خطأ في إرسال الرسالة');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB max
        alert('حجم الصورة كبير جداً. يجب أن يكون أقل من 5 ميجابايت');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = async () => {
    setIsUploading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          profileImage: selectedImage,
          gender: selectedGender
        })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        onUpdateProfile?.(updatedUser);
        setIsEditingProfile(false);
        alert('تم تحديث الملف الشخصي بنجاح!');
      } else {
        alert('فشل في تحديث الملف الشخصي');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('حدث خطأ في تحديث الملف الشخصي');
    } finally {
      setIsUploading(false);
    }
  };

  const getProfileImage = () => {
    if (selectedImage) return selectedImage;
    if (userData?.profileImage) return userData.profileImage;
    // صورة افتراضية حسب الجنس
    return userData?.gender === 'female' 
      ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iNTAiIGZpbGw9IiNGRjY5QjQiLz4KPHN2ZyB4PSIyNSIgeT0iMjUiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0xMiAyQzEzLjEgMiAxNCAyLjkgMTQgNFMxMy4xIDYgMTIgNiAxMCA1LjEgMTAgNFMxMC45IDIgMTIgMlpNMjEgOVYxMUgyMFYxMkMxOS4xIDEyIDE4LjQgMTIuNiAxOC4xIDEzLjNDMTcuMSAxMS45IDE1LjEgMTEgMTMuOCAxMC43QzE0IDEwLjUgMTQuMSAxMC4yIDE0LjEgMTBDMTQgOS4xIDEzLjYgOC40IDEzIDhDMTMuNCA3LjYgMTMuNyA3IDE0IDYuOUMxNS40IDcuNyAxNi4yIDkuMSAxNiAzMEMxOC40IDI5IDEwLjUgMzAgOFMxMS42IDI5IDEwIDI5LjdIMThDMTggMjguNSAxOC4zIDI3LjUgMTguOSAyNi43QzE5LjMgMjcuMSAxOS44IDI3LjMgMjAuNSAyNy4zSDE5QzE5IDI3IDEwLjMgMjcgMTAuNSAyNy4zSDE5LjQgMjEgOVoiLz4KPHN2Zz4KPHN2Zz4K'
      : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iNTAiIGZpbGw9IiMzQjgyRjYiLz4KPHN2ZyB4PSIyNSIgeT0iMjUiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0xMiAyQTMgMyAwIDAgMSAxNSA1QTMgMyAwIDAgMSAxMiA4QTMgMyAwIDAgMSA5IDVBMyAzIDAgMCAxIDEyIDJNMjEgMjFWMjBDMjEgMTYuMTMgMTcuODcgMTMgMTQgMTNIMTBDNi4xMyAxMyAzIDE2LjEzIDMgMjBWMjFIMjFaIi8+Cjwvc3ZnPgo=';
  };

  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-slate-900 via-purple-900/90 to-slate-800 min-h-screen rounded-3xl shadow-2xl overflow-hidden">
      {/* Header with gradient based on gender */}
      <div className={`bg-gradient-to-br ${theme.primary} p-8 text-white relative overflow-hidden rounded-t-3xl`}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white/30 rounded-full -translate-x-20 -translate-y-20 blur-xl"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/20 rounded-full translate-x-12 translate-y-12 blur-lg"></div>
          <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white/10 rounded-full -translate-x-12 -translate-y-12 blur-md"></div>
        </div>
        
        <div className="relative z-10">
          {/* Profile Image Section */}
          <div className="flex flex-col items-center mb-4">
            <div className="relative">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white/60 shadow-2xl bg-gradient-to-br from-purple-400 to-blue-500 ring-4 ring-white/30 backdrop-blur-sm">
                <img 
                  src={getProfileImage()}
                  alt="الصورة الشخصية"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {isOwner && (
                <button
                  onClick={() => isEditingProfile ? document.getElementById('imageUpload')?.click() : setIsEditingProfile(true)}
                  className="absolute -bottom-1 -right-1 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl border-2 border-white/50 hover:scale-110 transition-transform"
                >
                  <Camera className="w-5 h-5 text-white" />
                </button>
              )}
              
              {isEditingProfile && (
                <input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              )}
            </div>
            
            <h2 className="text-xl font-bold mt-3 text-black">{userData?.username}</h2>
            <p className="text-white/80 text-sm">ID: {userData?.playerId}</p>
            
            {/* Gender selector for editing */}
            {isEditingProfile && (
              <div className="mt-3 flex space-x-2 rtl:space-x-reverse">
                <button
                  onClick={() => setSelectedGender('male')}
                  className={`px-3 py-1 rounded-full text-xs ${selectedGender === 'male' ? 'bg-white text-blue-600' : 'bg-white/20 text-white'}`}
                >
                  ذكر
                </button>
                <button
                  onClick={() => setSelectedGender('female')}
                  className={`px-3 py-1 rounded-full text-xs ${selectedGender === 'female' ? 'bg-white text-pink-600' : 'bg-white/20 text-white'}`}
                >
                  أنثى
                </button>
              </div>
            )}
          </div>
          
          {/* Stats Grid - Private info only for owner */}
          {isOwner ? (
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-lg font-bold text-black">🪙 {userData?.goldCoins || 0}</div>
                <div className="text-xs text-white/80">ذهب</div>
              </div>
              <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-lg font-bold text-black">🦪 {userData?.pearls || 0}</div>
                <div className="text-xs text-white/80">لؤلؤ</div>
              </div>
              <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-lg font-bold text-black">Lv.{userData?.level || 1}</div>
                <div className="text-xs text-white/80">مستوى</div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm text-center">
                <div className="text-lg font-bold text-black">Lv.{userData?.level || 1}</div>
                <div className="text-xs text-white/80">مستوى</div>
              </div>
              
              {/* زر إرسال رسالة للأصدقاء فقط */}
              {isFriend && (
                <button
                  onClick={() => setShowMessageDialog(true)}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>إرسال رسالة</span>
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Edit controls */}
        {isEditingProfile && (
          <div className="absolute top-4 right-4 flex space-x-2 rtl:space-x-reverse">
            <button
              onClick={handleProfileSave}
              disabled={isUploading}
              className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
            >
              <Check className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => {
                setIsEditingProfile(false);
                setSelectedImage('');
                setSelectedGender(userData?.gender || 'male');
              }}
              className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        )}
      </div>
      
      {/* Navigation Tabs */}
      <div className="sticky top-0 bg-gradient-to-r from-slate-800/95 to-blue-800/95 backdrop-blur-md border-b border-blue-500/30 z-20 mx-4 rounded-2xl mt-4 shadow-lg">
        <div className="flex overflow-x-auto scrollbar-hide p-2">
          {[
            { id: 'overview', label: 'عام', icon: User },
            ...(isOwner ? [
              { id: 'friends', label: 'أصدقاء', icon: Users },
              { id: 'gifts', label: 'هدايا', icon: Gift },
              { id: 'items', label: 'عناصر ودرع', icon: Star },
              { id: 'charge', label: 'شحن', icon: CreditCard },
              { id: 'exchange', label: 'تبديل', icon: ArrowLeftRight }
            ] : [])
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`flex-shrink-0 flex flex-col items-center px-3 py-2 min-w-[60px] transition-all duration-300 rounded-xl ${
                activeSection === tab.id
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-300 hover:bg-slate-800/40 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4 mb-1" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6 pb-20">
        {activeSection === 'overview' && (
          <div className="space-y-6">
            {/* Status card */}
            <div className="bg-gradient-to-br from-slate-800/90 to-blue-800/90 rounded-2xl p-6 border border-blue-400/30 shadow-xl backdrop-blur-sm">
              <h3 className="font-bold text-blue-300 mb-4 text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                معلومات الحساب
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center p-3 bg-slate-800/40 rounded-xl backdrop-blur-sm border border-slate-400/20">
                  <span className="text-slate-300">الجنس:</span>
                  <span className="text-blue-300 font-medium">
                    {userData?.gender === 'female' ? '👩 أنثى' : '👨 ذكر'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-800/40 rounded-xl backdrop-blur-sm border border-slate-400/20">
                  <span className="text-slate-300">تاريخ الانضمام:</span>
                  <span className="text-blue-300 font-medium">
                    {new Date(userData?.joinedAt).toLocaleDateString('ar-EG')}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-800/40 rounded-xl backdrop-blur-sm border border-slate-400/20">
                  <span className="text-slate-300">آخر نشاط:</span>
                  <span className="text-blue-300 font-medium">
                    {new Date(userData?.lastActive).toLocaleDateString('ar-EG')}
                  </span>
                </div>
              </div>
            </div>

            {/* Visitor notice */}
            {!isOwner && (
              <div className="bg-gradient-to-br from-blue-800/80 to-indigo-800/80 rounded-2xl p-6 border border-blue-400/30 shadow-xl backdrop-blur-sm">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-300 text-lg">ملف عام</h4>
                    <p className="text-sm text-blue-200">
                      يمكنك عرض الاسم والصورة والآي دي والمستوى فقط
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-amber-800/80 to-orange-800/80 rounded-2xl p-5 shadow-xl border border-amber-400/30 backdrop-blur-sm">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-black">{userData?.experience || 0}</div>
                    <div className="text-xs text-amber-200 font-medium">خبرة</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-amber-800/80 to-orange-800/80 rounded-2xl p-5 shadow-xl border border-amber-400/30 backdrop-blur-sm">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-2xl">🎮</span>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-black">{userData?.level || 1}</div>
                    <div className="text-xs text-amber-200 font-medium">مستوى</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Friends Section */}
        {isOwner && activeSection === 'friends' && (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4 drop-shadow-lg">👥</div>
              <h3 className="text-xl font-bold text-white mb-2">إدارة الأصدقاء</h3>
              <p className="text-gray-300 text-sm">أضف وتفاعل مع أصدقائك في المنصة</p>
            </div>
            
            {/* Add Friend Section */}
            <div className="bg-gradient-to-br from-blue-800/60 to-indigo-800/60 p-6 rounded-2xl border border-blue-400/30 shadow-xl backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <UserPlus className="w-6 h-6 text-blue-300" />
                <h4 className="font-bold text-blue-200 text-lg">إضافة صديق جديد</h4>
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="رقم اللاعب (6 أرقام)"
                  className="flex-1 px-4 py-3 bg-blue-900/30 border border-blue-400/30 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={6}
                />
                <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-sm font-bold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-md">
                  🔍 بحث
                </button>
              </div>
            </div>

            {/* Friends List */}
            <div className="bg-gradient-to-br from-slate-800/60 to-blue-800/60 p-6 rounded-2xl border border-slate-400/30 shadow-xl backdrop-blur-sm">
              <h4 className="font-bold text-slate-200 mb-4 text-lg flex items-center gap-3">
                <span className="text-2xl">👫</span>
                قائمة الأصدقاء
              </h4>
              <div className="text-center py-6 text-slate-300 text-sm bg-slate-900/30 rounded-xl">
                <div className="text-3xl mb-2">😔</div>
                لا توجد أصدقاء حالياً
              </div>
            </div>

            {/* Friend Requests */}
            <div className="bg-gradient-to-br from-emerald-800/60 to-green-800/60 p-6 rounded-2xl border border-emerald-400/30 shadow-xl backdrop-blur-sm">
              <h4 className="font-bold text-emerald-200 mb-4 text-lg flex items-center gap-3">
                <span className="text-2xl">📩</span>
                طلبات الصداقة
              </h4>
              <div className="text-center py-6 text-emerald-300 text-sm bg-emerald-900/30 rounded-xl">
                <div className="text-3xl mb-2">📭</div>
                لا توجد طلبات صداقة جديدة
              </div>
            </div>
          </div>
        )}

        {/* Gifts Section */}
        {isOwner && activeSection === 'gifts' && (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4 drop-shadow-lg">🎁</div>
              <h3 className="text-xl font-bold text-white mb-2">نظام إدارة الهدايا</h3>
              <p className="text-gray-300 text-sm">أرسل واستقبل الهدايا المتنوعة مع الأصدقاء</p>
            </div>
            
            {/* Send Gift Section */}
            <div className="bg-gradient-to-br from-blue-800/60 to-indigo-800/60 p-6 rounded-2xl border border-blue-400/30 shadow-xl backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-5">
                <Send className="w-6 h-6 text-blue-300" />
                <h4 className="font-bold text-blue-200 text-lg">إرسال هدية جديدة</h4>
              </div>
              
              {/* Currency Gifts */}
              <div className="mb-5">
                <h5 className="text-base font-bold text-yellow-300 mb-3 flex items-center gap-2">
                  <span className="text-xl">💰</span>
                  العملات الذهبية
                </h5>
                <div className="grid grid-cols-1 gap-3">
                  <button className="p-4 bg-yellow-800/40 border border-yellow-400/30 rounded-xl hover:bg-yellow-700/50 transition-all duration-300 flex items-center gap-4 shadow-lg">
                    <div className="text-3xl drop-shadow-lg">🪙</div>
                    <div className="text-right flex-1">
                      <div className="text-sm font-bold text-yellow-200">عملات ذهبية</div>
                      <div className="text-xs text-yellow-300">للشراء والاستخدام في المنصة</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Harmful Items */}
              <div className="mb-5">
                <h5 className="text-base font-bold text-red-300 mb-3 flex items-center gap-2">
                  <span className="text-xl">⚠️</span>
                  العناصر الضارة
                </h5>
                <div className="grid grid-cols-3 gap-3">
                  <button className="p-4 bg-red-800/40 border border-red-400/30 rounded-xl hover:bg-red-700/50 transition-all duration-300 text-center shadow-lg">
                    <div className="text-3xl mb-2 drop-shadow-lg">💣</div>
                    <div className="text-xs font-bold text-red-200">قنبلة مدمرة</div>
                  </button>
                  <button className="p-4 bg-red-800/40 border border-red-400/30 rounded-xl hover:bg-red-700/50 transition-all duration-300 text-center shadow-lg">
                    <div className="text-3xl mb-2 drop-shadow-lg">🦇</div>
                    <div className="text-xs font-bold text-red-200">خفاش مؤذي</div>
                  </button>
                  <button className="p-4 bg-red-800/40 border border-red-400/30 rounded-xl hover:bg-red-700/50 transition-all duration-300 text-center shadow-lg">
                    <div className="text-3xl mb-2 drop-shadow-lg">🐍</div>
                    <div className="text-xs font-bold text-red-200">ثعبان سام</div>
                  </button>
                </div>
              </div>

              {/* Beneficial Items */}
              <div className="mb-5">
                <h5 className="text-base font-bold text-emerald-300 mb-3 flex items-center gap-2">
                  <span className="text-xl">✨</span>
                  العناصر المفيدة
                </h5>
                <div className="grid grid-cols-3 gap-3">
                  <button className="p-4 bg-emerald-800/40 border border-emerald-400/30 rounded-xl hover:bg-emerald-700/50 transition-all duration-300 text-center shadow-lg">
                    <div className="text-3xl mb-2 drop-shadow-lg">💎</div>
                    <div className="text-xs font-bold text-emerald-200">جوهرة نادرة</div>
                  </button>
                  <button className="p-4 bg-emerald-800/40 border border-emerald-400/30 rounded-xl hover:bg-emerald-700/50 transition-all duration-300 text-center shadow-lg">
                    <div className="text-3xl mb-2 drop-shadow-lg">⭐</div>
                    <div className="text-xs font-bold text-emerald-200">نجمة ذهبية</div>
                  </button>
                  <button className="p-4 bg-emerald-800/40 border border-emerald-400/30 rounded-xl hover:bg-emerald-700/50 transition-all duration-300 text-center shadow-lg">
                    <div className="text-3xl mb-2 drop-shadow-lg">🪙</div>
                    <div className="text-xs font-bold text-emerald-200">عملة خاصة</div>
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="رقم اللاعب (6 أرقام)"
                  className="flex-1 px-4 py-3 bg-blue-900/30 border border-blue-400/30 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-sm font-bold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-md">
                  🎁 إرسال
                </button>
              </div>
            </div>

            {/* Received Gifts */}
            <div className="bg-gradient-to-br from-slate-800/60 to-blue-800/60 p-6 rounded-2xl border border-slate-400/30 shadow-xl backdrop-blur-sm">
              <h4 className="font-bold text-slate-200 mb-4 text-lg flex items-center gap-3">
                <span className="text-2xl">📦</span>
                الهدايا المستلمة
              </h4>
              <div className="text-center py-6 text-slate-300 text-sm bg-slate-900/30 rounded-xl">
                <div className="text-3xl mb-2">🎈</div>
                لا توجد هدايا جديدة في الوقت الحالي
              </div>
            </div>
          </div>
        )}

        {/* Items Section */}
        {isOwner && activeSection === 'items' && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">العناصر المجمعة</h3>
              <p className="text-sm text-gray-500">العناصر التي حصلت عليها من الألعاب</p>
            </div>
            
            {/* Beneficial Items from Games */}
            <div className="bg-gradient-to-br from-emerald-800/80 to-green-800/80 p-6 rounded-2xl border border-emerald-400/30 shadow-xl backdrop-blur-sm">
              <h4 className="font-bold text-emerald-300 mb-4 text-lg flex items-center gap-3">
                <span className="text-2xl">⭐</span>
                العناصر المفيدة
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-emerald-800/40 rounded-xl border border-emerald-400/30 backdrop-blur-sm hover:bg-emerald-700/50 transition-all duration-300 transform hover:scale-105 shadow-lg">
                  <div className="text-4xl mb-3 drop-shadow-lg">💎</div>
                  <div className="text-sm font-bold text-emerald-200 mb-1">جوهرة نادرة</div>
                  <div className="text-xs text-emerald-300 bg-emerald-900/30 px-2 py-1 rounded-lg mb-2">مكافأة 500 🪙</div>
                  <div className="text-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl py-2 shadow-md">{itemCounts.gems}</div>
                </div>
                <div className="text-center p-4 bg-emerald-800/40 rounded-xl border border-emerald-400/30 backdrop-blur-sm hover:bg-emerald-700/50 transition-all duration-300 transform hover:scale-105 shadow-lg">
                  <div className="text-4xl mb-3 drop-shadow-lg">⭐</div>
                  <div className="text-sm font-bold text-emerald-200 mb-1">نجمة ذهبية</div>
                  <div className="text-xs text-emerald-300 bg-emerald-900/30 px-2 py-1 rounded-lg mb-2">مكافأة 200 🪙</div>
                  <div className="text-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl py-2 shadow-md">{itemCounts.stars}</div>
                </div>
                <div className="text-center p-4 bg-emerald-800/40 rounded-xl border border-emerald-400/30 backdrop-blur-sm hover:bg-emerald-700/50 transition-all duration-300 transform hover:scale-105 shadow-lg">
                  <div className="text-4xl mb-3 drop-shadow-lg">🪙</div>
                  <div className="text-sm font-bold text-emerald-200 mb-1">عملة خاصة</div>
                  <div className="text-xs text-emerald-300 bg-emerald-900/30 px-2 py-1 rounded-lg mb-2">مكافأة 100 🪙</div>
                  <div className="text-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl py-2 shadow-md">{itemCounts.coins}</div>
                </div>
              </div>
            </div>

            {/* Harmful Items from Games */}
            <div className="bg-gradient-to-br from-red-800/80 to-rose-800/80 p-6 rounded-2xl border border-red-400/30 shadow-xl backdrop-blur-sm">
              <h4 className="font-bold text-red-300 mb-4 text-lg flex items-center gap-3">
                <span className="text-2xl">💣</span>
                العناصر الضارة
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-red-800/40 rounded-xl border border-red-400/30 backdrop-blur-sm hover:bg-red-700/50 transition-all duration-300 transform hover:scale-105 shadow-lg">
                  <div className="text-4xl mb-3 drop-shadow-lg">💣</div>
                  <div className="text-sm font-bold text-red-200 mb-1">قنبلة مدمرة</div>
                  <div className="text-xs text-red-300 bg-red-900/30 px-2 py-1 rounded-lg mb-2">خسارة 100 🪙</div>
                  <div className="text-xl font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 rounded-xl py-2 shadow-md">{itemCounts.bombs}</div>
                </div>
                <div className="text-center p-4 bg-red-800/40 rounded-xl border border-red-400/30 backdrop-blur-sm hover:bg-red-700/50 transition-all duration-300 transform hover:scale-105 shadow-lg">
                  <div className="text-4xl mb-3 drop-shadow-lg">🦇</div>
                  <div className="text-sm font-bold text-red-200 mb-1">خفاش مؤذي</div>
                  <div className="text-xs text-red-300 bg-red-900/30 px-2 py-1 rounded-lg mb-2">خسارة 50 🪙</div>
                  <div className="text-xl font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 rounded-xl py-2 shadow-md">{itemCounts.bats}</div>
                </div>
                <div className="text-center p-4 bg-red-800/40 rounded-xl border border-red-400/30 backdrop-blur-sm hover:bg-red-700/50 transition-all duration-300 transform hover:scale-105 shadow-lg">
                  <div className="text-4xl mb-3 drop-shadow-lg">🐍</div>
                  <div className="text-sm font-bold text-red-200 mb-1">ثعبان سام</div>
                  <div className="text-xs text-red-300 bg-red-900/30 px-2 py-1 rounded-lg mb-2">خسارة 75 🪙</div>
                  <div className="text-xl font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 rounded-xl py-2 shadow-md">{itemCounts.snakes}</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-800/60 to-yellow-800/60 p-6 rounded-2xl border border-amber-400/30 shadow-xl backdrop-blur-sm">
              <h4 className="font-bold text-amber-200 mb-3 text-lg flex items-center gap-3">
                <span className="text-2xl">💡</span>
                نصائح مهمة
              </h4>
              <p className="text-amber-100 text-sm leading-relaxed">
                اجمع العناصر المفيدة من الألعاب • أرسلها كهدايا للأصدقاء • بادلها بعملات ذهبية قيمة
              </p>
            </div>

            {/* Shield Protection Section */}
            <div className="bg-gradient-to-br from-blue-800/80 to-indigo-800/80 p-6 rounded-2xl border border-blue-400/30 shadow-xl backdrop-blur-sm">
              <h4 className="font-bold text-blue-200 mb-4 text-lg flex items-center gap-3">
                <span className="text-3xl drop-shadow-lg">🛡️</span>
                نظام الحماية المتطور
              </h4>
              <p className="text-blue-100 text-sm mb-6 leading-relaxed">احمِ نفسك من العناصر الضارة والهجمات الخطيرة في الألعاب والهدايا</p>
              
              <div className="grid grid-cols-1 gap-5">
                <div className="bg-blue-800/40 p-5 rounded-xl border border-blue-400/30 backdrop-blur-sm shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-bold text-blue-200 text-base">🥇 درع ذهبي أساسي</h5>
                    <span className="text-xs text-blue-100 bg-blue-600/40 px-3 py-1 rounded-full font-medium">24 ساعة</span>
                  </div>
                  <p className="text-sm text-blue-100 mb-4 leading-relaxed">حماية قوية ضد القنابل المدمرة والخفافيش المؤذية والثعابين السامة</p>
                  <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl text-sm font-bold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md">
                    🛡️ تفعيل الحماية (2,000 🪙)
                  </button>
                </div>
                
                <div className="bg-purple-800/40 p-5 rounded-xl border border-purple-400/30 backdrop-blur-sm shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-bold text-purple-200 text-base">👑 درع متقدم مميز</h5>
                    <span className="text-xs text-purple-100 bg-purple-600/40 px-3 py-1 rounded-full font-medium">7 أيام</span>
                  </div>
                  <p className="text-sm text-purple-100 mb-4 leading-relaxed">حماية مميزة وشاملة لمدة أسبوع كامل ضد جميع العناصر الضارة والهجمات</p>
                  <button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-xl text-sm font-bold hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-md">
                    👑 تفعيل الحماية المميزة (20,000 🪙)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}



        {/* Charge Section */}
        {isOwner && activeSection === 'charge' && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4 drop-shadow-lg">💰</div>
              <h3 className="text-xl font-bold text-white mb-2">شحن الرصيد الذهبي</h3>
              <p className="text-gray-300 text-sm">اشحن عملاتك الذهبية بأفضل الأسعار</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-gradient-to-br from-yellow-800/60 to-amber-800/60 p-6 rounded-2xl border border-yellow-400/30 shadow-xl backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-4xl mb-3 drop-shadow-lg">🪙</div>
                  <h4 className="font-bold text-yellow-200 mb-2 text-lg">5,000 عملة ذهبية</h4>
                  <p className="text-yellow-100 text-base mb-4 font-semibold">💵 $1 USD فقط</p>
                  <button className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-white py-3 rounded-xl text-sm font-bold hover:from-yellow-600 hover:to-amber-700 transition-all duration-300 shadow-md">
                    📱 شحن عبر واتساب
                  </button>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-800/60 to-emerald-800/60 p-6 rounded-2xl border border-green-400/30 shadow-xl backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-4xl mb-3 drop-shadow-lg">🪙</div>
                  <h4 className="font-bold text-green-200 mb-2 text-lg">27,200 عملة ذهبية</h4>
                  <p className="text-green-100 text-base mb-1 font-semibold">💵 $5 USD</p>
                  <p className="text-sm text-green-300 bg-green-900/30 px-3 py-1 rounded-lg mb-4 font-medium">🎉 وفر 8% أكثر!</p>
                  <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl text-sm font-bold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-md">
                    📱 شحن عبر واتساب
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Exchange Section */}
        {isOwner && activeSection === 'exchange' && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4 drop-shadow-lg">🔄</div>
              <h3 className="text-xl font-bold text-white mb-2">نظام تبديل العملات</h3>
              <p className="text-gray-300 text-sm">اللآلئ مخصصة حصرياً للتحويل إلى دولارات نقدية</p>
            </div>
            <div className="space-y-5">
              <div className="bg-gradient-to-br from-blue-800/60 to-indigo-800/60 p-6 rounded-2xl border border-blue-400/30 shadow-xl backdrop-blur-sm">
                <h4 className="font-bold text-blue-200 mb-4 text-lg flex items-center gap-3">
                  <span className="text-2xl">🪙➡️🦪</span>
                  تحويل ذهب إلى لآلئ
                </h4>
                <p className="text-blue-100 text-sm mb-4 bg-blue-900/30 px-3 py-2 rounded-lg">معدل التحويل: 10,000 🪙 = 1 🦪</p>
                <div className="flex items-center gap-3 mb-4">
                  <input type="number" placeholder="10000" className="flex-1 px-4 py-3 bg-blue-900/30 border border-blue-400/30 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <span className="text-blue-200 font-medium">🪙 ➡️ 🦪</span>
                </div>
                <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl text-sm font-bold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-md">
                  🔄 تحويل إلى لآلئ
                </button>
              </div>
              
              <div className="bg-gradient-to-br from-green-800/60 to-emerald-800/60 p-6 rounded-2xl border border-green-400/30 shadow-xl backdrop-blur-sm">
                <h4 className="font-bold text-green-200 mb-4 text-lg flex items-center gap-3">
                  <span className="text-2xl">🦪➡️💵</span>
                  سحب دولارات نقدية
                </h4>
                <div className="bg-green-900/30 p-4 rounded-xl mb-4">
                  <p className="text-green-100 text-sm leading-relaxed">
                    <strong className="text-green-200">💰 معدل التحويل:</strong> 10 🦪 = $1 USD<br/>
                    <strong className="text-green-200">🎯 الحد الأدنى للسحب:</strong> $25 USD (250 🦪)
                  </p>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <input type="number" placeholder="250" min="250" className="flex-1 px-4 py-3 bg-green-900/30 border border-green-400/30 rounded-xl text-white placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-green-500" />
                  <span className="text-green-200 font-medium">🦪 ➡️ $</span>
                </div>
                <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl text-sm font-bold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-md">
                  📱 طلب سحب عبر واتساب
                </button>
              </div>

              <div className="bg-gradient-to-br from-amber-800/60 to-yellow-800/60 p-6 rounded-2xl border border-amber-400/30 shadow-xl backdrop-blur-sm">
                <h4 className="font-bold text-amber-200 mb-4 text-lg flex items-center gap-3">
                  <span className="text-2xl">📝</span>
                  معلومات مهمة
                </h4>
                <div className="space-y-2 text-amber-100 text-sm leading-relaxed">
                  <p>• <strong>اللآلئ 🦪</strong> - مخصصة حصرياً للتحويل إلى دولارات نقدية</p>
                  <p>• <strong>العملات الذهبية 🪙</strong> - للشراء والتبادل داخل المنصة</p>
                  <p>• <strong>العناصر الخاصة</strong> - تُكسب من الألعاب والتحديات</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* مربع حوار إرسال الرسالة */}
      {showMessageDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-blue-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-blue-400/30">
            <h3 className="text-xl font-bold text-white mb-4 text-center">إرسال رسالة إلى {userData?.username}</h3>
            
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="اكتب رسالتك هنا..."
              className="w-full p-3 rounded-xl bg-slate-800/40 border border-blue-400/30 text-white placeholder-blue-300 resize-none h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={500}
            />
            
            <div className="text-right text-xs text-blue-300 mt-1 mb-4">
              {messageText.length}/500
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowMessageDialog(false);
                  setMessageText('');
                }}
                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-2 px-4 rounded-xl transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-500 disabled:to-gray-600 text-white py-2 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                إرسال
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileProfileCard;