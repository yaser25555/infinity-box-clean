import React, { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import MainDashboard from './components/MainDashboard';
import MobileApp from './MobileApp';
import { wsService } from './services/websocket';
import { apiService } from './services/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Clear any old activeTab data
    localStorage.removeItem('activeTab');
    
    // Detect mobile device
    const checkMobile = () => {
      const userAgent = navigator.userAgent;
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) || 
                            (window.innerWidth <= 768);
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    const token = localStorage.getItem('token');
    if (token) {
      apiService.getCurrentUser()
        .then((user) => {
          const isAdmin = localStorage.getItem('isAdmin') === 'true';
          if (user && typeof user === 'object') {
            setUserData({ ...user, token, isAdmin });
          } else {
            setUserData({ token, isAdmin });
          }
          setIsAuthenticated(true);
          wsService.connect().catch(error => {
            console.error('Failed to connect to WebSocket:', error);
          });
        })
        .catch((error) => {
          // Check if logged in from another device
          if (error.message.includes('MULTIPLE_LOGIN')) {
            alert('تم تسجيل الدخول من جهاز آخر. سيتم تسجيل خروجك من هذا الجهاز.');
          }
          setIsAuthenticated(false);
          setUserData(null);
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          localStorage.removeItem('isAdmin');
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleAuthSuccess = async (userData: any) => {
    setUserData(userData);
    setIsAuthenticated(true);
    try {
      await wsService.connect();
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('isAdmin');
    wsService.disconnect();
    setIsAuthenticated(false);
    setUserData(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Show mobile app for mobile devices
  if (isMobile) {
    return <MobileApp />;
  }

  // Show desktop app for desktop devices
  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return <MainDashboard userData={userData} onLogout={handleLogout} />;
}

export default App;