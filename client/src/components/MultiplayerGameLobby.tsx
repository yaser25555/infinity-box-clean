import React, { useState, useEffect } from 'react';
import { wsService } from '../services/websocket';
import { apiService } from '../services/api';

interface GameRoom {
  id: string;
  name: string;
  gameType: string;
  players: Player[];
  settings: {
    maxPlayers: number;
    isPrivate: boolean;
    gameMode: 'competitive' | 'cooperative';
    difficulty: 'easy' | 'medium' | 'hard';
  };
  status: 'waiting' | 'playing' | 'paused' | 'finished';
  hostId: string;
}

interface Player {
  id: string;
  username: string;
  isAdmin: boolean;
  isHost: boolean;
  score: number;
  lives: number;
  level: number;
  isReady: boolean;
}

export default function MultiplayerGameLobby() {
  const [rooms, setRooms] = useState<GameRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [newRoomData, setNewRoomData] = useState({
    name: '',
    gameType: 'fruit_catching',
    isPrivate: false,
    password: '',
    maxPlayers: 4,
    gameMode: 'competitive' as 'competitive' | 'cooperative',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard'
  });

  const username = localStorage.getItem('username') || 'مجهول';
  const userId = localStorage.getItem('userId') || '1';
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  useEffect(() => {
    loadGameRooms();
    setupWebSocketHandlers();
    
    return () => {
      cleanupWebSocketHandlers();
    };
  }, []);

  const loadGameRooms = async () => {
    try {
      const response = await apiService.request('/game/rooms');
      setRooms(response.rooms || []);
    } catch (error) {
      console.error('خطأ في تحميل غرف الألعاب:', error);
    }
  };

  const setupWebSocketHandlers = () => {
    wsService.on('room_create', handleRoomCreated);
    wsService.on('room_join', handleRoomJoined);
    wsService.on('room_leave', handleRoomLeft);
    wsService.on('player_joined', handlePlayerJoined);
    wsService.on('player_left', handlePlayerLeft);
    wsService.on('game_start', handleGameStart);
    wsService.on('game_end', handleGameEnd);
    wsService.on('player_move', handlePlayerMove);
    wsService.on('player_score', handlePlayerScore);
  };

  const cleanupWebSocketHandlers = () => {
    wsService.off('room_create', handleRoomCreated);
    wsService.off('room_join', handleRoomJoined);
    wsService.off('room_leave', handleRoomLeft);
    wsService.off('player_joined', handlePlayerJoined);
    wsService.off('player_left', handlePlayerLeft);
    wsService.off('game_start', handleGameStart);
    wsService.off('game_end', handleGameEnd);
    wsService.off('player_move', handlePlayerMove);
    wsService.off('player_score', handlePlayerScore);
  };

  const handleRoomCreated = (message: any) => {
    const { room } = message.data;
    setCurrentRoom(room);
    loadGameRooms();
  };

  const handleRoomJoined = (message: any) => {
    const { room } = message.data;
    setCurrentRoom(room);
  };

  const handleRoomLeft = (message: any) => {
    setCurrentRoom(null);
    loadGameRooms();
  };

  const handlePlayerJoined = (message: any) => {
    const { room } = message.data;
    setCurrentRoom(room);
  };

  const handlePlayerLeft = (message: any) => {
    const { room } = message.data;
    setCurrentRoom(room);
  };

  const handleGameStart = (message: any) => {
    if (currentRoom) {
      setCurrentRoom({ ...currentRoom, status: 'playing' });
    }
  };

  const handleGameEnd = (message: any) => {
    if (currentRoom) {
      setCurrentRoom({ ...currentRoom, status: 'finished' });
    }
  };

  const handlePlayerMove = (message: any) => {
    // معالجة حركة اللاعبين في الوقت الفعلي
  };

  const handlePlayerScore = (message: any) => {
    const { playerId, score } = message.data;
    if (currentRoom) {
      const updatedPlayers = currentRoom.players.map(player => 
        player.id === playerId ? { ...player, score } : player
      );
      setCurrentRoom({ ...currentRoom, players: updatedPlayers });
    }
  };

  const createRoom = async () => {
    try {
      wsService.send({
        type: 'room_create',
        data: {
          gameType: newRoomData.gameType,
          settings: {
            maxPlayers: newRoomData.maxPlayers,
            isPrivate: newRoomData.isPrivate,
            password: newRoomData.password,
            gameMode: newRoomData.gameMode,
            difficulty: newRoomData.difficulty
          },
          playerInfo: { id: userId, username, isAdmin }
        },
        roomId: '',
        playerId: userId,
        timestamp: Date.now()
      });
      setIsCreatingRoom(false);
    } catch (error) {
      console.error('خطأ في إنشاء الغرفة:', error);
    }
  };

  const joinRoom = async (roomId: string, password?: string) => {
    try {
      wsService.send({
        type: 'room_join',
        data: {
          roomId,
          playerInfo: { id: userId, username, isAdmin },
          password
        },
        roomId,
        playerId: userId,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('خطأ في الانضمام للغرفة:', error);
    }
  };

  const leaveRoom = () => {
    if (currentRoom) {
      wsService.send({
        type: 'room_leave',
        roomId: currentRoom.id,
        playerId: userId,
        data: {},
        timestamp: Date.now()
      });
    }
  };

  const startGame = () => {
    if (currentRoom && currentRoom.hostId === userId) {
      wsService.send({
        type: 'game_start',
        roomId: currentRoom.id,
        playerId: userId,
        data: {},
        timestamp: Date.now()
      });
    }
  };

  const toggleReady = () => {
    // منطق تغيير حالة الجاهزية
  };

  if (currentRoom) {
    return (
      <div className="bg-slate-900 text-white p-6 rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{currentRoom.name}</h2>
          <button
            onClick={leaveRoom}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
          >
            مغادرة الغرفة
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* معلومات الغرفة */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-semibold mb-2">معلومات اللعبة</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>نوع اللعبة: {currentRoom.gameType}</div>
                <div>الوضع: {currentRoom.settings.gameMode === 'competitive' ? 'تنافسي' : 'تعاوني'}</div>
                <div>الصعوبة: {currentRoom.settings.difficulty}</div>
                <div>الحالة: {currentRoom.status === 'waiting' ? 'في الانتظار' : currentRoom.status}</div>
              </div>
            </div>

            {/* قائمة اللاعبين */}
            <div className="bg-slate-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">اللاعبون ({currentRoom.players.length}/{currentRoom.settings.maxPlayers})</h3>
              <div className="space-y-2">
                {currentRoom.players.map((player) => (
                  <div key={player.id} className="flex items-center justify-between bg-slate-700 p-3 rounded">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${player.isReady ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="font-medium">{player.username}</span>
                      {player.isHost && <span className="bg-yellow-600 px-2 py-1 text-xs rounded">مضيف</span>}
                      {player.isAdmin && <span className="bg-blue-600 px-2 py-1 text-xs rounded">مدير</span>}
                    </div>
                    <div className="text-sm text-slate-300">
                      النقاط: {player.score} | المستوى: {player.level}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* أدوات التحكم */}
          <div className="space-y-4">
            <button
              onClick={toggleReady}
              className="w-full bg-green-600 hover:bg-green-700 px-4 py-3 rounded-lg transition-colors font-medium"
            >
              تغيير الجاهزية
            </button>

            {currentRoom.hostId === userId && currentRoom.status === 'waiting' && (
              <button
                onClick={startGame}
                className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg transition-colors font-medium"
                disabled={!currentRoom.players.every(p => p.isReady)}
              >
                بدء اللعبة
              </button>
            )}

            {currentRoom.status === 'playing' && (
              <div className="bg-green-800 p-4 rounded-lg text-center">
                <div className="text-lg font-bold mb-2">اللعبة قيد التشغيل</div>
                <div className="text-sm">انتقل للعبة لبدء اللعب</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">غرف الألعاب الجماعية</h2>
        <button
          onClick={() => setIsCreatingRoom(true)}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
        >
          إنشاء غرفة جديدة
        </button>
      </div>

      {/* نموذج إنشاء غرفة */}
      {isCreatingRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg w-96 max-w-md">
            <h3 className="text-xl font-bold mb-4">إنشاء غرفة جديدة</h3>
            
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
                <label className="block text-sm font-medium mb-1">نوع اللعبة</label>
                <select
                  value={newRoomData.gameType}
                  onChange={(e) => setNewRoomData({...newRoomData, gameType: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2"
                >
                  <option value="fruit_catching">لعبة جمع الفواكه</option>
                  <option value="racing">لعبة السباق</option>
                  <option value="puzzle">لعبة الألغاز</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">أقصى عدد لاعبين</label>
                  <select
                    value={newRoomData.maxPlayers}
                    onChange={(e) => setNewRoomData({...newRoomData, maxPlayers: parseInt(e.target.value)})}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2"
                  >
                    <option value={2}>2 لاعبين</option>
                    <option value={4}>4 لاعبين</option>
                    <option value={6}>6 لاعبين</option>
                    <option value={8}>8 لاعبين</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">الصعوبة</label>
                  <select
                    value={newRoomData.difficulty}
                    onChange={(e) => setNewRoomData({...newRoomData, difficulty: e.target.value as any})}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2"
                  >
                    <option value="easy">سهل</option>
                    <option value="medium">متوسط</option>
                    <option value="hard">صعب</option>
                  </select>
                </div>
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
                onClick={createRoom}
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

      {/* قائمة الغرف المتاحة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.filter(room => room.status === 'waiting').map((room) => (
          <div key={room.id} className="bg-slate-800 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-lg">{room.name}</h3>
              <span className={`px-2 py-1 text-xs rounded ${
                room.settings.isPrivate ? 'bg-red-600' : 'bg-green-600'
              }`}>
                {room.settings.isPrivate ? 'خاصة' : 'عامة'}
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-slate-300 mb-4">
              <div>نوع اللعبة: {room.gameType}</div>
              <div>اللاعبون: {room.players.length}/{room.settings.maxPlayers}</div>
              <div>الوضع: {room.settings.gameMode === 'competitive' ? 'تنافسي' : 'تعاوني'}</div>
              <div>الصعوبة: {room.settings.difficulty}</div>
            </div>

            <button
              onClick={() => joinRoom(room.id)}
              className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded transition-colors"
              disabled={room.players.length >= room.settings.maxPlayers}
            >
              {room.players.length >= room.settings.maxPlayers ? 'الغرفة ممتلئة' : 'انضمام'}
            </button>
          </div>
        ))}
      </div>

      {rooms.filter(room => room.status === 'waiting').length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <div className="text-lg mb-2">لا توجد غرف متاحة حالياً</div>
          <div className="text-sm">قم بإنشاء غرفة جديدة لبدء اللعب مع الأصدقاء</div>
        </div>
      )}
    </div>
  );
}