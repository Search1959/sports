import React, { useState } from 'react';
import { Organization, Branch } from '../types.ts';
import {
  Building,
  Save,
  CheckCircle2,
  Shield,
  Layers,
  Globe,
  Plus,
  X,
  Lock,
} from 'lucide-react';

interface SettingsViewProps {
  activeOrg: Organization;
  branches: Branch[];
  onUpdateOrg: (data: Partial<Organization>) => Promise<void>;
  onCreateBranch: (data: any) => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  activeOrg,
  branches,
  onUpdateOrg,
  onCreateBranch,
}) => {
  const [form, setForm] = useState({
    name: activeOrg.name,
    type: activeOrg.type,
    city: activeOrg.city,
    country: activeOrg.country || 'India',
    address: activeOrg.address || '',
    phone: activeOrg.phone || '',
    email: activeOrg.email || '',
    establishedYear: activeOrg.establishedYear || 1948,
    currency: activeOrg.currency || 'INR',
    timezone: activeOrg.timezone || 'Asia/Kolkata',
    coverImage: activeOrg.coverImage || '',
    description: activeOrg.description || '',
  });

  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [branchForm, setBranchForm] = useState({
    name: '',
    code: '',
    address: '',
    city: activeOrg.city,
    phone: '',
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmitOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      await onUpdateOrg(form);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateBranchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchForm.name) return;
    try {
      await onCreateBranch(branchForm);
      setIsBranchModalOpen(false);
      setBranchForm({ name: '', code: '', address: '', city: activeOrg.city, phone: '' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Organization Settings & Multi-Branch</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure tenant branding, currency, timezones, physical branches, and role permissions.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsBranchModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Branch</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Organization Details Form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center space-x-2">
              <Building className="w-4 h-4 text-blue-600" />
              <span>Tenant Identity & Localization</span>
            </h3>

            {savedSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Organization profile updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSubmitOrg} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Organization Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Organization Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Sports Club">Sports Club</option>
                    <option value="Youth Organization">Youth Organization</option>
                    <option value="Community Organization">Community Organization</option>
                    <option value="Sports Academy">Sports Academy</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Est. Year</label>
                  <input
                    type="number"
                    value={form.establishedYear}
                    onChange={(e) => setForm({ ...form, establishedYear: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Official Phone</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Base Currency</label>
                  <select
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="INR">INR (₹ - Indian Rupee)</option>
                    <option value="USD">USD ($ - US Dollar)</option>
                    <option value="EUR">EUR (€ - Euro)</option>
                    <option value="GBP">GBP (£ - British Pound)</option>
                    <option value="SGD">SGD (S$ - Singapore Dollar)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Timezone</label>
                  <input
                    type="text"
                    value={form.timezone}
                    onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Public Description & Legacy</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cover Image URL</label>
                <input
                  type="text"
                  value={form.coverImage}
                  onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 font-mono text-slate-600"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right 1 col: Branches & Security RBAC overview */}
        <div className="space-y-4">
          {/* Multi-Branch Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Physical Branches ({branches.length})</span>
              </h3>
              <button
                onClick={() => setIsBranchModalOpen(true)}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                + Add
              </button>
            </div>

            <div className="space-y-2">
              {branches.map((b) => (
                <div key={b.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>{b.name}</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">
                      {b.code}
                    </span>
                  </div>
                  <div className="text-slate-500 mt-1">{b.address}, {b.city}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RBAC Security Info Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center space-x-1.5">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Tenant RBAC Matrix</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-2 rounded bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-800">Super Admin / Owner</span>
                <span className="text-[10px] text-emerald-600 font-semibold">Full Control</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-800">Coach / Trainer</span>
                <span className="text-[10px] text-blue-600 font-semibold">Attendance & Drills</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-800">Match Scorer</span>
                <span className="text-[10px] text-amber-600 font-semibold">Live Fixtures</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-800">Receptionist / Desk</span>
                <span className="text-[10px] text-purple-600 font-semibold">Invoicing & Leads</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Branch Modal */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Add Physical Branch</h3>
                <p className="text-xs text-slate-500">Configure secondary court or regional facility</p>
              </div>
              <button
                onClick={() => setIsBranchModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBranchSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Branch Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. South Kolkata Arena"
                  value={branchForm.name}
                  onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Branch Code</label>
                  <input
                    type="text"
                    required
                    placeholder="SKA-01"
                    value={branchForm.code}
                    onChange={(e) => setBranchForm({ ...branchForm, code: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={branchForm.city}
                    onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={branchForm.address}
                  onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsBranchModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs"
                >
                  Save Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
