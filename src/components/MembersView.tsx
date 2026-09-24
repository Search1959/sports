import React, { useState } from 'react';
import { Member, Sport, Branch, Invoice, Organization } from '../types.ts';
import { MembershipFeeReminderModal } from './MembershipFeeReminderModal.tsx';
import { MembershipCardModal } from './MembershipCardModal.tsx';
import { SportsCertificateModal } from './SportsCertificateModal.tsx';
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
  Users,
  Calendar,
  Filter,
  RefreshCw,
  ExternalLink,
  DollarSign,
  CreditCard,
  Eye,
  Edit2,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

interface MembersViewProps {
  members?: Member[];
  sports?: Sport[];
  branches?: Branch[];
  programs?: any[];
  invoices?: Invoice[];
  organizationName?: string;
  activeOrg?: Organization;
  onAddMember: (memberData: any) => Promise<void>;
  onUpdateMember?: (id: number, memberData: any) => Promise<void>;
  onDeleteMember?: (id: number) => Promise<void>;
  onSendFeeReminder?: (params: any) => Promise<any>;
  onGenerateCertificate?: (certData: any) => Promise<void>;
  currency?: string;
}

// Resilient helper getters for athletes
export const getAthleteName = (m: any): string => {
  if (!m) return 'Athlete';
  if (m.fullName && typeof m.fullName === 'string' && m.fullName.trim()) return m.fullName.trim();
  const combined = `${m.firstName || ''} ${m.lastName || ''}`.trim();
  if (combined) return combined;
  return `Athlete #${m.id || '1'}`;
};

export const getAthleteCode = (m: any): string => {
  if (!m) return 'M-000001';
  return m.memberCode || m.memberNumber || `M-${String(m.id || 1).padStart(6, '0')}`;
};

export const getAthleteMobile = (m: any): string => {
  if (!m) return '';
  return m.mobile || m.phone || '';
};

export const getAthleteSports = (m: any) => {
  if (!m) return [];
  if (Array.isArray(m.sports) && m.sports.length > 0) return m.sports;
  if (m.sportName) {
    return [{ sportId: 1, sportName: m.sportName, skillLevel: 'Intermediate', position: m.position || 'Player' }];
  }
  return [];
};

