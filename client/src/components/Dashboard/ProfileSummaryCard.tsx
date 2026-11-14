import React from 'react';
import { UserProfile, UserSkill, Certification, Project } from '../../types';
import { User, School, Target, Award, FolderGit2, Sparkles, BookOpen } from 'lucide-react';

interface ProfileSummaryCardProps {
  profile: UserProfile | null;
  skills: UserSkill[];
  certifications: Certification[];
  projects: Project[];
  onEditProfile: () => void;
}

export const ProfileSummaryCard: React.FC<ProfileSummaryCardProps> = ({
  profile,
  skills,
  certifications,
  projects,
  onEditProfile,
}) => {
  return (
    <div id="profile-summary-section" className="p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[#DEDED5] shadow-xs">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        {/* Left: Avatar & Identity */}
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-[#17191C] text-[#C5F36A] flex items-center justify-center font-black text-2xl shadow-sm border border-neutral-800 shrink-0">
            {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-2xl font-extrabold text-[#17191C]">{profile?.full_name || 'Learner Profile'}</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-[#C5F36A] text-[#17191C] text-[10px] font-extrabold uppercase">
                Active
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-neutral-500 mt-1 font-medium">
              <span className="flex items-center space-x-1">
                <School className="w-3.5 h-3.5" />
                <span>{profile?.education || 'Degree not specified'}</span>
              </span>
              {profile?.college_organization && (
                <span>• {profile.college_organization}</span>
              )}
            </div>
            {profile?.bio && (
              <p className="text-xs text-neutral-600 mt-2 max-w-xl leading-relaxed">
                "{profile.bio}"
              </p>
            )}
          </div>
        </div>

        {/* Right: Career Goal Pill & Edit Action */}
        <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3">
          <div className="p-3.5 rounded-2xl bg-[#F8F7F2] border border-[#DEDED5] text-left md:text-right">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
              Target Career Role
            </span>
            <div className="text-base font-black text-[#17191C] flex items-center md:justify-end space-x-1.5 mt-0.5">
              <Target className="w-4 h-4 text-[#17191C]" />
              <span>{profile?.target_career || 'Not Chosen'}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onEditProfile}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#17191C] bg-[#EFEEE7] hover:bg-[#DEDED5] transition-colors border border-[#DEDED5]"
          >
            Update Profile
          </button>
        </div>
      </div>

      {/* Profile Assets Bar */}
      <div className="mt-6 pt-6 border-t border-[#DEDED5] grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="p-3 rounded-2xl bg-[#F8F7F2]">
          <div className="text-xl font-black text-[#17191C]">{skills.length}</div>
          <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mt-0.5">Skills Tracked</div>
        </div>

        <div className="p-3 rounded-2xl bg-[#F8F7F2]">
          <div className="text-xl font-black text-[#17191C]">{projects.length}</div>
          <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mt-0.5">Projects Built</div>
        </div>

        <div className="p-3 rounded-2xl bg-[#F8F7F2]">
          <div className="text-xl font-black text-[#17191C]">{certifications.length}</div>
          <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mt-0.5">Certifications</div>
        </div>

        <div className="p-3 rounded-2xl bg-[#F8F7F2]">
          <div className="text-xl font-black text-[#17191C]">{profile?.career_readiness_score || 0}%</div>
          <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mt-0.5">Readiness Score</div>
        </div>
      </div>
    </div>
  );
};
