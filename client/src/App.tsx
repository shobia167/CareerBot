import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { api } from './lib/api';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { AuthModal } from './components/AuthModal';
import { OnboardingContainer } from './components/Onboarding/OnboardingContainer';
import { ProfileSummaryCard } from './components/Dashboard/ProfileSummaryCard';
import { SkillAnalysisSection } from './components/Dashboard/SkillAnalysisSection';
import { CareerMatchingSection } from './components/Dashboard/CareerMatchingSection';
import { RoadmapSection } from './components/Dashboard/RoadmapSection';
import { ProgressTracker } from './components/Dashboard/ProgressTracker';
import { PrivateLearningPosts } from './components/Dashboard/PrivateLearningPosts';
import { AssessmentModal } from './components/AssessmentModal';
import { AITutorPanel } from './components/TutorChat/AITutorPanel';
import {
  UserProfile,
  UserSkill,
  Certification,
  Project,
  SkillGapAnalysis,
  CareerMatch,
  LearningRoadmap,
  LearningActivity,
  LearningPost,
  AssessmentResult
} from './types';
import { Sparkles, Bot, AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isTutorOpen, setIsTutorOpen] = useState(false);

  // Application Data States
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [gapAnalysis, setGapAnalysis] = useState<SkillGapAnalysis | null>(null);
  const [careerMatch, setCareerMatch] = useState<CareerMatch | null>(null);
  const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(null);
  const [activities, setActivities] = useState<LearningActivity[]>([]);
  const [posts, setPosts] = useState<LearningPost[]>([]);
  const [assessmentAttempts, setAssessmentAttempts] = useState<any[]>([]);

  // Assessment Modal state
  const [assessmentModalSkill, setAssessmentModalSkill] = useState<string | null>(null);
  const [isRegeneratingRoadmap, setIsRegeneratingRoadmap] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // 1. Listen for Supabase auth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingAuth(false);
      if (session) {
        loadAllUserData();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        loadAllUserData();
      } else {
        resetAppState();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const resetAppState = () => {
    setProfile(null);
    setSkills([]);
    setCertifications([]);
    setProjects([]);
    setGapAnalysis(null);
    setCareerMatch(null);
    setRoadmap(null);
    setActivities([]);
    setPosts([]);
    setAssessmentAttempts([]);
    setShowOnboarding(false);
  };

  const loadAllUserData = async () => {
    try {
      // 1. Load Profile
      const meData = await api.getProfile();
      if (meData?.profile) {
        setProfile(meData.profile);
        if (!meData.profile.target_career) {
          setShowOnboarding(true);
        }
      }

      // 2. Load Skills, Projects, Certs
      const [skillsRes, projectsRes, certsRes] = await Promise.all([
        api.getSkills().catch(() => ({ skills: [] })),
        api.getProjects().catch(() => ({ projects: [] })),
        api.getCertifications().catch(() => ({ certifications: [] })),
      ]);
      setSkills(skillsRes.skills || []);
      setProjects(projectsRes.projects || []);
      setCertifications(certsRes.certifications || []);

      // 3. Load Career Analysis
      const careerData = await api.getCurrentCareer().catch(() => null);
      if (careerData) {
        setGapAnalysis(careerData.gap_analysis);
        setCareerMatch(careerData.career_match);
      }

      // 4. Load Active Roadmap
      const roadmapData = await api.getActiveRoadmap().catch(() => null);
      if (roadmapData) {
        setRoadmap(roadmapData.roadmap);
        setActivities(roadmapData.activities || []);
      }

      // 5. Load Posts & Assessments
      const [postsRes, attemptsRes] = await Promise.all([
        api.getPosts().catch(() => ({ posts: [] })),
        api.getAssessmentHistory().catch(() => ({ attempts: [] })),
      ]);
      setPosts(postsRes.posts || []);
      setAssessmentAttempts(attemptsRes.attempts || []);
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    resetAppState();
  };

  // Submit collected onboarding data
  const handleOnboardingSubmit = async (data: any) => {
    const { personalInfo, skills: newSkills, certifications: newCerts, projects: newProjects, targetCareer } = data;

    // 1. Update Profile
    await api.updateProfile({
      full_name: personalInfo.fullName,
      education: personalInfo.education,
      college_organization: personalInfo.collegeOrganization,
      current_qualification: personalInfo.currentQualification,
      bio: personalInfo.bio,
      areas_of_interest: personalInfo.areasOfInterest,
      target_career: targetCareer,
    });

    // 2. Save skills, certs, projects
    for (const s of newSkills) {
      await api.addSkill(s).catch(() => {});
    }
    for (const c of newCerts) {
      await api.addCertification(c).catch(() => {});
    }
    for (const p of newProjects) {
      await api.addProject(p).catch(() => {});
    }

    // 3. Trigger Nemotron Career Analysis (Agent 2 & 3)
    const selectRes = await api.selectCareer(targetCareer);
    if (selectRes) {
      setGapAnalysis(selectRes.gap_analysis);
      setCareerMatch(selectRes.career_match);
    }

    // 4. Trigger Nemotron Learning Roadmap (Agent 4)
    const roadmapRes = await api.generateRoadmap(targetCareer);
    if (roadmapRes) {
      setRoadmap(roadmapRes.roadmap);
      setActivities(roadmapRes.activities || []);
    }

    // Refresh state and hide onboarding
    setShowOnboarding(false);
    await loadAllUserData();
  };

  // Switch career goal from Dashboard
  const handleSwitchCareer = async (newCareer: string) => {
    if (!newCareer || newCareer === profile?.target_career) return;
    setIsRegeneratingRoadmap(true);
    try {
      const selectRes = await api.selectCareer(newCareer);
      if (selectRes) {
        setGapAnalysis(selectRes.gap_analysis);
        setCareerMatch(selectRes.career_match);
      }
      const roadmapRes = await api.generateRoadmap(newCareer);
      if (roadmapRes) {
        setRoadmap(roadmapRes.roadmap);
        setActivities(roadmapRes.activities || []);
      }
      await loadAllUserData();
    } catch (err) {
      console.error('Error switching career:', err);
    } finally {
      setIsRegeneratingRoadmap(false);
    }
  };

  // Toggle learning activity completion (Scenario 4)
  const handleToggleActivity = async (activityId: string, currentStatus: boolean) => {
    try {
      const res = await api.toggleActivityCompletion(activityId, !currentStatus);
      if (res && res.success) {
        setActivities(prev =>
          prev.map(a => a.id === activityId ? { ...a, is_completed: !currentStatus } : a)
        );
        if (roadmap && res.progress) {
          setRoadmap({
            ...roadmap,
            completed_activities: res.progress.completed_activities,
            progress_percentage: res.progress.progress_percentage
          });
        }
      }
    } catch (err) {
      console.error('Error updating activity:', err);
    }
  };

  // Regenerate roadmap via Agent 4
  const handleRegenerateRoadmap = async () => {
    if (!profile?.target_career) return;
    setIsRegeneratingRoadmap(true);
    try {
      const res = await api.generateRoadmap(profile.target_career);
      if (res) {
        setRoadmap(res.roadmap);
        setActivities(res.activities || []);
      }
    } catch (err) {
      console.error('Failed to regenerate roadmap:', err);
    } finally {
      setIsRegeneratingRoadmap(false);
    }
  };

  // Create Private Learning Post
  const handleCreatePost = async (postData: any) => {
    const res = await api.createPost(postData);
    if (res && res.post) {
      setPosts(prev => [res.post, ...prev]);
    }
  };

  // Delete Private Learning Post
  const handleDeletePost = async (postId: string) => {
    await api.deletePost(postId);
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  // Assessment Completed (Scenario 1 & 2)
  const handleAssessmentCompleted = (result: AssessmentResult) => {
    // Refresh assessment history & skills
    api.getAssessmentHistory().then(res => setAssessmentAttempts(res.attempts || []));
    api.getSkills().then(res => setSkills(res.skills || []));
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F2] text-[#17191C] flex flex-col font-sans selection:bg-[#C5F36A] selection:text-[#17191C]">
      {/* 1. Header */}
      <Header
        user={session?.user}
        profile={profile}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onScrollToResume={() => {
          if (!session) setIsAuthModalOpen(true);
          else {
            setShowOnboarding(true);
            setTimeout(() => scrollToSection('onboarding-section'), 100);
          }
        }}
        onScrollToProfile={() => {
          if (!session) setIsAuthModalOpen(true);
          else scrollToSection('profile-summary-section');
        }}
        onToggleTutor={() => setIsTutorOpen(!isTutorOpen)}
        isTutorOpen={isTutorOpen}
      />

      {/* Main Single Page Content */}
      <main className="flex-1 pb-24">
        {/* 2. Hero Section */}
        <HeroSection
          onStartOnboarding={() => {
            if (!session) {
              setIsAuthModalOpen(true);
            } else {
              setShowOnboarding(true);
              setTimeout(() => scrollToSection('onboarding-section'), 100);
            }
          }}
          hasProfile={Boolean(profile?.target_career)}
          onExploreDashboard={() => {
            setShowOnboarding(false);
            scrollToSection('dashboard-content');
          }}
        />

        {/* 3. Onboarding Form Section (Expandable container within Home Page) */}
        {session && (showOnboarding || !profile?.target_career) && (
          <OnboardingContainer
            initialEmail={session?.user?.email}
            onComplete={() => {
              setShowOnboarding(false);
              scrollToSection('dashboard-content');
            }}
            onSubmitProfileData={handleOnboardingSubmit}
          />
        )}

        {/* 4. Complete Learning Dashboard (Within the Same Page) */}
        {session && (
          <div id="dashboard-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 mt-4">
            {/* Toggle Onboarding / Edit Profile Bar */}
            <div className="flex items-center justify-between bg-[#EFEEE7] p-4 rounded-2xl border border-[#DEDED5]">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#17191C]">
                <Sparkles className="w-4 h-4 text-[#17191C]" />
                <span>Career Dashboard • Single Page Hub</span>
              </div>
              <button
                type="button"
                onClick={() => setShowOnboarding(!showOnboarding)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FFFFFF] border border-[#DEDED5] hover:bg-[#F8F7F2] transition-colors"
              >
                {showOnboarding ? 'Hide Onboarding Form' : 'Edit Onboarding Data'}
              </button>
            </div>

            {/* A. User Profile Summary */}
            <ProfileSummaryCard
              profile={profile}
              skills={skills}
              certifications={certifications}
              projects={projects}
              onEditProfile={() => {
                setShowOnboarding(true);
                setTimeout(() => scrollToSection('onboarding-section'), 100);
              }}
            />

            {/* B. Skill Analysis & Gap Matrix */}
            <SkillAnalysisSection
              gapAnalysis={gapAnalysis}
              userSkills={skills}
              onTakeSkillAssessment={(skillName) => setAssessmentModalSkill(skillName)}
            />

            {/* C. Career Matching & Readiness */}
            <CareerMatchingSection
              careerMatch={careerMatch}
              onSwitchCareer={handleSwitchCareer}
            />

            {/* D. Personalized Learning Roadmap */}
            <RoadmapSection
              roadmap={roadmap}
              activities={activities}
              onToggleActivity={handleToggleActivity}
              onTakeAssessment={(skillName) => setAssessmentModalSkill(skillName)}
              onRegenerateRoadmap={handleRegenerateRoadmap}
              isRegenerating={isRegeneratingRoadmap}
            />

            {/* E. Progress Tracking */}
            <ProgressTracker
              activities={activities}
              assessmentAttempts={assessmentAttempts}
              userSkills={skills}
            />

            {/* Section 10: Strictly Private Learning Posts */}
            <PrivateLearningPosts
              posts={posts}
              onCreatePost={handleCreatePost}
              onDeletePost={handleDeletePost}
            />
          </div>
        )}

        {/* Not Signed In Welcome Banner */}
        {!session && !loadingAuth && (
          <div className="max-w-3xl mx-auto px-4 text-center mt-6">
            <div className="p-8 rounded-3xl bg-[#FFFFFF] border border-[#DEDED5] shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#17191C] text-[#C5F36A] flex items-center justify-center font-bold mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-[#17191C]">
                Ready to Accelerate Your Career?
              </h3>
              <p className="text-sm text-neutral-600 max-w-lg mx-auto">
                Sign in with Supabase to save your profile, run Nemotron multi-agent skill gap evaluations, and chat with your personal Gemini Career Tutor.
              </p>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-6 py-3 rounded-2xl font-bold text-sm bg-[#C5F36A] text-[#17191C] hover:bg-[#b8e858] transition-all shadow-xs"
              >
                Sign In or Register
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Button for AI Career Tutor */}
      {session && !isTutorOpen && (
        <button
          onClick={() => setIsTutorOpen(true)}
          className="fixed bottom-6 right-6 z-40 p-4 rounded-2xl bg-[#17191C] text-[#C5F36A] hover:scale-105 transition-all shadow-xl flex items-center space-x-2.5 border border-neutral-700"
          title="Open AI Career Tutor"
        >
          <Bot className="w-6 h-6" />
          <span className="text-xs font-bold pr-1">Ask Career Tutor</span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#C5F36A] animate-ping" />
        </button>
      )}

      {/* Modals & Drawers */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          loadAllUserData();
        }}
      />

      <AssessmentModal
        isOpen={Boolean(assessmentModalSkill)}
        skillName={assessmentModalSkill || ''}
        targetCareer={profile?.target_career}
        onClose={() => setAssessmentModalSkill(null)}
        onAssessmentCompleted={handleAssessmentCompleted}
      />

      <AITutorPanel
        isOpen={isTutorOpen}
        onClose={() => setIsTutorOpen(false)}
        profile={profile}
      />

      {/* Footer */}
      <footer className="border-t border-[#DEDED5] py-8 text-center text-xs text-neutral-500 bg-[#F8F7F2]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>CareerBot AI Platform • Powered by NVIDIA Nemotron 30B & Google Gemini Flash</div>
          <div>Integrated with Supabase PostgreSQL & Row Level Security</div>
        </div>
      </footer>
    </div>
  );
};
