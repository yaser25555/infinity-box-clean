import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  TextInput,
  Modal,
  Dimensions,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// الألوان المخصصة
const colors = {
  primary: '#1e293b',
  secondary: '#3b82f6',
  accent: '#10b981',
  background: '#0f172a',
  surface: '#1e293b',
  text: '#f8fafc',
  textSecondary: '#cbd5e1',
  warning: '#f59e0b',
  error: '#ef4444',
  success: '#10b981'
};

// واجهة تسجيل الدخول
const LoginScreen = ({ onLogin }: { onLogin: (user: any) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');

  const handleAuth = async () => {
    try {
      const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
      const body = isRegistering 
        ? { username, password, email }
        : { username, password };

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const data = await response.json();
        await AsyncStorage.setItem('userToken', data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
        onLogin(data.user);
      }
    } catch (error) {
      console.error('خطأ في المصادقة:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.loginContainer}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🎮</Text>
          <Text style={styles.appName}>INFINITY BOX</Text>
          <Text style={styles.tagline}>منصة الألعاب الجماعية والمحادثة الصوتية</Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="اسم المستخدم"
            placeholderTextColor={colors.textSecondary}
            value={username}
            onChangeText={setUsername}
          />
          
          {isRegistering && (
            <TextInput
              style={styles.input}
              placeholder="البريد الإلكتروني"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
          )}
          
          <TextInput
            style={styles.input}
            placeholder="كلمة المرور"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.primaryButton} onPress={handleAuth}>
            <Text style={styles.buttonText}>
              {isRegistering ? 'إنشاء حساب' : 'تسجيل الدخول'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => setIsRegistering(!isRegistering)}
          >
            <Text style={styles.secondaryButtonText}>
              {isRegistering ? 'لديك حساب؟ سجل دخولك' : 'ليس لديك حساب؟ أنشئ واحداً'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

// الشاشة الرئيسية
const HomeScreen = () => {
  const [games] = useState([
    {
      id: 1,
      name: 'لعبة جمع الفواكه',
      icon: '🍎',
      players: 1250,
      description: 'اجمع الفواكه واربح النقاط الذهبية',
      featured: true
    },
    {
      id: 2,
      name: 'لعبة السباق',
      icon: '🏁',
      players: 890,
      description: 'سابق أصدقاءك في سباقات مثيرة',
      featured: false
    },
    {
      id: 3,
      name: 'لعبة الألغاز',
      icon: '🧩',
      players: 650,
      description: 'حل الألغاز مع فريقك',
      featured: false
    }
  ]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* رأس الصفحة */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>مرحباً بك في</Text>
        <Text style={styles.headerTitle}>INFINITY BOX</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>2,790</Text>
            <Text style={styles.statLabel}>لاعب متصل</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>156</Text>
            <Text style={styles.statLabel}>غرفة نشطة</Text>
          </View>
        </View>
      </View>

      {/* الألعاب المميزة */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>الألعاب المميزة</Text>
        {games.filter(game => game.featured).map(game => (
          <TouchableOpacity key={game.id} style={styles.featuredGameCard}>
            <View style={styles.gameIcon}>
              <Text style={styles.gameIconText}>{game.icon}</Text>
            </View>
            <View style={styles.gameInfo}>
              <Text style={styles.gameName}>{game.name}</Text>
              <Text style={styles.gameDescription}>{game.description}</Text>
              <Text style={styles.playersCount}>{game.players} لاعب متصل</Text>
            </View>
            <TouchableOpacity style={styles.playButton}>
              <Text style={styles.playButtonText}>العب الآن</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>

      {/* جميع الألعاب */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>جميع الألعاب</Text>
        <View style={styles.gamesGrid}>
          {games.map(game => (
            <TouchableOpacity key={game.id} style={styles.gameCard}>
              <Text style={styles.gameCardIcon}>{game.icon}</Text>
              <Text style={styles.gameCardName}>{game.name}</Text>
              <Text style={styles.gameCardPlayers}>{game.players} لاعب</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

// غرف الألعاب الجماعية
const MultiplayerRoomsScreen = () => {
  const [rooms, setRooms] = useState([
    {
      id: 1,
      name: 'غرفة المحترفين',
      gameType: 'fruit_catching',
      players: 3,
      maxPlayers: 4,
      isPrivate: false,
      difficulty: 'hard'
    },
    {
      id: 2,
      name: 'أصدقاء المدرسة',
      gameType: 'racing',
      players: 2,
      maxPlayers: 6,
      isPrivate: true,
      difficulty: 'medium'
    }
  ]);

  const [showCreateRoom, setShowCreateRoom] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.roomsHeader}>
        <Text style={styles.pageTitle}>غرف الألعاب الجماعية</Text>
        <TouchableOpacity 
          style={styles.createRoomButton}
          onPress={() => setShowCreateRoom(true)}
        >
          <Icon name="add" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.roomsList}>
        {rooms.map(room => (
          <TouchableOpacity key={room.id} style={styles.roomCard}>
            <View style={styles.roomHeader}>
              <Text style={styles.roomName}>{room.name}</Text>
              <View style={[styles.roomStatus, { backgroundColor: room.isPrivate ? colors.warning : colors.success }]}>
                <Text style={styles.roomStatusText}>
                  {room.isPrivate ? 'خاصة' : 'عامة'}
                </Text>
              </View>
            </View>
            
            <View style={styles.roomInfo}>
              <Text style={styles.roomGameType}>
                {room.gameType === 'fruit_catching' ? '🍎 جمع الفواكه' : 
                 room.gameType === 'racing' ? '🏁 سباق' : '🧩 ألغاز'}
              </Text>
              <Text style={styles.roomPlayers}>
                {room.players}/{room.maxPlayers} لاعبين
              </Text>
              <Text style={styles.roomDifficulty}>
                الصعوبة: {room.difficulty === 'easy' ? 'سهل' : 
                         room.difficulty === 'medium' ? 'متوسط' : 'صعب'}
              </Text>
            </View>
            
            <TouchableOpacity style={styles.joinRoomButton}>
              <Text style={styles.joinRoomButtonText}>انضمام</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* نافذة إنشاء غرفة */}
      <Modal visible={showCreateRoom} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>إنشاء غرفة جديدة</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="اسم الغرفة"
              placeholderTextColor={colors.textSecondary}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setShowCreateRoom(false)}
              >
                <Text style={styles.modalCancelText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCreateButton}>
                <Text style={styles.modalCreateText}>إنشاء</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// الغرف الصوتية
const VoiceRoomsScreen = () => {
  const [voiceRooms] = useState([
    {
      id: 1,
      name: 'الغرفة العامة',
      users: 12,
      maxUsers: 20,
      isPrivate: false
    },
    {
      id: 2,
      name: 'أصدقاء الجامعة',
      users: 5,
      maxUsers: 10,
      isPrivate: true
    }
  ]);

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>الغرف الصوتية</Text>
      
      <ScrollView style={styles.voiceRoomsList}>
        {voiceRooms.map(room => (
          <TouchableOpacity key={room.id} style={styles.voiceRoomCard}>
            <View style={styles.voiceRoomHeader}>
              <Text style={styles.voiceRoomName}>{room.name}</Text>
              <View style={styles.voiceRoomUsers}>
                <Icon name="people" size={16} color={colors.textSecondary} />
                <Text style={styles.voiceRoomUsersText}>
                  {room.users}/{room.maxUsers}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.joinVoiceButton}>
              <Icon name="mic" size={20} color={colors.text} />
              <Text style={styles.joinVoiceButtonText}>انضمام للمحادثة</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

// الملف الشخصي
const ProfileScreen = () => {
  const [user] = useState({
    username: 'اللاعب123',
    playerId: 'P-456789',
    level: 15,
    goldCoins: 25000,
    pearls: 45,
    profileImage: null
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.profileContent}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <Text style={styles.profileName}>{user.username}</Text>
        <Text style={styles.playerId}>رقم اللاعب: {user.playerId}</Text>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>المستوى {user.level}</Text>
        </View>
      </View>

      <View style={styles.currencySection}>
        <View style={styles.currencyItem}>
          <Text style={styles.currencyIcon}>🪙</Text>
          <View>
            <Text style={styles.currencyAmount}>{user.goldCoins.toLocaleString()}</Text>
            <Text style={styles.currencyLabel}>ذهب</Text>
          </View>
        </View>
        
        <View style={styles.currencyItem}>
          <Text style={styles.currencyIcon}>🦪</Text>
          <View>
            <Text style={styles.currencyAmount}>{user.pearls}</Text>
            <Text style={styles.currencyLabel}>لؤلؤة</Text>
          </View>
        </View>
      </View>

      <View style={styles.profileActions}>
        <TouchableOpacity style={styles.profileActionButton}>
          <Icon name="settings" size={24} color={colors.text} />
          <Text style={styles.profileActionText}>الإعدادات</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.profileActionButton}>
          <Icon name="history" size={24} color={colors.text} />
          <Text style={styles.profileActionText}>السجل</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.profileActionButton}>
          <Icon name="people" size={24} color={colors.text} />
          <Text style={styles.profileActionText}>الأصدقاء</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// التبويبات الرئيسية
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';
          
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Multiplayer') iconName = 'games';
          else if (route.name === 'Voice') iconName = 'record-voice-over';
          else if (route.name === 'Profile') iconName = 'person';
          
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.primary,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8
        },
        headerShown: false
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ tabBarLabel: 'الرئيسية' }}
      />
      <Tab.Screen 
        name="Multiplayer" 
        component={MultiplayerRoomsScreen}
        options={{ tabBarLabel: 'الألعاب' }}
      />
      <Tab.Screen 
        name="Voice" 
        component={VoiceRoomsScreen}
        options={{ tabBarLabel: 'الصوت' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'الملف' }}
      />
    </Tab.Navigator>
  );
};

// التطبيق الرئيسي
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('خطأ في فحص حالة المصادقة:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>🎮</Text>
        <Text style={styles.loadingTitle}>INFINITY BOX</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <MainTabs /> : <LoginScreen onLogin={setUser} />}
    </NavigationContainer>
  );
}

// الأنماط
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // شاشة تسجيل الدخول
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 80,
    marginBottom: 10,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  tagline: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    color: colors.text,
    fontSize: 16,
    textAlign: 'right',
  },
  primaryButton: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    alignItems: 'center',
    padding: 10,
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  
  // الشاشة الرئيسية
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
    textAlign: 'right',
  },
  
  // بطاقة اللعبة المميزة
  featuredGameCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  gameIcon: {
    width: 60,
    height: 60,
    backgroundColor: colors.secondary,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  gameIconText: {
    fontSize: 30,
  },
  gameInfo: {
    flex: 1,
  },
  gameName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
    textAlign: 'right',
  },
  gameDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 5,
    textAlign: 'right',
  },
  playersCount: {
    fontSize: 12,
    color: colors.accent,
    textAlign: 'right',
  },
  playButton: {
    backgroundColor: colors.accent,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  playButtonText: {
    color: colors.text,
    fontWeight: 'bold',
  },
  
  // شبكة الألعاب
  gamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gameCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 15,
    width: (width - 60) / 2,
    alignItems: 'center',
    marginBottom: 15,
  },
  gameCardIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  gameCardName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 5,
  },
  gameCardPlayers: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  
  // غرف الألعاب
  roomsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  createRoomButton: {
    backgroundColor: colors.secondary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomsList: {
    flex: 1,
    padding: 20,
  },
  roomCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  roomName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  roomStatus: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  roomStatusText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: 'bold',
  },
  roomInfo: {
    marginBottom: 15,
  },
  roomGameType: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 5,
  },
  roomPlayers: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  roomDifficulty: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  joinRoomButton: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  joinRoomButtonText: {
    color: colors.text,
    fontWeight: 'bold',
  },
  
  // الغرف الصوتية
  voiceRoomsList: {
    flex: 1,
    padding: 20,
  },
  voiceRoomCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  voiceRoomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  voiceRoomName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  voiceRoomUsers: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voiceRoomUsersText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 5,
  },
  joinVoiceButton: {
    backgroundColor: colors.secondary,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinVoiceButtonText: {
    color: colors.text,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  
  // الملف الشخصي
  profileContent: {
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    backgroundColor: colors.surface,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 50,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  playerId: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  levelBadge: {
    backgroundColor: colors.secondary,
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  levelText: {
    color: colors.text,
    fontWeight: 'bold',
  },
  
  currencySection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  currencyItem: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    flex: 1,
    marginHorizontal: 5,
  },
  currencyIcon: {
    fontSize: 30,
    marginBottom: 10,
  },
  currencyAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  currencyLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  
  profileActions: {
    gap: 15,
  },
  profileActionButton: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileActionText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 15,
  },
  
  // النوافذ المنبثقة
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    width: width - 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 15,
    color: colors.text,
    marginBottom: 20,
    textAlign: 'right',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  modalCancelText: {
    color: colors.textSecondary,
  },
  modalCreateButton: {
    flex: 1,
    backgroundColor: colors.secondary,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  modalCreateText: {
    color: colors.text,
    fontWeight: 'bold',
  },
  
  // شاشة التحميل
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 80,
    marginBottom: 20,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
});