import React, { useState } from 'react';
import { WhatsAppTemplate, WhatsAppMessage, Member, Sport, Invoice } from '../types.ts';
import { MembershipFeeReminderModal } from './MembershipFeeReminderModal.tsx';
import {
  MessageCircle,
  Send,
  CheckCheck,
  ShieldCheck,
  FileText,
  Users,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  QrCode,
  Sparkles,
} from 'lucide-react';

interface WhatsAppViewProps {
  templates: WhatsAppTemplate[];
  messages: WhatsAppMessage[];
  members: Member[];
  sports: Sport[];
  invoices?: Invoice[];
  activeOrgName?: string;
  onSendBroadcast: (templateId?: number, customText?: string) => Promise<{ sentCount: number; message: string }>;
  onSendFeeReminder?: (params: any) => Promise<any>;
}

export const WhatsAppView: React.FC<WhatsAppViewProps> = ({
  templates,
  messages,
  members,
  sports,
  invoices = [],
  activeOrgName = 'Sports Academy',
  onSendBroadcast,
  onSendFeeReminder,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | undefined>(templates[0]?.id);
  const [customText, setCustomText] = useState(
    'Urgent Notice: Today evening basketball practice moved to 5:00 PM on Court 1. Please arrive on time with jersey.'
  );
  const [sending, setSending] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<string | null>(null);
  const [isFeeReminderModalOpen, setIsFeeReminderModalOpen] = useState(false);
  const [selectedFeeMemberId, setSelectedFeeMemberId] = useState<number | undefined>(undefined);

  const optedInCount = members.filter((m) => m.whatsappOptIn).length;
  const pendingInvoices = invoices.filter((inv) => inv.status === 'due' || inv.status === 'overdue');

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setBroadcastResult(null);
    try {
      const res = await onSendBroadcast(selectedTemplateId, customText);
      setBroadcastResult(res.message);
      setTimeout(() => setBroadcastResult(null), 5000);
    } catch (err: any) {
      setBroadcastResult(`Failed: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">WhatsApp Broadcast & Communication</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Meta WhatsApp Business Platform compliant messaging with opt-in verification and structured notification templates.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => {
              setSelectedFeeMemberId(undefined);
              setIsFeeReminderModalOpen(true);
            }}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <DollarSign className="w-4 h-4" />
            <span>Membership Fee Reminder Model</span>
          </button>

          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Opt-In: {optedInCount} Verified</span>
          </div>
        </div>
      </div>

      {/* Featured Banner: WhatsApp Membership Fee Reminder Model */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-emerald-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Fee Collection Engine
            </span>
            {pendingInvoices.length > 0 && (
              <span className="px-2 py-0.5 bg-amber-500 text-white font-bold text-[10px] rounded-full">
                {pendingInvoices.length} Dues Pending
              </span>
            )}
          </div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <MessageCircle className="w-5 h-5 text-emerald-400" />
            <span>Membership Fee Reminder Model via WhatsApp</span>
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Dispatch personalized WhatsApp fee dues with dynamic UPI payment links, QR codes, live chat preview bubble, and 1-tap <code className="bg-white/10 px-1 py-0.5 rounded text-emerald-300">wa.me</code> or Meta Cloud API dispatch.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setSelectedFeeMemberId(undefined);
              setIsFeeReminderModalOpen(true);
            }}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Fee Reminder Model</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Broadcast Composer */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="font-bold text-slate-900 text-base mb-1 flex items-center space-x-2">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Broadcast Campaign Composer</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Dispatch immediate match updates, drill cancellations, or fee receipts.
            </p>

            {broadcastResult && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{broadcastResult}</span>
              </div>
            )}

            <form onSubmit={handleBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Approved Message Template
                </label>
                <select
                  value={selectedTemplateId || ''}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    setSelectedTemplateId(id);
                    const t = templates.find((x) => x.id === id);
                    if (t) setCustomText(t.content);
                  }}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                >
                  {templates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name} ({tpl.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Message Content</label>
                <textarea
                  rows={4}
                  required
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden font-sans"
                />
              </div>

              {/* Target Audience Summary */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-slate-700">
                    Recipients: All Active Opted-In Club Members
                  </span>
                </div>
                <span className="font-mono font-bold text-slate-900 bg-white px-2.5 py-1 rounded border border-slate-200">
                  {optedInCount} Contacts
                </span>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={sending || optedInCount === 0}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-2 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>{sending ? 'Dispatching...' : `Dispatch WhatsApp Broadcast (${optedInCount})`}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Dispatch Logs */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Recent WhatsApp Delivery Logs</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-xs text-slate-400 italic text-center py-4">
                  No messages sent yet. Send a broadcast to see logs.
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-800">
                        {msg.recipientName} ({msg.recipientPhone})
                      </div>
                      <div className="text-slate-500 mt-0.5 line-clamp-1">{msg.content}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-semibold text-emerald-700 flex items-center space-x-1">
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="capitalize">{msg.status}</span>
                      </span>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{msg.sentAt?.slice(0, 10)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Templates Library */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-2 flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Approved Template Library</span>
            </h3>
            <div className="space-y-2.5">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => {
                    setSelectedTemplateId(tpl.id);
                    setCustomText(tpl.content);
                  }}
                  className="p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-colors cursor-pointer text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>{tpl.name}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase">
                      {tpl.category}
                    </span>
                  </div>
                  <p className="text-slate-500 mt-1 line-clamp-2">{tpl.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Membership Fee Reminder WhatsApp Modal */}
      {isFeeReminderModalOpen && (
        <MembershipFeeReminderModal
          isOpen={isFeeReminderModalOpen}
          onClose={() => setIsFeeReminderModalOpen(false)}
          members={members}
          invoices={invoices}
          initialMemberId={selectedFeeMemberId}
          activeOrgName={activeOrgName}
          onSendApiReminder={onSendFeeReminder}
        />
      )}
    </div>
  );
};
