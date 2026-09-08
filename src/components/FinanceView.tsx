import React, { useState } from 'react';
import { Invoice, Payment, Expense, Member, Donation } from '../types.ts';
import {
  CreditCard,
  Plus,
  Receipt,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  X,
  FileText,
  DollarSign,
  HeartHandshake,
  MessageSquareText,
  Send,
  Printer,
  ShieldCheck,
  Building2,
  QrCode,
  Sparkles,
  Search,
  Filter,
  ArrowUpRight,
  Clock,
  Download,
} from 'lucide-react';

interface FinanceViewProps {
  invoices: Invoice[];
  payments: Payment[];
  expenses: Expense[];
  donations?: Donation[];
  summary: {
    totalCollected: number;
    totalExpenses: number;
    totalDonations?: number;
    netBalance: number;
    pendingDue: number;
    overdueDue?: number;
    paidInvoicesCount?: number;
    pendingInvoicesCount?: number;
    donationCount?: number;
  };
  members: Member[];
  onRecordPayment: (paymentData: any) => Promise<void>;
  onLogExpense: (expenseData: any) => Promise<void>;
  onGenerateInvoice?: (invoiceData: any) => Promise<void>;
  onRecordDonation?: (donationData: any) => Promise<void>;
  onSendWhatsAppReminder?: (invoiceIds?: number[], upiVpa?: string, customMessage?: string) => Promise<any>;
  currency?: string;
  activeOrgName?: string;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  invoices = [],
  payments = [],
  expenses = [],
  donations = [],
  summary,
  members = [],
  onRecordPayment,
  onLogExpense,
  onGenerateInvoice,
  onRecordDonation,
  onSendWhatsAppReminder,
  currency = 'INR',
  activeOrgName = 'Sports Organization',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'invoices' | 'payments' | 'expenses' | 'donations' | 'whatsapp-reminders'
  >('invoices');

  // Filters & Search
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<'all' | 'due' | 'overdue' | 'paid'>('all');
  const [invoiceSearch, setInvoiceSearch] = useState('');

  // Modals state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isCert80GModalOpen, setIsCert80GModalOpen] = useState(false);
  const [isSingleReminderModalOpen, setIsSingleReminderModalOpen] = useState(false);

