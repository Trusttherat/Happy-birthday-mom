import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, Image as ImageIcon, BookOpen, Lock, Unlock, Cake, Menu, X, Crown, Clock } from 'lucide-react';
import { PageId } from '../types';

interface SidebarNavProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  isAdmin: boolean;
  onToggleAdminModal: () => void;
}

interface NavItem {
  id: PageId;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  locked?: boolean;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  currentPage,
  onSelectPage,
  isAdmin,
  onToggleAdminModal,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      id: 'landing',
      title: 'Happy Birthday',
      subtitle: 'Celebration Entrance',
      icon: <Cake className="w-5 h-5" />,
    },
    {
      id: 'about',
      title: 'About Mom',
      subtitle: 'Her Grace & Superpowers',
      icon: <Heart className="w-5 h-5" />,
    },
    {
      id: 'timeline',
      title: 'Life Journey',
      subtitle: 'Memories Through Time',
      icon: <Clock className="w-5 h-5" />,
    },
    {
      id: 'gallery',
      title: 'Photo Gallery',
      subtitle: 'Past Memories & Today',
      icon: <ImageIcon className="w-5 h-5" />,
    },
    {
      id: 'treasures',
      title: "Mom's Treasures",
      subtitle: 'Jokes, Lessons & Quips',
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      id: 'alpha',
      title: 'Word from Alpha',
      subtitle: 'Heartfelt Letter to Mom',
      icon: <Sparkles className="w-5 h-5 text-amber-500" />,
    },
  ];


  return (
    <>
      {/* Mobile Toggle Bar */}
      <div className="lg:hidden fixed top-4 left-4 z-50 flex items-center gap-2">
        <button
          id="mobile-nav-toggle-btn"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="glow-btn p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-pink-200/80 text-pink-600 focus:outline-none"
          aria-label="Toggle Navigation"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <span className="text-xs font-bold px-3 py-1.5 bg-white/80 backdrop-blur-md rounded-full border border-pink-100 text-pink-700 shadow-sm">
          {navItems.find((n) => n.id === currentPage)?.title}
        </span>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
          >
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              onClick={(e) => e.stopPropagation()}
              className="w-72 h-full bg-gradient-to-b from-white via-rose-50 to-pink-50/90 shadow-2xl p-6 flex flex-col justify-between border-r border-pink-200/70"
            >
              <div>
                <div className="flex items-center gap-3 pb-6 border-b border-pink-100 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-fuchsia-600 flex items-center justify-center text-white shadow-md shadow-pink-500/30">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-serif-display font-bold text-slate-800 text-lg leading-tight">
                      Mom's Day
                    </h2>
                    <p className="text-[11px] font-semibold text-pink-600 uppercase tracking-widest">
                      Special Edition
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {navItems.map((item, idx) => {
                    const isActive = currentPage === item.id;
                    return (
                      <button
                        key={item.id}
                        id={`mobile-nav-item-${item.id}`}
                        onClick={() => {
                          onSelectPage(item.id);
                          setIsMobileOpen(false);
                        }}
                        className={`glow-btn w-full text-left p-3.5 rounded-2xl flex items-center gap-3.5 transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white shadow-md shadow-pink-500/25 font-bold'
                            : 'hover:bg-pink-100/70 text-slate-700 font-medium'
                        }`}
                      >
                        <div
                          className={`p-2 rounded-xl shrink-0 ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-pink-100/80 text-pink-600'
                          }`}
                        >
                          {item.icon}
                        </div>
                        <div className="truncate">
                          <div className="text-sm font-semibold truncate flex items-center gap-1.5">
                            {item.title}
                            {item.locked && !isAdmin && (
                              <span className="text-[10px] bg-slate-200/80 text-slate-600 px-1.5 py-0.5 rounded-full font-medium">
                                Lock
                              </span>
                            )}
                          </div>
                          <div
                            className={`text-xs truncate ${
                              isActive ? 'text-pink-100' : 'text-slate-500'
                            }`}
                          >
                            {item.subtitle}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Admin toggle in mobile */}
              <div className="pt-4 border-t border-pink-100">
                <button
                  id="mobile-admin-toggle-btn"
                  onClick={() => {
                    onToggleAdminModal();
                    setIsMobileOpen(false);
                  }}
                  className={`glow-btn w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                    isAdmin
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-white/80 text-slate-600 hover:text-pink-600 border border-pink-200'
                  }`}
                >
                  {isAdmin ? (
                    <>
                      <Unlock className="w-4 h-4 text-amber-600" />
                      <span>Admin Mode Active</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-slate-400" />
                      <span>Alpha Secure Login</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Left Vertical Nav (Expands on hover) */}
      <aside
        id="desktop-sidebar-nav"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`hidden lg:flex fixed top-0 left-0 bottom-0 z-40 flex-col justify-between py-6 px-3 bg-white/80 backdrop-blur-xl border-r border-pink-200/60 shadow-xl shadow-pink-500/5 transition-all duration-300 ease-out select-none ${
          isHovered ? 'w-64' : 'w-20'
        }`}
      >
        {/* Top Logo / Crown */}
        <div>
          <div className="flex items-center gap-3 px-2 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-fuchsia-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/30 shrink-0">
              <Crown className="w-6 h-6" />
            </div>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                isHovered ? 'opacity-100 max-w-[160px]' : 'opacity-0 max-w-0 pointer-events-none'
              }`}
            >
              <h1 className="font-serif-display font-black text-slate-800 text-lg leading-tight whitespace-nowrap">
                Happy Birthday
              </h1>
              <p className="text-[11px] font-bold text-pink-600 uppercase tracking-wider whitespace-nowrap">
                Beloved Mom
              </p>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="space-y-2.5">
            {navItems.map((item, index) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  id={`sidebar-nav-${item.id}`}
                  onClick={() => onSelectPage(item.id)}
                  title={!isHovered ? item.title : undefined}
                  className={`glow-btn group relative w-full flex items-center rounded-2xl p-2.5 transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-600 text-white shadow-lg shadow-pink-500/30 font-bold'
                      : 'hover:bg-pink-100/70 text-slate-600 hover:text-pink-700'
                  }`}
                >
                  {/* Left active marker pill */}
                  {isActive && (
                    <motion.div
                      layoutId="activePill"
                      className="absolute left-0 top-2 bottom-2 w-1.5 rounded-r-full bg-white shadow-sm"
                    />
                  )}

                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-pink-50 text-pink-600 group-hover:scale-110'
                    }`}
                  >
                    {item.icon}
                  </div>

                  {/* Expanded text */}
                  <div
                    className={`ml-3 overflow-hidden text-left transition-all duration-300 whitespace-nowrap ${
                      isHovered ? 'opacity-100 max-w-[170px]' : 'opacity-0 max-w-0 pointer-events-none'
                    }`}
                  >
                    <div className="text-sm font-bold flex items-center gap-1.5 leading-tight">
                      <span>{item.title}</span>
                      {item.locked && !isAdmin && (
                        <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                      )}
                    </div>
                    <div
                      className={`text-[11px] truncate leading-tight mt-0.5 ${
                        isActive ? 'text-pink-100' : 'text-slate-400 group-hover:text-pink-500'
                      }`}
                    >
                      {item.subtitle}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Admin Status / Lock */}
        <div className="pt-4 border-t border-pink-100/80">
          <button
            id="sidebar-admin-btn"
            onClick={onToggleAdminModal}
            className={`glow-btn group w-full flex items-center rounded-2xl p-2.5 transition-all cursor-pointer ${
              isAdmin
                ? 'bg-amber-100/80 hover:bg-amber-200/80 text-amber-800 border border-amber-300/80'
                : 'hover:bg-pink-100/80 text-slate-600 hover:text-pink-600 border border-transparent'
            }`}
            title={!isHovered ? (isAdmin ? 'Admin Mode (Alpha)' : 'Alpha Login') : undefined}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isAdmin ? 'bg-amber-500 text-white' : 'bg-pink-100 text-pink-600'
              }`}
            >
              {isAdmin ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>

            <div
              className={`ml-3 overflow-hidden text-left transition-all duration-300 whitespace-nowrap ${
                isHovered ? 'opacity-100 max-w-[170px]' : 'opacity-0 max-w-0 pointer-events-none'
              }`}
            >
              <div className="text-xs font-bold leading-tight">
                {isAdmin ? 'Alpha Mode Active' : 'Alpha Access'}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {isAdmin ? 'Click to manage/logout' : 'Click to unlock editing'}
              </div>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};
