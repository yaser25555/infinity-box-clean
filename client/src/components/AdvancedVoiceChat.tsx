import React, { useState, useEffect, useRef } from 'react';
import { wsService } from '../services/websocket';
import { apiService } from '../services/api';

interface VoiceRoom {
  id: string;
  name: string;
  description?: string;
  users: VoiceUser[];
  settings: {
    maxUsers: number;
    isPrivate: boolean;
    autoMute: boolean;
    noiseReduction: boolean;
    echoCancellation: boolean;
  };
  ownerId: string;
  isTemporary: boolean;
  userCount: number;
}

interface VoiceUser {
  id: string;
  username: string;
  isAdmin: boolean;
  isMuted: boolean;
  isSpeaking: boolean;
  isDeafened: boolean;
  volume: number;
  quality: 'low' | 'medium' | 'high';
  micEnabled: boolean;
  speakerEnabled: boolean;
  lastActivity: Date;
}

export default function AdvancedVoiceChat() {
  const [voiceRooms, setVoiceRooms] = useState<VoiceRoom[]>([]);
  const [currentVoiceRoom, setCurrentVoiceRoom] = useState<VoiceRoom | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [audioSettings, setAudioSettings] = useState({
    micEnabled: true,
    speakerEnabled: true,
    volume: 100,
    quality: 'medium' as 'low' | 'medium' | 'high',
    noiseReduction: true,
    echoCancellation: true
  });
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [newRoomData, setNewRoomData] = useState({
    name: '',
    description: '',
    isPrivate: false,
    password: '',
    maxUsers: 10
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const recordingRef = useRef<MediaRecorder | null>(null);

  const username = localStorage.getItem('username') || 'مجهول';
  const userId = localStorage.getItem('userId') || '1';
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  useEffect(() => {
    loadVoiceRooms();
    setupWebSocketHandlers();
    initializeAudioContext();
    
    return () => {
      cleanupVoiceChat();
      cleanupWebSocketHandlers();
    };
  }, []);

  const loadVoiceRooms = async () => {
    try {
      const response = await apiService.request('/voice/rooms');
      setVoiceRooms(response.rooms || []);
    } catch (error) {
      console.error('خطأ في تحميل الغرف الصوتية:', error);
    }
  };

  const setupWebSocketHandlers = () => {
    wsService.on('voice_room_join', handleVoiceRoomJoined);
    wsService.on('voice_room_leave', handleVoiceRoomLeft);
    wsService.on('voice_room_create', handleVoiceRoomCreated);
    wsService.on('voice_user_status', handleVoiceUserStatus);
    wsService.on('voice_start_speaking', handleUserStartSpeaking);
    wsService.on('voice_stop_speaking', handleUserStopSpeaking);
    wsService.on('voice_audio_data', handleAudioData);
    wsService.on('voice_mute', handleUserMuted);
    wsService.on('voice_unmute', handleUserUnmuted);
    wsService.on('voice_room_settings', handleRoomSettingsChanged);
    wsService.on('voice_echo_test', handleEchoTest);
  };

  const cleanupWebSocketHandlers = () => {
    wsService.off('voice_room_join', handleVoiceRoomJoined);
    wsService.off('voice_room_leave', handleVoiceRoomLeft);
    wsService.off('voice_room_create', handleVoiceRoomCreated);
    wsService.off('voice_user_status', handleVoiceUserStatus);
    wsService.off('voice_start_speaking', handleUserStartSpeaking);
    wsService.off('voice_stop_speaking', handleUserStopSpeaking);
    wsService.off('voice_audio_data', handleAudioData);
    wsService.off('voice_mute', handleUserMuted);
    wsService.off('voice_unmute', handleUserUnmuted);
    wsService.off('voice_room_settings', handleRoomSettingsChanged);
    wsService.off('voice_echo_test', handleEchoTest);
  };

  const initializeAudioContext = async () => {
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      console.log('تم تهيئة السياق الصوتي بنجاح');
    } catch (error) {
      console.error('خطأ في تهيئة السياق الصوتي:', error);
    }
  };

  const startMicrophone = async () => {
    try {
      const constraints = {
        audio: {
          echoCancellation: audioSettings.echoCancellation,
          noiseSuppression: audioSettings.noiseReduction,
          autoGainControl: true,
          sampleRate: 44100
        }
      };

      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia(constraints);
      
      // إعداد تسجيل الصوت
      recordingRef.current = new MediaRecorder(mediaStreamRef.current, {
        mimeType: 'audio/webm;codecs=opus'
      });

      recordingRef.current.ondataavailable = (event) => {
        if (event.data.size > 0 && currentVoiceRoom) {
          // إرسال البيانات الصوتية عبر WebSocket
          wsService.send({
            type: 'voice_audio_data',
            roomId: currentVoiceRoom.id,
            userId,
            data: {
              audioData: event.data,
              quality: audioSettings.quality
            },
            timestamp: Date.now()
          });
        }
      };

      // بدء التسجيل المستمر
      recordingRef.current.start(100); // إرسال كل 100ms

      setAudioSettings(prev => ({ ...prev, micEnabled: true }));
      console.log('تم تشغيل الميكروفون بنجاح');
    } catch (error) {
      console.error('خطأ في تشغيل الميكروفون:', error);
      setAudioSettings(prev => ({ ...prev, micEnabled: false }));
    }
  };

  const stopMicrophone = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    if (recordingRef.current) {
      recordingRef.current.stop();
      recordingRef.current = null;
    }

    setAudioSettings(prev => ({ ...prev, micEnabled: false }));
  };

  const handleVoiceRoomJoined = (message: any) => {
    const { room } = message.data;
    setCurrentVoiceRoom(room);
    setIsConnecting(false);
    
    // بدء الميكروفون إذا كان مُفعلاً
    if (audioSettings.micEnabled) {
      startMicrophone();
    }
  };

  const handleVoiceRoomLeft = (message: any) => {
    setCurrentVoiceRoom(null);
    stopMicrophone();
    cleanupAudioElements();
  };

  const handleVoiceRoomCreated = (message: any) => {
    const { room } = message.data;
    setCurrentVoiceRoom(room);
    loadVoiceRooms();
    setIsCreatingRoom(false);
  };

  const handleVoiceUserStatus = (message: any) => {
    const { user, action } = message.data;
    
    if (currentVoiceRoom) {
      if (action === 'joined') {
        const updatedRoom = {
          ...currentVoiceRoom,
          users: [...currentVoiceRoom.users, user],
          userCount: currentVoiceRoom.userCount + 1
        };
        setCurrentVoiceRoom(updatedRoom);
      } else if (action === 'left') {
        const updatedRoom = {
          ...currentVoiceRoom,
          users: currentVoiceRoom.users.filter(u => u.id !== user.id),
          userCount: currentVoiceRoom.userCount - 1
        };
        setCurrentVoiceRoom(updatedRoom);
        
        // إزالة عنصر الصوت للمستخدم المغادر
        const audioElement = audioElementsRef.current.get(user.id);
        if (audioElement) {
          audioElement.pause();
          audioElementsRef.current.delete(user.id);
        }
      }
    }
  };

  const handleUserStartSpeaking = (message: any) => {
    if (currentVoiceRoom) {
      const updatedUsers = currentVoiceRoom.users.map(user =>
        user.id === message.userId ? { ...user, isSpeaking: true } : user
      );
      setCurrentVoiceRoom({ ...currentVoiceRoom, users: updatedUsers });
    }
  };

  const handleUserStopSpeaking = (message: any) => {
    if (currentVoiceRoom) {
      const updatedUsers = currentVoiceRoom.users.map(user =>
        user.id === message.userId ? { ...user, isSpeaking: false } : user
      );
      setCurrentVoiceRoom({ ...currentVoiceRoom, users: updatedUsers });
    }
  };

  const handleAudioData = async (message: any) => {
    const { audioData, senderId, senderName } = message.data;
    
    if (!audioSettings.speakerEnabled || senderId === userId) return;

    try {
      // إنشاء أو الحصول على عنصر الصوت للمرسل
      let audioElement = audioElementsRef.current.get(senderId);
      if (!audioElement) {
        audioElement = new Audio();
        audioElement.volume = audioSettings.volume / 100;
        audioElementsRef.current.set(senderId, audioElement);
      }

      // تشغيل البيانات الصوتية
      const audioBlob = new Blob([audioData], { type: 'audio/webm;codecs=opus' });
      const audioUrl = URL.createObjectURL(audioBlob);
      audioElement.src = audioUrl;
      
      await audioElement.play();
      
      // تنظيف URL بعد التشغيل
      audioElement.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };
    } catch (error) {
      console.error('خطأ في تشغيل الصوت:', error);
    }
  };

  const handleUserMuted = (message: any) => {
    if (currentVoiceRoom) {
      const updatedUsers = currentVoiceRoom.users.map(user =>
        user.id === message.userId ? { ...user, isMuted: true, isSpeaking: false } : user
      );
      setCurrentVoiceRoom({ ...currentVoiceRoom, users: updatedUsers });
    }
  };

  const handleUserUnmuted = (message: any) => {
    if (currentVoiceRoom) {
      const updatedUsers = currentVoiceRoom.users.map(user =>
        user.id === message.userId ? { ...user, isMuted: false } : user
      );
      setCurrentVoiceRoom({ ...currentVoiceRoom, users: updatedUsers });
    }
  };

  const handleRoomSettingsChanged = (message: any) => {
    const { settings } = message.data;
    if (currentVoiceRoom) {
      setCurrentVoiceRoom({ ...currentVoiceRoom, settings });
    }
  };

  const handleEchoTest = (message: any) => {
    // تشغيل صوت اختبار الصدى
    console.log('اختبار الصدى مكتمل:', message.data.delay + 'ms');
  };

  const joinVoiceRoom = async (roomId: string, password?: string) => {
    setIsConnecting(true);
    
    try {
      wsService.send({
        type: 'voice_room_join',
        roomId,
        userId,
        data: {
          roomId,
          userInfo: { id: userId, username, isAdmin },
          password
        },
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('خطأ في الانضمام للغرفة الصوتية:', error);
      setIsConnecting(false);
    }
  };

  const leaveVoiceRoom = () => {
    if (currentVoiceRoom) {
      wsService.send({
        type: 'voice_room_leave',
        roomId: currentVoiceRoom.id,
        userId,
        data: {},
        timestamp: Date.now()
      });
    }
  };

  const createVoiceRoom = async () => {
    try {
      wsService.send({
        type: 'voice_room_create',
        roomId: '',
        userId,
        data: {
          roomData: {
            name: newRoomData.name,
            description: newRoomData.description,
            isPrivate: newRoomData.isPrivate,
            password: newRoomData.password,
            maxUsers: newRoomData.maxUsers
          },
          userInfo: { id: userId, username, isAdmin }
        },
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('خطأ في إنشاء الغرفة الصوتية:', error);
    }
  };

  const toggleMute = () => {
    const newMutedState = !audioSettings.micEnabled;
    
    if (newMutedState) {
      stopMicrophone();
    } else {
      startMicrophone();
    }

    if (currentVoiceRoom) {
      wsService.send({
        type: newMutedState ? 'voice_mute' : 'voice_unmute',
        roomId: currentVoiceRoom.id,
        userId,
        data: {},
        timestamp: Date.now()
      });
    }
  };

  const toggleSpeaker = () => {
    const newSpeakerState = !audioSettings.speakerEnabled;
    setAudioSettings(prev => ({ ...prev, speakerEnabled: newSpeakerState }));
    
    // تطبيق على جميع عناصر الصوت
    audioElementsRef.current.forEach(audio => {
      audio.muted = !newSpeakerState;
    });
  };

  const changeVolume = (volume: number) => {
    setAudioSettings(prev => ({ ...prev, volume }));
    
    // تطبيق على جميع عناصر الصوت
    audioElementsRef.current.forEach(audio => {
      audio.volume = volume / 100;
    });
  };

  const changeQuality = (quality: 'low' | 'medium' | 'high') => {
    setAudioSettings(prev => ({ ...prev, quality }));
    
    if (currentVoiceRoom) {
      wsService.send({
        type: 'voice_quality_change',
        roomId: currentVoiceRoom.id,
        userId,
        data: { quality, volume: audioSettings.volume },
        timestamp: Date.now()
      });
    }
  };

  const runEchoTest = () => {
    if (currentVoiceRoom && mediaStreamRef.current) {
      // إنشاء بيانات صوتية اختبارية
      const testAudio = new Blob(['test audio data'], { type: 'audio/webm' });
      
      wsService.send({
        type: 'voice_echo_test',
        roomId: currentVoiceRoom.id,
        userId,
        data: { audioData: testAudio },
        timestamp: Date.now()
      });
    }
  };

  const cleanupAudioElements = () => {
    audioElementsRef.current.forEach(audio => {
      audio.pause();
      audio.src = '';
    });
    audioElementsRef.current.clear();
  };

  const cleanupVoiceChat = () => {
    stopMicrophone();
    cleanupAudioElements();
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  if (currentVoiceRoom) {
    return (
      <div className="bg-slate-900 text-white p-6 rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">{currentVoiceRoom.name}</h2>
            {currentVoiceRoom.description && (
              <p className="text-slate-300 text-sm">{currentVoiceRoom.description}</p>
            )}
          </div>
          <button
            onClick={leaveVoiceRoom}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
          >
            مغادرة المحادثة
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* المشاركون في المحادثة */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">
                المشاركون ({currentVoiceRoom.userCount}/{currentVoiceRoom.settings.maxUsers})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {currentVoiceRoom.users.map((user) => (
                  <div key={user.id} className="bg-slate-700 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${
                        user.isSpeaking ? 'bg-green-500 animate-pulse' : 
                        user.isMuted ? 'bg-red-500' : 'bg-gray-500'
                      }`}></div>
                      <span className="font-medium text-sm">{user.username}</span>
                      {user.isAdmin && <span className="text-xs bg-blue-600 px-1 rounded">مدير</span>}
                    </div>
                    <div className="text-xs text-slate-300">
                      الصوت: {user.volume}% | الجودة: {user.quality}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* أدوات التحكم الصوتي */}
          <div className="space-y-4">
            {/* أزرار التحكم الرئيسية */}
            <div className="bg-slate-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">التحكم الصوتي</h3>
              <div className="space-y-3">
                <button
                  onClick={toggleMute}
                  className={`w-full px-4 py-3 rounded-lg transition-colors font-medium ${
                    audioSettings.micEnabled 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {audioSettings.micEnabled ? '🎤 إيقاف الميكروفون' : '🔇 تشغيل الميكروفون'}
                </button>

                <button
                  onClick={toggleSpeaker}
                  className={`w-full px-4 py-3 rounded-lg transition-colors font-medium ${
                    audioSettings.speakerEnabled 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                >
                  {audioSettings.speakerEnabled ? '🔊 إيقاف السماعة' : '🔇 تشغيل السماعة'}
                </button>
              </div>
            </div>

            {/* إعدادات الصوت */}
            <div className="bg-slate-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">إعدادات الصوت</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">مستوى الصوت: {audioSettings.volume}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={audioSettings.volume}
                    onChange={(e) => changeVolume(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">جودة الصوت</label>
                  <select
                    value={audioSettings.quality}
                    onChange={(e) => changeQuality(e.target.value as any)}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2"
                  >
                    <option value="low">منخفضة</option>
                    <option value="medium">متوسطة</option>
                    <option value="high">عالية</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={audioSettings.noiseReduction}
                      onChange={(e) => setAudioSettings(prev => ({ ...prev, noiseReduction: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm">تقليل الضوضاء</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={audioSettings.echoCancellation}
                      onChange={(e) => setAudioSettings(prev => ({ ...prev, echoCancellation: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm">إلغاء الصدى</span>
                  </label>
                </div>

                <button
                  onClick={runEchoTest}
                  className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  اختبار الصدى
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">المحادثة الصوتية</h2>
        <button
          onClick={() => setIsCreatingRoom(true)}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
        >
          إنشاء غرفة صوتية
        </button>
      </div>

      {/* نموذج إنشاء غرفة صوتية */}
      {isCreatingRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg w-96 max-w-md">
            <h3 className="text-xl font-bold mb-4">إنشاء غرفة صوتية جديدة</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">اسم الغرفة</label>
                <input
                  type="text"
                  value={newRoomData.name}
                  onChange={(e) => setNewRoomData({...newRoomData, name: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2"
                  placeholder="اسم الغرفة..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">الوصف (اختياري)</label>
                <textarea
                  value={newRoomData.description}
                  onChange={(e) => setNewRoomData({...newRoomData, description: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 h-20"
                  placeholder="وصف الغرفة..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">أقصى عدد مستخدمين</label>
                <select
                  value={newRoomData.maxUsers}
                  onChange={(e) => setNewRoomData({...newRoomData, maxUsers: parseInt(e.target.value)})}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2"
                >
                  <option value={5}>5 مستخدمين</option>
                  <option value={10}>10 مستخدمين</option>
                  <option value={20}>20 مستخدم</option>
                  <option value={50}>50 مستخدم</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newRoomData.isPrivate}
                    onChange={(e) => setNewRoomData({...newRoomData, isPrivate: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-sm">غرفة خاصة</span>
                </label>
              </div>

              {newRoomData.isPrivate && (
                <div>
                  <label className="block text-sm font-medium mb-1">كلمة المرور</label>
                  <input
                    type="password"
                    value={newRoomData.password}
                    onChange={(e) => setNewRoomData({...newRoomData, password: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2"
                    placeholder="كلمة المرور..."
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={createVoiceRoom}
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded transition-colors"
                disabled={!newRoomData.name}
              >
                إنشاء
              </button>
              <button
                onClick={() => setIsCreatingRoom(false)}
                className="flex-1 bg-slate-600 hover:bg-slate-700 py-2 rounded transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* قائمة الغرف الصوتية المتاحة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {voiceRooms.map((room) => (
          <div key={room.id} className="bg-slate-800 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-lg">{room.name}</h3>
                {room.description && (
                  <p className="text-slate-400 text-sm mt-1">{room.description}</p>
                )}
              </div>
              <span className={`px-2 py-1 text-xs rounded ${
                room.settings.isPrivate ? 'bg-red-600' : 'bg-green-600'
              }`}>
                {room.settings.isPrivate ? 'خاصة' : 'عامة'}
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-slate-300 mb-4">
              <div>المستخدمون: {room.userCount}/{room.settings.maxUsers}</div>
              <div className="flex gap-2">
                {room.settings.noiseReduction && <span className="bg-blue-600 px-2 py-1 text-xs rounded">تقليل ضوضاء</span>}
                {room.settings.echoCancellation && <span className="bg-purple-600 px-2 py-1 text-xs rounded">إلغاء صدى</span>}
              </div>
            </div>

            <button
              onClick={() => joinVoiceRoom(room.id)}
              className="w-full bg-green-600 hover:bg-green-700 py-2 rounded transition-colors"
              disabled={room.userCount >= room.settings.maxUsers || isConnecting}
            >
              {isConnecting ? 'جاري الاتصال...' : 
               room.userCount >= room.settings.maxUsers ? 'الغرفة ممتلئة' : 'انضمام'}
            </button>
          </div>
        ))}
      </div>

      {voiceRooms.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <div className="text-lg mb-2">لا توجد غرف صوتية متاحة حالياً</div>
          <div className="text-sm">قم بإنشاء غرفة جديدة لبدء المحادثة الصوتية</div>
        </div>
      )}
    </div>
  );
}