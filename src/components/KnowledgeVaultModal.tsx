import React, { useState } from 'react';
import {
  X,
  Bookmark,
  CheckCircle2,
  HelpCircle,
  Flame,
  Download,
  Copy,
  Check,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { MicroReel, UserSavedData } from '../types';

interface KnowledgeVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  allReels: MicroReel[];
  userData: UserSavedData;
  onSelectReel: (reelId: string) => void;
  onRemoveBookmark: (reelId: string) => void;
}

export const KnowledgeVaultModal: React.FC<KnowledgeVaultModalProps> = ({
  isOpen,
  onClose,
  allReels,
  userData,
  onSelectReel,
  onRemoveBookmark,
}) => {
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);

  if (!isOpen) return null;

  const bookmarkedReels = allReels.filter((r) => userData.bookmarkedIds.includes(r.id));
  const totalCompletedActions = userData.completedActionIds.length;
  const answeredQuizzesCount = Object.keys(userData.completedQuizzes).length;
  const correctQuizzesCount = Object.values(userData.completedQuizzes).filter((q: { isCorrect: boolean }) => q.isCorrect).length;

  const generateMarkdownExport = () => {
    let md = `# My Fehem Knowledge Vault & Action Journal\n\n`;
    md += `*Exported on ${new Date().toLocaleDateString()} | Streak: ${userData.streakDays} Days*\n\n`;

    md += `## 📊 Learning Progress\n`;
    md += `- Action Items Implemented: ${totalCompletedActions}\n`;
    md += `- Quiz Retention Score: ${correctQuizzesCount} / ${answeredQuizzesCount} correct\n`;
    md += `- Bookmarked Micro-Reels: ${bookmarkedReels.length}\n\n`;

    md += `## 📚 Saved Summaries & Key Takeaways\n\n`;

    bookmarkedReels.forEach((reel, idx) => {
      md += `### ${idx + 1}. ${reel.title} (${reel.source.name} by ${reel.source.authorOrTopic})\n`;
      md += `> "${reel.coreIdea}"\n\n`;
      md += `**Key Takeaways:**\n`;
      reel.takeaways.forEach((t) => {
        md += `- **${t.point}**: ${t.detail}\n`;
      });
      if (reel.mentalModel) {
        md += `\n**Mental Model / Formula:** ${reel.mentalModel.name} - \`${reel.mentalModel.formulaOrRule || reel.mentalModel.description}\`\n`;
      }
      if (reel.codeSnippet) {
        md += `\n\`\`\`${reel.codeSnippet.language}\n${reel.codeSnippet.code}\n\`\`\`\n`;
      }
      md += `\n**2-Minute Challenge:** ${reel.immediateActionChallenge}\n\n---\n\n`;
    });

    return md;
  };

  const handleCopyMarkdown = async () => {
    try {
      const md = generateMarkdownExport();
      await navigator.clipboard.writeText(md);
      setCopiedMarkdown(true);
      setTimeout(() => setCopiedMarkdown(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownloadMarkdown = () => {
    const md = generateMarkdownExport();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Fehem-Knowledge-Vault-${Date.now()}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[88vh] glass-panel bg-neutral-950/85 rounded-3xl border border-white/15 shadow-2xl flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Bookmark className="w-4 h-4 fill-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Saved Knowledge Vault</h2>
              <p className="text-xs text-white/60">Your saved mental models, action items & snippets</p>
            </div>
          </div>

          <button
            id="btn-close-vault-modal"
            onClick={onClose}
            className="p-2 rounded-full glass-pill text-white/70 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stats Row */}
        <div className="px-5 py-3.5 bg-neutral-950/60 border-b border-neutral-800 grid grid-cols-3 gap-3 shrink-0 text-center">
          <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800/80">
            <div className="flex items-center justify-center space-x-1 text-amber-400 text-xs font-semibold mb-0.5">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>Streak</span>
            </div>
            <span className="text-base font-bold text-white font-mono">{userData.streakDays} Days</span>
          </div>

          <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800/80">
            <div className="flex items-center justify-center space-x-1 text-emerald-400 text-xs font-semibold mb-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Action Items</span>
            </div>
            <span className="text-base font-bold text-white font-mono">{totalCompletedActions} Applied</span>
          </div>

          <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800/80">
            <div className="flex items-center justify-center space-x-1 text-purple-400 text-xs font-semibold mb-0.5">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Retention Score</span>
            </div>
            <span className="text-base font-bold text-white font-mono">
              {correctQuizzesCount} / {answeredQuizzesCount}
            </span>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 p-5 overflow-y-auto no-scrollbar space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              Saved Reels ({bookmarkedReels.length})
            </span>

            {bookmarkedReels.length > 0 && (
              <div className="flex items-center space-x-2">
                <button
                  id="btn-copy-vault-md"
                  onClick={handleCopyMarkdown}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors border border-neutral-700"
                >
                  {copiedMarkdown ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy MD</span>
                    </>
                  )}
                </button>

                <button
                  id="btn-download-vault-md"
                  onClick={handleDownloadMarkdown}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors border border-neutral-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>
              </div>
            )}
          </div>

          {bookmarkedReels.length === 0 ? (
            <div className="p-8 rounded-2xl bg-neutral-950/40 border border-dashed border-neutral-800 text-center space-y-2">
              <Bookmark className="w-8 h-8 text-neutral-600 mx-auto" />
              <p className="text-sm font-semibold text-neutral-300">Your Knowledge Vault is empty</p>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Click the bookmark ribbon on any programming snippet or book summary to store it here for rapid review.
              </p>
            </div>
          ) : (
            bookmarkedReels.map((reel) => (
              <div
                key={reel.id}
                className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 hover:border-neutral-700 transition-all flex items-center justify-between group"
              >
                <div
                  onClick={() => {
                    onSelectReel(reel.id);
                    onClose();
                  }}
                  className="flex-1 cursor-pointer pr-4"
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                      {reel.source.name}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-medium">
                      {reel.takeaways.length} Takeaways
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {reel.title}
                  </h4>
                  <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">
                    {reel.coreIdea}
                  </p>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onRemoveBookmark(reel.id)}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                    title="Remove from vault"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      onSelectReel(reel.id);
                      onClose();
                    }}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                    title="Open reel"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
