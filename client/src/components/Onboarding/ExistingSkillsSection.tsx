import React, { useState } from 'react';
import { Plus, X, Award, Check } from 'lucide-react';
import { UserSkill } from '../../types';

interface ExistingSkillsProps {
  skills: UserSkill[];
  onChange: (skills: UserSkill[]) => void;
}

const POPULAR_SKILLS = [
  'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js',
  'SQL', 'PostgreSQL', 'Docker', 'FastAPI', 'Machine Learning',
  'PyTorch', 'Data Analytics', 'Power BI', 'Git', 'AWS'
];

export const ExistingSkillsSection: React.FC<ExistingSkillsProps> = ({ skills, onChange }) => {
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProf, setNewSkillProf] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');

  const handleAddSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newSkillName.trim();
    if (!trimmed) return;
    if (skills.some(s => s.skill_name.toLowerCase() === trimmed.toLowerCase())) {
      setNewSkillName('');
      return;
    }
    onChange([...skills, { skill_name: trimmed, proficiency: newSkillProf }]);
    setNewSkillName('');
  };

  const handleQuickAdd = (skillName: string) => {
    if (skills.some(s => s.skill_name.toLowerCase() === skillName.toLowerCase())) return;
    onChange([...skills, { skill_name: skillName, proficiency: 'Intermediate' }]);
  };

  const handleRemoveSkill = (index: number) => {
    onChange(skills.filter((_, i) => i !== index));
  };

  const handleProficiencyChange = (index: number, prof: 'Beginner' | 'Intermediate' | 'Advanced') => {
    const updated = [...skills];
    updated[index].proficiency = prof;
    onChange(updated);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-[#DEDED5] pb-4">
        <h3 className="text-lg font-bold text-[#17191C]">Technical & Professional Skills</h3>
        <p className="text-xs text-neutral-500 mt-0.5">
          List your programming languages, frameworks, cloud tools, and domain proficiencies. The Skill Gap Agent compares these with industry role requirements.
        </p>
      </div>

      {/* Add Skill Input Bar */}
      <form onSubmit={handleAddSkill} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            placeholder="Type a skill (e.g. Python, React, SQL, PyTorch)..."
            className="w-full px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#DEDED5] text-sm text-[#17191C] placeholder:text-neutral-400 focus:outline-none focus:border-[#17191C]"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={newSkillProf}
            onChange={(e) => setNewSkillProf(e.target.value as any)}
            className="px-3 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#DEDED5] text-xs font-semibold text-[#17191C] focus:outline-none focus:border-[#17191C]"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-[#17191C] text-[#C5F36A] hover:bg-[#2c3036] transition-all flex items-center space-x-1.5 shrink-0 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Skill</span>
          </button>
        </div>
      </form>

      {/* Quick Add Suggestions */}
      <div>
        <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-2">
          Popular Industry Skills (Click to quick-add):
        </span>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_SKILLS.map((item) => {
            const alreadyAdded = skills.some(s => s.skill_name.toLowerCase() === item.toLowerCase());
            return (
              <button
                key={item}
                type="button"
                disabled={alreadyAdded}
                onClick={() => handleQuickAdd(item)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  alreadyAdded
                    ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                    : 'bg-[#EFEEE7] text-neutral-700 hover:bg-[#DEDED5]'
                }`}
              >
                {alreadyAdded ? '✓ ' : '+ '}
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {/* Added Skills List */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-[#17191C] uppercase tracking-wider">
            Your Tracked Skills ({skills.length})
          </h4>
          {skills.length > 0 && (
            <span className="text-xs text-neutral-500">Click proficiency to adjust</span>
          )}
        </div>

        {skills.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#F8F7F2] border border-dashed border-[#DEDED5] text-center">
            <Award className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
            <p className="text-xs text-neutral-500">No skills added yet. Use the bar above or upload a resume to auto-import skills.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {skills.map((skill, index) => (
              <div
                key={index}
                className="p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#DEDED5] shadow-2xs flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="text-sm font-bold text-[#17191C] truncate">{skill.skill_name}</div>
                  <div className="flex items-center space-x-1 mt-1">
                    {(['Beginner', 'Intermediate', 'Advanced'] as const).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => handleProficiencyChange(index, level)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${
                          skill.proficiency === level
                            ? level === 'Advanced'
                              ? 'bg-[#17191C] text-[#C5F36A]'
                              : level === 'Intermediate'
                              ? 'bg-[#C5F36A] text-[#17191C]'
                              : 'bg-[#EFEEE7] text-neutral-800'
                            : 'text-neutral-400 hover:text-neutral-700'
                        }`}
                      >
                        {level.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveSkill(index)}
                  className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-neutral-100 rounded-lg transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
