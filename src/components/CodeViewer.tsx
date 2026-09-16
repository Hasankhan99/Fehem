import React, { useState } from 'react';
import { Copy, Check, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { CodeSnippet } from '../types';

interface CodeViewerProps {
  snippet: CodeSnippet;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ snippet }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'solution' | 'anti-pattern'>('solution');

  const currentCode = activeTab === 'solution' ? snippet.code : (snippet.badCode || snippet.code);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div id={`code-viewer-${snippet.language}`} className="w-full rounded-xl bg-neutral-900/90 border border-neutral-800 overflow-hidden shadow-xl my-2">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-neutral-950/80 border-b border-neutral-800/80">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-xs font-mono text-neutral-400 font-medium ml-1.5">
            {snippet.title || `${snippet.language} snippet`}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 uppercase tracking-wider">
            {snippet.language}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {snippet.badCode && (
            <div className="flex items-center bg-neutral-900 rounded-lg p-0.5 border border-neutral-800 text-xs">
              <button
                id="btn-tab-solution"
                onClick={() => setActiveTab('solution')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all font-medium ${
                  activeTab === 'solution'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Best Practice</span>
              </button>
              <button
                id="btn-tab-antipattern"
                onClick={() => setActiveTab('anti-pattern')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all font-medium ${
                  activeTab === 'anti-pattern'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Anti-Pattern</span>
              </button>
            </div>
          )}

          <button
            id="btn-copy-code"
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors border border-neutral-700/50"
            title="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-neutral-400" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Block with line numbering */}
      <div className="relative p-3.5 overflow-x-auto text-xs font-mono leading-relaxed max-h-60 sm:max-h-72 overflow-y-auto no-scrollbar">
        <pre className="text-neutral-200 selection:bg-emerald-600/40">
          <code>{currentCode}</code>
        </pre>
      </div>

      {/* Explanation Footer */}
      {snippet.explanation && (
        <div className="px-3.5 py-2.5 bg-neutral-950/60 border-t border-neutral-800/80 text-[11px] text-neutral-400 flex items-start space-x-2">
          <span className="text-emerald-400 font-semibold uppercase tracking-wider shrink-0 mt-0.5">Key Insight:</span>
          <p className="leading-snug text-neutral-300">{snippet.explanation}</p>
        </div>
      )}
    </div>
  );
};
