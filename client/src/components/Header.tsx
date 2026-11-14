import React from 'react';
import { Sparkles, FileText, UserCheck, LogOut, Compass, Bot } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  user: any;
  profile: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onScrollToResume: () => void;
  onScrollToProfile: () => void;
  onToggleTutor: () => void;
  isTutorOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  profile,
  onOpenAuth,
  onLogout,
  onScrollToResume,
  onScrollToProfile,
  onToggleTutor,
  isTutorOpen,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#F8F7F2]/90 backdrop-blur-md border-b border-[#DEDED5] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left: Logo & Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-11 h-11 rounded-2xl bg-[#17191C] flex items-center justify-center relative shadow-sm border border-neutral-700">
            <Sparkles className="w-6 h-6 text-[#C5F36A]" />
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#C5F36A] border-2 border-[#17191C]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-extrabold tracking-tight text-[#17191C]">
                Career<span className="text-[#17191C]">Bot</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-[#C5F36A] text-[#17191C] rounded-full">
                AI
              </span>
            </div>
            <p className="text-xs text-neutral-500 font-medium">Personalized Career Engine</p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {user ? (
            <>
              {/* AI Career Tutor Toggle Button */}
              <button
                onClick={onToggleTutor}
                className={`relative inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isTutorOpen
                    ? 'bg-[#17191C] text-[#C5F36A] shadow-md'
                    : 'bg-[#C5F36A] text-[#17191C] hover:bg-[#b5e656]'
                }`}
                title="Open AI Career Tutor"
              >
                <Bot className="w-4 h-4" />
                <span className="hidden md:inline">AI Tutor</span>
                <span className="w-2 h-2 rounded-full bg-[#17191C] animate-pulse" />
              </button>

              {/* Resume Upload CTA Button */}
              <button
                onClick={onScrollToResume}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-[#17191C] bg-[#EFEEE7] hover:bg-[#E5E4DC] border border-[#DEDED5] transition-colors"
              >
                <FileText className="w-4 h-4 text-neutral-600" />
                <span className="hidden sm:inline">Resume Upload</span>
              </button>

              {/* Profile Check Button */}
              <button
                onClick={onScrollToProfile}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-[#17191C] bg-[#EFEEE7] hover:bg-[#E5E4DC] border border-[#DEDED5] transition-colors"
              >
                <UserCheck className="w-4 h-4 text-neutral-600" />
                <span className="hidden sm:inline">Profile Check</span>
              </button>

              {/* User Avatar & Logout */}
              <div className="flex items-center space-x-3 pl-2 border-l border-[#DEDED5]">
                <div className="w-9 h-9 rounded-xl bg-[#17191C] text-[#C5F36A] flex items-center justify-center font-bold text-sm shadow-sm">
                  {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-[#17191C] leading-tight truncate max-w-[120px]">
                    {profile?.full_name || 'Learner'}
                  </div>
                  <div className="text-[11px] text-neutral-500 truncate max-w-[120px]">
                    {profile?.target_career || 'Profile Building'}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-neutral-500 hover:text-red-600 hover:bg-neutral-100 rounded-xl transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-[#17191C] text-white hover:bg-[#2c3036] transition-all shadow-sm"
            >
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
