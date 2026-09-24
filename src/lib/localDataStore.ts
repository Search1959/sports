import {
  MOCK_ORGANIZATIONS,
  MOCK_SPORTS,
  MOCK_BRANCHES,
  MOCK_PROGRAMS,
  MOCK_COACHES,
  MOCK_TEAMS,
  MOCK_MEMBERS,
  MOCK_FACILITIES,
  MOCK_SESSIONS,
  MOCK_TOURNAMENTS,
  MOCK_INVOICES,
  MOCK_PAYMENTS,
  MOCK_EXPENSES,
  MOCK_DONATIONS,
  MOCK_EQUIPMENT,
  MOCK_LEADS,
  MOCK_TEMPLATES,
  MOCK_MESSAGES,
  MOCK_CERTIFICATES,
  MOCK_EVENTS,
} from '../data/mockStore.ts';

const STORAGE_PREFIX = 'bys_local_';

function getStored<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    if (item) {
      return JSON.parse(item);
    }
  } catch (e) {
    console.warn('LocalStorage read error:', e);
  }
  return defaultVal;
}

function setStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(val));
  } catch (e) {
    console.warn('LocalStorage write error:', e);
  }
}

export class LocalDataStore {
  static getOrganizations() {
    return getStored('organizations', MOCK_ORGANIZATIONS);
  }

  static getSports() {
    return getStored('sports', MOCK_SPORTS);
  }

  static getBranches() {
    return getStored('branches', MOCK_BRANCHES);
  }

  static getPrograms() {
    return getStored('programs', MOCK_PROGRAMS);
  }

  static getCoaches() {
    return getStored('coaches', MOCK_COACHES);
  }

  static getTeams() {
    return getStored('teams', MOCK_TEAMS);
  }

  static getMembers() {
    const raw = getStored('members', MOCK_MEMBERS);
    if (!Array.isArray(raw) || raw.length === 0) {
      return MOCK_MEMBERS;
    }
    return raw.map((m: any, idx: number) => {
      const fName = m.firstName || '';
      const lName = m.lastName || '';
      const fallbackName = (fName || lName) ? `${fName} ${lName}`.trim() : `Athlete #${m.id || idx + 1}`;
      const fullName = m.fullName || fallbackName;
      const code = m.memberCode || m.memberNumber || `M-${String(m.id || idx + 1).padStart(6, '0')}`;
      const mobile = m.mobile || m.phone || '+91 98300 00000';
      const whatsapp = m.whatsapp || mobile;
      const sports = m.sports || (m.sportName ? [{ memberId: m.id, sportId: 1, sportName: m.sportName, skillLevel: 'Intermediate', position: 'Player' }] : [{ memberId: m.id, sportId: 1, sportName: 'General Sports', skillLevel: 'Player', position: 'Player' }]);

      return {
        ...m,
        id: m.id || idx + 1,
        fullName,
        firstName: m.firstName || fullName.split(' ')[0] || 'Athlete',
        lastName: m.lastName || fullName.split(' ').slice(1).join(' ') || '',
        memberCode: code,
        memberNumber: m.memberNumber || code,
        mobile,
        phone: m.phone || mobile,
        whatsapp,
        whatsappOptIn: m.whatsappOptIn !== undefined ? m.whatsappOptIn : true,
        dob: m.dob || m.dateOfBirth || '2010-01-01',
        dateOfBirth: m.dateOfBirth || m.dob || '2010-01-01',
        status: m.status || 'Active',
        joiningDate: m.joiningDate || m.joinDate || '2026-01-01',
        joinDate: m.joinDate || m.joiningDate || '2026-01-01',
        expiryDate: m.expiryDate || m.validUntil || '2027-01-01',
        validUntil: m.validUntil || m.expiryDate || '2027-01-01',
        photoUrl: m.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        sports,
      };
    });
  }

  static getFacilities() {
    return getStored('facilities', MOCK_FACILITIES);
  }

  static getSessions() {
    const raw = getStored('sessions', MOCK_SESSIONS);
    const today = new Date().toISOString().split('T')[0];
    return raw.map((s: any, idx: number) => ({
      ...s,
      id: Number(s.id || idx + 1),
      title: s.title || `Training Session #${s.id || idx + 1}`,
      sessionType: s.sessionType || 'Training',
      sessionDate: s.sessionDate || today,
      startTime: s.startTime || '16:30',
      endTime: s.endTime || '18:00',
      venue: s.venue || s.facilityName || 'Main Sports Complex',
      sportName: s.sportName || 'All Sports',
      teamName: s.teamName || 'Open Squad',
      coachName: s.coachName || 'Academy Coach',
      status: s.status || 'Scheduled',
    }));
  }

