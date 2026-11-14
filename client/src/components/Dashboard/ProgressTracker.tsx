import React from 'react';
import { TrendingUp, CheckCircle, Clock, Award, Calendar, BarChart3, ShieldCheck } from 'lucide-react';
import { LearningActivity, UserSkill } from '../../types';

interface ProgressTrackerProps {
  activities: LearningActivity[];
  assessmentAttempts: any[];
  userSkills: UserSkill[];
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  activities,
  assessmentAttempts,
  userSkills,
}) => {
  const completedActivities = activities.filter(a => a.is_completed);
  const pendingActivities = activities.filter(a => !a.is_completed);
  const totalActivities = activities.length;
  const progressPct = totalActivities > 0 ? Math.round((completedActivities.length / totalActivities) * 100) : 0;

  const passedTests = assessmentAttempts.filter(a => a.passed);
  const avgScore = assessmentAttempts.length > 0
    ? Math.round(assessmentAttempts.reduce((acc, curr) => acc + (curr.score || 0), 0) / assessmentAttempts.length)
    : 0;

  const verifiedSkillsCount = userSkills.filter(s => s.verified).length;

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[#DEDED5] shadow-xs space-y-6">
      <div className="border-b border-[#DEDED5] pb-4">
        <h3 className="text-xl font-extrabold text-[#17191C]">Verifiable Progress & Assessment Performance</h3>
        <p className="text-xs text-neutral-500 mt-0.5">
          Calculated from persistent database activity records and adaptive test scores.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#F8F7F2] border border-[#DEDED5]">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-bold uppercase mb-2">
            <span>Roadmap Progress</span>
            <TrendingUp className="w-4 h-4 text-[#17191C]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#17191C]">{progressPct}%</div>
          <div className="text-[11px] text-neutral-500 mt-1">
            {completedActivities.length} of {totalActivities} tasks finished
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#F8F7F2] border border-[#DEDED5]">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-bold uppercase mb-2">
            <span>Assessments Passed</span>
            <Award className="w-4 h-4 text-[#17191C]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#17191C]">{passedTests.length}</div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Out of {assessmentAttempts.length} total attempts
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#F8F7F2] border border-[#DEDED5]">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-bold uppercase mb-2">
            <span>Avg Test Score</span>
            <BarChart3 className="w-4 h-4 text-[#17191C]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#17191C]">{avgScore}%</div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Across technical evaluations
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#F8F7F2] border border-[#DEDED5]">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-bold uppercase mb-2">
            <span>Verified Skills</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#17191C]">{verifiedSkillsCount}</div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Validated by assessment pass
          </div>
        </div>
      </div>

      {/* Assessment History Table */}
      {assessmentAttempts.length > 0 && (
        <div className="pt-2">
          <h4 className="text-xs font-bold text-[#17191C] uppercase tracking-wider mb-3">
            Recent Assessment History & Remediation
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F7F2] text-neutral-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3 rounded-l-xl">Skill Assessed</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Result</th>
                  <th className="p-3">Feedback & Weak Topics</th>
                  <th className="p-3 rounded-r-xl">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DEDED5]">
                {assessmentAttempts.slice(0, 5).map((att, i) => (
                  <tr key={i} className="hover:bg-[#F8F7F2]/50 transition-colors">
                    <td className="p-3 font-bold text-[#17191C]">{att.skill_name || 'Technical Concept'}</td>
                    <td className="p-3 font-extrabold text-[#17191C]">{att.score}%</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        att.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {att.passed ? 'Passed' : 'Needs Practice'}
                      </span>
                    </td>
                    <td className="p-3 text-neutral-600 max-w-xs truncate">
                      {att.ai_feedback || (att.weak_topics?.join(', ') || 'Solid concept application')}
                    </td>
                    <td className="p-3 text-neutral-400">
                      {att.completed_at ? new Date(att.completed_at).toLocaleDateString() : 'Recent'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
