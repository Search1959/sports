import React, { useState } from 'react';
import { Invoice, Payment, Expense, Member, Donation } from '../types.ts';
import { MembershipFeeReminderModal } from './MembershipFeeReminderModal.tsx';
import { printIsolatedHtml } from '../lib/printUtils.ts';
import {
  CreditCard,
  Plus,
  Receipt,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  AlertTriangle,
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
  Eye,
  Edit2,
  Trash2,
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
  onUpdateInvoice?: (id: number, data: any) => Promise<void>;
  onDeleteInvoice?: (id: number) => Promise<void>;
  onUpdatePayment?: (id: number, data: any) => Promise<void>;
  onDeletePayment?: (id: number) => Promise<void>;
  onUpdateExpense?: (id: number, data: any) => Promise<void>;
  onDeleteExpense?: (id: number) => Promise<void>;
  onUpdateDonation?: (id: number, data: any) => Promise<void>;
  onDeleteDonation?: (id: number) => Promise<void>;
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
  onUpdateInvoice,
  onDeleteInvoice,
  onUpdatePayment,
  onDeletePayment,
  onUpdateExpense,
  onDeleteExpense,
  onUpdateDonation,
  onDeleteDonation,
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
  const [isProcessingCrud, setIsProcessingCrud] = useState(false);
  const [printFeedback, setPrintFeedback] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // CRUD modal states
  // 1. Invoices
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null);
  const [editInvoiceForm, setEditInvoiceForm] = useState<Partial<Invoice>>({});

  // 2. Payments
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [deletingPayment, setDeletingPayment] = useState<Payment | null>(null);
  const [editPaymentForm, setEditPaymentForm] = useState<Partial<Payment>>({});

  // 3. Expenses
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [editExpenseForm, setEditExpenseForm] = useState<Partial<Expense>>({});

  // 4. Donations
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);
  const [deletingDonation, setDeletingDonation] = useState<Donation | null>(null);
  const [editDonationForm, setEditDonationForm] = useState<Partial<Donation>>({});

  // Trigger print toast with auto clear
  const triggerPrintFeedback = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setPrintFeedback({ message, type });
    setTimeout(() => setPrintFeedback(null), 5000);
  };

  // Dedicated reliable print helper for Money Receipt
  const handlePrintOfficialReceipt = async (payment: Payment) => {
    triggerPrintFeedback(`Preparing official receipt #${payment.receiptNumber}...`, 'info');
    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 2px solid #0f172a; border-radius: 12px;">
        <div style="text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 16px;">
          <h1 style="margin: 0; font-size: 22px; color: #0f172a; text-transform: uppercase;">${activeOrgName}</h1>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">Affiliated to State Sports Association • Official Financial Document</p>
          <div style="display: inline-block; margin-top: 8px; background: #2563eb; color: #ffffff; padding: 4px 12px; border-radius: 6px; font-size: 11px; font-weight: bold; letter-spacing: 1px;">
            OFFICIAL MONEY & FEE RECEIPT
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 12px;">
          <div>
            <span style="color: #64748b; text-transform: uppercase; font-size: 10px; display: block;">Receipt Number</span>
            <strong style="font-family: monospace; font-size: 14px; color: #0f172a;">${payment.receiptNumber}</strong>
          </div>
          <div style="text-align: right;">
            <span style="color: #64748b; text-transform: uppercase; font-size: 10px; display: block;">Date of Payment</span>
            <strong style="font-size: 13px; color: #0f172a;">${payment.paymentDate}</strong>
          </div>
        </div>

        <div style="background: #f8fafc; padding: 14px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 16px; font-size: 12px; line-height: 1.8;">
          <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #cbd5e1; padding-bottom: 6px; margin-bottom: 6px;">
            <span style="color: #475569;">Received From:</span>
            <strong style="color: #0f172a;">${payment.memberName || (payment.memberId ? `Member #${payment.memberId}` : 'Club Athlete')}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #cbd5e1; padding-bottom: 6px; margin-bottom: 6px;">
            <span style="color: #475569;">Payment Method / Gateway:</span>
            <strong style="color: #0f172a;">${payment.paymentMethod}</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #475569;">Purpose / Notes:</span>
            <span style="color: #334155; font-style: italic;">${payment.notes || 'Subscription & Training Dues'}</span>
          </div>
        </div>

        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <span style="font-weight: bold; color: #065f46; font-size: 13px;">Total Amount Received:</span>
          <span style="font-family: monospace; font-weight: bold; color: #047857; font-size: 20px;">₹${payment.amount}</span>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: flex-end; padding-top: 16px; border-top: 2px solid #e2e8f0;">
          <div style="width: 80px; height: 80px; border: 1px dashed #94a3b8; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 9px; color: #64748b;">
            OFFICIAL<br/>STAMP
          </div>
          <div style="text-align: right;">
            <div style="height: 32px; font-family: serif; font-style: italic; color: #1e293b; font-size: 15px;">Hon. Treasurer</div>
            <div style="font-size: 11px; color: #64748b; border-top: 1px solid #94a3b8; padding-top: 4px;">Authorized Signatory</div>
          </div>
        </div>
      </div>
    `;

    try {
      const res = await printIsolatedHtml(html, `Receipt-${payment.receiptNumber}`);
      if (res.success) {
        triggerPrintFeedback(`System print window opened for Receipt #${payment.receiptNumber}!`, 'success');
      } else {
        triggerPrintFeedback(`Browser restricted direct print. Use browser Ctrl+P or save receipt.`, 'info');
      }
    } catch (err) {
      console.warn('Print error', err);
      window.print();
    }
  };

  // Dedicated reliable print helper for 80G Certificate
  const handlePrintOfficial80GCert = async (donation: Donation) => {
    triggerPrintFeedback(`Preparing 80G Tax Exemption Certificate for ${donation.donorName}...`, 'info');
    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; padding: 28px; border: 2px solid #581c87; border-radius: 12px;">
        <div style="text-align: center; border-bottom: 2px solid #e9d5ff; padding-bottom: 16px; margin-bottom: 16px;">
          <h1 style="margin: 0; font-size: 24px; color: #3b0764; text-transform: uppercase;">${activeOrgName}</h1>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #475569;">Registered Non-Profit Sports & Youth Welfare Society</p>
          <div style="margin-top: 8px; font-family: monospace; font-size: 11px; color: #6b21a8; font-weight: bold;">
            80G Registration Approval No: CIT(E)/KOL/80G/2024-25/A-11029
          </div>
          <div style="display: inline-block; margin-top: 8px; background: #6b21a8; color: #ffffff; padding: 4px 14px; border-radius: 6px; font-size: 11px; font-weight: bold; letter-spacing: 1px;">
            CERTIFICATE OF DONATION UNDER SECTION 80G
          </div>
        </div>

        <div style="background: #faf5ff; padding: 16px; border-radius: 8px; border: 1px solid #e9d5ff; margin-bottom: 16px; font-size: 12px; line-height: 1.8;">
          <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #d8b4fe; padding-bottom: 6px; margin-bottom: 6px;">
            <span style="color: #6b21a8;">Receipt Reference:</span>
            <strong style="font-family: monospace; color: #3b0764;">${donation.receiptNumber}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #d8b4fe; padding-bottom: 6px; margin-bottom: 6px;">
            <span style="color: #6b21a8;">Donor Name:</span>
            <strong style="color: #0f172a;">${donation.donorName}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #d8b4fe; padding-bottom: 6px; margin-bottom: 6px;">
            <span style="color: #6b21a8;">Donor PAN:</span>
            <strong style="font-family: monospace; color: #0f172a;">${donation.donorPan || 'Not Specified'}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #d8b4fe; padding-bottom: 6px; margin-bottom: 6px;">
            <span style="color: #6b21a8;">Date of Donation:</span>
            <strong style="color: #0f172a;">${donation.donationDate}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #d8b4fe; padding-bottom: 6px; margin-bottom: 6px;">
            <span style="color: #6b21a8;">Mode of Transfer:</span>
            <strong style="color: #0f172a;">${donation.paymentMethod}</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #6b21a8;">Designated Sports Cause:</span>
            <strong style="color: #581c87;">${donation.cause}</strong>
          </div>
        </div>

        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <div style="font-weight: bold; color: #065f46; font-size: 13px;">Donation Amount:</div>
            <div style="font-size: 11px; color: #047857;">Eligible for 50% deduction under Sec 80G(5)(vi) of IT Act</div>
          </div>
          <span style="font-family: monospace; font-weight: bold; color: #047857; font-size: 22px;">₹${Number(donation.amount).toLocaleString('en-IN')}</span>
        </div>

        <p style="font-size: 11px; color: #64748b; font-style: italic; line-height: 1.6; margin-bottom: 24px;">
          "We certify that the above sum has been received as a voluntary contribution towards the sports youth welfare objectives of ${activeOrgName}. This certificate is valid for claiming tax exemption under Section 80G of the Income Tax Act, 1961."
        </p>

        <div style="display: flex; justify-content: space-between; align-items: flex-end; padding-top: 16px; border-top: 2px solid #e2e8f0;">
          <div style="width: 80px; height: 80px; border: 1px dashed #9333ea; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 9px; color: #7e22ce;">
            80G TAX<br/>SEAL
          </div>
          <div style="text-align: right;">
            <div style="height: 32px; font-family: serif; font-style: italic; color: #1e293b; font-size: 15px;">Secretary / Trustee</div>
            <div style="font-size: 11px; color: #64748b; border-top: 1px solid #94a3b8; padding-top: 4px;">Authorized Signatory</div>
          </div>
        </div>
      </div>
    `;

    try {
      const res = await printIsolatedHtml(html, `80G-${donation.receiptNumber}`);
      if (res.success) {
        triggerPrintFeedback(`System print window opened for 80G Certificate #${donation.receiptNumber}!`, 'success');
      } else {
        triggerPrintFeedback(`Browser restricted direct print. Use browser Ctrl+P or save certificate.`, 'info');
      }
    } catch (err) {
      console.warn('Print error', err);
      window.print();
    }
  };

  // Invoice Handlers
  const handleOpenEditInvoice = (inv: Invoice) => {
    setEditingInvoice(inv);
    setEditInvoiceForm({
      title: inv.title,
      category: inv.category,
      amount: inv.amount,
      dueDate: inv.dueDate,
      status: inv.status,
    });
  };

  const handleSaveEditInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvoice) return;
    setIsProcessingCrud(true);
    try {
      if (onUpdateInvoice) {
        await onUpdateInvoice(editingInvoice.id, editInvoiceForm);
      }
      setEditingInvoice(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingCrud(false);
    }
  };

  const handleConfirmDeleteInvoice = async () => {
    if (!deletingInvoice) return;
    setIsProcessingCrud(true);
    try {
      if (onDeleteInvoice) {
        await onDeleteInvoice(deletingInvoice.id);
      }
      setDeletingInvoice(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingCrud(false);
    }
  };

  // Payment Handlers
  const handleOpenEditPayment = (p: Payment) => {
    setEditingPayment(p);
    setEditPaymentForm({
      amount: p.amount,
      paymentMethod: p.paymentMethod,
      notes: p.notes,
    });
  };

  const handleSaveEditPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayment) return;
    setIsProcessingCrud(true);
    try {
      if (onUpdatePayment) {
        await onUpdatePayment(editingPayment.id, editPaymentForm);
      }
      setEditingPayment(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingCrud(false);
    }
  };

  const handleConfirmDeletePayment = async () => {
    if (!deletingPayment) return;
    setIsProcessingCrud(true);
    try {
      if (onDeletePayment) {
        await onDeletePayment(deletingPayment.id);
      }
      setDeletingPayment(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingCrud(false);
    }
  };

  // Expense Handlers
  const handleOpenEditExpense = (exp: Expense) => {
    setEditingExpense(exp);
    setEditExpenseForm({
      title: exp.title,
      category: exp.category,
      amount: exp.amount,
      paidTo: exp.paidTo,
      description: exp.description,
      expenseDate: exp.expenseDate,
    });
  };

  const handleSaveEditExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;
    setIsProcessingCrud(true);
    try {
      if (onUpdateExpense) {
        await onUpdateExpense(editingExpense.id, editExpenseForm);
      }
      setEditingExpense(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingCrud(false);
    }
  };

  const handleConfirmDeleteExpense = async () => {
    if (!deletingExpense) return;
    setIsProcessingCrud(true);
    try {
      if (onDeleteExpense) {
        await onDeleteExpense(deletingExpense.id);
      }
      setDeletingExpense(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingCrud(false);
    }
  };

  // Donation Handlers
  const handleOpenEditDonation = (don: Donation) => {
    setEditingDonation(don);
    setEditDonationForm({
      donorName: don.donorName,
      donorPan: don.donorPan,
      amount: don.amount,
      cause: don.cause,
      paymentMethod: don.paymentMethod,
    });
  };

  const handleSaveEditDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDonation) return;
    setIsProcessingCrud(true);
    try {
      if (onUpdateDonation) {
        await onUpdateDonation(editingDonation.id, editDonationForm);
      }
      setEditingDonation(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingCrud(false);
    }
  };

  const handleConfirmDeleteDonation = async () => {
    if (!deletingDonation) return;
    setIsProcessingCrud(true);
    try {
      if (onDeleteDonation) {
        await onDeleteDonation(deletingDonation.id);
      }
      setDeletingDonation(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingCrud(false);
    }
  };

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
      {/* Print Feedback Notification */}
      {printFeedback && (
        <div
          className={`p-3.5 rounded-2xl flex items-center justify-between text-xs shadow-xs border transition-all ${
            printFeedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : printFeedback.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-blue-50 text-blue-800 border-blue-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Printer className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{printFeedback.message}</span>
          </div>
          <button
            onClick={() => setPrintFeedback(null)}
            className="p-1 rounded-lg hover:bg-black/5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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
                              <span className="text-[11px] text-emerald-600 font-semibold inline-flex items-center space-x-1 mr-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Paid</span>
                              </span>
                            )}

                            {/* CRUD buttons for Invoices */}
                            <button
                              onClick={() => setViewingInvoice(inv)}
                              title="View Invoice Details"
                              className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEditInvoice(inv)}
                              title="Edit Invoice"
                              className="p-1 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingInvoice(inv)}
                              title="Delete Invoice"
                              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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
                      <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedPayment(p);
                            setIsReceiptModalOpen(true);
                          }}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-medium transition-colors"
                        >
                          <Eye className="w-3 h-3 text-slate-500" />
                          <span>Receipt</span>
                        </button>
                        <button
                          onClick={() => handlePrintOfficialReceipt(p)}
                          title="Print Official Stamped Receipt"
                          className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors inline-flex items-center"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEditPayment(p)}
                          title="Edit Payment Record"
                          className="p-1 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors inline-flex items-center"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingPayment(p)}
                          title="Delete Payment"
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors inline-flex items-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
                    <th className="py-3 px-4 text-right">Actions</th>
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
                        <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => setViewingExpense(e)}
                            title="View Expense Details"
                            className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditExpense(e)}
                            title="Edit Expense"
                            className="p-1 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingExpense(e)}
                            title="Delete Expense"
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-xs text-slate-400 italic">
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
                        <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setSelectedDonation(d);
                              setIsCert80GModalOpen(true);
                            }}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800 text-[11px] font-semibold transition-colors"
                          >
                            <Eye className="w-3 h-3 text-purple-600" />
                            <span>80G Certificate</span>
                          </button>
                          <button
                            onClick={() => handlePrintOfficial80GCert(d)}
                            title="Print 80G Tax Exemption Certificate"
                            className="p-1 rounded-md text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors inline-flex items-center"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditDonation(d)}
                            title="Edit Donation"
                            className="p-1 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors inline-flex items-center"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingDonation(d)}
                            title="Delete Donation"
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors inline-flex items-center"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-slate-600 font-medium">
                    Target: <span className="font-bold text-amber-700">{unpaidInvoices.length} members with unpaid dues</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedInvoice(unpaidInvoices[0] || invoices[0] || null);
                        setIsSingleReminderModalOpen(true);
                      }}
                      className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                    >
                      <MessageSquareText className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Single Reminder Model</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTriggerBroadcast()}
                      disabled={isBroadcasting || unpaidInvoices.length === 0}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isBroadcasting ? 'Broadcasting...' : `Send to All (${unpaidInvoices.length})`}</span>
                    </button>
                  </div>
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
                onClick={() => handlePrintOfficialReceipt(selectedPayment)}
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
                onClick={() => handlePrintOfficial80GCert(selectedDonation)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print 80G Exemption Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: Membership Fee Reminder WhatsApp Modal */}
      {isSingleReminderModalOpen && (
        <MembershipFeeReminderModal
          isOpen={isSingleReminderModalOpen}
          onClose={() => setIsSingleReminderModalOpen(false)}
          members={members}
          invoices={invoices}
          initialMemberId={selectedInvoice?.memberId}
          initialInvoiceId={selectedInvoice?.id}
          activeOrgName={activeOrgName}
          defaultUpiVpa={upiVpa}
          onSendApiReminder={async (params) => {
            const res = await handleTriggerBroadcast(params.invoiceIds?.[0] || selectedInvoice?.id);
            return res;
          }}
        />
      )}

      {/* MODAL: View Invoice Details */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900">Invoice Details</h3>
              </div>
              <button onClick={() => setViewingInvoice(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Invoice Number:</span>
                <span className="font-mono font-bold text-slate-900">{viewingInvoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Member:</span>
                <span className="font-semibold text-slate-900">{viewingInvoice.memberName || `Member #${viewingInvoice.memberId}`}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Fee Title:</span>
                <span className="font-medium text-slate-800">{viewingInvoice.title}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Category:</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">{viewingInvoice.category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Amount Due:</span>
                <span className="font-mono font-bold text-base text-blue-600">₹{viewingInvoice.amount}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Due Date:</span>
                <span className="text-slate-700">{viewingInvoice.dueDate}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Status:</span>
                <span className={`font-bold px-2 py-0.5 rounded uppercase text-[10px] ${
                  viewingInvoice.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {viewingInvoice.status}
                </span>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
              <button
                onClick={() => {
                  const inv = viewingInvoice;
                  setViewingInvoice(null);
                  handleOpenEditInvoice(inv);
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Edit Invoice
              </button>
              <button
                onClick={() => setViewingInvoice(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Edit Invoice */}
      {editingInvoice && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Edit Invoice ({editingInvoice.invoiceNumber})</h3>
              <button onClick={() => setEditingInvoice(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEditInvoice} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editInvoiceForm.title || ''}
                  onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    value={editInvoiceForm.amount || ''}
                    onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={editInvoiceForm.category || 'Membership Fee'}
                    onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Membership Fee">Membership Fee</option>
                    <option value="Coaching Pass">Coaching Pass</option>
                    <option value="Tournament Entry">Tournament Entry</option>
                    <option value="Facility Booking">Facility Booking</option>
                    <option value="Kit & Gear">Kit & Gear</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={editInvoiceForm.dueDate || ''}
                    onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={editInvoiceForm.status || 'due'}
                    onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="due">Due</option>
                    <option value="overdue">Overdue</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingInvoice(null)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingCrud}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                >
                  {isProcessingCrud ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Delete Invoice Confirmation */}
      {deletingInvoice && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-slate-900 text-sm">Delete Invoice?</h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete invoice <strong className="font-mono">{deletingInvoice.invoiceNumber}</strong> ({deletingInvoice.title}) for ₹{deletingInvoice.amount}? This action cannot be undone.
            </p>
            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => setDeletingInvoice(null)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteInvoice}
                disabled={isProcessingCrud}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
              >
                {isProcessingCrud ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Edit Payment */}
      {editingPayment && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Edit Payment ({editingPayment.receiptNumber})</h3>
              <button onClick={() => setEditingPayment(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEditPayment} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={editPaymentForm.amount || ''}
                  onChange={(e) => setEditPaymentForm({ ...editPaymentForm, amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Payment Method</label>
                <select
                  value={editPaymentForm.paymentMethod || 'UPI'}
                  onChange={(e) => setEditPaymentForm({ ...editPaymentForm, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="UPI">UPI / QR Code</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Debit / Credit Card</option>
                  <option value="Bank Transfer">NEFT / Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Notes / Transaction Reference</label>
                <input
                  type="text"
                  value={editPaymentForm.notes || ''}
                  onChange={(e) => setEditPaymentForm({ ...editPaymentForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="pt-4 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingPayment(null)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingCrud}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                >
                  {isProcessingCrud ? 'Saving...' : 'Save Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Delete Payment Confirmation */}
      {deletingPayment && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-slate-900 text-sm">Delete Payment Record?</h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete payment receipt <strong className="font-mono">{deletingPayment.receiptNumber}</strong> of ₹{deletingPayment.amount}?
            </p>
            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => setDeletingPayment(null)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeletePayment}
                disabled={isProcessingCrud}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
              >
                {isProcessingCrud ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: View Expense */}
      {viewingExpense && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <TrendingDown className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-slate-900">Expense Details</h3>
              </div>
              <button onClick={() => setViewingExpense(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Title:</span>
                <span className="font-bold text-slate-900">{viewingExpense.title}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Category:</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">{viewingExpense.category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Paid To:</span>
                <span className="font-semibold text-slate-800">{viewingExpense.paidTo || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Amount:</span>
                <span className="font-mono font-bold text-base text-rose-600">₹{viewingExpense.amount}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Date:</span>
                <span className="text-slate-700">{viewingExpense.expenseDate}</span>
              </div>
              <div className="py-1">
                <span className="text-slate-500 block mb-1">Description:</span>
                <p className="bg-slate-50 p-2 rounded text-slate-700">{viewingExpense.description || 'No additional notes provided.'}</p>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
              <button
                onClick={() => {
                  const exp = viewingExpense;
                  setViewingExpense(null);
                  handleOpenEditExpense(exp);
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Edit Expense
              </button>
              <button
                onClick={() => setViewingExpense(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Edit Expense */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Edit Expense</h3>
              <button onClick={() => setEditingExpense(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEditExpense} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Expense Title</label>
                <input
                  type="text"
                  value={editExpenseForm.title || ''}
                  onChange={(e) => setEditExpenseForm({ ...editExpenseForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    value={editExpenseForm.amount || ''}
                    onChange={(e) => setEditExpenseForm({ ...editExpenseForm, amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={editExpenseForm.category || 'Equipment'}
                    onChange={(e) => setEditExpenseForm({ ...editExpenseForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Equipment">Equipment</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Coach Salary">Coach Salary</option>
                    <option value="Utilities">Utilities & Rent</option>
                    <option value="Refreshments">Refreshments</option>
                    <option value="Event Ops">Event Ops</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Paid To (Vendor)</label>
                  <input
                    type="text"
                    value={editExpenseForm.paidTo || ''}
                    onChange={(e) => setEditExpenseForm({ ...editExpenseForm, paidTo: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={editExpenseForm.expenseDate || ''}
                    onChange={(e) => setEditExpenseForm({ ...editExpenseForm, expenseDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editExpenseForm.description || ''}
                  onChange={(e) => setEditExpenseForm({ ...editExpenseForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="pt-4 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingCrud}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                >
                  {isProcessingCrud ? 'Saving...' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Delete Expense Confirmation */}
      {deletingExpense && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-slate-900 text-sm">Delete Expense?</h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete <strong className="font-semibold">{deletingExpense.title}</strong> of ₹{deletingExpense.amount}?
            </p>
            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => setDeletingExpense(null)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteExpense}
                disabled={isProcessingCrud}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
              >
                {isProcessingCrud ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Edit Donation */}
      {editingDonation && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Edit Donation ({editingDonation.receiptNumber})</h3>
              <button onClick={() => setEditingDonation(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEditDonation} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Donor Name</label>
                <input
                  type="text"
                  value={editDonationForm.donorName || ''}
                  onChange={(e) => setEditDonationForm({ ...editDonationForm, donorName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    value={editDonationForm.amount || ''}
                    onChange={(e) => setEditDonationForm({ ...editDonationForm, amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Donor PAN</label>
                  <input
                    type="text"
                    value={editDonationForm.donorPan || ''}
                    onChange={(e) => setEditDonationForm({ ...editDonationForm, donorPan: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Cause / Project</label>
                  <input
                    type="text"
                    value={editDonationForm.cause || ''}
                    onChange={(e) => setEditDonationForm({ ...editDonationForm, cause: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={editDonationForm.paymentMethod || 'UPI'}
                    onChange={(e) => setEditDonationForm({ ...editDonationForm, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer / NEFT</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingDonation(null)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingCrud}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold"
                >
                  {isProcessingCrud ? 'Saving...' : 'Save Donation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Delete Donation Confirmation */}
      {deletingDonation && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-slate-900 text-sm">Delete Donation?</h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete donation record <strong className="font-mono">{deletingDonation.receiptNumber}</strong> from <strong>{deletingDonation.donorName}</strong> of ₹{deletingDonation.amount}?
            </p>
            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => setDeletingDonation(null)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteDonation}
                disabled={isProcessingCrud}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
              >
                {isProcessingCrud ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
