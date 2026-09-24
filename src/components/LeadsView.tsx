import React, { useState } from 'react';
import { Lead } from '../types.ts';
import {
  UserCheck,
  Phone,
  Mail,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Filter,
  Plus,
  Eye,
  Edit2,
  Trash2,
  AlertTriangle,
  X,
  FileText,
} from 'lucide-react';

interface LeadsViewProps {
  leads: Lead[];
  onConvertLead: (leadId: number) => Promise<void>;
  onAddLead?: (data: any) => Promise<void>;
  onUpdateLead?: (id: number, data: any) => Promise<void>;
  onDeleteLead?: (id: number) => Promise<void>;
}

export const LeadsView: React.FC<LeadsViewProps> = ({
  leads = [],
  onConvertLead,
  onAddLead,
  onUpdateLead,
  onDeleteLead,
}) => {
  const safeLeads = Array.isArray(leads) ? leads : [];
  const [convertingId, setConvertingId] = useState<number | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingCrud, setIsProcessingCrud] = useState(false);

  // CRUD State
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null);
  const [editForm, setEditForm] = useState<Partial<Lead>>({});

  // Add Lead Form
  const [addForm, setAddForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    age: '',
    interestedSport: 'Badminton',
    interestedProgram: 'Junior Development Camp',
    source: 'Walk-in / Offline Ingestion',
    notes: '',
  });

  const handleConvert = async (leadId: number) => {
    setConvertingId(leadId);
    try {
      await onConvertLead(leadId);
    } catch (err) {
      console.error(err);
    } finally {
      setConvertingId(null);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.fullName || !addForm.phone) return;
    setIsSubmitting(true);
    try {
      if (onAddLead) {
        await onAddLead({
          ...addForm,
          age: addForm.age ? Number(addForm.age) : undefined,
          status: 'new_inquiry',
        });
      }
      setIsAddOpen(false);
      setAddForm({
        fullName: '',
        phone: '',
        email: '',
        age: '',
        interestedSport: 'Badminton',
        interestedProgram: 'Junior Development Camp',
        source: 'Walk-in / Offline Ingestion',
        notes: '',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (lead: Lead) => {
    setEditingLead(lead);
    setEditForm({
      fullName: lead.fullName,
      phone: lead.phone,
      email: lead.email,
      age: lead.age,
      interestedSport: lead.interestedSport,
      interestedProgram: lead.interestedProgram,
      source: lead.source,
      notes: lead.notes,
      status: lead.status,
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;
    setIsProcessingCrud(true);
    try {
      if (onUpdateLead) {
        await onUpdateLead(editingLead.id, editForm);
      }
      setEditingLead(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingCrud(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingLead) return;
    setIsProcessingCrud(true);
    try {
      if (onDeleteLead) {
        await onDeleteLead(deletingLead.id);
      }
      setDeletingLead(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingCrud(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">CRM Membership & Sports Applications</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Incoming inquiries from public website, walk-ins, and trials. One-click conversion to active registered member.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Inquiry / Lead</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100">
        {safeLeads.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No public inquiries yet. Submit an application via the Public Website tab or click "Add Inquiry / Lead" to record one!
          </div>
        ) : (
          safeLeads.map((lead) => {
            const isConverted = lead.status === 'converted';
            return (
              <div
                key={lead.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-slate-900 text-sm">{lead.fullName}</h3>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${
                        isConverted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {lead.status.replace('_', ' ')}
                    </span>
                    {lead.age && (
                      <span className="text-[10px] text-slate-500 font-mono">Age: {lead.age}</span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1.5">
                    <span className="flex items-center space-x-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lead.phone}</span>
                    </span>
                    {lead.email && (
                      <span className="flex items-center space-x-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{lead.email}</span>
                      </span>
                    )}
                    <span className="text-slate-400">• Source: {lead.source || 'Website Application'}</span>
                  </div>

                  <div className="mt-2.5 flex items-center space-x-2 text-xs flex-wrap gap-y-1">
                    <span className="font-semibold text-slate-700">Interested In:</span>
                    <span className="bg-slate-100 text-slate-800 font-medium px-2.5 py-0.5 rounded-md">
                      {lead.interestedSport || lead.interestedProgram || 'General Membership'}
                    </span>
                    {lead.notes && <span className="text-slate-400 italic">"{lead.notes}"</span>}
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-start md:self-auto shrink-0">
                  {/* View / Edit / Delete Action Buttons */}
                  <button
                    onClick={() => setViewingLead(lead)}
                    title="View Application Details"
                    className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(lead)}
                    title="Edit Inquiry"
                    className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingLead(lead)}
                    title="Delete Inquiry"
                    className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Conversion Status / Action */}
                  {isConverted ? (
                    <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Converted to Member</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleConvert(lead.id)}
                      disabled={convertingId === lead.id}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>{convertingId === lead.id ? 'Converting...' : 'Approve Member'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ADD LEAD MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">New Inbound Inquiry / Lead</h3>
                <p className="text-xs text-slate-500">Record a phone, walk-in, or referral inquiry</p>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Applicant Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Siddharth Verma"
                  value={addForm.fullName}
                  onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    placeholder="e.g. 14"
                    value={addForm.age}
                    onChange={(e) => setAddForm({ ...addForm, age: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="applicant@example.com"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Interested Sport</label>
                  <input
                    type="text"
                    placeholder="e.g. Badminton, Football"
                    value={addForm.interestedSport}
                    onChange={(e) => setAddForm({ ...addForm, interestedSport: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Inquiry Source</label>
                  <select
                    value={addForm.source}
                    onChange={(e) => setAddForm({ ...addForm, source: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Walk-in / Offline Ingestion">Walk-in</option>
                    <option value="Phone Inquiry">Phone Inquiry</option>
                    <option value="Trial Session">Trial Session</option>
                    <option value="School Outreach">School Outreach</option>
                    <option value="Website Application">Website</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Special Requests</label>
                <textarea
                  rows={2}
                  placeholder="Left contact for summer tournament camp..."
                  value={addForm.notes}
                  onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-xs"
                >
                  {isSubmitting ? 'Saving...' : 'Save Inquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW LEAD MODAL */}
      {viewingLead && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">{viewingLead.fullName}</h3>
              </div>
              <button onClick={() => setViewingLead(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Status:</span>
                <span className="font-semibold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                  {viewingLead.status.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Phone:</span>
                <span className="font-mono font-bold text-slate-900">{viewingLead.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Email:</span>
                <span className="text-slate-800">{viewingLead.email || 'Not provided'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Age:</span>
                <span className="text-slate-800 font-medium">{viewingLead.age ? `${viewingLead.age} years` : 'Not specified'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Interested Sport:</span>
                <span className="font-bold text-blue-600">{viewingLead.interestedSport || 'General'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Source:</span>
                <span className="text-slate-700">{viewingLead.source || 'Website'}</span>
              </div>
              {viewingLead.notes && (
                <div className="py-1">
                  <span className="text-slate-500 block mb-1">Notes:</span>
                  <p className="bg-slate-50 p-2.5 rounded-lg text-slate-700">{viewingLead.notes}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
              <button
                onClick={() => {
                  const l = viewingLead;
                  setViewingLead(null);
                  handleOpenEdit(l);
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Edit Inquiry
              </button>
              <button
                onClick={() => setViewingLead(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT LEAD MODAL */}
      {editingLead && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Edit Application / Inquiry</h3>
              <button onClick={() => setEditingLead(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editForm.fullName || ''}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={editForm.age || ''}
                    onChange={(e) => setEditForm({ ...editForm, age: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Interested Sport</label>
                  <input
                    type="text"
                    value={editForm.interestedSport || ''}
                    onChange={(e) => setEditForm({ ...editForm, interestedSport: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={editForm.status || 'new_inquiry'}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="new_inquiry">New Inquiry</option>
                    <option value="contacted">Contacted</option>
                    <option value="trial_scheduled">Trial Scheduled</option>
                    <option value="converted">Converted</option>
                    <option value="closed">Closed / Dropped</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={editForm.notes || ''}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>
              <div className="pt-4 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingLead(null)}
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

      {/* DELETE LEAD MODAL */}
      {deletingLead && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-slate-900 text-sm">Delete Inquiry?</h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete inquiry from <strong>{deletingLead.fullName}</strong>?
            </p>
            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => setDeletingLead(null)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
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
