import React from 'react';
import { CheckCircle, Edit3, ArrowRight, Sparkles, User, FileText, Award, FolderGit2, Target } from 'lucide-react';
import { UserSkill, Certification, Project, ResumeAnalysis } from '../../types';

interface ConfirmationProps {
  personalInfo: {
    fullName: string;
    email: string;
    education: string;
    collegeOrganization: string;
    currentQualification: string;
    bio: string;
    areasOfInterest: string[];
  };
  resumeAnalysis: ResumeAnalysis | null;
  skills: UserSkill[];
  certifications: Certification[];
  projects: Project[];
  targetCareer: string;
  onEditStep: (stepNumber: number) => void;
  onConfirmAndAnalyze: () => void;
  isSubmitting: boolean;
}

export const ConfirmationSection: React.FC<ConfirmationProps> = ({
  personalInfo,
  resumeAnalysis,
  skills,
  certifications,
  projects,
  targetCareer,
  onEditStep,
  onConfirmAndAnalyze,
  isSubmitting,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-[#DEDED5] pb-4">
        <h3 className="text-lg font-bold text-[#17191C]">Profile Review & Final Confirmation</h3>
        <p className="text-xs text-neutral-500 mt-0.5">
          Review your compiled career profile before saving to Supabase and activating the Nemotron multi-agent analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Personal Info */}
        <div className="p-5 rounded-3xl bg-[#FFFFFF] border border-[#DEDED5] shadow-xs relative">
          <button
            type="button"
            onClick={() => onEditStep(1)}
            className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-[#17191C] hover:bg-[#EFEEE7] rounded-lg transition-colors"
            title="Edit Section"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <div className="flex items-center space-x-2 text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
            <User className="w-3.5 h-3.5 text-[#17191C]" />
            <span>Personal & Education</span>
          </div>
          <div className="text-base font-extrabold text-[#17191C]">{personalInfo.fullName || 'Not specified'}</div>
          <div className="text-xs text-neutral-600 mt-1">{personalInfo.education || 'No degree listed'} • {personalInfo.collegeOrganization || 'N/A'}</div>
          <div className="text-xs text-neutral-500 mt-1">{personalInfo.currentQualification}</div>
          {personalInfo.areasOfInterest?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {personalInfo.areasOfInterest.map((interest, i) => (
                <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-[#EFEEE7] font-medium text-[#17191C]">
                  {interest}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Card 2: Target Career */}
        <div className="p-5 rounded-3xl bg-[#FFFFFF] border border-[#DEDED5] shadow-xs relative">
          <button
            type="button"
            onClick={() => onEditStep(6)}
            className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-[#17191C] hover:bg-[#EFEEE7] rounded-lg transition-colors"
            title="Edit Section"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <div className="flex items-center space-x-2 text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
            <Target className="w-3.5 h-3.5 text-[#17191C]" />
            <span>Target Career Goal</span>
          </div>
          <div className="text-xl font-black text-[#17191C]">{targetCareer || 'None selected'}</div>
          <p className="text-xs text-neutral-500 mt-1">
            Skill gap benchmarks, adaptive roadmaps, and Gemini tutor focus will be tailored to this goal.
          </p>
        </div>

        {/* Card 3: Resume & ATS */}
        <div className="p-5 rounded-3xl bg-[#FFFFFF] border border-[#DEDED5] shadow-xs relative">
          <button
            type="button"
            onClick={() => onEditStep(2)}
            className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-[#17191C] hover:bg-[#EFEEE7] rounded-lg transition-colors"
            title="Edit Section"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <div className="flex items-center space-x-2 text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
            <FileText className="w-3.5 h-3.5 text-[#17191C]" />
            <span>Resume & ATS Compatibility</span>
          </div>
          {resumeAnalysis ? (
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-[#17191C]">{resumeAnalysis.ats_score}/100</span>
                <span className="text-xs font-semibold text-emerald-700">Audit Completed</span>
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                {resumeAnalysis.strengths?.length || 0} strengths, {resumeAnalysis.missing_sections?.length || 0} missing sections identified.
              </p>
            </div>
          ) : (
            <p className="text-xs text-neutral-400 italic">No resume uploaded yet (optional).</p>
          )}
        </div>

        {/* Card 4: Skills & Projects Count */}
        <div className="p-5 rounded-3xl bg-[#FFFFFF] border border-[#DEDED5] shadow-xs relative">
          <button
            type="button"
            onClick={() => onEditStep(3)}
            className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-[#17191C] hover:bg-[#EFEEE7] rounded-lg transition-colors"
            title="Edit Section"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <div className="flex items-center space-x-2 text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
            <Award className="w-3.5 h-3.5 text-[#17191C]" />
            <span>Profile Assets</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center mt-2">
            <div className="p-2 rounded-xl bg-[#F8F7F2]">
              <div className="text-lg font-black text-[#17191C]">{skills.length}</div>
              <div className="text-[10px] text-neutral-500 uppercase">Skills</div>
            </div>
            <div className="p-2 rounded-xl bg-[#F8F7F2]">
              <div className="text-lg font-black text-[#17191C]">{projects.length}</div>
              <div className="text-[10px] text-neutral-500 uppercase">Projects</div>
            </div>
            <div className="p-2 rounded-xl bg-[#F8F7F2]">
              <div className="text-lg font-black text-[#17191C]">{certifications.length}</div>
              <div className="text-[10px] text-neutral-500 uppercase">Certs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation CTA Box */}
      <div className="p-6 rounded-3xl bg-[#17191C] text-white flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
        <div>
          <div className="flex items-center space-x-2 text-[#C5F36A] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Ready for AI Analysis</span>
          </div>
          <h4 className="text-lg font-extrabold mt-1">Confirm and Launch Personalized Dashboard</h4>
          <p className="text-xs text-neutral-400 mt-0.5">
            Will trigger Nemotron agents to build your Skill Gap Matrix, Career Readiness Score, and Adaptive Roadmap.
          </p>
        </div>

        <button
          type="button"
          disabled={isSubmitting || !targetCareer}
          onClick={onConfirmAndAnalyze}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm bg-[#C5F36A] text-[#17191C] hover:bg-[#b8e858] transition-all flex items-center justify-center space-x-2 shrink-0 disabled:opacity-50 shadow-md"
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-[#17191C] border-t-transparent rounded-full animate-spin" />
              <span>Running Nemotron Agents...</span>
            </>
          ) : (
            <>
              <span>Confirm & Generate Roadmap</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