  // Active selection for modals
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);

  // WhatsApp Broadcast state
  const [upiVpa, setUpiVpa] = useState('burrabazar.sports@icici');
  const [reminderMessageTemplate, setReminderMessageTemplate] = useState(
    'Dear {name}, your fee payment of ₹{amount} for "{title}" is due on {dueDate}. Please pay promptly via UPI ({upiVpa}) or at the club reception desk.'
  );
  const [broadcastResult, setBroadcastResult] = useState<any>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Forms
  const [paymentForm, setPaymentForm] = useState({
    invoiceId: undefined as number | undefined,
    memberId: members[0]?.id || undefined,
    amount: '2400',
    paymentMethod: 'UPI',
    notes: 'Google Pay / PhonePe transaction confirmation',
  });

  const [expenseForm, setExpenseForm] = useState({
    title: 'Court Maintenance & Equipment',
    category: 'Equipment',
    amount: '3500',
    paidTo: 'Stag Sports Vendor',
    description: 'Nets, balls, and lighting repair',
    expenseDate: new Date().toISOString().split('T')[0],
  });

  const [invoiceForm, setInvoiceForm] = useState({
    memberId: members[0]?.id || 1,
    invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    title: 'Monthly Coaching & Facility Pass',
    category: 'Membership Fee',
    amount: '1800',
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
  });

  const [donationForm, setDonationForm] = useState({
    donorName: '',
    donorPhone: '+91 ',
    donorEmail: '',
    donorPan: '',
    donorAddress: 'Kolkata, West Bengal',
    amount: '25000',
    paymentMethod: 'UPI',
    cause: 'Grassroots Youth Scholarship Fund',
    taxExemption80G: true,
    isAnonymous: false,
    notes: 'Annual benevolent patron contribution for youth training kit.',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Open Payment modal pre-filled
  const handleOpenPayment = (inv?: Invoice) => {
    if (inv) {
      setSelectedInvoice(inv);
      setPaymentForm({
        invoiceId: inv.id,
        memberId: inv.memberId,
        amount: inv.amount,
        paymentMethod: 'UPI',
        notes: `Settlement for ${inv.invoiceNumber} (${inv.title})`,
      });
    } else {
      setSelectedInvoice(null);
      setPaymentForm({
        invoiceId: undefined,
        memberId: members[0]?.id || undefined,
        amount: '1500',
        paymentMethod: 'UPI',
        notes: 'General training subscription fee',
      });
    }
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onRecordPayment(paymentForm);
      setIsPaymentModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.title || !expenseForm.amount) return;
    setIsSubmitting(true);
    try {
      await onLogExpense(expenseForm);
      setIsExpenseModalOpen(false);
      setExpenseForm({
        title: '',
        category: 'Equipment',
        amount: '',
        paidTo: '',
        description: '',
        expenseDate: new Date().toISOString().split('T')[0],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceForm.title || !invoiceForm.amount || !onGenerateInvoice) return;
    setIsSubmitting(true);
    try {
      await onGenerateInvoice(invoiceForm);
      setIsInvoiceModalOpen(false);
      setInvoiceForm({
        memberId: members[0]?.id || 1,
        invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        title: 'Monthly Coaching & Facility Pass',
        category: 'Membership Fee',
        amount: '1800',
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donationForm.donorName && !donationForm.isAnonymous) return;
    if (!donationForm.amount || !onRecordDonation) return;
    setIsSubmitting(true);
    try {
      await onRecordDonation(donationForm);
      setIsDonationModalOpen(false);
      setDonationForm({
        donorName: '',
        donorPhone: '+91 ',
        donorEmail: '',
        donorPan: '',
        donorAddress: 'Kolkata, West Bengal',
        amount: '25000',
        paymentMethod: 'UPI',
        cause: 'Grassroots Youth Scholarship Fund',
        taxExemption80G: true,
        isAnonymous: false,
        notes: '',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Trigger WhatsApp Reminders
  const handleTriggerBroadcast = async (specificInvoiceId?: number) => {
    if (!onSendWhatsAppReminder) return;
    setIsBroadcasting(true);
    try {
      const ids = specificInvoiceId ? [specificInvoiceId] : undefined;
      const res = await onSendWhatsAppReminder(ids, upiVpa, reminderMessageTemplate);
      setBroadcastResult(res);
      if (specificInvoiceId) {
        setIsSingleReminderModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsBroadcasting(false);
    }
  };

  // Filtered invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus =
      invoiceStatusFilter === 'all'
        ? true
        : invoiceStatusFilter === 'due'
        ? inv.status === 'due'
        : invoiceStatusFilter === 'overdue'
        ? inv.status === 'overdue'
        : inv.status === 'paid';

    const q = invoiceSearch.toLowerCase();
    const matchesSearch =
      !q ||
      inv.invoiceNumber.toLowerCase().includes(q) ||
      (inv.memberName && inv.memberName.toLowerCase().includes(q)) ||
      inv.title.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  const unpaidInvoices = invoices.filter((inv) => inv.status === 'due' || inv.status === 'overdue');
  const totalDonationSum = donations.reduce((acc, d) => acc + Number(d.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <span>Fee Management, Invoicing & Donations</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              UPI & 80G Ready
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Collect member tuition, log operational costs, manage 80G tax-exempt donations, and send instant WhatsApp payment reminders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onGenerateInvoice && (
            <button
              onClick={() => setIsInvoiceModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-blue-600" />
              <span>Create Fee Invoice</span>
            </button>
          )}

          {onRecordDonation && (
            <button
              onClick={() => setIsDonationModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100/80 text-amber-800 text-xs font-semibold shadow-xs transition-colors"
            >
              <HeartHandshake className="w-3.5 h-3.5 text-amber-600" />
              <span>Record Donation (80G)</span>
            </button>
          )}

          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
          >
            <CreditCard className="w-3.5 h-3.5 text-rose-600" />
            <span>Log Expense</span>
          </button>

          <button
            onClick={() => handleOpenPayment()}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Record Payment (UPI/Cash)</span>
          </button>
        </div>
      </div>

      {/* Financial Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Collections</span>
            <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-600 mt-1.5">
            ₹{summary.totalCollected.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{summary.paidInvoicesCount || payments.length} paid receipts</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Pending Dues</span>
            <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-amber-600 mt-1.5">
            ₹{summary.pendingDue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-amber-700 font-medium mt-0.5">
            {unpaidInvoices.length} members with dues
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Donations & 80G</span>
            <span className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <HeartHandshake className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-purple-700 mt-1.5">
            ₹{(summary.totalDonations || totalDonationSum).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-purple-600 font-medium mt-0.5">{donations.length} patrons / sponsors</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Expenses</span>
            <span className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-rose-600 mt-1.5">
            ₹{summary.totalExpenses.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{expenses.length} logged outlays</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Net Reserve</span>
            <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className={`text-xl font-bold font-mono mt-1.5 ${summary.netBalance >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
            ₹{summary.netBalance.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Solvent Treasury</div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 gap-2">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('invoices')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center space-x-1.5 shrink-0 ${
              activeSubTab === 'invoices'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Fee Invoices & Dues ({invoices.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('payments')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center space-x-1.5 shrink-0 ${
              activeSubTab === 'payments'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Payment Receipts ({payments.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('expenses')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center space-x-1.5 shrink-0 ${
              activeSubTab === 'expenses'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Operational Expenses ({expenses.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('donations')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center space-x-1.5 shrink-0 ${
              activeSubTab === 'donations'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Donations & 80G ({donations.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('whatsapp-reminders')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center space-x-1.5 shrink-0 ${
              activeSubTab === 'whatsapp-reminders'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquareText className="w-3.5 h-3.5" />
            <span>WhatsApp Fee Reminders</span>
            {unpaidInvoices.length > 0 && (
              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full font-bold">
                {unpaidInvoices.length}
              </span>
            )}
          </button>
        </div>

        {/* Unpaid quick count */}
        {unpaidInvoices.length > 0 && activeSubTab === 'invoices' && (
          <div className="pb-2">
            <button
              onClick={() => setActiveSubTab('whatsapp-reminders')}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 px-3 py-1 rounded-lg transition-colors"
            >
              <MessageSquareText className="w-3.5 h-3.5" />
              <span>Broadcast WhatsApp Reminders ({unpaidInvoices.length})</span>
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: Fee Invoices & Dues */}
      {activeSubTab === 'invoices' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
            <div className="flex items-center space-x-1 text-xs">
              <span className="text-slate-400 font-medium mr-1 flex items-center">
                <Filter className="w-3 h-3 mr-1" /> Filter:
              </span>
              {(['all', 'due', 'overdue', 'paid'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setInvoiceStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-semibold capitalize text-xs transition-colors ${
                    invoiceStatusFilter === st
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search member, inv #..."
                value={invoiceSearch}
                onChange={(e) => setInvoiceSearch(e.target.value)}
                className="pl-8 pr-3 py-1 text-xs rounded-lg border border-slate-200 w-full sm:w-64 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Member Name</th>
                    <th className="py-3 px-4">Fee Category & Title</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.length > 0 ? (
                    filteredInvoices.map((inv) => {
                      const isPaid = inv.status === 'paid';
                      const isOverdue = inv.status === 'overdue';

                      return (
                        <tr key={inv.id} className="hover:bg-slate-50/60">
                          <td className="py-3 px-4 font-mono font-bold text-slate-800">{inv.invoiceNumber}</td>
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            <div>{inv.memberName || 'General Member'}</div>
                            {inv.memberPhone && (
                              <div className="text-[10px] text-slate-400 font-normal">{inv.memberPhone}</div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-slate-800">{inv.title}</div>
                            <div className="text-[10px] text-slate-400">{inv.category}</div>
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-600">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{inv.dueDate}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">₹{inv.amount}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                                isPaid
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : isOverdue
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                            {!isPaid && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedInvoice(inv);
                                    setIsSingleReminderModalOpen(true);
                                  }}
                                  title="Send WhatsApp Dues Reminder"
                                  className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md text-[11px] font-semibold inline-flex items-center space-x-1"
                                >
                                  <MessageSquareText className="w-3 h-3 text-emerald-600" />
                                  <span>WhatsApp</span>
                                </button>

                                <button
                                  onClick={() => handleOpenPayment(inv)}
                                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-[11px] font-semibold shadow-2xs inline-flex items-center space-x-1"
                                >
                                  <Receipt className="w-3 h-3" />
                                  <span>Collect</span>
                                </button>
                              </>
                            )}

                            {isPaid && (
                              <span className="text-[11px] text-emerald-600 font-semibold inline-flex items-center space-x-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Paid</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-xs text-slate-400 italic">
                        No invoices match the selected filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Payments & Receipts */}
      {activeSubTab === 'payments' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3 border-b border-slate-100 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Official Money Receipts & Payment Ledger</span>
            <span className="text-slate-400 text-[11px]">Click "View Receipt" to print official club stamped receipt</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Member / Payer</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Notes / Txn Ref</th>
                  <th className="py-3 px-4 text-right">Official Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.length > 0 ? (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">{p.receiptNumber}</td>
                      <td className="py-3 px-4 text-slate-600">{p.paymentDate}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {p.memberName || (p.memberId ? `Member #${p.memberId}` : 'Club Member')}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-600">₹{p.amount}</td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{p.notes || 'Settled'}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedPayment(p);
                            setIsReceiptModalOpen(true);
                          }}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-medium transition-colors"
                        >
                          <Printer className="w-3 h-3 text-slate-500" />
                          <span>View Receipt</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-xs text-slate-400 italic">
                      No payment receipts recorded yet. Click "Record Payment" to log UPI or cash fee receipts.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Operational Expenses */}
      {activeSubTab === 'expenses' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3 border-b border-slate-100 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Club Operational Expense Register</span>
              <button
                onClick={() => setIsExpenseModalOpen(true)}
                className="inline-flex items-center space-x-1 text-blue-600 font-semibold hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log New Expense</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Expense Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Paid To</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.length > 0 ? (
                    expenses.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-bold text-slate-900">{e.title}</td>
                        <td className="py-3 px-4">
                          <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                            {e.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">{e.paidTo || '-'}</td>
                        <td className="py-3 px-4 text-slate-500">{e.expenseDate}</td>
                        <td className="py-3 px-4 font-mono font-bold text-rose-600">₹{e.amount}</td>
                        <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{e.description || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-xs text-slate-400 italic">
                        No club expenses logged yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Donations & 80G Tax Exemption */}
      {activeSubTab === 'donations' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-1.5">
                <HeartHandshake className="w-4 h-4 text-purple-600" />
                <span>Patron Donations, CSR Grants & 80G Tax Certificates</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Log philanthropic contributions for youth sports scholarships, infrastructure floodlights, and auto-generate Section 80G tax exemption receipts.
              </p>
            </div>

            {onRecordDonation && (
              <button
                onClick={() => setIsDonationModalOpen(true)}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record New Donation</span>
              </button>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Receipt #</th>
                    <th className="py-3 px-4">Donor Name & Contact</th>
                    <th className="py-3 px-4">Cause / Project</th>
                    <th className="py-3 px-4">Date & Mode</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">80G Status</th>
                    <th className="py-3 px-4 text-right">Tax Certificate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {donations.length > 0 ? (
                    donations.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-mono font-bold text-purple-700">{d.receiptNumber}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{d.donorName}</div>
                          {d.donorPan && (
                            <div className="text-[10px] font-mono text-slate-500">PAN: {d.donorPan}</div>
                          )}
                          {d.donorPhone && (
                            <div className="text-[10px] text-slate-400">{d.donorPhone}</div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            {d.cause}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          <div>{d.donationDate}</div>
                          <div className="text-[10px] text-slate-400 font-semibold">{d.paymentMethod}</div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-purple-700">₹{d.amount}</td>
                        <td className="py-3 px-4">
                          {d.taxExemption80G ? (
                            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded flex items-center space-x-1 w-fit">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>80G Eligible</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Non-80G</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedDonation(d);
                              setIsCert80GModalOpen(true);
                            }}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800 text-[11px] font-semibold transition-colors"
                          >
                            <Printer className="w-3 h-3 text-purple-600" />
                            <span>80G Certificate</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-xs text-slate-400 italic">
                        No donations recorded yet. Click "Record New Donation" to log donor patron contributions.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: WhatsApp Fee Reminders Engine */}
      {activeSubTab === 'whatsapp-reminders' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left panel: Broadcast controls & template */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <MessageSquareText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">WhatsApp Dues Broadcast Desk</h3>
                    <p className="text-[11px] text-slate-500">Automated UPI payment link & fee reminder notifications</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Meta Cloud API
                </span>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Club UPI VPA Identifier (for Instant Payment)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={upiVpa}
                      onChange={(e) => setUpiVpa(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 font-mono text-slate-800 focus:outline-hidden"
                      placeholder="e.g. burrabazar.sports@icici"
                    />
                    <div className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
                      <QrCode className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Direct UPI payment links (<span className="font-mono">upi://pay?pa=...</span>) will be appended automatically.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Custom Message Template
                  </label>
                  <textarea
                    rows={4}
                    value={reminderMessageTemplate}
                    onChange={(e) => setReminderMessageTemplate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden leading-relaxed"
                  />
                  <div className="flex flex-wrap gap-1 mt-1 text-[10px] text-slate-400">
                    <span>Variables:</span>
                    <span className="font-mono bg-slate-100 px-1 py-0.2 rounded text-slate-600">{'{name}'}</span>
                    <span className="font-mono bg-slate-100 px-1 py-0.2 rounded text-slate-600">{'{amount}'}</span>
                    <span className="font-mono bg-slate-100 px-1 py-0.2 rounded text-slate-600">{'{title}'}</span>
                    <span className="font-mono bg-slate-100 px-1 py-0.2 rounded text-slate-600">{'{dueDate}'}</span>
                    <span className="font-mono bg-slate-100 px-1 py-0.2 rounded text-slate-600">{'{upiVpa}'}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-600 font-medium">
                    Target: <span className="font-bold text-amber-700">{unpaidInvoices.length} members with unpaid dues</span>
                  </div>

                  <button
                    onClick={() => handleTriggerBroadcast()}
                    disabled={isBroadcasting || unpaidInvoices.length === 0}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isBroadcasting ? 'Broadcasting...' : `Send Reminders to All (${unpaidInvoices.length})`}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Live Broadcast Success Card */}
            {broadcastResult && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
                <div className="flex items-center space-x-2 text-emerald-800 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp Fee Reminders Dispatched Successfully!</span>
                </div>
                <p className="text-emerald-700">
                  {broadcastResult.message || `Dispatched to ${broadcastResult.dispatchedCount} members.`}
                </p>
                {broadcastResult.results && broadcastResult.results.length > 0 && (
                  <div className="max-h-36 overflow-y-auto space-y-1 pt-1 border-t border-emerald-200">
                    {broadcastResult.results.map((r: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] text-emerald-900 bg-white/70 p-1.5 rounded">
                        <span className="font-semibold">{r.recipient}</span>
                        <span className="text-slate-500">{r.phone}</span>
                        <span className="font-mono font-bold text-emerald-700">₹{r.amount}</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">Delivered</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right panel: WhatsApp phone preview */}
          <div className="lg:col-span-6">
            <div className="bg-slate-900 rounded-3xl p-4 shadow-xl max-w-sm mx-auto text-white">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    {activeOrgName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-slate-100">{activeOrgName} Desk</div>
                    <div className="text-[10px] text-emerald-400">Official WhatsApp Verified</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Preview</span>
              </div>

              {/* Chat bubble */}
              <div className="my-4 p-3 bg-emerald-950/80 border border-emerald-800/40 rounded-2xl text-slate-200 text-xs space-y-2">
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Official Fee Due Notification
                </div>
                <p className="leading-relaxed">
                  Dear <span className="font-semibold text-white">Pooja Agarwal</span>, your fee payment of{' '}
                  <span className="font-mono font-bold text-emerald-300">₹3,600</span> for "Quarterly Badminton Coaching" is due on{' '}
                  <span className="font-semibold text-white">01 Sep 2026</span>.
                </p>
                <div className="p-2.5 rounded-lg bg-slate-900/90 border border-emerald-800/30 text-[11px] space-y-1">
                  <div className="text-slate-400 text-[10px]">Instant UPI Pay Link:</div>
                  <div className="font-mono text-emerald-300 truncate">
                    upi://pay?pa={upiVpa}&pn={encodeURIComponent(activeOrgName)}&am=3600
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 text-right">Today, 10:45 AM • Delivered ✓✓</div>
              </div>

              <div className="text-center text-[10px] text-slate-500 py-1">
                Members can tap the link directly from their phone to open GPay / PhonePe.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Generate Fee Invoice */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Generate Member Fee Invoice</h3>
                <p className="text-xs text-slate-500">Bill athlete for tuition, tournament kit, or passes</p>
              </div>
              <button
                onClick={() => setIsInvoiceModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInvoiceSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Member *</label>
                <select
                  value={invoiceForm.memberId}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, memberId: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.memberCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Fee Description / Title *</label>
                <input
                  type="text"
                  required
                  value={invoiceForm.title}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, title: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                  placeholder="e.g. Monthly Academy Training Fee"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fee Category</label>
                  <select
                    value={invoiceForm.category}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, category: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Membership Fee">Membership Fee</option>
                    <option value="Coaching Fee">Coaching Tuition</option>
                    <option value="Tournament Fee">Tournament Fee</option>
                    <option value="Equipment & Kit">Equipment & Kit</option>
                    <option value="Facility Access">Facility Locker/Court</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={invoiceForm.amount}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Code</label>
                  <input
                    type="text"
                    required
                    value={invoiceForm.invoiceNumber}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 font-mono text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Due Date *</label>
                  <input
                    type="date"
                    required
                    value={invoiceForm.dueDate}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Issue Fee Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Record Payment Receipt */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Record Payment Receipt</h3>
                <p className="text-xs text-slate-500">Collect member subscription or tournament fee</p>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Member *</label>
                <select
                  value={paymentForm.memberId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, memberId: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.memberCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="Cash">Cash Receipt</option>
                    <option value="Card">Debit / Credit Card</option>
                    <option value="NetBanking">NetBanking / IMPS</option>
                    <option value="Cheque">Bank Cheque / DD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction Ref / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. UPI Ref: 489201938102"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Recording...' : 'Generate Official Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Log Operational Expense */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Log Operational Expense</h3>
                <p className="text-xs text-slate-500">Record tournament supplies, maintenance, or gear</p>
              </div>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Expense Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nivia Basketball Set & Whistles"
                  value={expenseForm.title}
                  onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Equipment">Equipment & Gear</option>
                    <option value="Maintenance">Court / Facility Maintenance</option>
                    <option value="Coach Stipend">Coach / Referee Stipend</option>
                    <option value="Tournaments">Tournament Logistics</option>
                    <option value="Refreshments">Athlete Refreshments</option>
                    <option value="Administrative">Office / Utility</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Paid To / Vendor</label>
                  <input
                    type="text"
                    placeholder="e.g. Eastern Sports Goods"
                    value={expenseForm.paidTo}
                    onChange={(e) => setExpenseForm({ ...expenseForm, paidTo: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Expense Date</label>
                  <input
                    type="date"
                    value={expenseForm.expenseDate}
                    onChange={(e) => setExpenseForm({ ...expenseForm, expenseDate: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Bill Notes</label>
                <textarea
                  rows={2}
                  placeholder="Official receipt/invoice number or purpose details"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Record Donation (80G) */}
      {isDonationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Record Philanthropic Donation</h3>
                <p className="text-xs text-slate-500">Log patron donation & issue 80G tax exemption receipt</p>
              </div>
              <button
                onClick={() => setIsDonationModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDonationSubmit} className="p-5 space-y-3.5">
              <div className="flex items-center space-x-2 mb-1">
                <input
                  type="checkbox"
                  id="anonCheck"
                  checked={donationForm.isAnonymous}
                  onChange={(e) => setDonationForm({ ...donationForm, isAnonymous: e.target.checked })}
                  className="rounded text-purple-600"
                />
                <label htmlFor="anonCheck" className="text-xs font-semibold text-slate-700">
                  Anonymous Donor / Well-Wisher
                </label>
              </div>

              {!donationForm.isAnonymous && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Donor Full Name / Entity *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mr. Sanjay Singhania or Eastern Traders"
                      value={donationForm.donorName}
                      onChange={(e) => setDonationForm({ ...donationForm, donorName: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Donor PAN Number (for 80G)</label>
                      <input
                        type="text"
                        placeholder="e.g. ABCPS1234F"
                        value={donationForm.donorPan}
                        onChange={(e) => setDonationForm({ ...donationForm, donorPan: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile / WhatsApp</label>
                      <input
                        type="text"
                        placeholder="+91 98310 11223"
                        value={donationForm.donorPhone}
                        onChange={(e) => setDonationForm({ ...donationForm, donorPhone: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Donation Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={donationForm.amount}
                    onChange={(e) => setDonationForm({ ...donationForm, amount: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 font-mono font-bold text-purple-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={donationForm.paymentMethod}
                    onChange={(e) => setDonationForm({ ...donationForm, paymentMethod: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="UPI">UPI Transfer (GPay / PhonePe)</option>
                    <option value="Bank Transfer (NEFT)">Bank Transfer (NEFT/RTGS)</option>
                    <option value="Cheque">Account Payee Cheque</option>
                    <option value="Cash">Cash Receipt</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Dedicated Sports Cause</label>
                <select
                  value={donationForm.cause}
                  onChange={(e) => setDonationForm({ ...donationForm, cause: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                >
                  <option value="Grassroots Youth Scholarship Fund">Grassroots Youth Athlete Scholarships</option>
                  <option value="Basketball Court LED Floodlight Project">Night Training Floodlights & Infrastructure</option>
                  <option value="State Championship Tournament Kits">Under-19 State Travel Grants & Uniforms</option>
                  <option value="Medical & Physical Therapy Fund">First-Aid & Sports Medicine Equipment</option>
                  <option value="General Corpus Sports Fund">General Club Corpus & Operations</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 p-2.5 rounded-lg bg-purple-50 border border-purple-100">
                <input
                  type="checkbox"
                  id="tax80g"
                  checked={donationForm.taxExemption80G}
                  onChange={(e) => setDonationForm({ ...donationForm, taxExemption80G: e.target.checked })}
                  className="rounded text-purple-600"
                />
                <label htmlFor="tax80g" className="text-xs font-semibold text-purple-900">
                  Issue 80G Tax Exemption Certificate (Income Tax Act 1961)
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsDonationModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Recording...' : 'Record & Issue 80G Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: Official Printable Payment Receipt */}
      {isReceiptModalOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Official Money Receipt</h3>
                  <p className="text-[11px] text-slate-500 font-mono">{selectedPayment.receiptNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Content Area */}
            <div className="p-6 space-y-4 text-xs font-sans">
              <div className="text-center pb-3 border-b border-slate-200">
                <div className="font-bold text-base text-slate-900">{activeOrgName}</div>
                <div className="text-[11px] text-slate-500">Affiliated to State Sports Association • Kolkata, West Bengal</div>
                <div className="text-[10px] font-semibold text-blue-700 mt-1 uppercase tracking-wider">
                  Official Money & Fee Receipt
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">Receipt No:</span>
                  <div className="font-mono font-bold text-slate-900">{selectedPayment.receiptNumber}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">Date:</span>
                  <div className="font-medium text-slate-900">{selectedPayment.paymentDate}</div>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Received From:</span>
                  <span className="font-bold text-slate-900">
                    {selectedPayment.memberName || (selectedPayment.memberId ? `Member #${selectedPayment.memberId}` : 'Club Member')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Mode:</span>
                  <span className="font-semibold text-slate-800">{selectedPayment.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Reference / Notes:</span>
                  <span className="text-slate-700 italic">{selectedPayment.notes || 'Settled'}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center justify-between">
                <span className="font-bold text-emerald-900">Total Amount Received:</span>
                <span className="text-lg font-bold font-mono text-emerald-700">₹{selectedPayment.amount}</span>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-end justify-between">
                <div>
                  <div className="w-16 h-16 rounded-full border border-slate-200 flex items-center justify-center text-[10px] text-slate-400 font-mono text-center p-1">
                    OFFICIAL SEAL
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-8 flex items-end justify-end">
                    <span className="font-serif italic text-slate-700">Hon. Treasurer</span>
                  </div>
                  <div className="text-[10px] text-slate-400 border-t border-slate-300 pt-1">
                    Authorized Signatory
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-2">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: Official Section 80G Tax Certificate */}
      {isCert80GModalOpen && selectedDonation && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-purple-50">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-purple-700 text-white flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Certificate of Donation under Section 80G</h3>
                  <p className="text-[11px] text-purple-700 font-mono">{selectedDonation.receiptNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setIsCert80GModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-purple-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-sans">
              <div className="text-center pb-3 border-b border-slate-200">
                <div className="font-bold text-base text-slate-900">{activeOrgName}</div>
                <div className="text-[11px] text-slate-600">Registered Non-Profit Sports & Youth Welfare Society</div>
                <div className="text-[10px] font-mono text-purple-800 font-semibold mt-1">
                  80G Registration Approval No: CIT(E)/KOL/80G/2024-25/A-11029
                </div>
              </div>

              <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-100 space-y-2 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Donor Name:</span>
                  <span className="font-bold text-slate-900">{selectedDonation.donorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Donor Permanent Account Number (PAN):</span>
                  <span className="font-mono font-bold text-slate-900">{selectedDonation.donorPan || 'Not Specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Donation Date:</span>
                  <span className="font-medium text-slate-800">{selectedDonation.donationDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mode of Transfer:</span>
                  <span className="font-semibold text-slate-800">{selectedDonation.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Designated Cause:</span>
                  <span className="font-medium text-purple-900">{selectedDonation.cause}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-emerald-900">Donation Sum:</div>
                  <div className="text-[10px] text-emerald-700">Qualifies for 50% deduction under Sec 80G(5)(vi)</div>
                </div>
                <div className="text-xl font-bold font-mono text-emerald-800">
                  ₹{Number(selectedDonation.amount).toLocaleString('en-IN')}
                </div>
              </div>

              <p className="text-[10px] text-slate-500 italic leading-relaxed">
                "We certify that the above sum has been received as a voluntary contribution towards the sports youth welfare objectives of {activeOrgName}. This certificate is valid for claiming tax exemption under Section 80G of the Income Tax Act, 1961."
              </p>

              <div className="pt-3 border-t border-slate-200 flex items-end justify-between">
                <div>
                  <div className="w-16 h-16 rounded-full border border-purple-200 flex items-center justify-center text-[10px] text-purple-600 font-mono text-center p-1">
                    80G STAMP
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-8 flex items-end justify-end">
                    <span className="font-serif italic text-slate-800">Secretary / Trustee</span>
                  </div>
                  <div className="text-[10px] text-slate-400 border-t border-slate-300 pt-1">
                    Authorized Signatory
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-2">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print 80G Exemption Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: Single Member WhatsApp Reminder */}
      {isSingleReminderModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Send WhatsApp Fee Reminder</h3>
                <p className="text-xs text-slate-500">Instant UPI payment link to {selectedInvoice.memberName}</p>
              </div>
              <button
                onClick={() => setIsSingleReminderModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Invoice:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedInvoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Member:</span>
                  <span className="font-bold text-slate-900">{selectedInvoice.memberName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount Due:</span>
                  <span className="font-mono font-bold text-emerald-600">₹{selectedInvoice.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Due Date:</span>
                  <span className="font-medium text-slate-700">{selectedInvoice.dueDate}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recipient WhatsApp Number
                </label>
                <input
                  type="text"
                  readOnly
                  value={selectedInvoice.memberPhone || '+91 98319 88123'}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-mono text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  UPI VPA for Instant Pay Link
                </label>
                <input
                  type="text"
                  value={upiVpa}
                  onChange={(e) => setUpiVpa(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsSingleReminderModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleTriggerBroadcast(selectedInvoice.id)}
                  disabled={isBroadcasting}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isBroadcasting ? 'Dispatching...' : 'Dispatch WhatsApp Now'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
