import React from 'react';
import GameCard from './GameCard';
import { Gamepad2, Zap, Target, Puzzle, Mic } from 'lucide-react';
import { useLocation } from 'wouter';

type GameGridProps = {
  setActiveTab?: (tab: 'games' | 'voice' | 'leaderboard' | 'profile' | 'admin') => void;
};

const GameGrid: React.FC<GameGridProps> = ({ setActiveTab }) => {
  const [location, setLocation] = useLocation();
  const games = [
    {
      id: 8,
      title: '🍎 قطف الفواكه',
      description: 'اقطف الفواكه الساقطة واجمع أكبر عدد من النقاط في هذه اللعبة الممتعة!',
      image: 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=800',
      players: 250,
      rating: 5,
      featured: true,
      onPlay: () => {
        const currentOrigin = window.location.origin;
        window.open(`${currentOrigin}/fruit-catching.html`, '_blank');
      }
    },
    {
      id: 1,
      title: 'صناديق الحظ اللانهائية',
      description: 'افتح الصناديق واكتشف الكنوز المخفية في عالم INFINITY BOX',
      image: 'https://images.pexels.com/photos/1111597/pexels-photo-1111597.jpeg?auto=compress&cs=tinysrgb&w=800',
      players: 15420,
      rating: 5,
      featured: true,
      onPlay: () => window.open('/game1.html', '_blank')
    },
    {
      id: 2,
      title: 'تحدي السرعة',
      description: 'اختبر سرعة ردود أفعالك في هذا التحدي المثير',
      image: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=800',
      players: 8930,
      rating: 4,
      onPlay: () => console.log('تحدي السرعة')
    },
    {
      id: 3,
      title: 'ألغاز العقل',
      description: 'حل الألغاز المعقدة واكسب النقاط والجوائز',
      image: 'https://images.pexels.com/photos/1040157/pexels-photo-1040157.jpeg?auto=compress&cs=tinysrgb&w=800',
      players: 12150,
      rating: 4,
      onPlay: () => console.log('ألغاز العقل')
    },
    {
      id: 4,
      title: 'مغامرة الكنوز',
      description: 'انطلق في رحلة البحث عن الكنوز المفقودة',
      image: 'https://images.pexels.com/photos/1670977/pexels-photo-1670977.jpeg?auto=compress&cs=tinysrgb&w=800',
      players: 6780,
      rating: 5,
      onPlay: () => console.log('مغامرة الكنوز')
    },
    {
      id: 5,
      title: 'بطولة النجوم',
      description: 'تنافس مع أفضل اللاعبين في البطولة الكبرى',
      image: 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=800',
      players: 25600,
      rating: 5,
      onPlay: () => setLocation('/game')
    },
    {
      id: 6,
      title: 'عالم الخيال',
      description: 'استكشف عوالم خيالية مليئة بالمغامرات والأسرار',
      image: 'https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg?auto=compress&cs=tinysrgb&w=800',
      players: 18900,
      rating: 4,
      onPlay: () => console.log('عالم الخيال')
    },
    {
      id: 7,
      title: 'الصناديق التي لا تنتهي - لعبة جديدة',
      description: 'جرب لعبة الصناديق التي لا تنتهي الجديدة والممتعة!',
      image: 'https://images.pexels.com/photos/3258/boxes-wooden-crates-market.jpg?auto=compress&cs=tinysrgb&w=800',
      players: 0,
      rating: 5,
      featured: false,
      onPlay: () => window.open('/game8.html', '_blank')
    }
  ];

  const quickGames = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'لعبة سريعة',
      description: 'ابدأ لعبة سريعة في أقل من دقيقة',
      color: 'from-yellow-500 to-orange-500',
      onClick: () => console.log('لعبة سريعة')
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'تحدي يومي',
      description: 'أكمل التحدي اليومي واكسب مكافآت',
      color: 'from-green-500 to-emerald-500',
      onClick: () => console.log('تحدي يومي')
    },
    {
      icon: <Puzzle className="w-6 h-6" />,
      title: 'لغز اليوم',
      description: 'حل لغز اليوم واحصل على نقاط إضافية',
      color: 'from-blue-500 to-cyan-500',
      onClick: () => console.log('لغز اليوم')
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'قطف الفواكه',
      description: 'اقطف الفواكه الساقطة واجمع أكبر عدد من النقاط',
      color: 'from-green-500 to-lime-500',
      onClick: () => window.open('/fruit-catching.html', '_blank')
    },
    {
      icon: <Gamepad2 className="w-6 h-6" />,
      title: 'وضع التدريب',
      description: 'تدرب وحسن مهاراتك قبل المنافسة',
      color: 'from-purple-500 to-indigo-500',
      onClick: () => console.log('وضع التدريب')
    }
  ];

  return (
    <div className="space-y-12">
      {/* الألعاب السريعة */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">ألعاب سريعة</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickGames.map((game, index) => (
            <button
              key={index}
              onClick={game.onClick}
              className="group p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:scale-105 text-right"
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${game.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {game.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{game.title}</h3>
              <p className="text-gray-300 text-sm">{game.description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* الألعاب الرئيسية */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Gamepad2 className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">الألعاب المميزة</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* لعبة قطف الفواكه المميزة */}
          <GameCard
            title="🍎 قطف الفواكه"
            description="اقطف الفواكه الساقطة واجمع أكبر عدد من النقاط والعملات في هذه اللعبة الممتعة!"
            image="https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=800"
            players={1250}
            rating={5}
            onPlay={() => {
              const currentOrigin = window.location.origin;
              window.open(`${currentOrigin}/fruit-catching.html`, '_blank');
            }}
            featured={true}
          />
          {/* حاوية الغرفة الصوتية العامة */}
          <GameCard
            title="الغرفة الصوتية العامة"
            description="انضم للدردشة الصوتية مع جميع اللاعبين في INFINITY BOX وتواصل مباشرة بالصوت!"
            image="https://images.pexels.com/photos/3394656/pexels-photo-3394656.jpeg?auto=compress&cs=tinysrgb&w=800"
            players={9999}
            rating={5}
            onPlay={() => setActiveTab && setActiveTab('voice')}
            featured={true}
          />
          {/* باقي الألعاب */}
          {games.filter(game => game.id !== 8).map((game) => (
            <GameCard
              key={game.id}
              title={game.title}
              description={game.description}
              image={game.image}
              players={game.players}
              rating={game.rating}
              onPlay={game.onPlay}
              featured={game.featured}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default GameGrid;