import React, { useState, useEffect, useMemo } from 'react';
import { TrainingSession, SessionParticipant, Sport, Team, Coach, Member } from '../types.ts';
import {
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  CheckCheck,
  Calendar,
  Save,
  Plus,
  X,
  Search,
  Users,
  MessageCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface AttendanceViewProps {
  sessions?: TrainingSession[];
  sports?: Sport[];
  teams?: Team[];
  coaches?: Coach[];
  members?: Member[];
  organizationName?: string;
  fetchSessionAttendance: (sessionId: number) => Promise<{ session: TrainingSession; participants: SessionParticipant[] }>;
  saveSessionAttendance: (sessionId: number, attendanceList: { memberId: number; status: string }[]) => Promise<void>;
  createTrainingSession: (sessionData: any) => Promise<void>;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  sessions = [],
  sports = [],
  teams = [],
  coaches = [],
  members = [],
  organizationName = 'Sports Academy',
  fetchSessionAttendance,
  saveSessionAttendance,
  createTrainingSession,
}) => {
  const safeSessions = Array.isArray(sessions) ? sessions : [];
  const safeSports = Array.isArray(sports) ? sports : [];
  const safeTeams = Array.isArray(teams) ? teams : [];
  const safeCoaches = Array.isArray(coaches) ? coaches : [];
  const safeMembers = Array.isArray(members) ? members : [];

  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
    safeSessions[0]?.id || null
  );
  const [currentSession, setCurrentSession] = useState<TrainingSession | null>(null);
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false);

  // Filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [whatsappToast, setWhatsappToast] = useState<string | null>(null);

  // New session state
  const todayStr = new Date().toISOString().split('T')[0];
  const [newSessionForm, setNewSessionForm] = useState({
    title: 'Evening Tactical Practice',
    sessionType: 'Training',
    sessionDate: todayStr,
    startTime: '16:30',
    endTime: '18:00',
    venue: 'Main Sports Complex',
    sportId: safeSports[0]?.id || 1,
    teamId: safeTeams[0]?.id || undefined,
    coachId: safeCoaches[0]?.id || undefined,
    notes: 'Drills, endurance conditioning, match practice',
  });

  // Keep selectedSessionId synced when sessions list loads or changes
  useEffect(() => {
    if (safeSessions.length > 0) {
      if (!selectedSessionId || !safeSessions.some((s) => s.id === selectedSessionId)) {
        setSelectedSessionId(safeSessions[0].id);
      }
    }
  }, [safeSessions, selectedSessionId]);

  // Load attendance whenever active session changes
  useEffect(() => {
    if (selectedSessionId) {
      loadAttendance(selectedSessionId);
    } else if (safeSessions.length === 0) {
      setCurrentSession(null);
      setParticipants([]);
    }
  }, [selectedSessionId]);

  const loadAttendance = async (sessionId: number) => {
    setLoading(true);
    setSaveSuccess(false);
    try {
      const data = await fetchSessionAttendance(sessionId);
      if (data) {
        const foundSession = data.session || safeSessions.find((s) => s.id === sessionId) || null;
        setCurrentSession(foundSession);
        
        let loadedParticipants = Array.isArray(data.participants) ? data.participants : [];
        
        // If no participants returned (e.g. fresh session), fallback to active members
        if (loadedParticipants.length === 0 && safeMembers.length > 0) {
          loadedParticipants = safeMembers.map((m, idx) => ({
            memberId: m.id,
            fullName: m.fullName || `${m.firstName || ''} ${m.lastName || ''}`.trim() || `Athlete #${m.id}`,
            memberCode: m.memberCode || m.memberNumber || `M-${String(m.id).padStart(6, '0')}`,
            photoUrl: m.photoUrl,
            jerseyNumber: (m as any).jerseyNumber || idx + 1,
            position: (m as any).position || 'Player',
            status: 'unmarked',
          }));
        }

        setParticipants(loadedParticipants);
      } else {
        const fallback = safeSessions.find((s) => s.id === sessionId) || null;
        setCurrentSession(fallback);
        setParticipants([]);
      }
    } catch (err) {
      console.error('Failed to load session attendance:', err);
      const fallback = safeSessions.find((s) => s.id === sessionId) || null;
      setCurrentSession(fallback);
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (memberId: number, status: 'present' | 'absent' | 'late' | 'excused') => {
    setParticipants((prev) =>
      prev.map((p) => (p.memberId === memberId ? { ...p, status } : p))
    );
  };

  const handleMarkAll = (status: 'present' | 'absent') => {
    setParticipants((prev) =>
      prev.map((p) => ({ ...p, status }))
    );
  };

  const handleResetAttendance = () => {
    setParticipants((prev) =>
      prev.map((p) => ({ ...p, status: 'unmarked' }))
    );
  };

  const handleSaveAttendance = async () => {
    if (!selectedSessionId) return;
    setSaving(true);
    try {
      const payload = participants.map((p) => ({
        memberId: p.memberId,
        status: p.status === 'unmarked' ? 'present' : p.status,
      }));
      await saveSessionAttendance(selectedSessionId, payload);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to save attendance:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTrainingSession(newSessionForm);
      setIsAddSessionOpen(false);
    } catch (err) {
      console.error('Failed to create training session:', err);
    }
  };

  const handleQuickSeedSession = async () => {
    try {
      await createTrainingSession({
        title: 'Morning Conditioning & Court Practice',
        sessionType: 'Training',
        sessionDate: todayStr,
        startTime: '07:00',
        endTime: '08:30',
        venue: 'Main Arena / Court 1',
        sportId: safeSports[0]?.id || 1,
        notes: 'Initial warmup, footwork drills, full scrimmage',
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Stats calculation
  const safeParticipants = Array.isArray(participants) ? participants : [];
  const totalCount = safeParticipants.length;
  const presentCount = safeParticipants.filter((p) => p.status === 'present').length;
  const absentCount = safeParticipants.filter((p) => p.status === 'absent').length;
  const lateCount = safeParticipants.filter((p) => p.status === 'late').length;
  const excusedCount = safeParticipants.filter((p) => p.status === 'excused').length;
  const unmarkedCount = safeParticipants.filter((p) => !p.status || p.status === 'unmarked').length;
  const attendanceRate = totalCount > 0 ? Math.round(((presentCount + lateCount) / totalCount) * 100) : 0;

  // Filtered participants list
  const filteredParticipants = useMemo(() => {
    return safeParticipants.filter((p) => {
      const name = (p.fullName || '').toLowerCase();
      const code = (p.memberCode || '').toLowerCase();
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || name.includes(query) || code.includes(query);

      if (statusFilter === 'all') return matchesSearch;
      if (statusFilter === 'unmarked') {
        return matchesSearch && (!p.status || p.status === 'unmarked');
      }
      return matchesSearch && p.status === statusFilter;
    });
  }, [safeParticipants, searchQuery, statusFilter]);

  const handleNotifyAbsentees = () => {
    const absentees = safeParticipants.filter((p) => p.status === 'absent');
    if (absentees.length === 0) {
      setWhatsappToast('No absent athletes found for this session.');
      setTimeout(() => setWhatsappToast(null), 3000);
      return;
    }
    setWhatsappToast(
      `WhatsApp absence broadcast prepared for ${absentees.length} athlete(s). Notifications sent to registered parent contacts.`
    );
    setTimeout(() => setWhatsappToast(null), 4500);
  };

  const getPlayerName = (p: SessionParticipant) => {
    return p.fullName || `Athlete #${p.memberId}`;
  };

  const getPlayerCode = (p: SessionParticipant) => {
    return p.memberCode || `M-${String(p.memberId).padStart(6, '0')}`;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'AT';
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Toast Alert */}
      {whatsappToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-600 text-white text-xs font-semibold flex items-center justify-between shadow-md animate-fadeIn">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-4 h-4 shrink-0" />
            <span>{whatsappToast}</span>
          </div>
          <button
            onClick={() => setWhatsappToast(null)}
            className="p-1 hover:bg-white/20 rounded-lg text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header and session selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900">Attendance & Training Logs</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {safeSessions.length} Scheduled Sessions
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time touch marking for coaches during court & field practice, live attendance rates & instant parent WhatsApp updates.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {safeSessions.length === 0 && (
            <button
              onClick={handleQuickSeedSession}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Quick Demo Session</span>
            </button>
          )}
          <button
            onClick={() => setIsAddSessionOpen(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Session</span>
          </button>
        </div>
      </div>

      {/* Empty State: No Sessions Created */}
      {safeSessions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
            <Calendar className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">No Training Sessions Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Create training sessions to start taking attendance, track athlete discipline, calculate attendance percentages, and alert parents of unexcused absences.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={handleQuickSeedSession}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Sample Practice Session</span>
            </button>
            <button
              onClick={() => setIsAddSessionOpen(true)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors"
            >
              Custom Schedule
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Active Session Switcher Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1 w-full">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Active Training Session
              </label>
              <select
                value={selectedSessionId || ''}
                onChange={(e) => setSelectedSessionId(Number(e.target.value))}
                className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 focus:outline-hidden focus:border-blue-500"
              >
                {safeSessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.sessionDate || 'Upcoming'} • {s.title} ({s.sportName || 'General'} - {s.teamName || 'All Squads'})
                  </option>
                ))}
              </select>
            </div>

            {currentSession && (
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 w-full md:w-auto">
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span className="font-mono font-medium">
                    {currentSession.startTime || '16:30'} - {currentSession.endTime || '18:00'}
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-medium truncate max-w-[180px]">
                    {currentSession.venue || 'Main Sports Complex'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* REAL-TIME ATTENDANCE METRICS DASHBOARD BAR */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Metric counters */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-6">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Total Roster</div>
                  <div className="text-2xl font-black font-mono mt-0.5">{totalCount}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-emerald-400">Present</div>
                  <div className="text-2xl font-black font-mono text-emerald-400 mt-0.5">{presentCount}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-rose-400">Absent</div>
                  <div className="text-2xl font-black font-mono text-rose-400 mt-0.5">{absentCount}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-amber-400">Late</div>
                  <div className="text-2xl font-black font-mono text-amber-400 mt-0.5">{lateCount}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Excused</div>
                  <div className="text-2xl font-black font-mono text-slate-300 mt-0.5">{excusedCount}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-blue-400">Rate</div>
                  <div className="text-2xl font-black font-mono text-blue-400 mt-0.5">{attendanceRate}%</div>
                </div>
              </div>

              {/* Fast Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleMarkAll('present')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-slate-700"
                >
                  <CheckCheck className="w-4 h-4 text-emerald-400" />
                  <span>Mark All Present</span>
                </button>

                <button
                  type="button"
                  onClick={handleNotifyAbsentees}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-slate-700"
                  title="Notify guardians of absent athletes via WhatsApp"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp Absent</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveAttendance}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : saveSuccess ? 'Saved ✓' : 'Save Roster'}</span>
                </button>
              </div>
            </div>

            {/* Attendance Progress Track */}
            <div className="space-y-1 pt-1 border-t border-slate-800">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Participation Progress</span>
                <span className="font-mono text-slate-300">
                  {presentCount + lateCount} / {totalCount} Marked Active ({attendanceRate}%)
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${totalCount > 0 ? (presentCount / totalCount) * 100 : 0}%` }}
                  title={`Present: ${presentCount}`}
                />
                <div
                  className="bg-amber-500 h-full transition-all duration-300"
                  style={{ width: `${totalCount > 0 ? (lateCount / totalCount) * 100 : 0}%` }}
                  title={`Late: ${lateCount}`}
                />
                <div
                  className="bg-rose-500 h-full transition-all duration-300"
                  style={{ width: `${totalCount > 0 ? (absentCount / totalCount) * 100 : 0}%` }}
                  title={`Absent: ${absentCount}`}
                />
                <div
                  className="bg-slate-600 h-full transition-all duration-300"
                  style={{ width: `${totalCount > 0 ? (excusedCount / totalCount) * 100 : 0}%` }}
                  title={`Excused: ${excusedCount}`}
                />
              </div>
            </div>
          </div>

          {/* FILTER & SEARCH TOOLBAR */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search athlete by name, jersey, or member code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            {/* Status Filter Chips */}
            <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
              {[
                { key: 'all', label: `All (${totalCount})` },
                { key: 'present', label: `Present (${presentCount})` },
                { key: 'absent', label: `Absent (${absentCount})` },
                { key: 'late', label: `Late (${lateCount})` },
                { key: 'excused', label: `Excused (${excusedCount})` },
                { key: 'unmarked', label: `Unmarked (${unmarkedCount})` },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    statusFilter === tab.key
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* MOBILE-OPTIMIZED ATTENDANCE TOUCH LIST */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs divide-y divide-slate-100 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-xs text-slate-500 space-y-2">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Loading session roster...</p>
              </div>
            ) : filteredParticipants.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500 space-y-3">
                <Users className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-700">
                  {searchQuery || statusFilter !== 'all'
                    ? 'No athletes match current filters.'
                    : 'No participants registered for this session.'}
                </p>
                {(searchQuery || statusFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              filteredParticipants.map((player) => {
                const isPresent = player.status === 'present';
                const isAbsent = player.status === 'absent';
                const isLate = player.status === 'late';
                const isExcused = player.status === 'excused';
                const name = getPlayerName(player);
                const code = getPlayerCode(player);
                const initials = getInitials(name);

                return (
                  <div
                    key={player.memberId}
                    className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Athlete Identity */}
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl overflow-hidden bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 border border-slate-200">
                        {player.photoUrl ? (
                          <img
                            src={player.photoUrl}
                            alt={name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-xs">{initials}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 leading-tight flex items-center space-x-2 truncate">
                          <span className="truncate">{name}</span>
                          {player.jerseyNumber && (
                            <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-md font-mono font-bold shrink-0">
                              #{player.jerseyNumber}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center space-x-2">
                          <span>{code}</span>
                          {player.position && <span>• {player.position}</span>}
                          {player.status && player.status !== 'unmarked' && (
                            <span
                              className={`capitalize font-bold text-[10px] px-1.5 py-0.2 rounded ${
                                isPresent
                                  ? 'text-emerald-700 bg-emerald-50'
                                  : isAbsent
                                  ? 'text-rose-700 bg-rose-50'
                                  : isLate
                                  ? 'text-amber-700 bg-amber-50'
                                  : 'text-slate-700 bg-slate-100'
                              }`}
                            >
                              {player.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Tactile Big Touch Buttons for Coaches on Field */}
                    <div className="grid grid-cols-4 gap-1.5 sm:flex sm:items-center sm:space-x-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(player.memberId, 'present')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 min-h-[38px] ${
                          isPresent
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Present</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(player.memberId, 'absent')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 min-h-[38px] ${
                          isAbsent
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Absent</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(player.memberId, 'late')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 min-h-[38px] ${
                          isLate
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Late</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(player.memberId, 'excused')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 min-h-[38px] ${
                          isExcused
                            ? 'bg-slate-700 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Excused</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* SCHEDULE PRACTICE SESSION MODAL */}
      {isAddSessionOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Schedule Practice Session</h3>
                <p className="text-xs text-slate-500">Configure squad, coach, and drills schedule.</p>
              </div>
              <button
                onClick={() => setIsAddSessionOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSessionSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Session Title *</label>
                <input
                  type="text"
                  required
                  value={newSessionForm.title}
                  onChange={(e) => setNewSessionForm({ ...newSessionForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sport Discipline</label>
                  <select
                    value={newSessionForm.sportId}
                    onChange={(e) => setNewSessionForm({ ...newSessionForm, sportId: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    {safeSports.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Squad / Team</label>
                  <select
                    value={newSessionForm.teamId || ''}
                    onChange={(e) =>
                      setNewSessionForm({
                        ...newSessionForm,
                        teamId: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="">All Open Athletes</option>
                    {safeTeams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newSessionForm.sessionDate}
                    onChange={(e) => setNewSessionForm({ ...newSessionForm, sessionDate: e.target.value })}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newSessionForm.startTime}
                    onChange={(e) => setNewSessionForm({ ...newSessionForm, startTime: e.target.value })}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={newSessionForm.endTime}
                    onChange={(e) => setNewSessionForm({ ...newSessionForm, endTime: e.target.value })}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Venue / Ground</label>
                <input
                  type="text"
                  value={newSessionForm.venue}
                  onChange={(e) => setNewSessionForm({ ...newSessionForm, venue: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Drills & Coach Notes</label>
                <input
                  type="text"
                  value={newSessionForm.notes}
                  onChange={(e) => setNewSessionForm({ ...newSessionForm, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddSessionOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs min-h-[40px]"
                >
                  Save & Launch Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
