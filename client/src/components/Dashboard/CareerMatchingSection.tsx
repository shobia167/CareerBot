import React from 'react';
import { Target, CheckCircle2, AlertCircle, ArrowRight, Compass, Sparkles, TrendingUp } from 'lucide-react';
import { CareerMatch } from '../../types';

interface CareerMatchingProps {
  careerMatch: CareerMatch | null;
  onSwitchCareer: (careerTitle: string) => void;
}

export const CareerMatchingSection: React.FC<CareerMatchingProps> = ({
  careerMatch,
  onSwitchCareer,
}) => {
  if (!careerMatch) return null;

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[#DEDED5] shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DEDED5] pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-xl font-extrabold text-[#17191C]">Career Readiness & Opportunity Matching</h3>
            <span className="px-2 py-0.5 rounded-full bg-[#C5F36A] text-[#17191C] text-[10px] font-extrabold uppercase">
              Agent 3
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Explainable readiness evaluation for <span className="font-bold text-[#17191C]">{careerMatch.career_title}</span>.
          </p>
        </div>

        {/* Readiness Meter */}
        <div className="flex items-center space-x-4 bg-[#F8F7F2] p-3 rounded-2xl border border-[#DEDED5]">
          <div>
            <div className="text-xs font-bold text-neutral-500 uppercase">Readiness Score</div>
            <div className="text-2xl font-black text-[#17191C]">{careerMatch.readiness_score}%</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#17191C] flex items-center justify-center text-[#C5F36A] font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Reasoning Banner */}
      <div className="p-4 rounded-2xl bg-[#EFEEE7]/60 border border-[#DEDED5] text-xs text-neutral-700 leading-relaxed">
        <span className="font-bold text-[#17191C]">Evaluation Rationale: </span>
        {careerMatch.reasoning}
      </div>

      {/* Matching Skills vs Missing Requirements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#DEDED5]">
          <h4 className="text-xs font-bold text-[#17191C] uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Demonstrated Matching Skills</span>
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {careerMatch.matching_skills?.map((sk, i) => (
              <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                ✓ {sk}
              </span>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#DEDED5]">
          <h4 className="text-xs font-bold text-[#17191C] uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Missing Role Requirements</span>
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {careerMatch.missing_requirements?.map((req, i) => (
              <span key={i} className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
                • {req}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Alternative Career Paths */}
      {careerMatch.alternative_paths?.length > 0 && (
        <div className="pt-2">
          <h4 className="text-xs font-bold text-[#17191C] uppercase tracking-wider mb-3">
            Recommended Alternative Career Paths (High Transferable Compatibility)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {careerMatch.alternative_paths.map((alt, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#F8F7F2] border border-[#DEDED5] flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-extrabold text-[#17191C]">{alt.title}</h5>
                    <span className="px-2 py-0.5 rounded-full bg-[#17191C] text-[#C5F36A] text-[10px] font-bold">
                      {alt.match_score}% Match
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">{alt.why_good_fit}</p>

                  <div className="mt-3">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                      Bridge Skills Needed:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {alt.bridge_skills_needed?.map((bs, bidx) => (
                        <span key={bidx} className="px-2 py-0.5 rounded text-[10px] bg-white border border-[#DEDED5] text-neutral-700">
                          {bs}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSwitchCareer(alt.title)}
                  className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-[#FFFFFF] border border-[#DEDED5] hover:bg-[#17191C] hover:text-[#C5F36A] transition-all flex items-center justify-center space-x-1"
                >
                  <span>Switch Goal to {alt.title}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
