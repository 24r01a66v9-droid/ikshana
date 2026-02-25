import { motion } from "motion/react";
import { Users, Calendar, Info, Mail, Heart, LifeBuoy, Star, ImageIcon, LogIn, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import AuthModals from "./AuthModals";

import Logo from "./Logo";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const navItems = [
    { name: "About", icon: Info, href: "#about" },
    { name: "Events", icon: Calendar, href: "#events" },
    { name: "Gallery", icon: ImageIcon, href: "#gallery" },
    { name: "Seek Help", icon: LifeBuoy, href: "#seek-help" },
    { name: "Reviews", icon: Star, href: "#reviews" },
  ];

  const handleAuthClick = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <>
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/80 backdrop-blur-md border border-stone-200 rounded-full px-6 py-3 flex items-center justify-between pill-shadow"
        >
          <div className="flex items-center gap-3">
            <Logo className="w-8 h-8" />
            <span className="font-serif font-bold tracking-widest text-xl hidden sm:block">IKSHANA</span>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6">
            {navItems.map((item) => (
              <a 
                key={item.name}
                href={item.href}
                className="text-stone-600 hover:text-brand-red transition-colors text-sm font-medium flex items-center gap-1"
              >
                <item.icon size={16} className="sm:hidden" />
                <span className="hidden sm:inline">{item.name}</span>
              </a>
            ))}

            <div className="h-6 w-px bg-stone-200 hidden sm:block" />

            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 text-stone-600 text-sm font-medium">
                  <User size={16} className="text-brand-red" />
                  <span>{user.name.split(' ')[0]}</span>
                </div>
                <button 
                  onClick={() => logout()}
                  className="text-stone-600 hover:text-brand-red transition-colors flex items-center gap-1 text-sm font-medium"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleAuthClick('login')}
                  className="text-stone-600 hover:text-brand-red transition-colors flex items-center gap-1 text-sm font-medium"
                >
                  <LogIn size={16} />
                  <span className="hidden sm:inline">Login</span>
                </button>
                <button 
                  onClick={() => handleAuthClick('register')}
                  className="bg-brand-red text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-brand-red/90 transition-all hidden sm:block"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </nav>

      <AuthModals 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialMode={authMode} 
      />
    </>
  );
}
