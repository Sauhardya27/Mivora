"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X, Sparkles } from "lucide-react";

type NotificationType = "success" | "error" | "warning" | "info";

interface Notification {
  message: string;
  type: NotificationType;
  id: number;
  duration?: number;
}

interface NotificationContextType {
  showNotification: (message: string, type: NotificationType, duration?: number) => void;
  hideNotification: (id: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (message: string, type: NotificationType, duration: number = 4000) => {
    const id = Date.now() + Math.random();
    const newNotification: Notification = { message, type, id, duration };
    
    setNotifications(prev => [...prev, newNotification]);
    
    setTimeout(() => {
      hideNotification(id);
    }, duration);
  };

  const hideNotification = (id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification }}>
      {children}
      <NotificationContainer notifications={notifications} onHide={hideNotification} />
    </NotificationContext.Provider>
  );
}

function NotificationContainer({ 
  notifications, 
  onHide 
}: { 
  notifications: Notification[];
  onHide: (id: number) => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-[200] space-y-3 max-w-sm w-full pointer-events-none">
      {notifications.map((notification) => (
        <NotificationItem 
          key={notification.id} 
          notification={notification} 
          onHide={onHide}
        />
      ))}
    </div>
  );
}

function NotificationItem({ 
  notification, 
  onHide 
}: { 
  notification: Notification;
  onHide: (id: number) => void;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onHide(notification.id), 300);
  };

  const { icon, colors, bgGradient } = getNotificationStyle(notification.type);

  return (
    <div 
      className={`
        relative transform transition-all duration-500 ease-out pointer-events-auto
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
        ${isExiting ? 'translate-x-full opacity-0 scale-90' : ''}
      `}
    >
      <div className={`
        relative overflow-hidden rounded-2xl backdrop-blur-md border border-white/20 
        shadow-2xl ${bgGradient}
        before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/10 before:to-transparent
        hover:scale-105 transition-transform duration-300
      `}>
        <div className="absolute inset-0 overflow-hidden">
          <Sparkles className="absolute top-2 right-2 w-3 h-3 text-white/30 animate-pulse" />
          <div className="absolute top-0 left-0 w-full h-full">
            <div className={`absolute top-1/2 left-1/4 w-2 h-2 rounded-full ${colors.accent} opacity-20 animate-bounce delay-100`}></div>
            <div className={`absolute top-1/4 right-1/3 w-1 h-1 rounded-full ${colors.accent} opacity-30 animate-pulse delay-200`}></div>
          </div>
        </div>

        <div className="relative p-4 flex items-start space-x-3">
          <div className={`
            flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
            ${colors.iconBg} shadow-lg relative
          `}>
            <div className={`absolute inset-0 rounded-full ${colors.glow} opacity-50 animate-pulse`}></div>
            <div className="relative">
              {icon}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white leading-relaxed pr-2">
              {notification.message}
            </p>
          </div>

          <button
            onClick={handleClose}
            className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 
                     flex items-center justify-center transition-all duration-200 
                     hover:scale-110 active:scale-95 group"
            aria-label="Close notification"
          >
            <X className="w-3 h-3 text-white/80 group-hover:text-white transition-colors" />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div 
            className={`h-full ${colors.progress} animate-shrink-width`}
            style={{
              animationDuration: `${notification.duration}ms`
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}

function getNotificationStyle(type: NotificationType) {
  switch (type) {
    case "success":
      return {
        icon: <CheckCircle className="w-5 h-5 text-white" />,
        colors: {
          iconBg: "bg-green-500",
          accent: "bg-green-400",
          glow: "bg-green-400",
          progress: "bg-green-400"
        },
        bgGradient: "bg-gradient-to-br from-green-500/90 to-emerald-600/90"
      };
    case "error":
      return {
        icon: <XCircle className="w-5 h-5 text-white" />,
        colors: {
          iconBg: "bg-red-500",
          accent: "bg-red-400",
          glow: "bg-red-400",
          progress: "bg-red-400"
        },
        bgGradient: "bg-gradient-to-br from-red-500/90 to-rose-600/90"
      };
    case "warning":
      return {
        icon: <AlertTriangle className="w-5 h-5 text-white" />,
        colors: {
          iconBg: "bg-amber-500",
          accent: "bg-amber-400",
          glow: "bg-amber-400",
          progress: "bg-amber-400"
        },
        bgGradient: "bg-gradient-to-br from-amber-500/90 to-orange-600/90"
      };
    case "info":
    default:
      return {
        icon: <Info className="w-5 h-5 text-white" />,
        colors: {
          iconBg: "bg-blue-500",
          accent: "bg-blue-400",
          glow: "bg-blue-400",
          progress: "bg-blue-400"
        },
        bgGradient: "bg-gradient-to-br from-blue-500/90 to-indigo-600/90"
      };
  }
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
}