  static getSessionAttendance(sessionId: number) {
    const sessions = this.getSessions();
    const session = sessions.find((s: any) => Number(s.id) === Number(sessionId)) || sessions[0] || null;
    const members = this.getMembers();
    const savedAttendance = getStored(`attendance_${sessionId}`, []);

    // Filter participants by sport if applicable, otherwise all active members
    let roster = members;
    if (session && session.sportId) {
      const sportMembers = members.filter((m: any) =>
        m.sports && Array.isArray(m.sports) && m.sports.some((sp: any) => Number(sp.sportId) === Number(session.sportId))
      );
      if (sportMembers.length > 0) {
        roster = sportMembers;
      }
    }

    const participants = roster.map((m: any, idx: number) => {
      const existing = Array.isArray(savedAttendance)
        ? savedAttendance.find((r: any) => Number(r.memberId) === Number(m.id))
        : null;
      return {
        memberId: m.id,
        fullName: m.fullName || `${m.firstName || ''} ${m.lastName || ''}`.trim() || `Athlete #${m.id}`,
        memberCode: m.memberCode || m.memberNumber || `M-${String(m.id).padStart(6, '0')}`,
        photoUrl: m.photoUrl || '',
        jerseyNumber: m.jerseyNumber || idx + 1,
        position: m.position || (m.sports?.[0]?.position) || 'Player',
        status: existing?.status || 'unmarked',
        markedAt: existing?.markedAt || null,
        notes: existing?.notes || '',
      };
    });

    return { session, participants };
  }

  static saveSessionAttendance(sessionId: number, attendanceList: { memberId: number; status: string; notes?: string }[]) {
    const now = new Date().toISOString();
    const formatted = (Array.isArray(attendanceList) ? attendanceList : []).map((item) => ({
      memberId: Number(item.memberId),
      status: item.status || 'present',
      notes: item.notes || '',
      markedAt: now,
    }));
    setStored(`attendance_${sessionId}`, formatted);
    return { success: true, count: formatted.length, sessionId };
  }

  static getTournaments() {
    return getStored('tournaments', MOCK_TOURNAMENTS);
  }

  static getInvoices() {
    return getStored('invoices', MOCK_INVOICES);
  }

  static getPayments() {
    return getStored('payments', MOCK_PAYMENTS);
  }

  static getExpenses() {
    return getStored('expenses', MOCK_EXPENSES);
  }

  static getDonations() {
    return getStored('donations', MOCK_DONATIONS);
  }

  static getEquipment() {
    return getStored('equipment', MOCK_EQUIPMENT);
  }

  static getLeads() {
    return getStored('leads', MOCK_LEADS);
  }

  static getTemplates() {
    return getStored('templates', MOCK_TEMPLATES);
  }

  static getMessages() {
    return getStored('messages', MOCK_MESSAGES);
  }

  static sendWhatsAppFeeReminders(params: {
    invoiceIds?: number[];
    memberId?: number;
    upiVpa?: string;
    customMessage?: string;
    phone?: string;
    recipientName?: string;
  }) {
    const { invoiceIds, memberId, upiVpa = 'burrabazar.sports@icici', customMessage, phone, recipientName } = params;
    const invoices = this.getInvoices();
    const members = this.getMembers();
    const existingMessages = this.getMessages();

    let targetInvoices: any[] = [];
    if (invoiceIds && invoiceIds.length > 0) {
      targetInvoices = invoices.filter((inv: any) => invoiceIds.includes(Number(inv.id)));
    } else if (memberId) {
      targetInvoices = invoices.filter((inv: any) => Number(inv.memberId) === Number(memberId));
    } else {
      targetInvoices = invoices.filter((inv: any) => inv.status === 'due' || inv.status === 'overdue');
    }

    const orgs = this.getOrganizations();
    const orgName = orgs[0]?.name || 'Sports Academy';
    const now = new Date().toISOString();
    const newMessages: any[] = [];

    if (targetInvoices.length > 0) {
      for (const inv of targetInvoices) {
        const member = members.find((m: any) => Number(m.id) === Number(inv.memberId));
        const name = recipientName || inv.memberName || member?.fullName || `Member #${inv.memberId}`;
        const recipientPhone = phone || inv.memberWhatsApp || inv.memberPhone || member?.whatsapp || member?.mobile || '+91 98300 00000';
        const upiUrl = `upi://pay?pa=${encodeURIComponent(upiVpa)}&pn=${encodeURIComponent(orgName)}&am=${inv.amount}&cu=INR&tn=${encodeURIComponent(inv.invoiceNumber)}`;

        let msgText = customMessage || '';
        if (msgText) {
          msgText = msgText
            .replace(/{name}/g, name)
            .replace(/{amount}/g, `${inv.amount}`)
            .replace(/{title}/g, inv.title || 'Membership Fee')
            .replace(/{dueDate}/g, inv.dueDate || 'due date')
            .replace(/{upiVpa}/g, upiVpa)
            .replace(/{org}/g, orgName);
        } else {
          msgText = `*Official Fee Notice from ${orgName}*\n\nDear ${name},\nThis is a friendly reminder regarding your membership fee for *${inv.title}* (Inv #${inv.invoiceNumber}).\n\n📌 *Amount Due:* ₹${inv.amount}\n📅 *Due Date:* ${inv.dueDate}\n\n💳 *Instant UPI Pay Link:*\n${upiUrl}\n\nThank you!`;
        }

        const msgObj = {
          id: Date.now() + Math.floor(Math.random() * 1000),
          recipientPhone,
          recipientName: name,
          messageType: 'Fee Reminder',
          content: msgText,
          status: 'Delivered',
          sentAt: now,
          optInVerified: true,
        };
        newMessages.push(msgObj);
      }
    } else {
      // Single custom reminder without invoice
      const name = recipientName || 'Club Member';
      const recipientPhone = phone || '+91 98300 00000';
      const msgObj = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        recipientPhone,
        recipientName: name,
        messageType: 'Fee Reminder',
        content: customMessage || `Dear ${name}, this is a reminder regarding your membership subscription.`,
        status: 'Delivered',
        sentAt: now,
        optInVerified: true,
      };
      newMessages.push(msgObj);
    }

