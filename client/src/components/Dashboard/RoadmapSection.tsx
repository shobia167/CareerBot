import React from 'react';
import { BookOpen, CheckSquare, Square, ExternalLink, Clock, PlayCircle, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
import { LearningRoadmap, LearningActivity } from '../../types';

interface RoadmapSectionProps {
  roadmap: LearningRoadmap | null;
  activities: LearningActivity[];
  onToggleActivity: (activityId: string, currentStatus: boolean) => void;
  onTakeAssessment: (skillName: string) => void;
  onRegenerateRoadmap: () => void;
  isRegenerating: boolean;
}

export const RoadmapSection: React.FC<RoadmapSectionProps> = ({
  roadmap,
  activities,
  onToggleActivity,
  onTakeAssessment,
  onRegenerateRoadmap,
  isRegenerating,
}) => {
  if (!roadmap) {
    return (
      <div className="p-8 rounded-3xl bg-[#FFFFFF] border border-[#DEDED5] text-center">
        <Sparkles className="w-8 h-8 text-[#17191C] mx-auto mb-2 animate-pulse" />
        <h3 className="text-base font-bold text-[#17191C]">No Active Roadmap Generated</h3>
        <p className="text-xs text-neutral-500 mt-1">Complete your career selection to activate Agent 4's personalized curriculum.</p>
      </div>
    );
  }

  const completedCount = activities.filter(a => a.is_completed).length;
  const progressPct = activities.length > 0 ? Math.round((completedCount / activities.length) * 100) : 0;

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[#DEDED5] shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DEDED5] pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-xl font-extrabold text-[#17191C]">{roadmap.title}</h3>
            <span className="px-2 py-0.5 rounded-full bg-[#C5F36A] text-[#17191C] text-[10px] font-extrabold uppercase">
              Agent 4
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            {roadmap.description || 'Step-by-step sequential learning modules verified with official documentation.'}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              {completedCount} of {activities.length} Completed
            </div>
            <div className="text-sm font-extrabold text-[#17191C]">{progressPct}% Complete</div>
          </div>
          <button
            type="button"
            disabled={isRegenerating}
            onClick={onRegenerateRoadmap}
            className="p-2.5 rounded-xl bg-[#F8F7F2] border border-[#DEDED5] text-neutral-700 hover:text-[#17191C] hover:bg-[#EFEEE7] transition-colors"
            title="Regenerate Roadmap with AI"
          >
            <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#EFEEE7] h-2.5 rounded-full overflow-hidden">
        <div
          className="bg-[#C5F36A] h-full rounded-full transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Activities Sequence */}
      <div className="space-y-4 pt-2">
        {activities.map((act) => (
          <div
            key={act.id}
            className={`p-5 rounded-2xl border transition-all ${
              act.is_completed
                ? 'bg-[#F8F7F2]/80 border-emerald-200'
                : 'bg-[#FFFFFF] border-[#DEDED5] hover:border-neutral-400'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              {/* Checkbox & Details */}
              <div className="flex items-start space-x-3 min-w-0">
                <button
                  type="button"
                  onClick={() => onToggleActivity(act.id, act.is_completed)}
                  className="mt-1 text-neutral-400 hover:text-[#17191C] transition-colors shrink-0"
                >
                  {act.is_completed ? (
                    <CheckSquare className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>

                <div className="min-w-0">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="w-5 h-5 rounded-full bg-[#17191C] text-[#C5F36A] text-[10px] font-bold flex items-center justify-center shrink-0">
                      {act.sequence_order}
                    </span>
                    <h4 className={`text-sm font-extrabold ${act.is_completed ? 'line-through text-neutral-400' : 'text-[#17191C]'}`}>
                      {act.skill_name}
                    </h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#EFEEE7] text-neutral-700">
                      {act.difficulty_level}
                    </span>
                    <span className="flex items-center space-x-1 text-[11px] text-neutral-500">
                      <Clock className="w-3 h-3" />
                      <span>{act.estimated_duration}</span>
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                    {act.learning_objective}
                  </p>

                  {/* Practical Task */}
                  {act.practical_task && (
                    <div className="mt-3 p-3 rounded-xl bg-[#F8F7F2] border border-[#DEDED5] text-xs">
                      <span className="font-bold text-[#17191C]">Practical Portfolio Exercise: </span>
                      <span className="text-neutral-700">{act.practical_task}</span>
                    </div>
                  )}

                  {/* Resource Link */}
                  {act.resource_title && (
                    <div className="mt-3 flex items-center space-x-2">
                      <span className="text-[11px] font-bold text-neutral-500 uppercase">Resource:</span>
                      <a
                        href={act.resource_url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1 text-xs font-semibold text-[#17191C] hover:underline"
                      >
                        <span>{act.resource_title}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Take Assessment Button */}
              <div className="shrink-0 flex flex-col items-end space-y-2">
                <button
                  type="button"
                  onClick={() => onTakeAssessment(act.skill_name)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#17191C] text-[#C5F36A] hover:bg-[#2c3036] transition-all flex items-center space-x-1.5 shadow-xs"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>Take Assessment</span>
                </button>

                {act.is_completed && (
                  <span className="text-[10px] font-bold text-emerald-700 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Activity Verified</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
