import React from 'react';
import { User, School, GraduationCap, Building2, Tag, BookOpen } from 'lucide-react';

interface PersonalInfoProps {
  data: {
    fullName: string;
    email: string;
    education: string;
    collegeOrganization: string;
    currentQualification: string;
    bio: string;
    areasOfInterest: string[];
  };
  onChange: (fields: Partial<PersonalInfoProps['data']>) => void;
}

const COMMON_INTERESTS = [
  'Artificial Intelligence', 'Full Stack Development', 'Machine Learning',
  'Data Science', 'Cloud Architecture', 'DevOps & MLOps', 'Cybersecurity',
  'Mobile App Development', 'Product Design', 'Backend Engineering'
];

export const PersonalInfoSection: React.FC<PersonalInfoProps> = ({ data, onChange }) => {
  const toggleInterest = (interest: string) => {
    const current = data.areasOfInterest || [];
    if (current.includes(interest)) {
      onChange({ areasOfInterest: current.filter(i => i !== interest) });
    } else {
      onChange({ areasOfInterest: [...current, interest] });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-[#DEDED5] pb-4">
        <h3 className="text-lg font-bold text-[#17191C]">Personal & Educational Background</h3>
        <p className="text-xs text-neutral-500 mt-0.5">
          Provide your current educational qualifications and professional focus to customize your learning pathway.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              required
              value={data.fullName}
              onChange={(e) => onChange({ fullName: e.target.value })}
              placeholder="e.g. Jordan Lee"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#DEDED5] text-sm text-[#17191C] placeholder:text-neutral-400 focus:outline-none focus:border-[#17191C]"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            value={data.email}
            disabled
            className="w-full px-4 py-2.5 rounded-xl bg-[#EFEEE7] border border-[#DEDED5] text-sm text-neutral-600 cursor-not-allowed"
          />
        </div>

        {/* College / Organization */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
            College, University or Current Organization
          </label>
          <div className="relative">
            <Building2 className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={data.collegeOrganization}
              onChange={(e) => onChange({ collegeOrganization: e.target.value })}
              placeholder="e.g. Stanford University / Tech Corp"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#DEDED5] text-sm text-[#17191C] placeholder:text-neutral-400 focus:outline-none focus:border-[#17191C]"
            />
          </div>
        </div>

        {/* Education Degree */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
            Education / Major
          </label>
          <div className="relative">
            <GraduationCap className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={data.education}
              onChange={(e) => onChange({ education: e.target.value })}
              placeholder="e.g. B.S. in Computer Science"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#DEDED5] text-sm text-[#17191C] placeholder:text-neutral-400 focus:outline-none focus:border-[#17191C]"
            />
          </div>
        </div>

        {/* Current Qualification / Experience Level */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
            Current Qualification / Experience Stage
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['Undergraduate Student', 'Recent Graduate', 'Early Career (1-3 yrs)', 'Experienced Professional'].map((stage) => (
              <button
                key={stage}
                type="button"
                onClick={() => onChange({ currentQualification: stage })}
                className={`py-2 px-3 rounded-xl text-xs font-semibold text-center border transition-all ${
                  data.currentQualification === stage
                    ? 'bg-[#17191C] text-[#C5F36A] border-[#17191C] shadow-xs'
                    : 'bg-[#FFFFFF] text-neutral-700 border-[#DEDED5] hover:bg-[#EFEEE7]'
                }`}
              >
                {stage}
              </button>
            ))}
          </div>
        </div>

        {/* Short Bio */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
            Short Professional Bio
          </label>
          <textarea
            rows={3}
            value={data.bio}
            onChange={(e) => onChange({ bio: e.target.value })}
            placeholder="Briefly describe your career aspirations, key areas of excitement, or what drives your learning..."
            className="w-full p-3 rounded-xl bg-[#FFFFFF] border border-[#DEDED5] text-sm text-[#17191C] placeholder:text-neutral-400 focus:outline-none focus:border-[#17191C]"
          />
        </div>

        {/* Areas of Interest Tags */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
            <Tag className="w-3.5 h-3.5" />
            <span>Areas of Interest (Select all that apply)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {COMMON_INTERESTS.map((interest) => {
              const selected = (data.areasOfInterest || []).includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    selected
                      ? 'bg-[#C5F36A] text-[#17191C] shadow-xs'
                      : 'bg-[#FFFFFF] text-neutral-600 border border-[#DEDED5] hover:bg-[#EFEEE7]'
                  }`}
                >
                  {selected ? '✓ ' : '+ '}
                  {interest}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
