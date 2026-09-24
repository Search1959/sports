import React, { useState, useEffect, useMemo } from 'react';
import { Member, Invoice } from '../types.ts';
import {
  MessageCircle,
  Send,
  X,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  QrCode,
  DollarSign,
  User,
  Calendar,
  Sparkles,
  Phone,
  Clock,
  ChevronDown,
  Info,
} from 'lucide-react';

export interface MembershipFeeReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  invoices: Invoice[];
  initialMemberId?: number;
  initialInvoiceId?: number;
  activeOrgName?: string;
  defaultUpiVpa?: string;
  onSendApiReminder?: (params: {
    invoiceIds?: number[];
    memberId?: number;
    upiVpa?: string;
    customMessage?: string;
    phone?: string;
    recipientName?: string;
  }) => Promise<any>;
}

type TemplateKey = 'friendly' | 'overdue' | 'renewal' | 'parent';

export const MembershipFeeReminderModal: React.FC<MembershipFeeReminderModalProps> = ({
  isOpen,
  onClose,
  members = [],
  invoices = [],
  initialMemberId,
  initialInvoiceId,
  activeOrgName = 'Sports Academy',
  defaultUpiVpa = 'burrabazar.sports@icici',
  onSendApiReminder,
}) => {
  const safeMembers = Array.isArray(members) ? members : [];
  const safeInvoices = Array.isArray(invoices) ? invoices : [];

  // Selected Member
  const [selectedMemberId, setSelectedMemberId] = useState<number | undefined>(
    initialMemberId || safeMembers[0]?.id
  );

  // Selected Invoice
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | undefined>(initialInvoiceId);

  // Custom fee fields if no invoice exists or manual override
  const [feeTitle, setFeeTitle] = useState('Monthly Coaching & Facility Pass');
  const [feeAmount, setFeeAmount] = useState('1800');
  const [feeDueDate, setFeeDueDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [upiVpa, setUpiVpa] = useState(defaultUpiVpa);
  const [recipientPhone, setRecipientPhone] = useState('');
  const [activeTemplate, setActiveTemplate] = useState<TemplateKey>('friendly');
  const [customMessage, setCustomMessage] = useState('');

  // UI state
  const [copiedText, setCopiedText] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isSendingApi, setIsSendingApi] = useState(false);
  const [apiSendSuccess, setApiSendSuccess] = useState<string | null>(null);
  const [showQrPreview, setShowQrPreview] = useState(false);

  // Sync state when props change
  useEffect(() => {
    if (initialMemberId) {
      setSelectedMemberId(initialMemberId);
    } else if (!selectedMemberId && safeMembers.length > 0) {
      setSelectedMemberId(safeMembers[0].id);
    }
  }, [initialMemberId, safeMembers]);

  useEffect(() => {
    if (initialInvoiceId) {
      setSelectedInvoiceId(initialInvoiceId);
      const matched = safeInvoices.find((inv) => inv.id === initialInvoiceId);
      if (matched) {
        if (matched.memberId) setSelectedMemberId(matched.memberId);
        setFeeTitle(matched.title || 'Membership Fee');
        setFeeAmount(matched.amount || '1800');
        setFeeDueDate(matched.dueDate || new Date().toISOString().split('T')[0]);
      }
    }
  }, [initialInvoiceId, safeInvoices]);

  const currentMember = useMemo(() => {
    return safeMembers.find((m) => m.id === selectedMemberId) || null;
  }, [safeMembers, selectedMemberId]);

  // Unpaid invoices for selected member
  const memberInvoices = useMemo(() => {
    if (!selectedMemberId) return [];
    return safeInvoices.filter((inv) => inv.memberId === selectedMemberId);
  }, [safeInvoices, selectedMemberId]);

  // Update fields when member or invoice changes
  useEffect(() => {
    if (currentMember) {
      const phone = currentMember.whatsapp || currentMember.mobile || '';
      setRecipientPhone(phone);

      // Check if member has pending/due invoice
      const pending = memberInvoices.find((i) => i.status === 'due' || i.status === 'overdue');
      if (pending && !initialInvoiceId) {
        setSelectedInvoiceId(pending.id);
        setFeeTitle(pending.title);
        setFeeAmount(pending.amount);
        setFeeDueDate(pending.dueDate);
      } else if (!pending && !initialInvoiceId) {
        setSelectedInvoiceId(undefined);
      }
    }
  }, [currentMember, memberInvoices]);

  // Template generators
  const templates: Record<TemplateKey, { name: string; desc: string; text: string }> = {
    friendly: {
      name: 'Friendly Reminder',
      desc: 'Polite pre-due or standard dues alert',
      text: `*Fee Reminder Notice — {org}* 🏸⚽

Dear {name},

This is a gentle reminder regarding your membership fee for *{title}*.

📌 *Amount Due:* ₹{amount}
📅 *Due Date:* {dueDate}
🏛️ *Organization:* {org}

💳 *Instant UPI Payment Link (GPay / PhonePe / Paytm):*
{upiUrl}

Or pay directly to UPI VPA: \`{upiVpa}\`

Please ignore this reminder if payment has already been submitted at the reception counter.

Thank you,
*Accounts & Administration Desk*
{org}`,
    },
    overdue: {
      name: 'Urgent Overdue Alert',
      desc: 'Firm alert for past-due membership dues',
      text: `⚠️ *URGENT: OVERDUE FEE NOTICE — {org}*

Dear {name},

Our records indicate that your sports academy subscription for *{title}* is currently *OVERDUE*.

🚨 *Pending Amount:* ₹{amount}
📅 *Original Due Date:* {dueDate}

To prevent disruption to your court training schedules and digital athlete pass access, please settle the outstanding sum promptly:

📲 *Direct UPI Pay Link:*
{upiUrl}

UPI ID: \`{upiVpa}\`

Kindly contact the academy administrative office if you have any questions or require an updated receipt.

Best regards,
*Hon. Treasurer & Admin Team*
{org}`,
    },
    renewal: {
      name: 'Quarterly / Term Renewal',
      desc: 'Advance registration & batch continuation',
      text: `🌟 *MEMBERSHIP TERM RENEWAL — {org}*

Dear {name},

Advance registration for the upcoming sports coaching term is now officially open! Secure your slot and court timings:

📋 *Program:* {title}
💰 *Term Subscription Fee:* ₹{amount}
📅 *Renewal Deadline:* {dueDate}

⚡ *One-Click UPI Payment:*
{upiUrl}
(VPA: \`{upiVpa}\`)

Reply to this message with your payment screenshot to receive your verified digital membership badge instantly!

Warm regards,
*Head of Sports Operations*
{org}`,
    },
    parent: {
      name: 'Guardian / Parent Notice',
      desc: 'Tailored for youth & junior academy guardians',
      text: `📢 *Official Academy Update for Guardians*

Dear Guardian of *{name}*,

Warm greetings from *{org}*.

We are writing regarding the coaching & sports facility fee for {name}:
🏷️ *Training Track:* {title}
💵 *Fee Amount:* ₹{amount}
📆 *Due By:* {dueDate}

Parents can settle seamlessly through instant UPI:
🔗 {upiUrl}
UPI VPA: \`{upiVpa}\`

For any queries regarding training schedule or nutrition logs, our head coach is available at the reception.

Sincerely,
*Academy Coaching Staff & Management*
{org}`,
    },
  };

  // Generate populated message
  const populatedMessage = useMemo(() => {
    const rawTemplate = customMessage || templates[activeTemplate].text;
    const name = currentMember?.fullName || 'Athlete';
    const cleanPhone = recipientPhone.replace(/[^0-9]/g, '');
    const cleanUpi = upiVpa.trim();
    const upiUrl = `upi://pay?pa=${encodeURIComponent(cleanUpi)}&pn=${encodeURIComponent(
      activeOrgName
    )}&am=${encodeURIComponent(feeAmount)}&cu=INR&tn=${encodeURIComponent(
      `Fee for ${name} - ${feeTitle}`
    )}`;

    return rawTemplate
      .replace(/{name}/g, name)
      .replace(/{title}/g, feeTitle)
      .replace(/{amount}/g, feeAmount)
      .replace(/{dueDate}/g, feeDueDate)
      .replace(/{upiVpa}/g, cleanUpi)
      .replace(/{upiUrl}/g, upiUrl)
      .replace(/{org}/g, activeOrgName);
  }, [
    customMessage,
    activeTemplate,
    currentMember,
    feeTitle,
    feeAmount,
    feeDueDate,
    upiVpa,
    activeOrgName,
    recipientPhone,
  ]);

  // Deep link for wa.me
  const waMeLink = useMemo(() => {
    const cleanPhone = recipientPhone.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(populatedMessage)}`;
  }, [recipientPhone, populatedMessage]);

  // UPI deep link
  const currentUpiUrl = useMemo(() => {
    const cleanUpi = upiVpa.trim();
    const name = currentMember?.fullName || 'Member';
    return `upi://pay?pa=${encodeURIComponent(cleanUpi)}&pn=${encodeURIComponent(
      activeOrgName
    )}&am=${encodeURIComponent(feeAmount)}&cu=INR&tn=${encodeURIComponent(
      `Fee for ${name} - ${feeTitle}`
    )}`;
  }, [upiVpa, activeOrgName, feeAmount, currentMember, feeTitle]);

  // Handle template selection
  const handleSelectTemplate = (key: TemplateKey) => {
    setActiveTemplate(key);
    setCustomMessage(''); // Reset to default of that template
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(populatedMessage);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(currentUpiUrl);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleSendViaApi = async () => {
    if (!onSendApiReminder) return;
    setIsSendingApi(true);
    setApiSendSuccess(null);
    try {
      const res = await onSendApiReminder({
        invoiceIds: selectedInvoiceId ? [selectedInvoiceId] : undefined,
        memberId: selectedMemberId,
        upiVpa,
        customMessage: populatedMessage,
        phone: recipientPhone,
        recipientName: currentMember?.fullName,
      });
      setApiSendSuccess(
        res?.message || 'Fee reminder successfully queued and dispatched through WhatsApp Cloud API!'
      );
      setTimeout(() => {
        setApiSendSuccess(null);
      }, 5000);
    } catch (err: any) {
      console.error(err);
      setApiSendSuccess(`Dispatch error: ${err.message || 'Failed to dispatch WhatsApp API reminder'}`);
    } finally {
      setIsSendingApi(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-slate-900 text-base">Membership Fee Reminder (WhatsApp)</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                  Interactive Model
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Live message preview, UPI QR payment integration, preset notification templates & 1-tap wa.me launch.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FEEDBACK BANNER */}
        {apiSendSuccess && (
          <div className="p-3.5 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{apiSendSuccess}</span>
            </div>
            <button
              onClick={() => setApiSendSuccess(null)}
              className="p-1 hover:bg-emerald-100 rounded text-emerald-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* MODAL BODY (2-COL SPLIT: CONFIG ON LEFT, LIVE PREVIEW ON RIGHT) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Controls & Configurations */}
          <div className="lg:col-span-7 space-y-4">
            {/* 1. Member Selector */}
            <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>Target Athlete / Member</span>
                </label>
                {currentMember?.status && (
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold capitalize">
                    {currentMember.status}
                  </span>
                )}
              </div>

              <select
                value={selectedMemberId || ''}
                onChange={(e) => {
                  setSelectedMemberId(Number(e.target.value));
                  setSelectedInvoiceId(undefined);
                }}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:border-blue-500 shadow-2xs"
              >
                {safeMembers.map((m) => {
                  const mInvoices = safeInvoices.filter(
                    (i) => i.memberId === m.id && (i.status === 'due' || i.status === 'overdue')
                  );
                  const duesTag = mInvoices.length > 0 ? ` [⚠️ ${mInvoices.length} Dues]` : '';
                  return (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.memberCode}) • {m.mobile || 'No Mobile'} {duesTag}
                    </option>
                  );
                })}
              </select>

              {/* Recipient Phone & Guardian Fallback */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                <div>
                  <span className="text-[11px] text-slate-500 font-medium">WhatsApp Destination:</span>
                  <div className="relative mt-1">
                    <Phone className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      placeholder="+91 98300 00000"
                      className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-slate-200 bg-white font-mono text-xs text-slate-800 focus:outline-hidden"
                    />
                  </div>
                </div>

                {currentMember?.guardianName && (
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium">Guardian Phone:</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (currentMember.guardianPhone) {
                          setRecipientPhone(currentMember.guardianPhone);
                        }
                      }}
                      className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-left text-xs font-mono text-slate-700 flex items-center justify-between transition-colors"
                      title="Click to use guardian's phone number"
                    >
                      <span className="truncate">{currentMember.guardianPhone || 'N/A'}</span>
                      <span className="text-[10px] text-blue-600 font-sans font-bold">Use</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Fee & Invoice Details */}
            <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Fee Bill & Amount Due</span>
                </label>

                {memberInvoices.length > 0 && (
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    {memberInvoices.length} Registered Bill(s)
                  </span>
                )}
              </div>

              {/* Linked invoice selector if member has invoices */}
              {memberInvoices.length > 0 && (
                <div>
                  <span className="text-[11px] text-slate-500 font-medium block mb-1">
                    Select Existing Member Invoice:
                  </span>
                  <select
                    value={selectedInvoiceId || ''}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      setSelectedInvoiceId(id);
                      const inv = memberInvoices.find((i) => i.id === id);
                      if (inv) {
                        setFeeTitle(inv.title);
                        setFeeAmount(inv.amount);
                        setFeeDueDate(inv.dueDate);
                      }
                    }}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="">Manual / Custom Fee Description</option>
                    {memberInvoices.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.invoiceNumber} - {inv.title} (₹{inv.amount}, Due: {inv.dueDate}) [{inv.status}]
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Fee description, amount, due date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Fee Title</label>
                  <input
                    type="text"
                    value={feeTitle}
                    onChange={(e) => setFeeTitle(e.target.value)}
                    placeholder="Monthly Pass"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    value={feeAmount}
                    onChange={(e) => setFeeAmount(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={feeDueDate}
                    onChange={(e) => setFeeDueDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                </div>
              </div>

              {/* UPI VPA & QR Toggle */}
              <div className="pt-2 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex-1">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Club UPI ID (for GPay / PhonePe payment link)
                  </label>
                  <input
                    type="text"
                    value={upiVpa}
                    onChange={(e) => setUpiVpa(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-200 bg-white"
                    placeholder="academy@icici"
                  />
                </div>
                <div className="flex items-center space-x-2 self-end sm:self-center pt-2 sm:pt-4">
                  <button
                    type="button"
                    onClick={() => setShowQrPreview(!showQrPreview)}
                    className="px-2.5 py-1.5 bg-slate-200/80 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>{showQrPreview ? 'Hide QR' : 'View QR'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="px-2.5 py-1.5 bg-slate-200/80 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors"
                    title="Copy UPI Deep Link"
                  >
                    {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUpi ? 'Copied' : 'UPI Link'}</span>
                  </button>
                </div>
              </div>

              {/* QR Preview dropdown */}
              {showQrPreview && (
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center space-x-4 animate-fadeIn">
                  <div className="w-20 h-20 bg-slate-100 rounded-lg border border-slate-200 flex flex-col items-center justify-center p-1">
                    <QrCode className="w-12 h-12 text-slate-800" />
                    <span className="text-[8px] font-bold text-slate-500 mt-0.5">BHIM UPI</span>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <div className="font-bold text-slate-900">Scan & Pay ₹{feeAmount}</div>
                    <div className="font-mono text-[11px] text-slate-500">{upiVpa}</div>
                    <div className="text-[10px] text-slate-400">
                      Supports Google Pay, PhonePe, Paytm, and all Indian banking apps.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Preset Template Chips */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Choose Notification Model</span>
                </label>
                <span className="text-[10px] text-slate-400">Auto-injects athlete fee parameters</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(Object.keys(templates) as TemplateKey[]).map((key) => {
                  const t = templates[key];
                  const isSelected = activeTemplate === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleSelectTemplate(key)}
                      className={`p-2.5 rounded-xl text-left border transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/70 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isSelected ? 'text-emerald-900' : 'text-slate-800'}`}>
                          {t.name}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{t.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Edit Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Message Text Customizer</label>
                <button
                  type="button"
                  onClick={() => setCustomMessage(templates[activeTemplate].text)}
                  className="text-[10px] text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Reset Template
                </button>
              </div>
              <textarea
                rows={5}
                value={customMessage || templates[activeTemplate].text}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 leading-relaxed text-slate-800"
              />
              <div className="flex flex-wrap items-center gap-1 mt-1 text-[10px] text-slate-500">
                <span>Variables:</span>
                <span className="font-mono bg-slate-100 px-1 py-0.2 rounded text-slate-600">{'{name}'}</span>
                <span className="font-mono bg-slate-100 px-1 py-0.2 rounded text-slate-600">{'{amount}'}</span>
                <span className="font-mono bg-slate-100 px-1 py-0.2 rounded text-slate-600">{'{title}'}</span>
                <span className="font-mono bg-slate-100 px-1 py-0.2 rounded text-slate-600">{'{dueDate}'}</span>
                <span className="font-mono bg-slate-100 px-1 py-0.2 rounded text-slate-600">{'{upiUrl}'}</span>
                <span className="font-mono bg-slate-100 px-1 py-0.2 rounded text-slate-600">{'{org}'}</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Realistic WhatsApp Chat Simulator */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Live WhatsApp Chat Preview</span>
              <span className="text-[10px] font-mono text-slate-400">Recipient View</span>
            </div>

            {/* WhatsApp Phone Mockup Container */}
            <div className="flex-1 bg-[#efeae2] rounded-3xl border border-slate-300 shadow-inner overflow-hidden flex flex-col min-h-[420px]">
              {/* WhatsApp App Header */}
              <div className="bg-[#075e54] text-white p-3 flex items-center justify-between shadow-xs">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-xs border border-white/30">
                    {activeOrgName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="leading-tight">
                    <div className="font-bold text-xs flex items-center space-x-1">
                      <span className="truncate max-w-[150px]">{activeOrgName}</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-300 inline shrink-0" />
                    </div>
                    <div className="text-[10px] text-emerald-200">Official Business Account</div>
                  </div>
                </div>
                <div className="text-[10px] bg-white/20 text-white font-mono px-2 py-0.5 rounded-full">
                  WhatsApp
                </div>
              </div>

              {/* Chat Canvas */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3">
                {/* Security encryption pill */}
                <div className="bg-[#ffeecd] text-[#54656f] text-[10px] text-center p-1.5 rounded-lg shadow-2xs border border-amber-200 max-w-xs mx-auto flex items-center justify-center space-x-1">
                  <span>🔒 End-to-end encrypted official notification</span>
                </div>

                {/* Message Bubble */}
                <div className="bg-[#d9fdd3] text-slate-900 rounded-2xl rounded-tr-xs p-3 text-xs shadow-xs space-y-2 border border-emerald-200/50 max-w-[94%] ml-auto">
                  <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-900">
                    {populatedMessage}
                  </div>

                  {/* Bubble timestamp & double check */}
                  <div className="flex items-center justify-end space-x-1 text-[10px] text-slate-500 pt-1">
                    <span>
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-blue-500 font-bold">✓✓</span>
                  </div>
                </div>
              </div>

              {/* Instant WhatsApp launcher inside preview */}
              <div className="p-3 bg-white border-t border-slate-200 space-y-2">
                <a
                  href={waMeLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-colors shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Launch in WhatsApp App (wa.me)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <p className="text-[10px] text-center text-slate-400">
                  Opens WhatsApp Web or mobile app directly pre-filled for {recipientPhone || 'athlete'}.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 flex items-center space-x-1.5 transition-colors"
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedText ? 'Copied Message!' : 'Copy Full Text'}</span>
            </button>
            <span className="text-xs text-slate-400 hidden sm:inline">•</span>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Recipient: <strong className="text-slate-800">{currentMember?.fullName || 'Athlete'}</strong> (
              <span className="font-mono">{recipientPhone}</span>)
            </span>
          </div>

          <div className="flex items-center space-x-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Close
            </button>

            {onSendApiReminder && (
              <button
                type="button"
                onClick={handleSendViaApi}
                disabled={isSendingApi || !recipientPhone}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isSendingApi ? 'Dispatching...' : 'Send via Cloud API'}</span>
              </button>
            )}

            <a
              href={waMeLink}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Direct WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
