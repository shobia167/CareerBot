import React from 'react';
import { ArrowRight, Sparkles, Target, Zap, ShieldCheck, Compass } from 'lucide-react';

interface HeroSectionProps {
  onStartOnboarding: () => void;
  hasProfile: boolean;
  onExploreDashboard: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartOnboarding,
  hasProfile,
  onExploreDashboard,
}) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28">
      {/* Subtle decorative background waves & lime geometry */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#C5F36A]/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#EFEEE7] blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#FFFFFF] border border-[#DEDED5] shadow-xs mb-8">
            <span className="w-2 h-2 rounded-full bg-[#C5F36A]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-800">
              Next-Gen AI Career Discovery Engine
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#17191C] leading-[1.15] mb-6">
            Your Skills. Your Goals.{' '}
            <span className="relative inline-block">
              <span className="relative z-10">Your Career Journey.</span>
              <span className="absolute bottom-2 left-0 right-0 h-3.5 bg-[#C5F36A]/70 -rotate-1 rounded-sm -z-0" />
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="text-lg sm:text-xl text-neutral-600 font-normal leading-relaxed mb-10 max-w-2xl mx-auto">
            Discover your strengths, identify skill gaps and build a personalized roadmap to achieve your dream career. Powered by NVIDIA Nemotron multi-agent intelligence and Google Gemini personal mentorship.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartOnboarding}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-3 px-8 py-4 rounded-2xl font-bold text-base bg-[#C5F36A] text-[#17191C] hover:bg-[#b8e858] transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 group"
            >
              <span>Build My Career Profile</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>

            {hasProfile && (
              <button
                onClick={onExploreDashboard}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-4 rounded-2xl font-semibold text-base bg-[#FFFFFF] text-[#17191C] border border-[#DEDED5] hover:bg-[#EFEEE7] transition-all"
              >
                <Compass className="w-5 h-5 text-neutral-600" />
                <span>View Learning Dashboard</span>
              </button>
            )}
          </div>

          {/* Feature Highlights Grid */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-left">
            <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#DEDED5] shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-[#C5F36A]/30 flex items-center justify-center mb-3 text-[#17191C]">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-[#17191C] uppercase tracking-wider">Multi-Agent AI</h4>
              <p className="text-xs text-neutral-500 mt-1">Nemotron 30B specialized agent system</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#DEDED5] shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-[#C5F36A]/30 flex items-center justify-center mb-3 text-[#17191C]">
                <Target className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-[#17191C] uppercase tracking-wider">ATS Resume Audit</h4>
              <p className="text-xs text-neutral-500 mt-1">Score out of 100 with actionable feedback</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#DEDED5] shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-[#C5F36A]/30 flex items-center justify-center mb-3 text-[#17191C]">
                <Zap className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-[#17191C] uppercase tracking-wider">Adaptive Roadmap</h4>
              <p className="text-xs text-neutral-500 mt-1">Sequenced activities that adapt to test results</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#DEDED5] shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-[#C5F36A]/30 flex items-center justify-center mb-3 text-[#17191C]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-[#17191C] uppercase tracking-wider">Private & Secure</h4>
              <p className="text-xs text-neutral-500 mt-1">Postgres RLS with private learning journals</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
