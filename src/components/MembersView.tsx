import React, { useState } from 'react';
import { Member, Sport, Branch } from '../types.ts';
import {
  UserPlus,
  Search,
  Phone,
  MessageCircle,
  QrCode,
  Shield,
  X,
  Plus,
  Mail,
  Check,
  Award,
} from 'lucide-react';

interface MembersViewProps {
  members: Member[];
  sports: Sport[];
  branches: Branch[];
  onAddMember: (memberData: any) => Promise<void>;
  currency?: string;
}

export const MembersView: React.FC<MembersViewProps> = ({
  members,
  sports,
  branches,
  onAddMember,
  currency = 'INR',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSportFilter, setSelectedSportFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMemberForCard, setSelectedMemberForCard] = useState<Member | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '2008-05-15',
    gender: 'Male',
    bloodGroup: 'B+',
    mobile: '+91 98300 12345',
    whatsapp: '+91 98300 12345',
    email: '',
    address: 'Central Kolkata',
    city: 'Kolkata',
    guardianName: '',
    guardianRelation: 'Father',
    guardianPhone: '',
    selectedSportIds: [] as number[],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter members
  const filtered = members.filter((m) => {
    const matchesSearch =
      m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.memberCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.mobile.includes(searchTerm);

    if (selectedSportFilter === 'all') return matchesSearch;
    const hasSport = m.sports?.some((s) => String(s.sportId) === selectedSportFilter);
    return matchesSearch && hasSport;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.mobile) return;
    setIsSubmitting(true);
    try {
      await onAddMember({
        ...formData,
        sportsList: formData.selectedSportIds.map((sId) => ({
          sportId: sId,
          skillLevel: 'Intermediate',
          position: 'Player',
        })),
      });
      setIsAddModalOpen(false);
      // Reset form
      setFormData({
        fullName: '',
        dob: '2008-05-15',
        gender: 'Male',
        bloodGroup: 'B+',
        mobile: '',
        whatsapp: '',
        email: '',
        address: '',
        city: 'Kolkata',
        guardianName: '',
        guardianRelation: 'Father',
        guardianPhone: '',
        selectedSportIds: [],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSportSelect = (sportId: number) => {
    setFormData((prev) => {
      const exists = prev.selectedSportIds.includes(sportId);
      return {
        ...prev,
        selectedSportIds: exists
          ? prev.selectedSportIds.filter((id) => id !== sportId)
          : [...prev.selectedSportIds, sportId],
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Members & Players Roster</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Single person representation across multi-sport disciplines with guardian credentials and WhatsApp opt-in.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Member</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, member code (e.g. M-000001), or mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 whitespace-nowrap">Sport Filter:</span>
          <select
            value={selectedSportFilter}
            onChange={(e) => setSelectedSportFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Sports ({members.length})</option>
            {sports.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Members Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={member.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={member.fullName}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">{member.fullName}</h3>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                        {member.memberCode}
                      </span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium capitalize">
                        {member.status}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedMemberForCard(member)}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                  title="View Digital ID Card & QR"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              </div>

              {/* Multi-sport tags */}
              <div className="mt-3">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Sport Specializations
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {member.sports && member.sports.length > 0 ? (
                    member.sports.map((sp) => (
                      <span
                        key={sp.sportId}
                        className="text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-md flex items-center space-x-1"
                      >
                        <span>{sp.sportName}</span>
                        {sp.position && <span className="text-blue-400">({sp.position})</span>}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">General Membership</span>
                  )}
                </div>
              </div>

              {/* Contact info */}
              <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-1 text-slate-500">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{member.mobile}</span>
                  </span>
                  {member.whatsappOptIn && (
                    <span className="flex items-center space-x-1 text-emerald-600 text-[11px] font-medium">
                      <MessageCircle className="w-3 h-3" />
                      <span>WhatsApp Active</span>
                    </span>
                  )}
                </div>
                {member.guardianName && (
                  <div className="text-[11px] text-slate-500">
                    <span className="text-slate-400">Guardian:</span> {member.guardianName} ({member.guardianRelation || 'Parent'}) • {member.guardianPhone}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Joined: {member.joiningDate}</span>
              <button
                onClick={() => setSelectedMemberForCard(member)}
                className="text-blue-600 font-semibold hover:underline flex items-center space-x-1"
              >
                <span>Digital Pass</span>
                <span>→</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500 text-sm">No members found matching your search filter.</p>
        </div>
      )}

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Register New Member / Player</h3>
                <p className="text-xs text-slate-500">Single person registration across multi-sport disciplines.</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value, whatsapp: e.target.value })}
                    placeholder="+91 98300 12345"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="aarav@example.com"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              {/* Guardian Info for Youth / Minors */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5">
                <div className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                  <span>Guardian / Emergency Contact (Youth Safeguard)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Guardian Name"
                    value={formData.guardianName}
                    onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Relation (e.g. Mother)"
                    value={formData.guardianRelation}
                    onChange={(e) => setFormData({ ...formData, guardianRelation: e.target.value })}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Guardian Phone"
                    value={formData.guardianPhone}
                    onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                </div>
              </div>

              {/* Sports Specialization Multi-Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Sport Specializations (Single person can participate in multiple!)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50">
                  {sports.map((sp) => {
                    const isSelected = formData.selectedSportIds.includes(sp.id);
                    return (
                      <div
                        key={sp.id}
                        onClick={() => toggleSportSelect(sp.id)}
                        className={`p-2 rounded-lg border text-xs font-medium cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span>{sp.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering...' : 'Register Member & Generate ID'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Digital Member Card Modal */}
      {selectedMemberForCard && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 relative">
              <button
                onClick={() => setSelectedMemberForCard(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="text-[11px] text-blue-400 font-mono uppercase tracking-widest font-semibold">
                Official Digital Member Pass
              </div>
              <div className="text-lg font-bold text-white mt-1">{selectedMemberForCard.fullName}</div>
              <div className="text-xs text-slate-300 font-mono mt-0.5">ID: {selectedMemberForCard.memberCode}</div>
            </div>

            <div className="p-6 text-center space-y-4">
              <div className="w-24 h-24 mx-auto rounded-xl overflow-hidden border-2 border-slate-200 shadow-xs">
                <img
                  src={selectedMemberForCard.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={selectedMemberForCard.fullName}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* QR Code representation */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 inline-block">
                <div className="w-28 h-28 bg-white p-2 border border-slate-300 rounded-lg flex items-center justify-center font-mono text-[9px] text-slate-600 break-all text-center">
                  <div className="space-y-1">
                    <QrCode className="w-12 h-12 text-slate-900 mx-auto" />
                    <div>{selectedMemberForCard.memberCode}</div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 mt-1 font-medium">Scan for verification & entry</div>
              </div>

              <div className="text-left space-y-1.5 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">Contact:</span>
                  <span className="font-semibold text-slate-800">{selectedMemberForCard.mobile}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Blood Group:</span>
                  <span className="font-semibold text-slate-800">{selectedMemberForCard.bloodGroup || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Valid Until:</span>
                  <span className="font-semibold text-slate-800">{selectedMemberForCard.expiryDate || '2027-01-01'}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedMemberForCard(null)}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
              >
                Close Pass
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
