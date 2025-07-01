import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, 
  MessageCircle, 
  Users, 
  Trophy, 
  Settings, 
  LogOut,
  Coins,
  Star,
  Crown,
  Box,
  Infinity,
  Menu,
  X,
  Shield
} from 'lucide-react';
import GameGrid from './GameGrid';
import VoiceChatRoom from './VoiceChatRoom';
import AdminDashboard from './AdminDashboard';
import MobileProfileCard from './MobileProfileCard';

interface MainDashboardProps {
  userData: any;
  onLogout: () => void;
}

const MainDashboard: React.FC<MainDashboardProps> = ({ userData, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'games' | 'voice' | 'leaderboard' | 'profile' | 'admin'>('games');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUserData, setCurrentUserData] = useState(userData);

  // دالة تحديث الملف الشخصي
  const handleProfileUpdate = (updatedData: any) => {
    setCurrentUserData({ ...currentUserData, ...updatedData });
  };

  const navigationItems = [
    { id: 'games', label: 'الألعاب', icon: Gamepad2, color: 'text-purple-400' },
    { id: 'voice', label: 'المحادثة الصوتية', icon: MessageCircle, color: 'text-blue-400' },
    { id: 'leaderboard', label: 'لوحة المتصدرين', icon: Trophy, color: 'text-yellow-400' },
    { id: 'profile', label: 'الملف الشخصي', icon: Users, color: 'text-green-400' },
    ...(userData?.isAdmin ? [{ id: 'admin', label: 'لوحة المشرف', icon: Shield, color: 'text-red-400' }] : []),
  ];

  // تحديث بيانات المستخدم
  useEffect(() => {
    setCurrentUserData(userData);
  }, [userData]);

  const renderContent = () => {
    switch (activeTab) {
      case 'games':
        return <GameGrid setActiveTab={setActiveTab} />;
      case 'voice':
        return <VoiceChatRoom userData={userData} onLogout={onLogout} />;
      case 'leaderboard':
        return <LeaderboardContent />;
      case 'profile':
        return <ProfileContent userData={currentUserData} onUpdateProfile={handleProfileUpdate} />;
      case 'admin':
        return userData?.isAdmin ? <AdminDashboard userData={userData} onLogout={onLogout} /> : <GameGrid />;
      default:
        return <GameGrid />;
    }
  };

  // إذا كان المستخدم في لوحة المشرف، عرضها بدون الشريط الجانبي
  if (activeTab === 'admin' && userData?.isAdmin) {
    return <AdminDashboard userData={userData} onLogout={onLogout} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>
      </div>

      <div className="relative z-10 flex h-screen">
        {/* الشريط الجانبي */}
        <aside className={`fixed lg:static inset-y-0 right-0 z-50 w-80 bg-slate-900 border-l border-slate-700 transform transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}>
          <div className="flex flex-col h-full">
            {/* رأس الشريط الجانبي */}
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center relative">
                    <Box className="w-6 h-6 text-white" />
                    <Infinity className="w-3 h-3 text-white absolute -top-1 -right-1" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      INFINITY BOX
                    </h1>
                    <p className="text-xs text-gray-400">منصة الألعاب والمحادثة</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="lg:hidden p-2 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* معلومات المستخدم */}
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-xl font-bold">
                  {userData?.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{userData?.username || 'مستخدم'}</h3>
                  {userData?.playerId && (
                    <div className="text-xs text-gray-400 mt-1">رقمك المميز: {userData.playerId}</div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span>المستوى 5</span>
                  </div>
                </div>
                {userData?.isAdmin && (
                  <Crown className="w-5 h-5 text-yellow-400" />
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800 rounded-xl p-3 text-center border border-slate-700">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 font-semibold">1,250</span>
                  </div>
                  <p className="text-xs text-gray-400">العملات الذهبية</p>
                </div>
                <div className="bg-slate-800 rounded-xl p-3 text-center border border-slate-700">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Trophy className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-400 font-semibold">847</span>
                  </div>
                  <p className="text-xs text-gray-400">النقاط</p>
                </div>
              </div>
            </div>

            {/* التنقل */}
            <nav className="flex-1 p-6">
              <div className="space-y-2">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-right ${
                      activeTab === item.id
                        ? 'bg-slate-700 border border-slate-600 shadow-lg'
                        : 'hover:bg-slate-800'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                    <span className="font-medium">{item.label}</span>
                    {item.id === 'admin' && userData?.isAdmin && (
                      <Crown className="w-4 h-4 text-yellow-400 mr-auto" />
                    )}
                  </button>
                ))}
              </div>
            </nav>

            {/* أزرار الإعدادات والخروج */}
            <div className="p-6 border-t border-white/10 space-y-2">
              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-right"
                onClick={() => {
                  if (userData?.isAdmin) {
                    setActiveTab('admin');
                    setIsSidebarOpen(false);
                  } else {
                    // يمكنك هنا فتح صفحة إعدادات عادية أو نافذة إعدادات
                    alert('هذه الصفحة مخصصة للمشرفين فقط');
                  }
                }}
              >
                <Settings className="w-5 h-5 text-gray-400" />
                <span>الإعدادات</span>
              </button>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/20 text-red-300 transition-colors text-right"
              >
                <LogOut className="w-5 h-5" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>
        </aside>

        {/* المحتوى الرئيسي */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* شريط علوي للجوال */}
          <header className="lg:hidden bg-slate-900 border-b border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Box className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-lg font-bold">INFINITY BOX</h1>
              </div>
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </header>

          {/* المحتوى */}
          <div className="flex-1 overflow-auto p-6 lg:p-8">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* خلفية الشريط الجانبي للجوال */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

// مكونات المحتوى
const ProfileContent: React.FC<{ userData: any; onUpdateProfile: (data: any) => void }> = ({ userData, onUpdateProfile }) => (
  <MobileProfileCard userData={userData} isOwner={true} onUpdateProfile={onUpdateProfile} />
);

const LeaderboardContent: React.FC = () => (
  <div className="space-y-8">
    <div className="flex items-center gap-3 mb-8">
      <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
        <Trophy className="w-5 h-5 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-white">لوحة المتصدرين</h2>
    </div>
    
    <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10">
      <div className="text-center py-12">
        <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">لوحة المتصدرين</h3>
        <p className="text-gray-300">قريباً - سيتم عرض أفضل اللاعبين هنا</p>
      </div>
    </div>
  </div>
);

const SocialProfile: React.FC<{ userData: any }> = ({ userData }) => {
  const [showFriendSearch, setShowFriendSearch] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [friendIdInput, setFriendIdInput] = useState('');
  const [friendSearchResult, setFriendSearchResult] = useState<any>(null);
  const [friendSearchError, setFriendSearchError] = useState('');
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [requestsTab, setRequestsTab] = useState<'gift'|'trade'|'destroy'>('gift');
  const [requestsData, setRequestsData] = useState<any>({giftRequests:[],tradeRequests:[],destroyRequests:[]});
  const [requestsError, setRequestsError] = useState('');
  const BACKEND_URL = 'https://mygame25bita-7eqw.onrender.com';
  const token = localStorage.getItem('token');

  // البحث عن صديق
  const searchUserById = async () => {
    setFriendSearchError('');
    setFriendSearchResult(null);
    if (!friendIdInput.trim()) {
      setFriendSearchError('يرجى إدخال رقم اللاعب');
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/api/users/search-by-id/${friendIdInput.trim()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        setFriendSearchError('لم يتم العثور على لاعب بهذا الرقم');
        return;
      }
      const user = await res.json();
      setFriendSearchResult(user);
    } catch {
      setFriendSearchError('حدث خطأ أثناء البحث');
    }
  };
  // إرسال طلب صداقة
  const sendFriendRequest = async (targetId: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/users/send-friend-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ targetId })
      });
      if (!res.ok) {
        setFriendSearchError('تعذر إرسال الطلب');
        return;
      }
      setFriendSearchResult(null);
      setFriendSearchError('تم إرسال طلب الصداقة بنجاح!');
    } catch {
      setFriendSearchError('حدث خطأ أثناء إرسال الطلب');
    }
  };
  // جلب الطلبات المعلقة وقائمة الأصدقاء
  const loadFriendsAndRequests = async () => {
    try {
      const res1 = await fetch(`${BACKEND_URL}/api/users/pending-requests`, { headers: { 'Authorization': `Bearer ${token}` } });
      setPendingRequests(res1.ok ? await res1.json() : []);
    } catch { setPendingRequests([]); }
    try {
      const res2 = await fetch(`${BACKEND_URL}/api/users/friends`, { headers: { 'Authorization': `Bearer ${token}` } });
      setFriends(res2.ok ? await res2.json() : []);
    } catch { setFriends([]); }
  };
  // قبول/رفض الطلبات
  const acceptFriendRequest = async (requestId: string) => {
    await fetch(`${BACKEND_URL}/api/users/accept-friend-request/${requestId}`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
    loadFriendsAndRequests();
  };
  const rejectFriendRequest = async (requestId: string) => {
    await fetch(`${BACKEND_URL}/api/users/reject-friend-request/${requestId}`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
    loadFriendsAndRequests();
  };
  // الطلبات الاجتماعية
  const loadRequests = async (type: 'gift'|'trade'|'destroy') => {
    setRequestsTab(type);
    setRequestsError('');
    try {
      const res = await fetch(`${BACKEND_URL}/api/users/my-requests`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) return;
      setRequestsData(await res.json());
    } catch { setRequestsError('تعذر جلب الطلبات'); }
  };
  useEffect(() => { if (showFriends) loadFriendsAndRequests(); }, [showFriends]);
  useEffect(() => { if (showRequests) loadRequests(requestsTab); }, [showRequests]);

  return (
    <div className="space-y-6">
      {/* أزرار النظام الاجتماعي */}
      <div className="flex flex-wrap gap-4 justify-center mb-4">
        <button className="bet-button bg-gradient-to-r from-indigo-500 to-purple-700" onClick={()=>setShowFriendSearch(true)}>بحث عن صديق بالرقم</button>
        <button className="bet-button bg-gradient-to-r from-green-500 to-emerald-700" onClick={()=>setShowFriends(true)}>الأصدقاء</button>
        <button className="bet-button bg-gradient-to-r from-pink-500 to-red-700 relative" onClick={()=>setShowRequests(true)}>
          الطلبات
        </button>
      </div>
      {/* نافذة البحث عن صديق */}
      {showFriendSearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-xl p-6 max-w-xs w-full relative">
            <button className="absolute top-2 left-2 text-gray-500" onClick={()=>{setShowFriendSearch(false);setFriendSearchResult(null);setFriendSearchError('');}}>&times;</button>
            <h2 className="text-lg font-bold mb-2">🔎 البحث عن صديق بالرقم</h2>
            <input type="text" className="w-full p-2 rounded border mb-2 text-black" placeholder="أدخل رقم اللاعب (ID)" value={friendIdInput} onChange={e=>setFriendIdInput(e.target.value)} />
            <button className="bet-button w-full mb-2" onClick={searchUserById}>بحث</button>
            {friendSearchError && <div className="text-red-500 mb-2">{friendSearchError}</div>}
            {friendSearchResult && (
              <div className="mb-2">
                <div>الاسم: <b>{friendSearchResult.username}</b></div>
                <button className="bet-button" onClick={()=>sendFriendRequest(friendSearchResult.playerId)}>إرسال طلب صداقة</button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* نافذة الأصدقاء والطلبات */}
      {showFriends && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-xl p-6 max-w-md w-full relative">
            <button className="absolute top-2 left-2 text-gray-500" onClick={()=>setShowFriends(false)}>&times;</button>
            <h2 className="text-lg font-bold mb-2">👥 الأصدقاء والطلبات</h2>
            <h4 className="font-semibold mb-1">الطلبات المعلقة</h4>
            <div className="mb-2">
              {pendingRequests.length === 0 ? <span className="text-gray-400">لا توجد طلبات معلقة</span> : pendingRequests.map((req:any)=>(
                <div key={req._id} className="mb-1">
                  <b>{req.username}</b> (ID: {req.playerId})
                  <button className="bet-button bg-green-500 ml-2" onClick={()=>acceptFriendRequest(req._id)}>قبول</button>
                  <button className="bet-button bg-red-500" onClick={()=>rejectFriendRequest(req._id)}>رفض</button>
                </div>
              ))}
            </div>
            <hr className="my-2" />
            <h4 className="font-semibold mb-1">قائمة الأصدقاء</h4>
            <div>
              {friends.length === 0 ? <span className="text-gray-400">لا يوجد أصدقاء بعد</span> : friends.map((friend:any)=>(
                <div key={friend._id} className="mb-1">
                  <b>{friend.username}</b> (ID: {friend.playerId})
                  <button className="bet-button bg-yellow-500 ml-2">🎁 هدية</button>
                  <button className="bet-button bg-blue-400">🔄 مقايضة</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* نافذة الطلبات الاجتماعية */}
      {showRequests && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-xl p-6 max-w-md w-full relative">
            <button className="absolute top-2 left-2 text-gray-500" onClick={()=>setShowRequests(false)}>&times;</button>
            <h2 className="text-lg font-bold mb-2">الطلبات الاجتماعية</h2>
            <div className="flex gap-2 mb-2">
              <button className={`bet-button ${requestsTab==='gift'?'bg-green-500':''}`} onClick={()=>loadRequests('gift')}>الهدايا</button>
              <button className={`bet-button ${requestsTab==='trade'?'bg-blue-500':''}`} onClick={()=>loadRequests('trade')}>المقايضات</button>
              <button className={`bet-button ${requestsTab==='destroy'?'bg-red-500':''}`} onClick={()=>loadRequests('destroy')}>التدمير</button>
            </div>
            <div>
              {requestsError && <span className="text-red-500">{requestsError}</span>}
              {requestsTab==='gift' && (requestsData.giftRequests?.length===0 ? <span className="text-gray-400">لا توجد طلبات هدايا</span> : requestsData.giftRequests.map((r:any)=>(
                <div key={r._id} className="mb-1">
                  <b>{r.from?.username||'مستخدم'}</b> أرسل لك {r.amount} × {r.item}
                  <span className="text-gray-400 mx-1">[{r.status==='pending'?'معلق':r.status==='accepted'?'مقبول':'مرفوض'}]</span>
                </div>
              )))}
              {requestsTab==='trade' && (requestsData.tradeRequests?.length===0 ? <span className="text-gray-400">لا توجد طلبات مقايضة</span> : requestsData.tradeRequests.map((r:any)=>(
                <div key={r._id} className="mb-1">
                  <b>{r.from?.username||'مستخدم'}</b> يطلب: {r.giveAmount} × {r.giveItem} مقابل {r.receiveAmount} × {r.receiveItem}
                  <span className="text-gray-400 mx-1">[{r.status==='pending'?'معلق':r.status==='accepted'?'مقبول':'مرفوض'}]</span>
                </div>
              )))}
              {requestsTab==='destroy' && (requestsData.destroyRequests?.length===0 ? <span className="text-gray-400">لا توجد طلبات تدمير</span> : requestsData.destroyRequests.map((r:any)=>(
                <div key={r._id} className="mb-1">
                  <b>{r.from?.username||'مستخدم'}</b> يريد تدمير {r.amount} × {r.item} لديك
                  <span className="text-gray-400 mx-1">[{r.status==='pending'?'معلق':r.status==='accepted'?'مقبول':'مرفوض'}]</span>
                </div>
              )))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainDashboard;