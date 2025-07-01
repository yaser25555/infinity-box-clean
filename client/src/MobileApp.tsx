import React, { useState, useEffect } from 'react';
import { apiService } from './services/api';
import { wsService } from './services/websocket';
import './MobileApp.css';

// مكونات الشاشات
const LoginScreen = ({ onLogin }: { onLogin: (user: any) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isRegistering) {
        const response = await apiService.register({ username, password, email });
        onLogin(response.user);
      } else {
        const response = await apiService.login({ username, password });
        onLogin(response.user);
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في المصادقة');
    }
  };

  return (
    <div className="mobile-login">
      <div className="login-header">
        <div className="app-logo">🎮</div>
        <h1 className="app-title">INFINITY BOX</h1>
        <p className="app-subtitle">منصة الألعاب الجماعية والمحادثة الصوتية</p>
      </div>

      <form className="login-form" onSubmit={handleAuth}>
        <input
          type="text"
          placeholder="اسم المستخدم"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        
        {isRegistering && (
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        )}
        
        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="login-button">
          {isRegistering ? 'إنشاء حساب' : 'تسجيل الدخول'}
        </button>

        <button 
          type="button"
          className="switch-mode"
          onClick={() => setIsRegistering(!isRegistering)}
        >
          {isRegistering ? 'لديك حساب؟ سجل دخولك' : 'ليس لديك حساب؟ أنشئ واحداً'}
        </button>
      </form>
    </div>
  );
};

// لعبة جمع الفواكه المحسّنة للجوال
const FruitCatchingGame = () => {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [goldCoins, setGoldCoins] = useState(0);
  const [basketPosition, setBasketPosition] = useState(50);
  const [fruits, setFruits] = useState<any[]>([]);
  const [gameActive, setGameActive] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);

  useEffect(() => {
    if (gameActive) {
      const interval = setInterval(() => {
        // إضافة فاكهة جديدة
        const newFruit = {
          id: Date.now(),
          x: Math.random() * 90 + 5,
          y: -10,
          type: Math.random() > 0.8 ? 'bomb' : 'fruit',
          emoji: Math.random() > 0.8 ? '💣' : ['🍎', '🍊', '🍌', '🍇'][Math.floor(Math.random() * 4)]
        };
        setFruits(prev => [...prev, newFruit]);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [gameActive]);

  useEffect(() => {
    if (gameActive) {
      const moveInterval = setInterval(() => {
        setFruits(prev => {
          return prev
            .map(fruit => ({ ...fruit, y: fruit.y + 5 }))
            .filter(fruit => {
              // التحقق من التقاط الفاكهة
              if (fruit.y >= 85 && fruit.y <= 95) {
                if (Math.abs(fruit.x - basketPosition) < 15) {
                  if (fruit.type === 'bomb') {
                    setLives(l => l - 1);
                  } else {
                    setScore(s => s + 10);
                    setGoldCoins(g => g + 5);
                  }
                  return false;
                }
              }
              return fruit.y < 100;
            });
        });
      }, 50);

      return () => clearInterval(moveInterval);
    }
  }, [gameActive, basketPosition]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touchX = e.touches[0].clientX;
    const diff = touchX - touchStartX;
    const movement = diff / window.innerWidth * 100;
    
    setBasketPosition(prev => {
      const newPos = prev + movement;
      return Math.max(10, Math.min(90, newPos));
    });
    
    setTouchStartX(touchX);
  };

  if (lives <= 0) {
    return (
      <div className="game-over">
        <h2>انتهت اللعبة!</h2>
        <p>النقاط: {score}</p>
        <p>الذهب المكتسب: {goldCoins} 🪙</p>
        <button onClick={() => window.location.reload()}>العب مرة أخرى</button>
      </div>
    );
  }

  return (
    <div className="fruit-game-mobile">
      <div className="game-header">
        <div>النقاط: {score}</div>
        <div>الحياة: {'❤️'.repeat(lives)}</div>
        <div>الذهب: {goldCoins} 🪙</div>
      </div>

      {!gameActive ? (
        <div className="game-start">
          <h2>لعبة جمع الفواكه</h2>
          <p>استخدم إصبعك لتحريك السلة وجمع الفواكه!</p>
          <button onClick={() => setGameActive(true)}>ابدأ اللعبة</button>
        </div>
      ) : (
        <div 
          className="game-area"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          {fruits.map(fruit => (
            <div
              key={fruit.id}
              className="falling-fruit"
              style={{
                left: `${fruit.x}%`,
                top: `${fruit.y}%`
              }}
            >
              {fruit.emoji}
            </div>
          ))}
          
          <div 
            className="basket"
            style={{ left: `${basketPosition}%` }}
          >
            🧺
          </div>
        </div>
      )}
    </div>
  );
};

// الشاشة الرئيسية
const HomeScreen = ({ user, onNavigate }: any) => {
  const [stats, setStats] = useState({
    onlinePlayers: 0,
    activeRooms: 0
  });

  useEffect(() => {
    // جلب الإحصائيات
    apiService.request('/stats').then(data => {
      setStats(data);
    }).catch(console.error);
  }, []);

  const games = [
    {
      id: 1,
      name: 'لعبة جمع الفواكه',
      icon: '🍎',
      description: 'اجمع الفواكه واربح النقاط الذهبية',
      action: () => onNavigate('fruit-game')
    },
    {
      id: 2,
      name: 'الغرف الجماعية',
      icon: '🎮',
      description: 'العب مع أصدقائك في غرف خاصة',
      action: () => onNavigate('multiplayer')
    },
    {
      id: 3,
      name: 'المحادثة الصوتية',
      icon: '🎤',
      description: 'تحدث مع الأصدقاء صوتياً',
      action: () => onNavigate('voice')
    },
    {
      id: 4,
      name: 'الملف الشخصي',
      icon: '👤',
      description: 'عرض وتعديل ملفك الشخصي',
      action: () => onNavigate('profile')
    }
  ];

  return (
    <div className="mobile-home">
      <div className="home-header">
        <h1>مرحباً {user.username}!</h1>
        <div className="stats">
          <div className="stat">
            <span className="stat-value">{stats.onlinePlayers}</span>
            <span className="stat-label">لاعب متصل</span>
          </div>
          <div className="stat">
            <span className="stat-value">{stats.activeRooms}</span>
            <span className="stat-label">غرفة نشطة</span>
          </div>
        </div>
      </div>

      <div className="games-grid">
        {games.map(game => (
          <div key={game.id} className="game-card" onClick={game.action}>
            <div className="game-icon">{game.icon}</div>
            <div className="game-name">{game.name}</div>
            <div className="game-desc">{game.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// غرف الألعاب الجماعية
const MultiplayerRooms = ({ onBack }: any) => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [roomName, setRoomName] = useState('');

  useEffect(() => {
    loadRooms();
    
    wsService.on('room_update', loadRooms);
    return () => {
      wsService.off('room_update', loadRooms);
    };
  }, []);

  const loadRooms = async () => {
    try {
      const response = await apiService.request('/game/rooms');
      setRooms(response.rooms || []);
    } catch (error) {
      console.error('Error loading rooms:', error);
    }
  };

  const createRoom = async () => {
    if (!roomName) return;
    
    wsService.send({
      type: 'room_create',
      data: {
        gameType: 'fruit_catching',
        settings: {
          maxPlayers: 4,
          isPrivate: false,
          gameMode: 'competitive',
          difficulty: 'medium'
        }
      },
      roomId: '',
      playerId: localStorage.getItem('userId') || '',
      timestamp: Date.now()
    });
    
    setShowCreateRoom(false);
    setRoomName('');
  };

  const joinRoom = (roomId: string) => {
    wsService.send({
      type: 'room_join',
      data: { roomId },
      roomId,
      playerId: localStorage.getItem('userId') || '',
      timestamp: Date.now()
    });
  };

  return (
    <div className="mobile-multiplayer">
      <div className="screen-header">
        <button onClick={onBack} className="back-button">⬅️</button>
        <h2>غرف الألعاب الجماعية</h2>
        <button onClick={() => setShowCreateRoom(true)} className="create-button">➕</button>
      </div>

      <div className="rooms-list">
        {rooms.map(room => (
          <div key={room.id} className="room-card">
            <div className="room-info">
              <h3>{room.name}</h3>
              <p>{room.players?.length || 0}/{room.settings?.maxPlayers || 4} لاعبين</p>
              <p>{room.settings?.isPrivate ? '🔒 خاصة' : '🌐 عامة'}</p>
            </div>
            <button onClick={() => joinRoom(room.id)} className="join-button">
              انضمام
            </button>
          </div>
        ))}
      </div>

      {showCreateRoom && (
        <div className="modal">
          <div className="modal-content">
            <h3>إنشاء غرفة جديدة</h3>
            <input
              type="text"
              placeholder="اسم الغرفة"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={() => setShowCreateRoom(false)}>إلغاء</button>
              <button onClick={createRoom}>إنشاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// الغرف الصوتية
const VoiceRooms = ({ onBack }: any) => {
  const [voiceRooms, setVoiceRooms] = useState<any[]>([]);
  const [currentRoom, setCurrentRoom] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    loadVoiceRooms();
  }, []);

  const loadVoiceRooms = async () => {
    try {
      const response = await apiService.request('/voice/rooms');
      setVoiceRooms(response.rooms || []);
    } catch (error) {
      console.error('Error loading voice rooms:', error);
    }
  };

  const joinVoiceRoom = (roomId: string) => {
    wsService.send({
      type: 'voice_room_join',
      roomId,
      userId: localStorage.getItem('userId') || '',
      data: { roomId },
      timestamp: Date.now()
    });
    
    const room = voiceRooms.find(r => r.id === roomId);
    setCurrentRoom(room);
  };

  const leaveVoiceRoom = () => {
    if (currentRoom) {
      wsService.send({
        type: 'voice_room_leave',
        roomId: currentRoom.id,
        userId: localStorage.getItem('userId') || '',
        data: {},
        timestamp: Date.now()
      });
      setCurrentRoom(null);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    wsService.send({
      type: isMuted ? 'voice_unmute' : 'voice_mute',
      roomId: currentRoom.id,
      userId: localStorage.getItem('userId') || '',
      data: {},
      timestamp: Date.now()
    });
  };

  if (currentRoom) {
    return (
      <div className="voice-room-active">
        <div className="screen-header">
          <button onClick={leaveVoiceRoom} className="back-button">⬅️</button>
          <h2>{currentRoom.name}</h2>
        </div>
        
        <div className="voice-users">
          {currentRoom.users?.map((user: any) => (
            <div key={user.id} className="voice-user">
              <div className="user-avatar">👤</div>
              <div className="user-name">{user.username}</div>
              <div className={`speaking-indicator ${user.isSpeaking ? 'speaking' : ''}`}>
                {user.isMuted ? '🔇' : '🔊'}
              </div>
            </div>
          ))}
        </div>
        
        <div className="voice-controls">
          <button onClick={toggleMute} className={`mute-button ${isMuted ? 'muted' : ''}`}>
            {isMuted ? '🔇' : '🎤'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-voice">
      <div className="screen-header">
        <button onClick={onBack} className="back-button">⬅️</button>
        <h2>الغرف الصوتية</h2>
      </div>

      <div className="voice-rooms-list">
        {voiceRooms.map(room => (
          <div key={room.id} className="voice-room-card">
            <div className="room-info">
              <h3>{room.name}</h3>
              <p>{room.userCount || 0}/{room.settings?.maxUsers || 20} مستخدم</p>
            </div>
            <button onClick={() => joinVoiceRoom(room.id)} className="join-button">
              انضمام 🎤
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// الملف الشخصي
const ProfileScreen = ({ user, onBack }: any) => {
  return (
    <div className="mobile-profile">
      <div className="screen-header">
        <button onClick={onBack} className="back-button">⬅️</button>
        <h2>الملف الشخصي</h2>
      </div>

      <div className="profile-content">
        <div className="profile-header">
          <div className="profile-avatar">👤</div>
          <h2>{user.username}</h2>
          <p className="player-id">رقم اللاعب: {user.playerId}</p>
          {user.isAdmin && <span className="admin-badge">مدير</span>}
        </div>

        <div className="profile-stats">
          <div className="stat-box">
            <span className="stat-icon">🪙</span>
            <span className="stat-value">{user.goldCoins?.toLocaleString() || 0}</span>
            <span className="stat-label">ذهب</span>
          </div>
          <div className="stat-box">
            <span className="stat-icon">🦪</span>
            <span className="stat-value">{user.pearls || 0}</span>
            <span className="stat-label">لؤلؤة</span>
          </div>
          <div className="stat-box">
            <span className="stat-icon">⭐</span>
            <span className="stat-value">{user.level || 1}</span>
            <span className="stat-label">المستوى</span>
          </div>
        </div>

        <div className="profile-actions">
          <button className="profile-action">
            <span>🛍️</span> المتجر
          </button>
          <button className="profile-action">
            <span>👥</span> الأصدقاء
          </button>
          <button className="profile-action">
            <span>🎁</span> الهدايا
          </button>
          <button className="profile-action">
            <span>⚙️</span> الإعدادات
          </button>
        </div>

        <button className="logout-button" onClick={() => {
          apiService.logout();
          window.location.reload();
        }}>
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
};

// التطبيق الرئيسي
export default function MobileApp() {
  const [user, setUser] = useState<any>(null);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await apiService.request('/auth/me');
          setUser(response.user);
        } catch (error) {
          console.error('Auth check failed:', error);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    setCurrentScreen('home');
  };

  const navigate = (screen: string) => {
    setCurrentScreen(screen);
  };

  if (loading) {
    return (
      <div className="mobile-loading">
        <div className="loading-icon">🎮</div>
        <h1>INFINITY BOX</h1>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="mobile-app">
      {currentScreen === 'home' && (
        <HomeScreen user={user} onNavigate={navigate} />
      )}
      {currentScreen === 'fruit-game' && (
        <div>
          <button onClick={() => navigate('home')} className="back-button">⬅️ رجوع</button>
          <FruitCatchingGame />
        </div>
      )}
      {currentScreen === 'multiplayer' && (
        <MultiplayerRooms onBack={() => navigate('home')} />
      )}
      {currentScreen === 'voice' && (
        <VoiceRooms onBack={() => navigate('home')} />
      )}
      {currentScreen === 'profile' && (
        <ProfileScreen user={user} onBack={() => navigate('home')} />
      )}
    </div>
  );
}