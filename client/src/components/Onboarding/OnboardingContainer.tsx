import React, { useState } from 'react';
import { User, FileText, Award, FolderGit2, Target, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import { PersonalInfoSection } from './PersonalInfoSection';
import { ResumeUploadSection } from './ResumeUploadSection';
import { ExistingSkillsSection } from './ExistingSkillsSection';
import { CertificationsSection } from './CertificationsSection';
import { ProjectsSection } from './ProjectsSection';
import { CareerGoalSection } from './CareerGoalSection';
import { ConfirmationSection } from './ConfirmationSection';
import { UserSkill, Certification, Project, ResumeAnalysis } from '../../types';

interface OnboardingContainerProps {
  initialEmail?: string;
  onComplete: () => void;
  onSubmitProfileData: (data: any) => Promise<void>;
}

export const OnboardingContainer: React.FC<OnboardingContainerProps> = ({
  initialEmail,
  onComplete,
  onSubmitProfileData,
}) => {
  const [activeStep, setActiveStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    email: initialEmail || '',
    education: '',
    collegeOrganization: '',
    currentQualification: 'Undergraduate Student',
    bio: '',
    areasOfInterest: ['Artificial Intelligence', 'Full Stack Development'],
  });

  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysis | null>(null);
  const [skills, setSkills] = useState<UserSkill[]>([
    { skill_name: 'Python', proficiency: 'Intermediate' },
    { skill_name: 'SQL', proficiency: 'Intermediate' },
  ]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [targetCareer, setTargetCareer] = useState<string>('AI Engineer');

  const steps = [
    { num: 1, title: 'Personal Info', icon: User },
    { num: 2, title: 'Resume Upload', icon: FileText },
    { num: 3, title: 'Skills', icon: Award },
    { num: 4, title: 'Certifications', icon: Award },
    { num: 5, title: 'Projects', icon: FolderGit2 },
    { num: 6, title: 'Career Goal', icon: Target },
    { num: 7, title: 'Confirmation', icon: CheckCircle2 },
  ];

  const handleExtractedSkillsAdd = (extractedSkills: string[]) => {
    const existingNames = new Set(skills.map(s => s.skill_name.toLowerCase()));
    const newItems: UserSkill[] = [];
    for (const name of extractedSkills) {
      if (!existingNames.has(name.toLowerCase())) {
        newItems.push({ skill_name: name, proficiency: 'Intermediate' });
      }
    }
    setSkills(prev => [...prev, ...newItems]);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmitProfileData({
        personalInfo,
        resumeAnalysis,
        skills,
        certifications,
        projects,
        targetCareer
      });
      onComplete();
    } catch (e) {
      console.error('Submission error:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="onboarding-section" className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Container Header */}
      <div className="text-center mb-8">
        <span className="px-3 py-1 rounded-full bg-[#FFFFFF] border border-[#DEDED5] text-xs font-bold uppercase tracking-wider text-neutral-800">
          Step {activeStep} of {steps.length} • Interactive Discovery
        </span>
        <h2 className="text-3xl font-extrabold text-[#17191C] mt-2">
          Personalized Learner Profile
        </h2>
        <p className="text-sm text-neutral-500 mt-1 max-w-xl mx-auto">
          Complete these sections to enable high-precision AI career gap analysis and structured roadmap generation.
        </p>
      </div>

      {/* Large Form Card */}
      <div className="bg-[#FFFFFF] rounded-3xl border border-[#DEDED5] shadow-lg overflow-hidden">
        {/* Step Navigation Pill Bar */}
        <div className="border-b border-[#DEDED5] bg-[#F8F7F2] p-3 sm:p-4 overflow-x-auto scrollbar-none">
          <div className="flex items-center space-x-2 min-w-max">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = activeStep === step.num;
              const isPast = activeStep > step.num;
              return (
                <button
                  key={step.num}
                  onClick={() => setActiveStep(step.num)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#17191C] text-[#C5F36A] shadow-xs'
                      : isPast
                      ? 'bg-[#EFEEE7] text-[#17191C] hover:bg-[#E5E4DC]'
                      : 'text-neutral-400 hover:text-neutral-700'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    isActive ? 'bg-[#C5F36A] text-[#17191C]' : isPast ? 'bg-[#17191C] text-white' : 'bg-neutral-200 text-neutral-600'
                  }`}>
                    {step.num}
                  </span>
                  <span>{step.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Content Area */}
        <div className="p-6 sm:p-10">
          {activeStep === 1 && (
            <PersonalInfoSection
              data={personalInfo}
              onChange={(fields) => setPersonalInfo(prev => ({ ...prev, ...fields }))}
            />
          )}

          {activeStep === 2 && (
            <ResumeUploadSection
              currentAnalysis={resumeAnalysis}
              onAnalysisComplete={setResumeAnalysis}
              onExtractedSkillsAdd={handleExtractedSkillsAdd}
            />
          )}

          {activeStep === 3 && (
            <ExistingSkillsSection
              skills={skills}
              onChange={setSkills}
            />
          )}

          {activeStep === 4 && (
            <CertificationsSection
              certifications={certifications}
              onChange={setCertifications}
            />
          )}

          {activeStep === 5 && (
            <ProjectsSection
              projects={projects}
              onChange={setProjects}
            />
          )}

          {activeStep === 6 && (
            <CareerGoalSection
              selectedCareer={targetCareer}
              onSelectCareer={setTargetCareer}
            />
          )}

          {activeStep === 7 && (
            <ConfirmationSection
              personalInfo={personalInfo}
              resumeAnalysis={resumeAnalysis}
              skills={skills}
              certifications={certifications}
              projects={projects}
              targetCareer={targetCareer}
              onEditStep={(step) => setActiveStep(step)}
              onConfirmAndAnalyze={handleFinalSubmit}
              isSubmitting={isSubmitting}
            />
          )}
        </div>

        {/* Form Footer Controls */}
        <div className="p-4 sm:p-6 bg-[#F8F7F2] border-t border-[#DEDED5] flex items-center justify-between">
          <button
            type="button"
            disabled={activeStep === 1}
            onClick={() => setActiveStep(prev => Math.max(prev - 1, 1))}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-[#17191C] bg-[#FFFFFF] border border-[#DEDED5] hover:bg-[#EFEEE7] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-xs text-neutral-500 font-medium hidden sm:inline">
            Step {activeStep} of {steps.length}
          </span>

          {activeStep < 7 ? (
            <button
              type="button"
              onClick={() => setActiveStep(prev => Math.min(prev + 1, 7))}
              className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-[#17191C] bg-[#C5F36A] hover:bg-[#b8e858] transition-all shadow-xs"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting || !targetCareer}
              onClick={handleFinalSubmit}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold text-[#17191C] bg-[#C5F36A] hover:bg-[#b8e858] transition-all shadow-xs disabled:opacity-50"
            >
              <span>Launch Dashboard</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
