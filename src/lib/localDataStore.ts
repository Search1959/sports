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
    return getStored('members', MOCK_MEMBERS);
  }

  static getFacilities() {
    return getStored('facilities', MOCK_FACILITIES);
  }

  static getSessions() {
    return getStored('sessions', MOCK_SESSIONS);
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
