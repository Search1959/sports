import React, { useState } from 'react';
import { Coach, Team, Sport, Member } from '../types.ts';
import {
  Shield,
  Users,
  Plus,
  Phone,
  Mail,
  Award,
  X,
  UserCheck,
  Hash,
  Eye,
  Edit2,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

interface TeamsCoachesViewProps {
  coaches: Coach[];
  teams: Team[];
  sports: Sport[];
  members: Member[];
  onAddCoach: (coachData: any) => Promise<void>;
  onUpdateCoach?: (id: number, coachData: any) => Promise<void>;
  onDeleteCoach?: (id: number) => Promise<void>;
  onAddTeam: (teamData: any) => Promise<void>;
  onUpdateTeam?: (id: number, teamData: any) => Promise<void>;
  onDeleteTeam?: (id: number) => Promise<void>;
  onAssignPlayer: (teamId: number, memberId: number, jerseyNumber?: number, position?: string) => Promise<void>;
  onRemoveTeamPlayer?: (teamId: number, memberId: number) => Promise<void>;
}

export const TeamsCoachesView: React.FC<TeamsCoachesViewProps> = ({
  coaches = [],
  teams = [],
  sports = [],
  members = [],
  onAddCoach,
  onUpdateCoach,
  onDeleteCoach,
  onAddTeam,
  onUpdateTeam,
  onDeleteTeam,
  onAssignPlayer,
  onRemoveTeamPlayer,
}) => {
  const [activeTab, setActiveTab] = useState<'teams' | 'coaches'>('teams');
  const [isAddCoachOpen, setIsAddCoachOpen] = useState(false);
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false);
  const [assigningTeam, setAssigningTeam] = useState<Team | null>(null);

  // View, Edit, Delete States for Teams
  const [viewingTeam, setViewingTeam] = useState<Team | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null);
  const [editTeamForm, setEditTeamForm] = useState<any>({});

  // View, Edit, Delete States for Coaches
  const [viewingCoach, setViewingCoach] = useState<Coach | null>(null);
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
  const [deletingCoach, setDeletingCoach] = useState<Coach | null>(null);
  const [editCoachForm, setEditCoachForm] = useState<any>({});

  const [isProcessing, setIsProcessing] = useState(false);

  const handleOpenEditTeam = (t: Team) => {
    setEditingTeam(t);
    setEditTeamForm({
      name: t.name,
      sportId: t.sportId,
      coachId: t.coachId,
      category: t.category,
      ageGroup: t.ageGroup,
    });
  };

  const handleSaveEditTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam) return;
    setIsProcessing(true);
    try {
      if (onUpdateTeam) {
        await onUpdateTeam(editingTeam.id, editTeamForm);
      }
      setEditingTeam(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmDeleteTeam = async () => {
    if (!deletingTeam) return;
    setIsProcessing(true);
    try {
      if (onDeleteTeam) {
        await onDeleteTeam(deletingTeam.id);
      }
      setDeletingTeam(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemovePlayer = async (teamId: number, memberId: number) => {
    if (!onRemoveTeamPlayer) return;
    try {
      await onRemoveTeamPlayer(teamId, memberId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenEditCoach = (c: Coach) => {
    setEditingCoach(c);
    setEditCoachForm({
      fullName: c.fullName,
      type: c.type || 'Head Coach',
      phone: c.phone || '',
      email: c.email || '',
      qualification: c.qualification || '',
      experienceYears: c.experienceYears || 1,
      photoUrl: c.photoUrl || '',
    });
  };

  const handleSaveEditCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoach) return;
    setIsProcessing(true);
    try {
      if (onUpdateCoach) {
        await onUpdateCoach(editingCoach.id, editCoachForm);
      }
      setEditingCoach(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmDeleteCoach = async () => {
    if (!deletingCoach) return;
    setIsProcessing(true);
    try {
      if (onDeleteCoach) {
        await onDeleteCoach(deletingCoach.id);
      }
      setDeletingCoach(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Coach form
  const [coachForm, setCoachForm] = useState({
    fullName: '',
    type: 'Head Coach',
    phone: '+91 98300 55555',
    email: '',
    qualification: 'NIS Diploma / Level 2 Certified',
    experienceYears: 6,
    selectedSportIds: [] as number[],
  });

  // Team form
  const [teamForm, setTeamForm] = useState({
    name: '',
    sportId: sports?.[0]?.id || 1,
    coachId: coaches?.[0]?.id || undefined,
    category: 'Juniors',
    ageGroup: 'U16',
  });

  // Assign player form
  const [assignForm, setAssignForm] = useState({
    memberId: members?.[0]?.id || 1,
    jerseyNumber: 10,
    position: 'Forward',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachForm.fullName) return;
    setIsSubmitting(true);
    try {
      await onAddCoach({
        ...coachForm,
        sportIds: coachForm.selectedSportIds,
      });
      setIsAddCoachOpen(false);
      setCoachForm({
        fullName: '',
        type: 'Head Coach',
        phone: '+91 98300 55555',
        email: '',
        qualification: 'NIS Diploma / Level 2 Certified',
        experienceYears: 6,
        selectedSportIds: [],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamForm.name) return;
    setIsSubmitting(true);
    try {
      await onAddTeam(teamForm);
      setIsAddTeamOpen(false);
      setTeamForm({
        name: '',
        sportId: sports[0]?.id || 1,
        coachId: coaches[0]?.id || undefined,
        category: 'Juniors',
        ageGroup: 'U16',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignPlayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningTeam) return;
    setIsSubmitting(true);
    try {
      await onAssignPlayer(
        assigningTeam.id,
        Number(assignForm.memberId),
        Number(assignForm.jerseyNumber),
        assignForm.position
      );
      setAssigningTeam(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Coaches, Instructors & Team Squads</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage certified coaching staff, team divisions, and active player rosters with jersey assignments.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {activeTab === 'teams' ? (
            <button
              onClick={() => setIsAddTeamOpen(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Team</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAddCoachOpen(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Coach / Trainer</span>
            </button>
          )}
        </div>
      </div>

      {/* Mode Subtabs */}
      <div className="flex space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('teams')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center space-x-1.5 ${
            activeTab === 'teams'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Teams & Squads ({teams.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('coaches')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center space-x-1.5 ${
            activeTab === 'coaches'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Coaches & Trainers ({coaches.length})</span>
        </button>
      </div>

      {/* Teams Tab */}
      {activeTab === 'teams' && (
        teams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teams.map((team) => (
              <div
                key={team.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {team.sportName || 'Sport'} • {team.ageGroup}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base mt-1">{team.name}</h3>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Head Coach: <span className="font-medium text-slate-700">{team.coachName || 'Unassigned'}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => setViewingTeam(team)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                        title="View Team Squad"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEditTeam(team)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 text-slate-500 transition-colors"
                        title="Edit Team Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setAssigningTeam(team)}
                        className="px-2 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1"
                        title="Add Player to Squad"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                      <button
                        onClick={() => setDeletingTeam(team)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-slate-400 transition-colors"
                        title="Delete Team"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Squad Players List */}
                  <div className="mt-4">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex justify-between">
                      <span>Active Squad Roster</span>
                      <span>{team.players?.length || 0} Players</span>
                    </div>

                    {team.players && team.players.length > 0 ? (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {team.players.map((p, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                          >
                            <div className="flex items-center space-x-2.5">
                              <span className="w-6 h-6 rounded-md bg-blue-600 text-white font-mono font-bold flex items-center justify-center text-[10px]">
                                #{p.jerseyNumber || (idx + 1)}
                              </span>
                              <div>
                                <div className="font-semibold text-slate-800">{p.memberName}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{p.memberCode}</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-[11px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                                {p.position || 'Player'}
                              </span>
                              {onRemoveTeamPlayer && (
                                <button
                                  type="button"
                                  onClick={() => handleRemovePlayer(team.id, p.memberId)}
                                  className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="Remove player from roster"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-lg text-center">
                        No players assigned yet. Click "Add Player" to build the squad roster.
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Category: {team.category}</span>
                  <span className="text-emerald-600 font-medium">Ready for Competition</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">No Teams or Squads Yet</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Create competitive rosters, assign dedicated head coaches, and manage player jerseys & tactical field positions.
            </p>
            <button
              onClick={() => setIsAddTeamOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Team Squad</span>
            </button>
          </div>
        )
      )}

      {/* Coaches Tab */}
      {activeTab === 'coaches' && (
        coaches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coaches.map((coach) => (
              <div
                key={coach.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3.5">
                      <img
                        src={coach.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                        alt={coach.fullName}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <h3 className="font-bold text-slate-900 text-base leading-tight">{coach.fullName}</h3>
                        <div className="text-xs font-medium text-blue-600 mt-0.5">{coach.type}</div>
                        <div className="text-[11px] text-slate-500 mt-1 flex items-center space-x-1">
                          <Award className="w-3 h-3 text-amber-500" />
                          <span>{coach.experienceYears} Years Exp</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => setViewingCoach(coach)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                        title="View Coach Profile"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEditCoach(coach)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 text-slate-500 transition-colors"
                        title="Edit Coach Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingCoach(coach)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-slate-400 transition-colors"
                        title="Delete Coach"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3.5 space-y-1 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-slate-400">Credentials:</span>{' '}
                      <span className="font-medium text-slate-700">{coach.qualification || 'Certified Instructor'}</span>
                    </div>
                    <div className="flex items-center space-x-2 pt-1 text-[11px] text-slate-500">
                      <span className="flex items-center space-x-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{coach.phone}</span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Assigned Sports
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {coach.sports && coach.sports.length > 0 ? (
                        coach.sports.map((sp) => (
                          <span
                            key={sp.sportId}
                            className="text-[10px] font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100"
                          >
                            {sp.sportName}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">General Staff</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="text-emerald-600 font-semibold">Active Staff</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">No Coaches or Trainers Added Yet</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Register licensed coaches, trainers, and fitness staff, assign them to sports disciplines, and link them to competitive squads.
            </p>
            <button
              onClick={() => setIsAddCoachOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Coach / Trainer</span>
            </button>
          </div>
        )
      )}

      {/* Assign Player Modal */}
      {assigningTeam && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Assign Player to {assigningTeam.name}</h3>
                <p className="text-xs text-slate-500">Assign jersey number & field position</p>
              </div>
              <button
                onClick={() => setAssigningTeam(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignPlayerSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Member / Player *</label>
                <select
                  value={assignForm.memberId}
                  onChange={(e) => setAssignForm({ ...assignForm, memberId: Number(e.target.value) })}
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jersey Number</label>
                  <input
                    type="number"
                    value={assignForm.jerseyNumber}
                    onChange={(e) => setAssignForm({ ...assignForm, jerseyNumber: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Position / Role</label>
                  <input
                    type="text"
                    placeholder="e.g. Point Guard / Striker"
                    value={assignForm.position}
                    onChange={(e) => setAssignForm({ ...assignForm, position: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setAssigningTeam(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs"
                >
                  {isSubmitting ? 'Assigning...' : 'Add to Squad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Coach Modal */}
      {isAddCoachOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Add Coach / Trainer</h3>
                <p className="text-xs text-slate-500">Register coaching staff & qualifications</p>
              </div>
              <button
                onClick={() => setIsAddCoachOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoach} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Coach Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Coach Vikram Sengupta"
                  value={coachForm.fullName}
                  onChange={(e) => setCoachForm({ ...coachForm, fullName: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
                  <select
                    value={coachForm.type}
                    onChange={(e) => setCoachForm({ ...coachForm, type: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Head Coach">Head Coach</option>
                    <option value="Assistant Coach">Assistant Coach</option>
                    <option value="Fitness Trainer">Fitness & Conditioning</option>
                    <option value="Yoga Master">Yoga Master</option>
                    <option value="Physiotherapist">Physiotherapist</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={coachForm.experienceYears}
                    onChange={(e) => setCoachForm({ ...coachForm, experienceYears: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Contact *</label>
                <input
                  type="text"
                  required
                  value={coachForm.phone}
                  onChange={(e) => setCoachForm({ ...coachForm, phone: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Qualifications / Certifications</label>
                <input
                  type="text"
                  value={coachForm.qualification}
                  onChange={(e) => setCoachForm({ ...coachForm, qualification: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddCoachOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs"
                >
                  {isSubmitting ? 'Adding...' : 'Save Coach'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Team Modal */}
      {isAddTeamOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Create Team Division</h3>
                <p className="text-xs text-slate-500">Configure team age group & coach</p>
              </div>
              <button
                onClick={() => setIsAddTeamOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Team Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Burrabazar Warriors U16"
                  value={teamForm.name}
                  onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sport</label>
                  <select
                    value={teamForm.sportId}
                    onChange={(e) => setTeamForm({ ...teamForm, sportId: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    {sports.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Head Coach</label>
                  <select
                    value={teamForm.coachId}
                    onChange={(e) => setTeamForm({ ...teamForm, coachId: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    {coaches.map((c) => (
                      <option key={c.id} value={c.id}>{c.fullName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Age Group</label>
                  <select
                    value={teamForm.ageGroup}
                    onChange={(e) => setTeamForm({ ...teamForm, ageGroup: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    {['U12', 'U14', 'U16', 'U18', 'U21', 'Senior', 'Masters'].map((ag) => (
                      <option key={ag} value={ag}>{ag}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={teamForm.category}
                    onChange={(e) => setTeamForm({ ...teamForm, category: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddTeamOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs"
                >
                  {isSubmitting ? 'Creating...' : 'Save Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1. View Team Squad Modal */}
      {viewingTeam && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 bg-gradient-to-r from-blue-700 to-indigo-700 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white font-bold text-lg">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">{viewingTeam.name}</h3>
                  <p className="text-xs text-blue-100">
                    {viewingTeam.sportName || 'Sport'} • {viewingTeam.ageGroup} • {viewingTeam.category}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingTeam(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">Head Coach</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {viewingTeam.coachName || 'Unassigned'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Roster Count</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {viewingTeam.players?.length || 0} Athletes
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Active Player Squad List
                </h4>
                {viewingTeam.players && viewingTeam.players.length > 0 ? (
                  <div className="space-y-1.5">
                    {viewingTeam.players.map((p, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-mono font-bold flex items-center justify-center text-xs">
                            #{p.jerseyNumber || (idx + 1)}
                          </span>
                          <div>
                            <div className="font-bold text-slate-900">{p.memberName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{p.memberCode}</div>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium">
                          {p.position || 'Player'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                    No athletes assigned to this squad yet.
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  const t = viewingTeam;
                  setViewingTeam(null);
                  handleOpenEditTeam(t);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold flex items-center space-x-1.5 hover:bg-blue-700"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Team Details</span>
              </button>
              <button
                type="button"
                onClick={() => setViewingTeam(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Edit Team Modal */}
      {editingTeam && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Edit Team Squad</h3>
                  <p className="text-[11px] text-slate-500">Updating {editingTeam.name}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingTeam(null)}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditTeam} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Squad Name *</label>
                <input
                  type="text"
                  required
                  value={editTeamForm.name || ''}
                  onChange={(e) => setEditTeamForm({ ...editTeamForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sport</label>
                  <select
                    value={editTeamForm.sportId}
                    onChange={(e) => setEditTeamForm({ ...editTeamForm, sportId: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    {sports.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Head Coach</label>
                  <select
                    value={editTeamForm.coachId || ''}
                    onChange={(e) => setEditTeamForm({ ...editTeamForm, coachId: Number(e.target.value) || undefined })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="">Unassigned</option>
                    {coaches.map((c) => (
                      <option key={c.id} value={c.id}>{c.fullName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Age Group</label>
                  <select
                    value={editTeamForm.ageGroup || 'U16'}
                    onChange={(e) => setEditTeamForm({ ...editTeamForm, ageGroup: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    {['U12', 'U14', 'U16', 'U18', 'U21', 'Senior', 'Masters'].map((ag) => (
                      <option key={ag} value={ag}>{ag}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={editTeamForm.category || ''}
                    onChange={(e) => setEditTeamForm({ ...editTeamForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingTeam(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold disabled:opacity-50"
                >
                  {isProcessing ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Delete Team Confirmation Modal */}
      {deletingTeam && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3.5">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-center font-bold text-slate-900 text-base">Delete Team Squad</h3>
            <p className="text-center text-xs text-slate-500 mt-1">
              Are you sure you want to delete <strong className="text-slate-800 font-bold">{deletingTeam.name}</strong>?
            </p>
            <div className="bg-amber-50 border border-amber-200/70 p-3 rounded-2xl text-[11px] text-amber-800 mt-4 leading-relaxed">
              ⚠️ Player profiles will remain intact in the club athlete directory, but will be unlinked from this squad roster.
            </div>
            <div className="mt-5 flex items-center justify-end space-x-2.5">
              <button
                type="button"
                onClick={() => setDeletingTeam(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmDeleteTeam}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. View Coach Profile Modal */}
      {viewingCoach && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 bg-gradient-to-r from-slate-900 to-blue-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img
                  src={viewingCoach.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                  alt={viewingCoach.fullName}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white/40 shadow-sm"
                />
                <div>
                  <h3 className="font-bold text-lg text-white">{viewingCoach.fullName}</h3>
                  <p className="text-xs text-blue-200">{viewingCoach.type || 'Head Coach'}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingCoach(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">Experience</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {viewingCoach.experienceYears || 0} Years Coaching
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Qualifications</span>
                  <span className="font-medium text-slate-700 block mt-0.5">
                    {viewingCoach.qualification || 'Certified Instructor'}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Contact Information
                </h4>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center space-x-2 text-slate-700 font-mono">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{viewingCoach.phone || 'No phone registered'}</span>
                  </div>
                  {viewingCoach.email && (
                    <div className="flex items-center space-x-2 text-slate-700">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span>{viewingCoach.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {viewingCoach.sports && viewingCoach.sports.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Certified Disciplines
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {viewingCoach.sports.map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 font-medium">
                        {s.sportName}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  const c = viewingCoach;
                  setViewingCoach(null);
                  handleOpenEditCoach(c);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold flex items-center space-x-1.5 hover:bg-blue-700"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Coach</span>
              </button>
              <button
                type="button"
                onClick={() => setViewingCoach(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Edit Coach Modal */}
      {editingCoach && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Edit Coach Record</h3>
                  <p className="text-[11px] text-slate-500">Updating {editingCoach.fullName}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingCoach(null)}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditCoach} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editCoachForm.fullName || ''}
                  onChange={(e) => setEditCoachForm({ ...editCoachForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Coach Role</label>
                  <select
                    value={editCoachForm.type || 'Head Coach'}
                    onChange={(e) => setEditCoachForm({ ...editCoachForm, type: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Head Coach">Head Coach</option>
                    <option value="Assistant Coach">Assistant Coach</option>
                    <option value="Fitness Trainer">Fitness Trainer</option>
                    <option value="Physiotherapist">Physiotherapist</option>
                    <option value="Guest Specialist">Guest Specialist</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={editCoachForm.experienceYears || 1}
                    onChange={(e) => setEditCoachForm({ ...editCoachForm, experienceYears: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editCoachForm.phone || ''}
                    onChange={(e) => setEditCoachForm({ ...editCoachForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editCoachForm.email || ''}
                    onChange={(e) => setEditCoachForm({ ...editCoachForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Certification & Credentials</label>
                <input
                  type="text"
                  value={editCoachForm.qualification || ''}
                  onChange={(e) => setEditCoachForm({ ...editCoachForm, qualification: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Photo URL</label>
                <input
                  type="text"
                  value={editCoachForm.photoUrl || ''}
                  onChange={(e) => setEditCoachForm({ ...editCoachForm, photoUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingCoach(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold disabled:opacity-50"
                >
                  {isProcessing ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Delete Coach Confirmation Modal */}
      {deletingCoach && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3.5">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-center font-bold text-slate-900 text-base">Delete Coach</h3>
            <p className="text-center text-xs text-slate-500 mt-1">
              Are you sure you want to delete coach <strong className="text-slate-800 font-bold">{deletingCoach.fullName}</strong>?
            </p>
            <div className="bg-amber-50 border border-amber-200/70 p-3 rounded-2xl text-[11px] text-amber-800 mt-4 leading-relaxed">
              ⚠️ Teams currently assigned to this coach will become unassigned until a new coach is selected.
            </div>
            <div className="mt-5 flex items-center justify-end space-x-2.5">
              <button
                type="button"
                onClick={() => setDeletingCoach(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmDeleteCoach}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