    const updated = [...newMessages, ...existingMessages];
    setStored('messages', updated);

    return {
      success: true,
      sentCount: newMessages.length,
      messages: newMessages,
      message: `Successfully dispatched WhatsApp fee reminder to ${newMessages.length} recipient(s).`,
    };
  }

  static getCertificates() {
    return getStored('certificates', MOCK_CERTIFICATES);
  }

  static getEvents() {
    return getStored('events', MOCK_EVENTS);
  }

  static getStats() {
    const members = this.getMembers();
    const sports = this.getSports();
    const programs = this.getPrograms();
    const coaches = this.getCoaches();
    const teams = this.getTeams();
    const sessions = this.getSessions();
    const invoices = this.getInvoices();
    const payments = this.getPayments();

    const pendingFees = invoices
      .filter((i: any) => i.status === 'due' || i.status === 'overdue')
      .reduce((s: number, i: any) => s + parseFloat(i.amount || '0'), 0);

    const totalCollected = payments.reduce(
      (s: number, p: any) => s + parseFloat(p.amount || '0'),
      0
    );

    return {
      memberCount: members.length,
      sportsCount: sports.length,
      programsCount: programs.length,
      coachesCount: coaches.length,
      teamsCount: teams.length,
      sessionsCount: sessions.length,
      pendingFees,
      totalCollected,
    };
  }

  static getFinanceSummary() {
    const payments = this.getPayments();
    const expenses = this.getExpenses();
    const invoices = this.getInvoices();

    const totalCollected = payments.reduce(
      (s: number, p: any) => s + parseFloat(p.amount || '0'),
      0
    );
    const totalExpenses = expenses.reduce(
      (s: number, e: any) => s + parseFloat(e.amount || '0'),
      0
    );
    const pendingDue = invoices
      .filter((i: any) => i.status === 'due' || i.status === 'overdue')
      .reduce((s: number, i: any) => s + parseFloat(i.amount || '0'), 0);

    return {
      totalCollected,
      totalExpenses,
      netBalance: totalCollected - totalExpenses,
      pendingDue,
    };
  }

  // Generic local save helper
  static saveItem<T extends { id?: number }>(key: string, defaultList: T[], item: any): T {
    const list = getStored<T[]>(key, defaultList);
    if (item.id) {
      const idx = list.findIndex((x: any) => x.id === item.id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...item };
      } else {
        list.push(item);
      }
    } else {
      const newId = Date.now();
      const newItem = { ...item, id: newId };
      list.push(newItem);
      item = newItem;
    }
    setStored(key, list);
    return item;
  }

  // Update match score in tournament
  static updateMatch(matchId: number, data: any) {
    const tournaments = this.getTournaments();
    let updatedMatch = null;
    for (const tourney of tournaments) {
      if (tourney.matches) {
        const m = tourney.matches.find((x: any) => x.id === matchId);
        if (m) {
          Object.assign(m, data);
          updatedMatch = m;
          break;
        }
      }
    }
    setStored('tournaments', tournaments);
    return updatedMatch;
  }

  // Reset demo storage to fresh state
  static resetToDefault() {
    try {
      const keys = Object.keys(localStorage);
      for (const k of keys) {
        if (k.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(k);
        }
      }
    } catch (e) {
      console.warn(e);
    }
  }
}
