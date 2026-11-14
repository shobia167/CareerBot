import React, { useState } from 'react';
import { Plus, X, Award, ExternalLink, Calendar, Building } from 'lucide-react';
import { Certification } from '../../types';

interface CertificationsProps {
  certifications: Certification[];
  onChange: (certs: Certification[]) => void;
}

export const CertificationsSection: React.FC<CertificationsProps> = ({ certifications, onChange }) => {
  const [name, setName] = useState('');
  const [issuingOrg, setIssuingOrg] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [credentialUrl, setCredentialUrl] = useState('');

  const handleAddCert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !issuingOrg.trim()) return;

    onChange([
      ...certifications,
      {
        name: name.trim(),
        issuing_organization: issuingOrg.trim(),
        completion_date: completionDate || undefined,
        credential_url: credentialUrl.trim() || undefined,
      }
    ]);

    setName('');
    setIssuingOrg('');
    setCompletionDate('');
    setCredentialUrl('');
  };

  const handleRemove = (index: number) => {
    onChange(certifications.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-[#DEDED5] pb-4">
        <h3 className="text-lg font-bold text-[#17191C]">Professional Certifications & Licenses</h3>
        <p className="text-xs text-neutral-500 mt-0.5">
          Record verified credentials from AWS, Google Cloud, Coursera, Meta, Microsoft, and academic bodies.
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleAddCert} className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#DEDED5] space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
              Certification Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AWS Certified Solutions Architect"
              className="w-full px-4 py-2 rounded-xl bg-[#F8F7F2] border border-[#DEDED5] text-sm text-[#17191C] placeholder:text-neutral-400 focus:outline-none focus:border-[#17191C]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
              Issuing Organization <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={issuingOrg}
              onChange={(e) => setIssuingOrg(e.target.value)}
              placeholder="e.g. Amazon Web Services, DeepLearning.AI"
              className="w-full px-4 py-2 rounded-xl bg-[#F8F7F2] border border-[#DEDED5] text-sm text-[#17191C] placeholder:text-neutral-400 focus:outline-none focus:border-[#17191C]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
              Completion Date (Optional)
            </label>
            <input
              type="date"
              value={completionDate}
              onChange={(e) => setCompletionDate(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-[#F8F7F2] border border-[#DEDED5] text-sm text-[#17191C] focus:outline-none focus:border-[#17191C]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
              Credential URL or ID (Optional)
            </label>
            <input
              type="url"
              value={credentialUrl}
              onChange={(e) => setCredentialUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2 rounded-xl bg-[#F8F7F2] border border-[#DEDED5] text-sm text-[#17191C] placeholder:text-neutral-400 focus:outline-none focus:border-[#17191C]"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-[#17191C] text-[#C5F36A] hover:bg-[#2c3036] transition-all flex items-center space-x-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Certification</span>
          </button>
        </div>
      </form>

      {/* Certifications List */}
      <div>
        <h4 className="text-xs font-bold text-[#17191C] uppercase tracking-wider mb-3">
          Recorded Certifications ({certifications.length})
        </h4>

        {certifications.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#F8F7F2] border border-dashed border-[#DEDED5] text-center">
            <Award className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
            <p className="text-xs text-neutral-500">No certifications recorded yet. Add any formal certifications or course completions above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {certifications.map((cert, index) => (
              <div
                key={index}
                className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#DEDED5] shadow-xs flex items-start justify-between gap-3"
              >
                <div>
                  <div className="text-sm font-bold text-[#17191C]">{cert.name}</div>
                  <div className="flex items-center space-x-3 text-xs text-neutral-500 mt-1">
                    <span className="flex items-center space-x-1">
                      <Building className="w-3.5 h-3.5" />
                      <span>{cert.issuing_organization}</span>
                    </span>
                    {cert.completion_date && (
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{cert.completion_date}</span>
                      </span>
                    )}
                  </div>
                  {cert.credential_url && (
                    <a
                      href={cert.credential_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1 text-xs text-neutral-700 hover:text-[#17191C] font-semibold mt-2 underline"
                    >
                      <span>Verify Credential</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-neutral-100 rounded-lg transition-colors"
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
