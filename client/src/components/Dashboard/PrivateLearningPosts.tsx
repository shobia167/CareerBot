import React, { useState } from 'react';
import { Lock, Plus, Trash2, Edit2, Link as LinkIcon, Image as ImageIcon, Sparkles, Tag, Check } from 'lucide-react';
import { LearningPost } from '../../types';

interface PrivateLearningPostsProps {
  posts: LearningPost[];
  onCreatePost: (postData: { content: string; skills_learned: string[]; image_url?: string; link_url?: string }) => Promise<void>;
  onDeletePost: (postId: string) => Promise<void>;
}

export const PrivateLearningPosts: React.FC<PrivateLearningPostsProps> = ({
  posts,
  onCreatePost,
  onDeletePost,
}) => {
  const [content, setContent] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const skills = skillInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    setIsSubmitting(true);
    try {
      await onCreatePost({
        content: content.trim(),
        skills_learned: skills,
        link_url: linkUrl.trim() || undefined,
        image_url: imageUrl.trim() || undefined,
      });
      setContent('');
      setSkillInput('');
      setLinkUrl('');
      setImageUrl('');
      setIsFormOpen(false);
    } catch (err) {
      console.error('Failed to create post:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[#DEDED5] shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DEDED5] pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-xl font-extrabold text-[#17191C]">Private Learning Journal</h3>
            <span className="px-2 py-0.5 rounded-full bg-[#17191C] text-[#C5F36A] text-[10px] font-extrabold uppercase flex items-center space-x-1">
              <Lock className="w-2.5 h-2.5" />
              <span>100% Confidential</span>
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Log your daily breakthroughs and project links. These entries are strictly private to your account and accessible only to your Gemini AI Tutor for personalized guidance.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#C5F36A] text-[#17191C] hover:bg-[#b8e858] transition-all shrink-0 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Journal Entry</span>
        </button>
      </div>

      {/* New Post Form */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-[#F8F7F2] border border-[#DEDED5] space-y-4 animate-in fade-in duration-200">
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
              What did you learn today?
            </label>
            <textarea
              rows={3}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="e.g. 'I mastered SQL Window functions (ROW_NUMBER and DENSE_RANK) and built an analytical dashboard query today...'"
              className="w-full p-3 rounded-xl bg-[#FFFFFF] border border-[#DEDED5] text-sm text-[#17191C] placeholder:text-neutral-400 focus:outline-none focus:border-[#17191C]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                Skills Learned (comma separated)
              </label>
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="e.g. SQL, Postgres, Analytics"
                className="w-full px-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#DEDED5] text-xs text-[#17191C] focus:outline-none focus:border-[#17191C]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                Project or Code URL (Optional)
              </label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full px-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#DEDED5] text-xs text-[#17191C] focus:outline-none focus:border-[#17191C]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                Attachment / Image URL (Optional)
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://...png"
                className="w-full px-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#DEDED5] text-xs text-[#17191C] focus:outline-none focus:border-[#17191C]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-[#EFEEE7]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#17191C] text-[#C5F36A] hover:bg-[#2c3036] transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Publish to Private Journal'}
            </button>
          </div>
        </form>
      )}

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#F8F7F2] border border-dashed border-[#DEDED5] text-center">
            <Lock className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-[#17191C]">Your Learning Diary is Clean</h4>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              Record daily achievements, tutorials completed, and questions for your AI tutor. No other user can ever view these notes.
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#DEDED5] shadow-xs hover:border-neutral-300 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-[11px] text-neutral-400">
                    <span className="font-semibold text-neutral-700">Private Entry</span>
                    <span>•</span>
                    <span>{new Date(post.created_at).toLocaleDateString()} at {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-sm text-[#17191C] leading-relaxed pt-1">
                    {post.content}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onDeletePost(post.id)}
                  className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-neutral-100 rounded-lg transition-colors"
                  title="Delete Entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {post.skills_learned?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {post.skills_learned.map((sk, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-[#EFEEE7] text-[10px] font-bold text-[#17191C]">
                      #{sk}
                    </span>
                  ))}
                </div>
              )}

              {post.link_url && (
                <div className="pt-2 border-t border-[#DEDED5]/60">
                  <a
                    href={post.link_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 text-xs font-semibold text-neutral-700 hover:text-[#17191C] underline"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span className="truncate max-w-md">{post.link_url}</span>
                  </a>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