export const MembersView: React.FC<MembersViewProps> = ({
  members = [],
  sports = [],
  branches = [],
  programs = [],
  invoices = [],
  organizationName = 'Sports Club',
  activeOrg,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  onSendFeeReminder,
  onGenerateCertificate,
  currency = 'INR',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSportFilter, setSelectedSportFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMemberForCard, setSelectedMemberForCard] = useState<Member | null>(null);
  const [selectedMemberForFeeReminder, setSelectedMemberForFeeReminder] = useState<Member | null>(null);
  const [isFeeReminderModalOpen, setIsFeeReminderModalOpen] = useState(false);
  const [selectedMemberForCardId, setSelectedMemberForCardId] = useState<number | undefined>(undefined);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [selectedMemberForCertId, setSelectedMemberForCertId] = useState<number | undefined>(undefined);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  // View, Edit, Delete States
  const [viewingMember, setViewingMember] = useState<Member | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenEdit = (m: Member) => {
    setEditingMember(m);
    setEditFormData({
      fullName: getAthleteName(m),
      dob: m.dob ? new Date(m.dob).toISOString().split('T')[0] : '2008-05-15',
      gender: m.gender || 'Male',
      bloodGroup: m.bloodGroup || 'B+',
      mobile: getAthleteMobile(m) || '',
      whatsapp: m.whatsapp || getAthleteMobile(m) || '',
      email: m.email || '',
      address: m.address || '',
      city: m.city || 'Kolkata',
      guardianName: m.guardianName || '',
      guardianRelation: m.guardianRelation || (m as any).guardianRelationship || 'Parent',
      guardianPhone: m.guardianPhone || '',
      status: m.status || 'Active',
      photoUrl: m.photoUrl || '',
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setIsSavingEdit(true);
    try {
      if (onUpdateMember) {
        await onUpdateMember(editingMember.id, editFormData);
      }
      setEditingMember(null);
    } catch (err) {
      console.error('Failed to update member:', err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingMember) return;
    setIsDeleting(true);
    try {
      if (onDeleteMember) {
        await onDeleteMember(deletingMember.id);
      }
      setDeletingMember(null);
    } catch (err) {
      console.error('Failed to delete member:', err);
    } finally {
      setIsDeleting(false);
    }
  };

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

  // Safe data wrappers
  const safeMembers = Array.isArray(members) ? members : [];
  const safeSports = Array.isArray(sports) ? sports : [];

  // Filter members safely
  const filtered = safeMembers.filter((m) => {
    if (!m) return false;
    const name = getAthleteName(m);
    const code = getAthleteCode(m);
    const mobile = getAthleteMobile(m);
    const q = (searchTerm || '').toLowerCase().trim();

    const matchesSearch =
      !q ||
      name.toLowerCase().includes(q) ||
      code.toLowerCase().includes(q) ||
      mobile.includes(q);

    if (selectedSportFilter === 'all') return matchesSearch;
    const sportsList = getAthleteSports(m);
    const hasSport = sportsList.some((s: any) => String(s.sportId) === selectedSportFilter);
    return matchesSearch && Boolean(hasSport);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.mobile.trim()) return;
    setIsSubmitting(true);
    try {
      await onAddMember({
        ...formData,
        sportsList: formData.selectedSportIds.map((sId) => {
          const matchedSport = safeSports.find((s) => s.id === sId);
          return {
            sportId: sId,
            sportName: matchedSport?.name || 'Sport',
            skillLevel: 'Intermediate',
            position: 'Player',
          };
        }),
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
      console.error('Error adding member:', err);
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
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900">Athletes & Members Roster</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {safeMembers.length} Registered
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Single person athlete profile across disciplines, digital ID pass, emergency contacts & WhatsApp notification.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setSelectedMemberForCardId(safeMembers[0]?.id);
              setIsCardModalOpen(true);
            }}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors min-h-[40px]"
          >
            <CreditCard className="w-4 h-4 text-amber-400" />
            <span>ID Card Studio</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedMemberForCertId(safeMembers[0]?.id);
              setIsCertModalOpen(true);
            }}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs transition-colors min-h-[40px]"
          >
            <Award className="w-4 h-4 text-white" />
            <span>Issue Certificate</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-colors min-h-[40px]"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Athlete</span>
          </button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, member code (e.g. M-000001), or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-500 whitespace-nowrap font-medium">Sport:</span>
          <select
            value={selectedSportFilter}
            onChange={(e) => setSelectedSportFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden w-full sm:w-auto"
          >
            <option value="all">All Disciplines ({safeMembers.length})</option>
            {safeSports.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Empty State: No Members at All */}
      {safeMembers.length === 0 && (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100 shadow-inner">
            <Users className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">No Athletes Registered Yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              Start building your academy roster. Register players to track daily attendance, bill seasonal fees, issue digital player ID cards, and send WhatsApp notifications.
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Register First Athlete</span>
          </button>
        </div>
      )}

      {/* Filtered Empty State (Search gave 0 results) */}
      {safeMembers.length > 0 && filtered.length === 0 && (
        <div className="text-center py-12 px-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <Search className="w-8 h-8 text-slate-300 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800">No Athletes Found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No member matched "{searchTerm || selectedSportFilter}". Try modifying your search term or clearing the sport filter.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedSportFilter('all');
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Members Grid / Cards */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((member) => {
            const fullName = getAthleteName(member);
            const memberCode = getAthleteCode(member);
            const mobile = getAthleteMobile(member);
            const athleteSports = getAthleteSports(member);
            const joinDate = member.joiningDate || (member as any).joinDate || '2026-01-01';
            const expiryDate = member.expiryDate || (member as any).validUntil || '2027-01-01';
            const initials = fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'AT';

            return (
              <div
                key={member.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Avatar & Member Code */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 border border-slate-200">
                        {member.photoUrl ? (
                          <img
                            src={member.photoUrl}
                            alt={fullName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // If image fails, fallback to initials
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-sm">{initials}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 leading-tight truncate">
                          {fullName}
                        </h3>
                        <div className="flex items-center space-x-1.5 mt-1 flex-wrap gap-y-1">
                          <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200/60">
                            {memberCode}
                          </span>
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium border border-emerald-200/60 capitalize">
                            {member.status || 'Active'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => setViewingMember(member)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                        title="View Complete Athlete Profile"
                        aria-label="View Full Athlete Profile"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(member)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 text-slate-500 transition-colors"
                        title="Edit Athlete Details"
                        aria-label="Edit Athlete Profile"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setSelectedMemberForCard(member)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 text-slate-500 transition-colors"
                        title="View Digital ID Card & QR Pass"
                        aria-label="View Digital ID Card"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingMember(member)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-slate-400 transition-colors"
                        title="Delete Athlete Record"
                        aria-label="Delete Athlete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Multi-sport tags */}
                  <div className="mt-3.5">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Sports & Disciplines
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {athleteSports.length > 0 ? (
                        athleteSports.map((sp: any, idx: number) => (
                          <span
                            key={sp.sportId || idx}
                            className="text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-lg flex items-center space-x-1"
                          >
                            <span>{sp.sportName}</span>
                            {sp.position && <span className="text-blue-400 font-normal">({sp.position})</span>}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">General Membership</span>
                      )}
                    </div>
                  </div>

                  {/* Contact info */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <a
                        href={`tel:${mobile}`}
                        className="flex items-center space-x-1 text-slate-600 hover:text-blue-600 transition-colors"
                      >
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span className="font-mono text-[11px]">{mobile || 'No phone'}</span>
                      </a>
                      {mobile && (
                        <div className="flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedMemberForFeeReminder(member);
                              setIsFeeReminderModalOpen(true);
                            }}
                            title="Send Membership Fee Reminder Model via WhatsApp"
                            className="flex items-center space-x-1 text-amber-700 hover:text-amber-800 text-[10px] font-semibold bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200 transition-colors"
                          >
                            <DollarSign className="w-3 h-3 text-amber-600" />
                            <span>Fee Due</span>
                          </button>
                          <a
                            href={`https://wa.me/${mobile.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center space-x-1 text-emerald-600 hover:text-emerald-700 text-[11px] font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      )}
                    </div>

                    {member.guardianName && (
                      <div className="text-[11px] text-slate-500 pt-0.5 flex items-center space-x-1">
                        <Shield className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">
                          Guardian: <strong className="text-slate-700 font-semibold">{member.guardianName}</strong>
                          {member.guardianPhone ? ` (${member.guardianPhone})` : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer: Join date & ID Card / Certificate actions */}
                <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Joined: {joinDate}</span>
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => {
                        setSelectedMemberForCardId(member.id);
                        setIsCardModalOpen(true);
                      }}
                      className="text-amber-700 font-bold hover:text-amber-800 flex items-center space-x-1 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200 transition-colors"
                      title="Issue official CR80 plastic membership card"
                    >
                      <CreditCard className="w-3 h-3 text-amber-600" />
                      <span>ID Card</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedMemberForCertId(member.id);
                        setIsCertModalOpen(true);
                      }}
                      className="text-blue-700 font-bold hover:text-blue-800 flex items-center space-x-1 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200 transition-colors"
                      title="Issue authenticated sports certificate"
                    >
                      <Award className="w-3 h-3 text-blue-600" />
                      <span>Certificate</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Register New Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Register New Athlete / Member</h3>
                <p className="text-xs text-slate-500">Enrolls single athlete with multi-sport eligibility & parent info.</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"
                aria-label="Close"
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
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 bg-white"
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
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value, whatsapp: e.target.value })}
                    placeholder="+91 98300 12345"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="athlete@example.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {/* Guardian Info for Youth / Minors */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                  <span>Guardian / Emergency Contact</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Guardian Name"
                    value={formData.guardianName}
                    onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                    className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Relation (e.g. Father)"
                    value={formData.guardianRelation}
                    onChange={(e) => setFormData({ ...formData, guardianRelation: e.target.value })}
                    className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Guardian Phone"
                    value={formData.guardianPhone}
                    onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                    className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              {/* Sports Specialization Multi-Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Sport Disciplines (Single athlete can join multiple)
                </label>
                {safeSports.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-2 border border-slate-200 rounded-2xl bg-slate-50">
                    {safeSports.map((sp) => {
                      const isSelected = formData.selectedSportIds.includes(sp.id);
                      return (
                        <div
                          key={sp.id}
                          onClick={() => toggleSportSelect(sp.id)}
                          className={`p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <span className="truncate">{sp.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No sports created yet. You can add them under Sports menu.</p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs disabled:opacity-50 min-h-[40px]"
                >
                  {isSubmitting ? 'Registering...' : 'Register Athlete & Generate ID'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Digital Member Card Modal */}
      {selectedMemberForCard && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white p-5 relative">
              <button
                onClick={() => setSelectedMemberForCard(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="text-[10px] text-blue-400 font-mono uppercase tracking-widest font-bold">
                {organizationName}
              </div>
              <div className="text-lg font-black text-white mt-1">
                {getAthleteName(selectedMemberForCard)}
              </div>
              <div className="text-xs text-slate-300 font-mono mt-0.5">
                Pass ID: {getAthleteCode(selectedMemberForCard)}
              </div>
            </div>

            <div className="p-6 text-center space-y-4">
              <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden border-2 border-slate-200 shadow-md bg-blue-50 flex items-center justify-center text-blue-700 font-bold text-xl">
                {selectedMemberForCard.photoUrl ? (
                  <img
                    src={selectedMemberForCard.photoUrl}
                    alt={getAthleteName(selectedMemberForCard)}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span>{getAthleteName(selectedMemberForCard).slice(0, 2).toUpperCase()}</span>
                )}
              </div>

              {/* QR Code representation */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 inline-block">
                <div className="w-28 h-28 bg-white p-2 border border-slate-300 rounded-xl flex items-center justify-center font-mono text-[9px] text-slate-600 break-all text-center shadow-inner">
                  <div className="space-y-1.5">
                    <QrCode className="w-14 h-14 text-slate-900 mx-auto" />
                    <div className="font-bold text-[10px]">{getAthleteCode(selectedMemberForCard)}</div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 mt-1.5 font-medium">Scan for gate entry & attendance</div>
              </div>

              <div className="text-left space-y-1.5 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    {getAthleteMobile(selectedMemberForCard) || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Blood Group:</span>
                  <span className="font-semibold text-slate-800">{selectedMemberForCard.bloodGroup || 'B+'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold text-emerald-600 capitalize">
                    {selectedMemberForCard.status || 'Active'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Valid Until:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedMemberForCard.expiryDate || (selectedMemberForCard as any).validUntil || '2027-01-01'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedMemberForCard(null)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Close Pass
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Membership Fee Reminder WhatsApp Modal */}
      {isFeeReminderModalOpen && (
        <MembershipFeeReminderModal
          isOpen={isFeeReminderModalOpen}
          onClose={() => {
            setIsFeeReminderModalOpen(false);
            setSelectedMemberForFeeReminder(null);
          }}
          members={safeMembers}
          invoices={invoices}
          initialMemberId={selectedMemberForFeeReminder?.id}
          activeOrgName={organizationName}
          onSendApiReminder={onSendFeeReminder}
        />
      )}

      {/* Official Membership Card Modal */}
      {isCardModalOpen && (
        <MembershipCardModal
          isOpen={isCardModalOpen}
          onClose={() => {
            setIsCardModalOpen(false);
            setSelectedMemberForCardId(undefined);
          }}
          members={safeMembers}
          initialMemberId={selectedMemberForCardId}
          activeOrg={activeOrg || { name: organizationName || 'Sports Club', id: 1 }}
        />
      )}

      {/* Sports Certificate Studio Modal */}
      {isCertModalOpen && (
        <SportsCertificateModal
          isOpen={isCertModalOpen}
          onClose={() => {
            setIsCertModalOpen(false);
            setSelectedMemberForCertId(undefined);
          }}
          members={safeMembers}
          sports={safeSports}
          activeOrg={activeOrg || { name: organizationName || 'Sports Club', id: 1 }}
          initialMemberId={selectedMemberForCertId}
          onIssueCertificate={onGenerateCertificate || (async () => {})}
        />
      )}

      {/* 1. Athlete 360° Profile Viewer Modal */}
      {viewingMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-6 text-white relative">
              <button
                onClick={() => setViewingMember(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/20 border-2 border-white/40 flex items-center justify-center text-white text-xl font-bold shrink-0">
                  {viewingMember.photoUrl ? (
                    <img
                      src={viewingMember.photoUrl}
                      alt={getAthleteName(viewingMember)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{getAthleteName(viewingMember).charAt(0)}</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold bg-white/20 px-2 py-0.5 rounded text-blue-100 border border-white/20">
                      {getAthleteCode(viewingMember)}
                    </span>
                    <span className="text-xs font-medium bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded capitalize border border-emerald-400/30">
                      {viewingMember.status || 'Active'}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold mt-1 text-white">{getAthleteName(viewingMember)}</h2>
                  <p className="text-xs text-blue-100/90 mt-0.5">
                    {organizationName} • Registered Athlete
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto text-xs">
              {/* Personal & Biological Specs */}
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Personal & Bio Details
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Date of Birth</span>
                    <span className="font-semibold text-slate-800">
                      {viewingMember.dob ? new Date(viewingMember.dob).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Gender</span>
                    <span className="font-semibold text-slate-800">{viewingMember.gender || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Blood Group</span>
                    <span className="font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 inline-block mt-0.5">
                      {viewingMember.bloodGroup || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Pass Validity</span>
                    <span className="font-semibold text-slate-800">
                      {viewingMember.expiryDate || (viewingMember as any).validUntil || '2027-01-01'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sports & Disciplines */}
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Enrolled Disciplines & Training
                </h4>
                <div className="flex flex-wrap gap-2">
                  {getAthleteSports(viewingMember).length > 0 ? (
                    getAthleteSports(viewingMember).map((sp: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center space-x-2 text-blue-900"
                      >
                        <Award className="w-4 h-4 text-blue-600 shrink-0" />
                        <div>
                          <div className="font-bold text-xs">{sp.sportName}</div>
                          <div className="text-[10px] text-blue-600">
                            Level: {sp.skillLevel || 'Intermediate'} {sp.position ? `• ${sp.position}` : ''}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 italic">
                      General club athlete membership
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Mobile Number</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {getAthleteMobile(viewingMember) || 'None registered'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Email Address</span>
                    <span className="font-semibold text-slate-800 truncate block">
                      {viewingMember.email || 'None registered'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">City / Location</span>
                    <span className="font-semibold text-slate-800">
                      {viewingMember.city || 'Kolkata'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Guardian & Emergency contact */}
              {viewingMember.guardianName && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                    Parent / Emergency Guardian
                  </h4>
                  <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/80 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800 text-xs">
                        {viewingMember.guardianName}{' '}
                        <span className="text-slate-500 font-normal">
                          ({viewingMember.guardianRelation || (viewingMember as any).guardianRelationship || 'Guardian'})
                        </span>
                      </div>
                      <div className="text-slate-600 font-mono text-[11px] mt-0.5">
                        {viewingMember.guardianPhone || 'No contact phone'}
                      </div>
                    </div>
                    {viewingMember.guardianPhone && (
                      <a
                        href={`tel:${viewingMember.guardianPhone}`}
                        className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-700 transition-colors"
                      >
                        Call Guardian
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    const m = viewingMember;
                    setViewingMember(null);
                    handleOpenEdit(m);
                  }}
                  className="px-3 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const m = viewingMember;
                    setViewingMember(null);
                    setSelectedMemberForCard(m);
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <QrCode className="w-3.5 h-3.5 text-slate-500" />
                  <span>Digital Pass</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setViewingMember(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Athlete Edit Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Edit Athlete Profile</h3>
                  <p className="text-[11px] text-slate-500">
                    Updating record for {getAthleteName(editingMember)} ({getAthleteCode(editingMember)})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingMember(null)}
                className="p-1.5 rounded-lg hover:bg-slate-200/60 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Athlete Full Name *</label>
                <input
                  type="text"
                  required
                  value={editFormData.fullName || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.mobile || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, mobile: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">WhatsApp Number</label>
                  <input
                    type="text"
                    value={editFormData.whatsapp || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, whatsapp: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={editFormData.dob || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, dob: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={editFormData.gender || 'Male'}
                    onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                    className="w-full px-2 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={editFormData.bloodGroup || 'B+'}
                    onChange={(e) => setEditFormData({ ...editFormData, bloodGroup: e.target.value })}
                    className="w-full px-2 py-2 rounded-xl border border-slate-200 bg-white font-bold"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editFormData.email || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Membership Status</label>
                  <select
                    value={editFormData.status || 'Active'}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full px-2 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-emerald-700"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Pending">Pending Approval</option>
                  </select>
                </div>
              </div>

              {/* Guardian Info */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <span className="font-bold text-slate-700 block text-[11px]">Guardian / Emergency Contact</span>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Guardian Name"
                    value={editFormData.guardianName || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, guardianName: e.target.value })}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                  />
                  <select
                    value={editFormData.guardianRelation || 'Parent'}
                    onChange={(e) => setEditFormData({ ...editFormData, guardianRelation: e.target.value })}
                    className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Parent">Parent</option>
                    <option value="Guardian">Guardian</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Guardian Phone"
                    value={editFormData.guardianPhone || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, guardianPhone: e.target.value })}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Photo URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={editFormData.photoUrl || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, photoUrl: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-[11px]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold disabled:opacity-50"
                >
                  {isSavingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Delete Confirmation Dialog */}
      {deletingMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3.5">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-center font-bold text-slate-900 text-base">Delete Athlete Record</h3>
            <p className="text-center text-xs text-slate-500 mt-1">
              Are you sure you want to permanently delete{' '}
              <strong className="text-slate-800 font-bold">{getAthleteName(deletingMember)}</strong> (
              {getAthleteCode(deletingMember)})?
            </p>
            <div className="bg-amber-50 border border-amber-200/70 p-3 rounded-2xl text-[11px] text-amber-800 mt-4 leading-relaxed">
              ⚠️ This will remove the athlete from all team rosters, pass verification QR codes, and attendance sessions.
            </div>
            <div className="mt-5 flex items-center justify-end space-x-2.5">
              <button
                type="button"
                onClick={() => setDeletingMember(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
