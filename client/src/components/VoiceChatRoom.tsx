import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Settings, 
  Users, 
  MessageCircle,
  Send,
  Smile,
  ChevronDown,
  ChevronUp,
  Phone,
  PhoneOff,
  Crown,
  Shield,
  Star,
  LogOut,
  Coins,
  Box,
  Infinity
} from 'lucide-react';
import UserAvatar from './UserAvatar';
import ChatMessage from './ChatMessage';
import EmojiPicker from './EmojiPicker';
import { wsService } from '../services/websocket';
import { VoiceUser } from '../types';

interface VoiceChatRoomProps {
  userData: any;
  onLogout: () => void;
}

// نوع محلي لقبول جميع أنواع الرسائل
interface LocalMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
  type: 'user' | 'system' | 'admin';
}

const VoiceChatRoom: React.FC<VoiceChatRoomProps> = ({ userData, onLogout }) => {
  const [users, setUsers] = useState<VoiceUser[]>([]);

  const [messages, setMessages] = useState<LocalMessage[]>([
    { id: '1', sender: 'النظام', text: 'مرحباً بكم في INFINITY BOX - غرفة المحادثة الصوتية', timestamp: new Date(), type: 'system' },
    { id: '2', sender: 'أحمد محمد', text: 'أهلاً وسهلاً بالجميع في INFINITY BOX!', timestamp: new Date(), type: 'user' },
    { id: '3', sender: 'فاطمة علي', text: 'كيف حالكم اليوم؟ هل جربتم الألعاب الجديدة؟', timestamp: new Date(), type: 'user' },
  ]);

  const [currentUser] = useState<VoiceUser>({ 
    id: 'current', 
    username: userData?.username || 'أنت', 
    isSpeaking: false, 
    isMuted: false, 
    isDeafened: false, 
    role: userData?.isAdmin ? 'admin' : 'member',
    isAdmin: userData?.isAdmin || false,
    coins: 500,
    level: 2,
    experience: 750,
    joinedAt: new Date(),
    lastActive: new Date(),
    status: 'online'
  });

  const [isMicOn, setIsMicOn] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [roomStats, setRoomStats] = useState({ totalUsers: 5, speakingUsers: 1 });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);

  const [peers, setPeers] = useState<{ [id: string]: RTCPeerConnection }>({});
  const [remoteStreams, setRemoteStreams] = useState<{ [id: string]: MediaStream }>({});

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Connect and authenticate with WebSocket
    wsService.connect().then(() => {
      // Send authentication info
      wsService.send({
        type: 'user_auth',
        userId: userData?.id?.toString() || '',
        username: userData?.username || 'ضيف',
        isAdmin: userData?.isAdmin || false
      });
      
      // Request room users
      setTimeout(() => {
        wsService.send({ type: 'get_room_users' });
      }, 500);
    });

    // Setup WebSocket listeners
    wsService.on('voice_room_users', (message: any) => {
      if (message.users) {
        const voiceUsers = message.users.map((user: any) => ({
          id: user.username,
          username: user.username,
          isSpeaking: user.isSpeaking || false,
          isMuted: user.isMuted || false,
          isDeafened: false,
          role: user.isAdmin ? 'admin' : 'member',
          isAdmin: user.isAdmin || false,
          coins: 0,
          level: 1,
          experience: 0,
          joinedAt: new Date(),
          lastActive: new Date(),
          status: 'online'
        }));
        
        setUsers(voiceUsers);
        setRoomStats({
          totalUsers: voiceUsers.length,
          speakingUsers: voiceUsers.filter((u: any) => u.isSpeaking).length
        });
      }
    });

    wsService.on('chat_message', (message: any) => {
      if (message.sender && message.text) {
        const newMessage: LocalMessage = {
          id: Date.now().toString(),
          sender: message.sender,
          text: message.text,
          timestamp: new Date(message.timestamp || Date.now()),
          type: message.isAdmin ? 'admin' : 'user'
        };
        setMessages(prev => [...prev, newMessage]);
      }
    });

    wsService.on('auth_success', (message: any) => {
      const systemMessage: LocalMessage = {
        id: Date.now().toString(),
        sender: 'النظام',
        text: message.message || 'تم الاتصال بالمحادثة الصوتية بنجاح',
        timestamp: new Date(),
        type: 'system'
      };
      setMessages(prev => [...prev, systemMessage]);
    });

    wsService.on('voice_status_update', (message: any) => {
      setUsers(prev => prev.map(user => 
        user.username === message.username 
          ? { ...user, isMuted: message.isMuted, isSpeaking: message.isSpeaking }
          : user
      ));
    });

    wsService.on('player_joined', (message: any) => {
      if (message.username) {
        const systemMessage: LocalMessage = {
          id: Date.now().toString(),
          sender: 'النظام',
          text: `انضم ${message.username} إلى INFINITY BOX`,
          timestamp: new Date(),
          type: 'system'
        };
        setMessages(prev => [...prev, systemMessage]);
      }
    });

    wsService.on('player_left', (message: any) => {
      if (message.username) {
        const systemMessage: LocalMessage = {
          id: Date.now().toString(),
          sender: 'النظام',
          text: `غادر ${message.username} من INFINITY BOX`,
          timestamp: new Date(),
          type: 'system'
        };
        setMessages(prev => [...prev, systemMessage]);
      }
    });

    // Simulate speaking users
    const interval = setInterval(() => {
      setUsers(prevUsers => 
        prevUsers.map(user => ({
          ...user,
          isSpeaking: Math.random() > 0.8 && !user.isMuted
        }))
      );
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const toggleMic = async () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
      setIsMicOn(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setLocalStream(stream);
      setIsMicOn(true);
      setMicError(null);
    } catch (err) {
      setMicError('تعذر الوصول للمايكروفون');
      setIsMicOn(false);
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };

  const toggleConnection = () => {
    setIsConnected(!isConnected);
    if (isConnected) {
      wsService.disconnect();
    } else {
      wsService.connect();
    }
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        type: 'chat_message' as const,
        sender: currentUser.username,
        text: newMessage.trim(),
        roomId: 'main-room'
      };

      wsService.send(message);
      
      // Add message locally for immediate feedback
      const localMessage: LocalMessage = {
        id: Date.now().toString(),
        sender: currentUser.username,
        text: newMessage.trim(),
        timestamp: new Date(),
        type: 'user'
      };
      setMessages(prev => [...prev, localMessage]);
      setNewMessage('');
      chatInputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    chatInputRef.current?.focus();
  };

  const getRoleIcon = (role: VoiceUser['role']) => {
    switch (role) {
      case 'admin': return <Crown className="w-3 h-3 text-yellow-400" />;
      case 'moderator': return <Shield className="w-3 h-3 text-blue-400" />;
      default: return null;
    }
  };

  useEffect(() => {
    if (!localStream) return;
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(localStream);
    const analyser = audioContext.createAnalyser();
    source.connect(analyser);
    const dataArray = new Uint8Array(analyser.fftSize);
    const updateVolume = () => {
      analyser.getByteTimeDomainData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += Math.abs(dataArray[i] - 128);
      }
      setVolume(sum / dataArray.length);
      requestAnimationFrame(updateVolume);
    };
    updateVolume();
    return () => {
      audioContext.close();
    };
  }, [localStream]);

  // منطق signaling عبر WebSocket
  useEffect(() => {
    if (!localStream || !currentUser?.id) return;

    // عند الانضمام للغرفة
    if (wsService.ws && wsService.ws.readyState === WebSocket.OPEN) {
      wsService.ws.send(JSON.stringify({ type: 'join_voice', userId: currentUser.id }));
    }

    // استقبال رسائل signaling
    wsService.ws?.addEventListener('message', (event) => {
      (async () => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'signal') {
            const { from, signal } = data;
            if (from === currentUser.id) return;
            let pc = peers[from];
            if (!pc) {
              pc = createPeerConnection(from);
              setPeers(prev => ({ ...prev, [from]: pc }));
            }
            if (signal.sdp) {
              await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
              if (signal.sdp.type === 'offer') {
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                wsService.ws?.send(JSON.stringify({ type: 'signal', to: from, from: currentUser.id, signal: { sdp: pc.localDescription } }));
              }
            }
            if (signal.candidate) {
              await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
            }
          }
        } catch {}
      })();
    });

    // استقبال قائمة المستخدمين الحاليين
    wsService.on('voice_room_users', (msg: any) => {
      if (!msg.users) return;
      msg.users.forEach((user: any) => {
        if (user.id !== currentUser.id && !peers[user.id]) {
          const pc = createPeerConnection(user.id);
          setPeers(prev => ({ ...prev, [user.id]: pc }));
          // ابدأ التفاوض
          if (localStream) {
            localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
          }
          pc.createOffer().then(offer => {
            pc.setLocalDescription(offer).then(() => {
              wsService.ws?.send(JSON.stringify({ type: 'signal', to: user.id, from: currentUser.id, signal: { sdp: offer } }));
            });
          });
        }
      });
    });

    // دالة إنشاء PeerConnection
    function createPeerConnection(peerId: string) {
      const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
      // أضف تراك الصوت
      if (localStream) {
        localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
      }
      // عند استقبال تراك صوت جديد
      pc.ontrack = (event) => {
        setRemoteStreams(prev => ({ ...prev, [peerId]: event.streams[0] }));
      };
      // عند توليد ICE candidate
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          wsService.ws?.send(JSON.stringify({ type: 'signal', to: peerId, from: currentUser.id, signal: { candidate: event.candidate } }));
        }
      };
      return pc;
    }

    // تنظيف الاتصالات عند الخروج
    return () => {
      Object.values(peers).forEach(pc => pc.close());
      setPeers({});
      setRemoteStreams({});
    };
  // eslint-disable-next-line
  }, [localStream, currentUser?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 overflow-hidden hidden sm:block">
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* رأس الغرفة */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/20">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <div className="flex items-center gap-2">
                <Box className="w-6 h-6 text-purple-400" />
                <Infinity className="w-4 h-4 text-blue-400" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                INFINITY BOX
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Users className="w-4 h-4" />
                <span>{roomStats.totalUsers}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* معلومات المستخدم */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/20 flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 font-semibold">{currentUser.coins}</span>
              </div>
              <div className="w-px h-4 bg-white/20"></div>
              <span className="text-sm text-gray-300">مرحباً، {currentUser.username}</span>
              {currentUser.isAdmin && <Crown className="w-4 h-4 text-yellow-400" />}
            </div>

            {/* زر تسجيل الخروج */}
            <button
              onClick={onLogout}
              className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-xl px-4 py-2 text-red-300 hover:text-red-200 transition-all duration-200 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              خروج
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* منطقة المستخدمين */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-4 sm:p-8 border border-white/10 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  المتصلون في INFINITY BOX ({users.length})
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  {roomStats.speakingUsers} يتحدث الآن
                </div>
              </div>

              {/* شبكة المستخدمين */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-8">
                {users.map((user) => (
                  <UserAvatar
                    key={user.id}
                    user={user}
                    roleIcon={getRoleIcon(user.role)}
                  />
                ))}
              </div>

              {/* أدوات التحكم الصوتي */}
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 w-full">
                <button
                  onClick={toggleMic}
                  className={`relative group p-4 rounded-2xl transition-all duration-300 transform hover:scale-110 ${
                    isMicOn 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/25' 
                      : 'bg-gradient-to-r from-red-500 to-pink-500 shadow-lg shadow-red-500/25'
                  }`}
                >
                  {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {isMicOn ? 'إيقاف المايك' : 'تشغيل المايك'}
                  </div>
                </button>

                {micError && <div style={{ color: 'red' }}>{micError}</div>}

                <div style={{ width: 100, height: 10, background: '#eee', marginTop: 8 }}>
                  <div style={{ width: `${volume * 10}px`, height: 10, background: '#4ade80' }} />
                </div>

                <button
                  onClick={toggleSpeaker}
                  className={`relative group p-4 rounded-2xl transition-all duration-300 transform hover:scale-110 ${
                    isSpeakerOn 
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25' 
                      : 'bg-gradient-to-r from-gray-500 to-slate-500 shadow-lg shadow-gray-500/25'
                  }`}
                >
                  {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {isSpeakerOn ? 'إيقاف السماعة' : 'تشغيل السماعة'}
                  </div>
                </button>

                <button
                  onClick={toggleConnection}
                  className={`relative group p-4 rounded-2xl transition-all duration-300 transform hover:scale-110 ${
                    isConnected 
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 shadow-lg shadow-red-500/25' 
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/25'
                  }`}
                >
                  {isConnected ? <PhoneOff className="w-6 h-6" /> : <Phone className="w-6 h-6" />}
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {isConnected ? 'قطع الاتصال' : 'الاتصال'}
                  </div>
                </button>

                <button className="relative group p-4 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 shadow-lg shadow-purple-500/25 transition-all duration-300 transform hover:scale-110">
                  <Settings className="w-6 h-6" />
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    الإعدادات
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* منطقة الدردشة */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
              {/* رأس الدردشة */}
              <div className="flex items-center justify-between p-3 sm:p-4 border-b border-white/10">
                <h3 className="font-semibold flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-purple-400" />
                  دردشة INFINITY BOX
                </h3>
                <button
                  onClick={() => setIsChatVisible(!isChatVisible)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  {isChatVisible ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {isChatVisible && (
                <>
                  {/* رسائل الدردشة */}
                  <div className="h-60 sm:h-96 overflow-y-auto p-2 sm:p-4 space-y-3">
                    {messages.map((message) => (
                      <ChatMessage key={message.id} message={message} />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* إدخال الرسالة */}
                  <div className="p-2 sm:p-4 border-t border-white/10">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="relative">
                        <button
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <Smile className="w-5 h-5 text-yellow-400" />
                        </button>
                        {showEmojiPicker && (
                          <EmojiPicker onEmojiSelect={addEmoji} onClose={() => setShowEmojiPicker(false)} />
                        )}
                      </div>
                      
                      <input
                        ref={chatInputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="اكتب رسالتك في INFINITY BOX..."
                        className="flex-1 bg-white/10 border border-white/20 rounded-xl px-2 sm:px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                      />
                      
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* شريط الحالة السفلي */}
        <div className="mt-4 sm:mt-8 text-center overflow-x-auto">
          <div className="inline-flex items-center gap-2 sm:gap-4 bg-white/5 backdrop-blur-md rounded-2xl px-3 sm:px-6 py-2 sm:py-3 border border-white/10">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm text-gray-300">
                {isConnected ? 'متصل بـ INFINITY BOX' : 'غير متصل'}
              </span>
            </div>
            <div className="w-px h-4 bg-white/20"></div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>جودة عالية</span>
            </div>
            <div className="w-px h-4 bg-white/20"></div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Box className="w-4 h-4 text-purple-400" />
              <span>المستوى {currentUser.level}</span>
            </div>
          </div>
        </div>

        {/* تشغيل الصوت الوارد من جميع المستخدمين */}
        {Object.entries(remoteStreams).map(([id, stream]) => (
          <audio key={id} autoPlay playsInline ref={audio => { if (audio) audio.srcObject = stream; }} />
        ))}
      </div>
    </div>
  );
};

export default VoiceChatRoom;