import React from 'react';
import { Award, CheckCircle2, AlertTriangle, ArrowUpRight, TrendingUp, Sparkles, BookOpen } from 'lucide-react';
import { SkillGapAnalysis, UserSkill } from '../../types';

interface SkillAnalysisSectionProps {
  gapAnalysis: SkillGapAnalysis | null;
  userSkills: UserSkill[];
  onTakeSkillAssessment: (skillName: string) => void;
}

export const SkillAnalysisSection: React.FC<SkillAnalysisSectionProps> = ({
  gapAnalysis,
  userSkills,
  onTakeSkillAssessment,
}) => {
  if (!gapAnalysis) {
    return (
      <div className="p-8 rounded-3xl bg-[#FFFFFF] border border-[#DEDED5] text-center">
        <Sparkles className="w-8 h-8 text-[#17191C] mx-auto mb-2 animate-pulse" />
        <h3 className="text-base font-bold text-[#17191C]">Skill Gap Matrix Generating</h3>
        <p className="text-xs text-neutral-500 mt-1">Select your target career to run the Nemotron skill gap analysis.</p>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[#DEDED5] shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DEDED5] pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-xl font-extrabold text-[#17191C]">Skill Gap & Proficiency Matrix</h3>
            <span className="px-2 py-0.5 rounded-full bg-[#C5F36A] text-[#17191C] text-[10px] font-extrabold uppercase">
              Agent 2
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Benchmarked against current industry requirements for <span className="font-bold text-[#17191C]">{gapAnalysis.target_career}</span>.
          </p>
        </div>
      </div>

      {/* Gap Summary Banner */}
      {gapAnalysis.gap_summary && (
        <div className="p-4 rounded-2xl bg-[#F8F7F2] border border-[#DEDED5]">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block mb-1">
            Executive Skill Gap Assessment:
          </span>
          <p className="text-xs sm:text-sm text-[#17191C] leading-relaxed font-medium">
            "{gapAnalysis.gap_summary}"
          </p>
        </div>
      )}

      {/* 4 Quadrants: Strong, Intermediate, Weak, Missing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strong Skills */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#DEDED5] shadow-2xs">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-xs font-bold text-[#17191C] uppercase tracking-wider">
              Strong Core Competencies ({gapAnalysis.strong_skills?.length || 0})
            </h4>
          </div>

          <div className="space-y-2">
            {gapAnalysis.strong_skills?.map((item, i) => (
              <div key={i} className="p-3 rounded-xl bg-[#F8F7F2] flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-[#17191C]">{item.name}</span>
                  <p className="text-[11px] text-neutral-500 mt-0.5">{item.reason}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onTakeSkillAssessment(item.name)}
                  className="px-2 py-1 rounded-lg text-[10px] font-bold bg-[#EFEEE7] text-neutral-700 hover:bg-[#17191C] hover:text-[#C5F36A] transition-colors shrink-0"
                >
                  Verify
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Missing Skills (High Priority Gaps) */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#DEDED5] shadow-2xs">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-xs font-bold text-[#17191C] uppercase tracking-wider">
              High Priority Skill Gaps ({gapAnalysis.missing_skills?.length || 0})
            </h4>
          </div>

          <div className="space-y-2">
            {gapAnalysis.missing_skills?.map((item, i) => (
              <div key={i} className="p-3 rounded-xl bg-[#F8F7F2] flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-[#17191C]">{item.name}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase ${
                      item.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.priority}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-0.5">{item.importance_reason}</p>
                </div>

                <button
                  type="button"
                  onClick={() => onTakeSkillAssessment(item.name)}
                  className="px-2 py-1 rounded-lg text-[10px] font-bold bg-[#C5F36A] text-[#17191C] hover:bg-[#b8e858] transition-colors shrink-0"
                >
                  Test Skill
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
