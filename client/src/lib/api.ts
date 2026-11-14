import { supabase } from './supabase';

const API_BASE = '/api';

export async function getAuthHeader(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export const api = {
  // Auth & Profile
  async getProfile() {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE}/auth/me`, { headers });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async updateProfile(profileData: any) {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(profileData)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Resume Upload & Analysis
  async analyzeResume(file: File) {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/resume/analyze`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async getLatestResumeAnalysis() {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE}/resume/latest`, { headers });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Career
  async suggestCareers() {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE}/career/suggest`, {
      method: 'POST',
      headers
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async selectCareer(targetCareer: string) {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE}/career/select`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ target_career: targetCareer })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async getCurrentCareer() {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE}/career/current`, { headers });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Learning Roadmap
  async generateRoadmap(targetCareer?: string) {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE}/learning/generate-roadmap`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ target_career: targetCareer })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async getActiveRoadmap() {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE}/learning/active-roadmap`, { headers });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async toggleActivityCompletion(activityId: string, isCompleted: boolean) {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE}/learning/activity/${activityId}/toggle`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ is_completed: isCompleted })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Assessments
  async generateAssessment(skillName: string, targetCareer?: string, difficulty?: string) {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE}/assessment/generate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        skill_name: skillName,
        target_career: targetCareer,
        difficulty: difficulty || 'Intermediate'
      })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async submitAssessment(assessmentId: string, answers: Record<string, number>) {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE}/assessment/submit/${assessmentId}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ answers })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async getAssessmentHistory() {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE}/assessment/history`, { headers });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Private Posts
  async getPosts() {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE}/posts`, { headers });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async createPost(postData: { content: string; skills_learned: string[]; image_url?: string; link_url?: string }) {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers,
      body: JSON.stringify(postData)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async deletePost(postId: string) {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE}/posts/${postId}`, {
      method: 'DELETE',
      headers
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // AI Tutor
  async chatWithTutor(message: string) {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE}/tutor/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async getTutorHistory() {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE}/tutor/history`, { headers });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async clearTutorHistory() {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE}/tutor/history`, {
      method: 'DELETE',
      headers
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Skills & Projects
  async getSkills() {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE}/profile-data/skills`, { headers });
    return res.json();
  },

  async addSkill(skill: { skill_name: string; proficiency: string }) {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE}/profile-data/skills`, {
      method: 'POST',
      headers,
      body: JSON.stringify(skill)
    });
    return res.json();
  },

  async deleteSkill(skillId: string) {
    const headers = await getAuthHeader();
    return fetch(`${API_BASE}/profile-data/skills/${skillId}`, { method: 'DELETE', headers });
  },

  async getProjects() {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE}/profile-data/projects`, { headers });
    return res.json();
  },

  async addProject(project: any) {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE}/profile-data/projects`, {
      method: 'POST',
      headers,
      body: JSON.stringify(project)
    });
    return res.json();
  },

  async getCertifications() {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE}/profile-data/certifications`, { headers });
    return res.json();
  },

  async addCertification(cert: any) {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE}/profile-data/certifications`, {
      method: 'POST',
      headers,
      body: JSON.stringify(cert)
    });
    return res.json();
  }
};
