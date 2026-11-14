import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, Award, HelpCircle } from 'lucide-react';
import { api } from '../lib/api';
import { AssessmentQuestion, AssessmentResult } from '../types';

interface AssessmentModalProps {
  isOpen: boolean;
  skillName: string;
  targetCareer?: string;
  onClose: () => void;
  onAssessmentCompleted: (result: AssessmentResult) => void;
}

export const AssessmentModal: React.FC<AssessmentModalProps> = ({
  isOpen,
  skillName,
  targetCareer,
  onClose,
  onAssessmentCompleted,
}) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [assessmentId, setAssessmentId] = useState('');
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [detailedQuestions, setDetailedQuestions] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && skillName) {
      loadAssessment();
    } else {
      setResult(null);
      setSelectedAnswers({});
    }
  }, [isOpen, skillName]);

  const loadAssessment = async () => {
    setLoading(true);
    setResult(null);
    setSelectedAnswers({});
    try {
      const res = await api.generateAssessment(skillName, targetCareer, 'Intermediate');
      if (res && res.assessment) {
        setAssessmentId(res.assessment.id);
        setQuestions(res.questions || []);
      }
    } catch (err) {
      console.error('Error loading assessment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (result) return; // Locked once submitted
    setSelectedAnswers(prev => ({
      ...prev,
      [String(questionIndex)]: optionIndex
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(selectedAnswers).length < questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.submitAssessment(assessmentId, selectedAnswers);
      if (res && res.evaluation) {
        setResult(res.evaluation);
        setDetailedQuestions(res.questions_with_answers || []);
        onAssessmentCompleted(res.evaluation);
      }
    } catch (err) {
      console.error('Error submitting assessment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#FFFFFF] rounded-3xl border border-[#DEDED5] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#DEDED5] flex items-center justify-between bg-[#F8F7F2]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#17191C] text-[#C5F36A] flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-extrabold text-[#17191C]">Skill Assessment: {skillName}</h3>
                <span className="px-2 py-0.5 rounded-full bg-[#C5F36A] text-[#17191C] text-[10px] font-extrabold uppercase">
                  Adaptive AI
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                5 targeted scenario questions to test applied problem solving and syntax mastery.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-[#EFEEE7] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#17191C] animate-spin mx-auto" />
              <h4 className="text-sm font-bold text-[#17191C]">Generating Assessment with Nemotron 30B...</h4>
              <p className="text-xs text-neutral-500">Formulating scenario-driven technical questions for {skillName}...</p>
            </div>
          ) : result ? (
            /* Result Screen */
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className={`p-6 rounded-3xl border text-center space-y-3 ${
                result.passed ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
              }`}>
                <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center font-black text-2xl ${
                  result.passed ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                }`}>
                  {result.score}%
                </div>

                <h4 className="text-xl font-extrabold text-[#17191C]">
                  {result.passed ? 'Demonstrated Competency Verified!' : 'Practice Recommended'}
                </h4>

                <p className="text-xs sm:text-sm text-neutral-700 max-w-lg mx-auto leading-relaxed">
                  {result.ai_feedback}
                </p>

                {result.passed ? (
                  <div className="inline-block px-3 py-1 rounded-full bg-emerald-200 text-emerald-900 text-xs font-bold">
                    ✓ Skill Upgraded to Verified in Your Profile
                  </div>
                ) : (
                  result.weak_topics?.length > 0 && (
                    <div className="pt-2 text-xs">
                      <span className="font-bold text-amber-900">Recommended Focus Topics: </span>
                      <span className="text-amber-800">{result.weak_topics.join(', ')}</span>
                    </div>
                  )
                )}
              </div>

              {/* Review Answers */}
              <div className="space-y-4">
                <h5 className="text-xs font-bold text-[#17191C] uppercase tracking-wider">
                  Question Breakdown & Explanations:
                </h5>
                {detailedQuestions.map((q, idx) => {
                  const userChoice = selectedAnswers[String(idx)];
                  const isCorrect = userChoice === q.correct_option_index;
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border text-xs space-y-2 ${
                        isCorrect ? 'bg-[#FFFFFF] border-emerald-300' : 'bg-red-50/50 border-red-200'
                      }`}
                    >
                      <div className="font-bold text-[#17191C]">
                        {idx + 1}. {q.question_text}
                      </div>
                      <div className="text-neutral-600">
                        <span className="font-semibold">Your Answer: </span>
                        {q.options[userChoice]} {isCorrect ? '✅' : '❌'}
                      </div>
                      {!isCorrect && (
                        <div className="text-emerald-800 font-semibold">
                          Correct Answer: {q.options[q.correct_option_index]}
                        </div>
                      )}
                      {q.explanation && (
                        <div className="p-2.5 rounded-xl bg-[#F8F7F2] text-neutral-600 text-[11px] leading-relaxed">
                          <span className="font-bold text-[#17191C]">Why: </span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Questions List */
            <div className="space-y-6">
              {questions.map((q, qIdx) => (
                <div key={q.id || qIdx} className="p-5 rounded-2xl bg-[#F8F7F2] border border-[#DEDED5] space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                      Question {qIdx + 1} of {questions.length} • {q.topic || 'Core Concept'}
                    </span>
                    {selectedAnswers[String(qIdx)] !== undefined && (
                      <span className="w-2 h-2 rounded-full bg-[#17191C]" />
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-[#17191C] leading-snug">
                    {q.question_text}
                  </h4>

                  <div className="grid grid-cols-1 gap-2 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[String(qIdx)] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(qIdx, optIdx)}
                          className={`p-3 rounded-xl text-xs text-left border transition-all flex items-start space-x-2.5 ${
                            isSelected
                              ? 'bg-[#17191C] text-white border-[#17191C] shadow-xs'
                              : 'bg-[#FFFFFF] text-neutral-800 border-[#DEDED5] hover:bg-neutral-50'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                            isSelected ? 'border-[#C5F36A] text-[#C5F36A]' : 'border-neutral-400 text-neutral-500'
                          }`}>
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="leading-tight">{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-[#DEDED5] bg-[#F8F7F2] flex items-center justify-between">
          {result ? (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-xl font-bold text-xs bg-[#17191C] text-[#C5F36A] hover:bg-[#2c3036] transition-all"
            >
              Done & Return to Dashboard
            </button>
          ) : (
            <>
              <span className="text-xs text-neutral-500 font-medium">
                {Object.keys(selectedAnswers).length} of {questions.length} answered
              </span>

              <button
                type="button"
                disabled={submitting || Object.keys(selectedAnswers).length < questions.length}
                onClick={handleSubmit}
                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#C5F36A] text-[#17191C] hover:bg-[#b8e858] transition-all disabled:opacity-50 flex items-center space-x-2 shadow-xs"
              >
                {submitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-[#17191C] border-t-transparent rounded-full animate-spin" />
                    <span>Scoring with AI...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Assessment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
