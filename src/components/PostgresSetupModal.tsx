import React, { useState } from 'react';
import { Database, X, Copy, Check, ExternalLink, HelpCircle } from 'lucide-react';

interface PostgresSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetryCloud?: () => void;
}

export function PostgresSetupModal({ isOpen, onClose, onRetryCloud }: PostgresSetupModalProps) {
  const [copiedVar, setCopiedVar] = useState(false);
  const [copiedExample, setCopiedExample] = useState(false);

  if (!isOpen) return null;

  const exampleUrl = 'postgresql://user:password@ep-sports-123456.us-east-1.aws.neon.tech/neondb?sslmode=require';

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">PostgreSQL Setup for Vercel</h3>
              <p className="text-[11px] text-slate-500">Connect a cloud database to persist data across devices</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-600">
          <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-2xl flex items-start space-x-3">
            <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-slate-700 leading-relaxed text-xs">
              <strong>Zero-friction:</strong> The application is currently running in{' '}
              <strong>Demo Sandbox Mode</strong>, saving all records in your browser. Adding a cloud PostgreSQL URL
              enables shared multi-user access and cloud sync.
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Step-by-step Connection (Takes ~2 minutes)
            </h4>

            <div className="space-y-2.5">
              {/* Step 1 */}
              <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <div className="space-y-1">
                  <span className="font-semibold text-slate-900 block">Create a Free PostgreSQL Instance</span>
                  <p className="text-slate-500">
                    Get an instant free PostgreSQL database from any of these popular managed providers:
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <a
                      href="https://neon.tech"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1 px-2.5 py-1 bg-white border border-slate-200 hover:border-blue-400 rounded-lg text-slate-700 font-medium"
                    >
                      <span>Neon (Recommended, ~20s setup)</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                    <a
                      href="https://supabase.com"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1 px-2.5 py-1 bg-white border border-slate-200 hover:border-emerald-400 rounded-lg text-slate-700 font-medium"
                    >
                      <span>Supabase</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                    <a
                      href="https://vercel.com/storage/postgres"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1 px-2.5 py-1 bg-white border border-slate-200 hover:border-indigo-400 rounded-lg text-slate-700 font-medium"
                    >
                      <span>Vercel Postgres</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <div className="space-y-2 flex-1 min-w-0">
                  <span className="font-semibold text-slate-900 block">Set Variable in Vercel Dashboard</span>
                  <p className="text-slate-500">
                    Go to your Vercel Project → <strong>Settings</strong> → <strong>Environment Variables</strong>:
                  </p>

                  <div className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[11px] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[10px] uppercase tracking-wider">Key</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText('DATABASE_URL');
                          setCopiedVar(true);
                          setTimeout(() => setCopiedVar(false), 2000);
                        }}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center space-x-1"
                      >
                        {copiedVar ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedVar ? 'Copied' : 'Copy Key'}</span>
                      </button>
                    </div>
                    <div className="text-white font-bold">DATABASE_URL</div>

                    <div className="border-t border-slate-800 pt-2 flex items-center justify-between">
                      <span className="text-slate-400 text-[10px] uppercase tracking-wider">Value Format</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(exampleUrl);
                          setCopiedExample(true);
                          setTimeout(() => setCopiedExample(false), 2000);
                        }}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center space-x-1"
                      >
                        {copiedExample ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedExample ? 'Copied' : 'Copy Sample'}</span>
                      </button>
                    </div>
                    <div className="text-amber-300 break-all text-[10px]">{exampleUrl}</div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <div className="space-y-1">
                  <span className="font-semibold text-slate-900 block">Redeploy on Vercel</span>
                  <p className="text-slate-500">
                    Go to the <strong>Deployments</strong> tab in Vercel, click <strong>...</strong> on the latest
                    deployment, and select <strong>Redeploy</strong>. The app will automatically connect and seed tables!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">Supported: Neon, Supabase, Vercel Postgres, AWS RDS</span>
          <div className="flex items-center space-x-2">
            {onRetryCloud && (
              <button
                onClick={() => {
                  onClose();
                  onRetryCloud();
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold"
              >
                Test Cloud DB
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
            >
              Continue with Sandbox
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
