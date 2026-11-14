import React, { useState } from 'react';
import { Plus, X, FolderGit2, ExternalLink, Github, Code } from 'lucide-react';
import { Project } from '../../types';

interface ProjectsProps {
  projects: Project[];
  onChange: (projects: Project[]) => void;
}

export const ProjectsSection: React.FC<ProjectsProps> = ({ projects, onChange }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [techInput, setTechInput] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [status, setStatus] = useState('Completed');

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const techs = techInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onChange([
      ...projects,
      {
        title: title.trim(),
        description: description.trim() || undefined,
        technologies: techs.length > 0 ? techs : ['General'],
        project_url: projectUrl.trim() || undefined,
        github_url: githubUrl.trim() || undefined,
        status: status || 'Completed',
      }
    ]);

    setTitle('');
    setDescription('');
    setTechInput('');
    setProjectUrl('');
    setGithubUrl('');
  };

  const handleRemove = (index: number) => {
    onChange(projects.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-[#DEDED5] pb-4">
        <h3 className="text-lg font-bold text-[#17191C]">Projects & Portfolio Experience</h3>
        <p className="text-xs text-neutral-500 mt-0.5">
          Hands-on projects provide verifiable evidence of applied capability for the Nemotron Career Matching and Skill Gap agents.
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleAddProject} className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#DEDED5] space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
              Project Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed Task Queue"
              className="w-full px-4 py-2 rounded-xl bg-[#F8F7F2] border border-[#DEDED5] text-sm text-[#17191C] placeholder:text-neutral-400 focus:outline-none focus:border-[#17191C]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
              Technologies (comma separated)
            </label>
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              placeholder="e.g. Python, Redis, FastAPI, Docker"
              className="w-full px-4 py-2 rounded-xl bg-[#F8F7F2] border border-[#DEDED5] text-sm text-[#17191C] placeholder:text-neutral-400 focus:outline-none focus:border-[#17191C]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
              Live Demo / Project URL (Optional)
            </label>
            <input
              type="url"
              value={projectUrl}
              onChange={(e) => setProjectUrl(e.target.value)}
              placeholder="https://myproject.app"
              className="w-full px-4 py-2 rounded-xl bg-[#F8F7F2] border border-[#DEDED5] text-sm text-[#17191C] placeholder:text-neutral-400 focus:outline-none focus:border-[#17191C]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
              GitHub Repository URL (Optional)
            </label>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/..."
              className="w-full px-4 py-2 rounded-xl bg-[#F8F7F2] border border-[#DEDED5] text-sm text-[#17191C] placeholder:text-neutral-400 focus:outline-none focus:border-[#17191C]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
              Project Description & Key Impact
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe what this project solved, architecture highlights, or metrics achieved..."
              className="w-full p-3 rounded-xl bg-[#F8F7F2] border border-[#DEDED5] text-sm text-[#17191C] placeholder:text-neutral-400 focus:outline-none focus:border-[#17191C]"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-[#17191C] text-[#C5F36A] hover:bg-[#2c3036] transition-all flex items-center space-x-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Project</span>
          </button>
        </div>
      </form>

      {/* Projects List */}
      <div>
        <h4 className="text-xs font-bold text-[#17191C] uppercase tracking-wider mb-3">
          Recorded Projects ({projects.length})
        </h4>

        {projects.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#F8F7F2] border border-dashed border-[#DEDED5] text-center">
            <FolderGit2 className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
            <p className="text-xs text-neutral-500">No projects added yet. Adding 1-2 core projects significantly boosts career match accuracy.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {projects.map((project, index) => (
              <div
                key={index}
                className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#DEDED5] shadow-xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <h5 className="text-sm font-bold text-[#17191C]">{project.title}</h5>
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      className="p-1 text-neutral-400 hover:text-red-500 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {project.description && (
                    <p className="text-xs text-neutral-600 mt-1 line-clamp-2">{project.description}</p>
                  )}

                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {project.technologies?.map((tech, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-[#EFEEE7] text-[11px] font-semibold text-[#17191C]">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-2 border-t border-[#DEDED5] text-xs">
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1 text-neutral-700 hover:text-[#17191C] font-semibold"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>Code</span>
                    </a>
                  )}
                  {project.project_url && (
                    <a
                      href={project.project_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1 text-neutral-700 hover:text-[#17191C] font-semibold"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Live App</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
