export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  education?: string;
  college_organization?: string;
  current_qualification?: string;
  bio?: string;
  areas_of_interest?: string[];
  avatar_url?: string;
  target_career?: string;
  career_readiness_score?: number;
  created_at?: string;
  updated_at?: string;
}

export interface UserSkill {
  id?: string;
  user_id?: string;
  skill_name: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced';
  verified?: boolean;
}

export interface Certification {
  id?: string;
  user_id?: string;
  name: string;
  issuing_organization: string;
  completion_date?: string;
  credential_url?: string;
}

export interface Project {
  id?: string;
  user_id?: string;
  title: string;
  description?: string;
  technologies: string[];
  project_url?: string;
  github_url?: string;
  status?: string;
}

export interface ResumeAnalysis {
  id?: string;
  user_id?: string;
  resume_file_name?: string;
  ats_score: number;
  score_breakdown?: {
    formatting_clarity: number;
    keyword_richness: number;
    quantifiable_impact: number;
    section_completeness: number;
  };
  missing_sections: string[];
  strengths: string[];
  weaknesses: string[];
  suggestions: Array<{
    category: string;
    suggestion: string;
    priority: 'High' | 'Medium' | 'Low';
  }>;
  extracted_skills: string[];
  extracted_education?: string;
}

export interface SkillGapAnalysis {
  id?: string;
  target_career: string;
  existing_skills: Array<{ name: string; proficiency: string; relevance?: string }>;
  strong_skills: Array<{ name: string; reason: string }>;
  intermediate_skills: Array<{ name: string; reason: string }>;
  weak_skills: Array<{ name: string; reason: string }>;
  missing_skills: Array<{
    name: string;
    priority: string;
    importance_reason: string;
    estimated_learning_hours?: number;
  }>;
  gap_summary: string;
}

export interface AlternativeCareerPath {
  title: string;
  match_score: number;
  why_good_fit: string;
  bridge_skills_needed: string[];
}

export interface CareerMatch {
  id?: string;
  career_title: string;
  readiness_score: number;
  matching_skills: string[];
  missing_requirements: string[];
  reasoning: string;
  alternative_paths: AlternativeCareerPath[];
}

export interface LearningActivity {
  id: string;
  roadmap_id: string;
  user_id?: string;
  skill_name: string;
  learning_objective: string;
  resource_title: string;
  resource_url?: string;
  difficulty_level: 'Beginner' | 'Intermediate' | 'Advanced';
  estimated_duration: string;
  practical_task: string;
  sequence_order: number;
  is_completed: boolean;
  completed_at?: string;
}

export interface LearningRoadmap {
  id: string;
  target_career: string;
  title: string;
  description?: string;
  total_activities: number;
  completed_activities: number;
  progress_percentage: number;
  is_active: boolean;
}

export interface AssessmentQuestion {
  id: string;
  question_text: string;
  options: string[];
  topic?: string;
}

export interface AssessmentResult {
  score: number;
  total_points: number;
  correct_count: number;
  total_questions: number;
  passed: boolean;
  weak_topics: string[];
  ai_feedback: string;
}

export interface LearningPost {
  id: string;
  user_id: string;
  content: string;
  skills_learned: string[];
  image_url?: string;
  link_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at?: string;
}
