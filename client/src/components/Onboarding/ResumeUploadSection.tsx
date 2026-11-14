import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, Sparkles, RefreshCw, ChevronRight, Check } from 'lucide-react';
import { api } from '../../lib/api';
import { ResumeAnalysis } from '../../types';

interface ResumeUploadProps {
  currentAnalysis: ResumeAnalysis | null;
  onAnalysisComplete: (analysis: ResumeAnalysis) => void;
  onExtractedSkillsAdd: (skills: string[]) => void;
}

export const ResumeUploadSection: React.FC<ResumeUploadProps> = ({
  currentAnalysis,
  onAnalysisComplete,
  onExtractedSkillsAdd,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string>('');
  const [skillsAdded, setSkillsAdded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setUploadError('');
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.pdf', '.docx', '.doc', '.txt'].includes(ext)) {
      setUploadError('Invalid format. Please upload a PDF or DOCX resume.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File exceeds 10MB limit.');
      return;
    }

    setSelectedFile(file);
    setUploading(true);

    try {
      const response = await api.analyzeResume(file);
      if (response && response.analysis) {
        onAnalysisComplete(response.analysis);
      }
    } catch (err: any) {
      setUploadError(err.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleAddSkillsToProfile = () => {
    if (currentAnalysis?.extracted_skills) {
      onExtractedSkillsAdd(currentAnalysis.extracted_skills);
      setSkillsAdded(true);
      setTimeout(() => setSkillsAdded(false), 3000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-[#DEDED5] pb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-bold text-[#17191C]">Resume Upload & ATS Intelligence</h3>
          <span className="px-2 py-0.5 rounded-full bg-[#C5F36A] text-[#17191C] text-[10px] font-extrabold uppercase">
            NVIDIA Nemotron 30B
          </span>
        </div>
        <p className="text-xs text-neutral-500 mt-0.5">
          Upload your resume in PDF or DOCX format. Our Nemotron agent extracts skills, computes an estimated ATS compatibility score, and pinpoints structural gaps.
        </p>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-[#17191C] bg-[#EFEEE7]'
            : 'border-[#DEDED5] bg-[#FFFFFF] hover:border-[#17191C] hover:bg-[#F8F7F2]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#EFEEE7] flex items-center justify-center text-[#17191C]">
          {uploading ? (
            <RefreshCw className="w-7 h-7 animate-spin text-[#17191C]" />
          ) : (
            <Upload className="w-7 h-7 text-[#17191C]" />
          )}
        </div>

        <h4 className="text-base font-bold text-[#17191C]">
          {uploading ? 'Analyzing Resume with NVIDIA Nemotron...' : 'Drag & drop your resume here, or browse files'}
        </h4>
        <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
          Supports standard PDF and Word DOCX formats (Max size 10MB). Text is parsed securely in-memory.
        </p>

        {selectedFile && !uploading && (
          <div className="mt-4 inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#EFEEE7] text-xs font-semibold text-[#17191C] border border-[#DEDED5]">
            <FileText className="w-3.5 h-3.5" />
            <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)</span>
          </div>
        )}
      </div>

      {uploadError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Analysis Results Display */}
      {currentAnalysis && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[#DEDED5] shadow-xs space-y-6">
          {/* Header & Score Gauge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DEDED5] pb-6">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C5F36A]" />
                <h4 className="text-xl font-extrabold text-[#17191C]">ATS Compatibility Audit</h4>
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                *Estimated benchmark based on industry ATS scanner parsers and structural criteria. Not an absolute guarantee.
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-3xl font-black text-[#17191C]">
                  {currentAnalysis.ats_score}<span className="text-base font-normal text-neutral-400">/100</span>
                </div>
                <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  {currentAnalysis.ats_score >= 80 ? 'Strong Match' : currentAnalysis.ats_score >= 65 ? 'Moderate Match' : 'Needs Optimization'}
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#17191C] flex items-center justify-center p-1">
                <div
                  className="w-full h-full rounded-xl bg-[#C5F36A] flex items-center justify-center font-black text-lg text-[#17191C]"
                >
                  {currentAnalysis.ats_score}%
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown & Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="p-5 rounded-2xl bg-[#F8F7F2] border border-[#DEDED5]">
              <h5 className="text-xs font-bold text-[#17191C] uppercase tracking-wider mb-3 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Identified Strengths</span>
              </h5>
              <ul className="space-y-2 text-xs text-neutral-700">
                {currentAnalysis.strengths?.map((strength, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-[#17191C] font-bold mt-0.5">•</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div className="p-5 rounded-2xl bg-[#F8F7F2] border border-[#DEDED5]">
              <h5 className="text-xs font-bold text-[#17191C] uppercase tracking-wider mb-3 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Areas to Improve</span>
              </h5>
              <ul className="space-y-2 text-xs text-neutral-700">
                {currentAnalysis.weaknesses?.map((weakness, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-amber-600 font-bold mt-0.5">•</span>
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Missing Sections Alert */}
          {currentAnalysis.missing_sections?.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Missing Recommended Resume Sections:
              </span>
              <div className="flex flex-wrap gap-2 mt-2">
                {currentAnalysis.missing_sections.map((sec, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-white border border-amber-200 text-xs font-semibold text-amber-800">
                    + {sec}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actionable Suggestions */}
          <div>
            <h5 className="text-xs font-bold text-[#17191C] uppercase tracking-wider mb-3">
              Actionable AI Improvement Steps
            </h5>
            <div className="space-y-2.5">
              {currentAnalysis.suggestions?.map((sugg, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#DEDED5] flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-[#17191C]">{sugg.category}: </span>
                    <span className="text-xs text-neutral-600">{sugg.suggestion}</span>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full shrink-0 ${
                    sugg.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-neutral-100 text-neutral-700'
                  }`}>
                    {sugg.priority} Priority
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Extracted Skills Bar & Quick Import */}
          {currentAnalysis.extracted_skills?.length > 0 && (
            <div className="pt-4 border-t border-[#DEDED5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#17191C] uppercase tracking-wider">
                  Extracted Skills ({currentAnalysis.extracted_skills.length})
                </span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {currentAnalysis.extracted_skills.map((skill, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-[#EFEEE7] text-xs font-medium text-[#17191C]">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddSkillsToProfile}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#17191C] text-[#C5F36A] hover:bg-[#2c3036] transition-all shrink-0 self-start sm:self-center shadow-xs"
              >
                {skillsAdded ? <Check className="w-3.5 h-3.5 text-[#C5F36A]" /> : <Sparkles className="w-3.5 h-3.5 text-[#C5F36A]" />}
                <span>{skillsAdded ? 'Imported to Profile!' : 'Import All Skills'}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
