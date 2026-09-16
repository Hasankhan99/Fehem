import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Share2,
  Download,
  BookOpen,
  Code2,
  Sparkles,
  Link,
  Send,
} from 'lucide-react';
import { MicroReel } from '../types';

interface ShareReelModalProps {
  isOpen: boolean;
  onClose: () => void;
  reel: MicroReel;
}

export const ShareReelModal: React.FC<ShareReelModalProps> = ({
  isOpen,
  onClose,
  reel,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href.split('?')[0] : '';
  const shareUrl = `${currentUrl}?reel=${reel.id}`;

  const shareSummaryText = `💡 ${reel.title} (${reel.source.name})
"${reel.coreIdea}"

🎯 Key Takeaways:
${reel.takeaways.map((t) => `• ${t.point}: ${t.detail}`).join('\n')}

⚡ 2-Minute Challenge: ${reel.immediateActionChallenge}

Learn on Fehem: ${shareUrl}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(shareSummaryText);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Fehem: ${reel.title}`,
          text: `"${reel.coreIdea}" - from ${reel.source.name}`,
          url: shareUrl,
        });
      } catch {
        // user cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  const shareTwitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `"${reel.coreIdea}"\n\n💡 ${reel.title} (${reel.source.name})\n\nStudy this micro-reel on Fehem:`
  )}&url=${encodeURIComponent(shareUrl)}`;

  const shareWhatsAppUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `💡 *${reel.title}* (${reel.source.name})\n\n"${reel.coreIdea}"\n\nCheck out this reel: ${shareUrl}`
  )}`;

  const shareLinkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    shareUrl
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-in fade-in duration-150">
      <div className="w-full max-w-md glass-panel bg-neutral-950/90 rounded-3xl border border-white/15 p-5 sm:p-6 shadow-2xl overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full glass-pill text-white/70 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-2.5 mb-4">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-500 via-purple-500 to-cyan-500 flex items-center justify-center shadow-lg">
            <Share2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Share Micro-Reel</h3>
            <p className="text-xs text-white/60">Send this concept to peers, social feeds, or notes</p>
          </div>
        </div>

        {/* Reel Preview Card */}
        <div className="p-3.5 rounded-2xl glass-pill border border-white/15 mb-4 space-y-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold">
            {reel.source.name} • {reel.source.authorOrTopic}
          </span>
          <h4 className="text-sm font-bold text-white line-clamp-1">{reel.title}</h4>
          <p className="text-xs text-white/75 italic line-clamp-2">&quot;{reel.coreIdea}&quot;</p>
        </div>

        {/* Share Destination Buttons (Instagram-Style Grid) */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {/* Native Share / Direct */}
          <button
            onClick={handleNativeShare}
            className="p-3 rounded-2xl glass-pill flex flex-col items-center justify-center hover:bg-white/15 transition-all text-white group"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
              <Send className="w-4 h-4 text-white" />
            </div>
            <span className="text-[10px] font-medium text-white/80">Send</span>
          </button>

          {/* Twitter / X */}
          <a
            href={shareTwitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-2xl glass-pill flex flex-col items-center justify-center hover:bg-white/15 transition-all text-white group"
          >
            <div className="w-8 h-8 rounded-full bg-black border border-white/20 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
              <span className="text-xs font-bold font-mono">𝕏</span>
            </div>
            <span className="text-[10px] font-medium text-white/80">Post</span>
          </a>

          {/* WhatsApp */}
          <a
            href={shareWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-2xl glass-pill flex flex-col items-center justify-center hover:bg-white/15 transition-all text-white group"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
              <span className="text-xs font-bold font-mono">WA</span>
            </div>
            <span className="text-[10px] font-medium text-white/80">WhatsApp</span>
          </a>

          {/* LinkedIn */}
          <a
            href={shareLinkedInUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-2xl glass-pill flex flex-col items-center justify-center hover:bg-white/15 transition-all text-white group"
          >
            <div className="w-8 h-8 rounded-full bg-sky-700 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
              <span className="text-xs font-bold font-mono">in</span>
            </div>
            <span className="text-[10px] font-medium text-white/80">LinkedIn</span>
          </a>
        </div>

        {/* Copy Deep Link Bar */}
        <div className="p-2.5 rounded-2xl glass-pill border border-white/15 flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 truncate mr-2">
            <Link className="w-3.5 h-3.5 text-white/50 shrink-0" />
            <span className="text-xs text-white/70 font-mono truncate">{shareUrl}</span>
          </div>
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-xl bg-white text-neutral-950 font-bold text-xs shrink-0 flex items-center space-x-1 hover:bg-neutral-200 transition-colors shadow-md"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Copy Full Structured Summary */}
        <button
          onClick={handleCopySummary}
          className="w-full py-2.5 rounded-2xl glass-pill text-xs font-semibold text-white/80 hover:text-white flex items-center justify-center space-x-2 hover:bg-white/10 transition-colors"
        >
          {copiedSummary ? <Check className="w-4 h-4 text-emerald-400" /> : <BookOpen className="w-4 h-4" />}
          <span>{copiedSummary ? 'Copied Full Summary & Takeaways!' : 'Copy Formatted Study Summary'}</span>
        </button>
      </div>
    </div>
  );
};
