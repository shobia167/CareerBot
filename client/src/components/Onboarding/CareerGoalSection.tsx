import React, { useState } from 'react';
import { Target, Sparkles, Check, ArrowRight, RefreshCw, Compass } from 'lucide-react';
import { api } from '../../lib/api';

interface CareerGoalProps {
  selectedCareer: string;
  onSelectCareer: (career: string) => void;
}

const COMMON_ROLES = [
  'AI Engineer',
  'Full Stack Developer',
  'Machine Learning Engineer',
  'Data Analyst',
  'Data Scientist',
  'Cloud Engineer',
  'Software Developer',
  'DevOps Engineer'
];

export const CareerGoalSection: React.FC<CareerGoalProps> = ({ selectedCareer, onSelectCareer }) => {
  const [mode, setMode] = useState<'choose' | 'suggest'>('choose');
  const [customRole, setCustomRole] = useState('');
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [suggestionError, setSuggestionError] = useState('');

  const handleFetchSuggestions = async () => {
    setLoadingSuggestions(true);
    setSuggestionError('');
    try {
      const res = await api.suggestCareers();
      if (res && res.suggestions) {
        setSuggestions(res.suggestions);
      }
    } catch (err: any) {
      setSuggestionError(err.message || 'Could not fetch AI suggestions. Please choose a target role manually.');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleApplyCustomRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (customRole.trim()) {
      onSelectCareer(customRole.trim());
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-[#DEDED5] pb-4">
        <h3 className="text-lg font-bold text-[#17191C]">Target Career Role Selection</h3>
        <p className="text-xs text-neutral-500 mt-0.5">
          Choose your aspiration or let our NVIDIA Nemotron agent analyze your background to recommend the best matched pathways.
        </p>
      </div>

      {/* Mode Switcher Buttons */}
      <div className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-[#EFEEE7] border border-[#DEDED5] max-w-md">
        <button
          type="button"
          onClick={() => setMode('choose')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
            mode === 'choose'
              ? 'bg-[#17191C] text-[#C5F36A] shadow-xs'
              : 'text-neutral-600 hover:text-[#17191C]'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>Option 1: Choose My Career</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMode('suggest');
            if (suggestions.length === 0) handleFetchSuggestions();
          }}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
            mode === 'suggest'
              ? 'bg-[#17191C] text-[#C5F36A] shadow-xs'
              : 'text-neutral-600 hover:text-[#17191C]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Option 2: Suggest For Me</span>
        </button>
      </div>

      {/* OPTION 1: Choose Career */}
      {mode === 'choose' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {COMMON_ROLES.map((role) => {
              const isSelected = selectedCareer.toLowerCase() === role.toLowerCase();
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => onSelectCareer(role)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-[#17191C] text-[#C5F36A] border-[#17191C] shadow-md'
                      : 'bg-[#FFFFFF] text-[#17191C] border-[#DEDED5] hover:bg-[#F8F7F2]'
                  }`}
                >
                  <div className="text-xs font-bold">{role}</div>
                  <div className={`text-[10px] mt-1 ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    {isSelected ? '✓ Selected Goal' : 'Click to select'}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom Role Input */}
          <form onSubmit={handleApplyCustomRole} className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#DEDED5] flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              placeholder="Or enter a specific title (e.g. Quantitative Developer, Blockchain Architect)..."
              className="flex-1 px-4 py-2 rounded-xl bg-[#F8F7F2] border border-[#DEDED5] text-sm text-[#17191C] placeholder:text-neutral-400 focus:outline-none focus:border-[#17191C]"
            />
            <button
              type="submit"
              className="px-5 py-2 rounded-xl font-bold text-xs bg-[#17191C] text-[#C5F36A] hover:bg-[#2c3036] transition-all shrink-0"
            >
              Set Role
            </button>
          </form>
        </div>
      )}

      {/* OPTION 2: Nemotron Suggestions */}
      {mode === 'suggest' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500">
              NVIDIA Nemotron has analyzed your profile, skills, projects, and resume:
            </span>
            <button
              type="button"
              disabled={loadingSuggestions}
              onClick={handleFetchSuggestions}
              className="inline-flex items-center space-x-1 text-xs font-semibold text-[#17191C] hover:underline"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingSuggestions ? 'animate-spin' : ''}`} />
              <span>Refresh Suggestions</span>
            </button>
          </div>

          {loadingSuggestions ? (
            <div className="p-12 rounded-3xl bg-[#FFFFFF] border border-[#DEDED5] text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#17191C] animate-spin mx-auto" />
              <div className="text-sm font-bold text-[#17191C]">Evaluating Profile with Nemotron 30B...</div>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Comparing your skill graph with high-growth market demand vectors...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {suggestions.map((sugg, i) => {
                const isSelected = selectedCareer.toLowerCase() === sugg.title.toLowerCase();
                return (
                  <div
                    key={i}
                    onClick={() => onSelectCareer(sugg.title)}
                    className={`p-5 rounded-3xl border cursor-pointer transition-all flex flex-col justify-between space-y-4 ${
                      isSelected
                        ? 'bg-[#17191C] text-white border-[#17191C] shadow-lg'
                        : 'bg-[#FFFFFF] text-[#17191C] border-[#DEDED5] hover:border-[#17191C] hover:shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          isSelected ? 'bg-[#C5F36A] text-[#17191C]' : 'bg-[#EFEEE7] text-neutral-800'
                        }`}>
                          {sugg.compatibility_score}% Compatibility
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-[#C5F36A]" />}
                      </div>

                      <h4 className="text-base font-extrabold">{sugg.title}</h4>
                      <p className={`text-xs mt-2 leading-relaxed ${isSelected ? 'text-neutral-300' : 'text-neutral-600'}`}>
                        {sugg.why_suitable}
                      </p>

                      <div className="mt-4 pt-3 border-t border-neutral-200/40">
                        <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 ${
                          isSelected ? 'text-[#C5F36A]' : 'text-neutral-500'
                        }`}>
                          Key Required Skills:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {sugg.key_required_skills?.map((sk: string, idx: number) => (
                            <span
                              key={idx}
                              className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                                isSelected ? 'bg-neutral-800 text-neutral-200' : 'bg-[#EFEEE7] text-neutral-700'
                              }`}
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                        isSelected
                          ? 'bg-[#C5F36A] text-[#17191C]'
                          : 'bg-[#EFEEE7] text-neutral-800 hover:bg-[#DEDED5]'
                      }`}
                    >
                      {isSelected ? '✓ Selected as Target Career' : 'Choose This Career Path'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Selected Career Badge Indicator */}
      {selectedCareer && (
        <div className="p-4 rounded-2xl bg-[#C5F36A]/20 border border-[#C5F36A] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-[#17191C]" />
            <span className="text-xs text-neutral-600 font-medium">Currently Selected Target Career:</span>
            <span className="text-sm font-extrabold text-[#17191C]">{selectedCareer}</span>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-white/80 px-2.5 py-1 rounded-full border border-emerald-200">
            Active Goal
          </span>
        </div>
      )}
    </div>
  );
};
