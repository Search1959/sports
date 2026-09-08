export interface Organization {
  id: number;
  name: string;
  shortName: string;
  slug: string;
  type: string;
  logo?: string;
  coverImage?: string;
  description?: string;
  establishedYear?: number;
  email?: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  currency?: string;
  timezone?: string;
  theme?: string;
  primaryColor?: string;
  status?: string;
  modules?: string[];
  branches?: Branch[];
  subscription?: Subscription;
}

export interface Branch {
  id: number;
  organizationId: number;
  name: string;
  code: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  isMain?: boolean;
}

export interface Sport {
  id: number;
  organizationId?: number | null;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  isGlobal?: boolean;
  scoringType?: string;
  categories?: string[];
  customFields?: { key: string; label: string; type: string; required?: boolean }[];
  status?: string;
}

export interface Program {
  id: number;
  organizationId: number;
  branchId?: number | null;
  sportId?: number | null;
  name: string;
  slug: string;
  type?: string;
  description?: string;
  fee?: string;
  scheduleNotes?: string;
  status?: string;
}

export interface MemberSport {
  memberId: number;
  sportId: number;
  skillLevel?: string;
  position?: string;
  sportName?: string;
  sportIcon?: string;
}

export interface Member {
  id: number;
  organizationId: number;
  branchId?: number | null;
  memberCode: string;
  fullName: string;
  dob?: string;
  gender?: string;
  bloodGroup?: string;
  mobile: string;
  whatsapp?: string;
  whatsappOptIn?: boolean;
  email?: string;
  address?: string;
  city?: string;
  guardianName?: string;
  guardianRelation?: string;
  guardianPhone?: string;
  membershipTypeId?: number | null;
  joiningDate: string;
  expiryDate?: string;
  photoUrl?: string;
  status?: string;
  sports?: MemberSport[];
}

export interface Coach {
  id: number;
  organizationId: number;
  fullName: string;
  type: string;
  phone: string;
  email?: string;
  qualification?: string;
  experienceYears?: number;
  photoUrl?: string;
  sports?: { coachId: number; sportId: number; sportName: string }[];
}

export interface TeamPlayer {
  teamId: number;
  memberId: number;
  jerseyNumber?: number;
  position?: string;
  memberName?: string;
  memberCode?: string;
  photoUrl?: string;
}

export interface Team {
  id: number;
  organizationId: number;
  name: string;
  category?: string;
  ageGroup?: string;
  status?: string;
  sportId: number;
  sportName?: string;
  coachId?: number;
  coachName?: string;
  players?: TeamPlayer[];
}

export interface TrainingSession {
  id: number;
  organizationId: number;
  title: string;
  sessionType: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  venue?: string;
  notes?: string;
  status: string;
  sportId?: number;
  sportName?: string;
  teamId?: number;
  teamName?: string;
  coachId?: number;
  coachName?: string;
}

export interface SessionParticipant {
  memberId: number;
  fullName: string;
  memberCode: string;
  photoUrl?: string;
  jerseyNumber?: number;
  position?: string;
  status: 'present' | 'absent' | 'late' | 'excused' | 'unmarked';
  markedAt?: string;
}

export interface Facility {
  id: number;
  organizationId: number;
  name: string;
  type: string;
  capacity: number;
  description?: string;
  status?: string;
  bookings?: FacilityBooking[];
}

export interface FacilityBooking {
  id: number;
  organizationId: number;
  facilityId: number;
  title: string;
  bookedBy: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
}

export interface Tournament {
  id: number;
  organizationId: number;
  name: string;
  format: string;
  startDate: string;
  endDate: string;
  venue?: string;
  entryFee?: string;
  rules?: string;
  status?: string;
  sportId: number;
  sportName?: string;
  matches?: Match[];
}

export interface Match {
  id: number;
  organizationId: number;
  tournamentId: number;
  sportId?: number;
  round: string;
  matchDate: string;
  matchTime?: string;
  venue?: string;
  participantA: string;
  participantB: string;
  scoreA: string;
  scoreB: string;
  winner?: string;
  status: string;
  notes?: string;
}

export interface EventItem {
  id: number;
  organizationId: number;
  title: string;
  description?: string;
  eventDate: string;
  eventTime?: string;
  venue?: string;
  fee?: string;
  maxCapacity?: number;
  isPublic?: boolean;
  status?: string;
}

export interface Invoice {
  id: number;
  organizationId: number;
  invoiceNumber: string;
  title: string;
  category: string;
  amount: string;
  dueDate: string;
  status: 'paid' | 'due' | 'overdue' | 'partially_paid';
  memberId?: number;
  memberName?: string;
  memberPhone?: string;
  memberWhatsApp?: string;
}

export interface Payment {
  id: number;
  organizationId: number;
  invoiceId?: number;
  memberId?: number;
  receiptNumber: string;
  amount: string;
  paymentMethod: string;
  paymentDate: string;
  notes?: string;
  memberName?: string;
  memberCode?: string;
  invoiceNumber?: string;
}

export interface Expense {
  id: number;
  organizationId: number;
  title: string;
  category: string;
  amount: string;
  expenseDate: string;
  paidTo?: string;
  description?: string;
}

export interface Donation {
  id: number;
  organizationId: number;
  branchId?: number;
  donorName: string;
  donorPhone?: string;
  donorEmail?: string;
  donorPan?: string;
  donorAddress?: string;
  amount: string;
  paymentMethod: string;
  donationDate: string;
  cause: string;
  receiptNumber: string;
  taxExemption80G: boolean;
  certificate80GNumber?: string;
  isAnonymous?: boolean;
  notes?: string;
  createdAt?: string;
}

export interface EquipmentItem {
  id: number;
  organizationId: number;
  name: string;
  category: string;
  quantity: number;
  availableQuantity: number;
  condition: string;
  location?: string;
}

export interface Lead {
  id: number;
  organizationId: number;
  fullName: string;
  phone: string;
  email?: string;
  interestedSport?: string;
  interestedProgram?: string;
  age?: number;
  source: string;
  status: 'new' | 'under_review' | 'approved' | 'rejected' | 'converted';
  notes?: string;
  createdAt?: string;
}

export interface Certificate {
  id: number;
  organizationId: number;
  recipientName: string;
  certificateType: string;
  title: string;
  sportOrProgram?: string;
  issueDate: string;
  verificationToken: string;
  verifiedCount: number;
  orgName?: string;
  orgLogo?: string;
}

export interface WhatsAppTemplate {
  id: number;
  name: string;
  category: string;
  content: string;
  variables?: string[];
}

export interface WhatsAppMessage {
  id: number;
  recipientPhone: string;
  recipientName: string;
  messageType: string;
  content: string;
  status: string;
  optInVerified?: boolean;
  sentAt?: string;
}

export interface Subscription {
  id: number;
  planName: string;
  status: string;
  monthlyFee: string;
  memberLimit: number;
  sportLimit: number;
  branchLimit: number;
  renewalDate?: string;
}

export interface DashboardStats {
  memberCount: number;
  sportsCount: number;
  programsCount: number;
  coachesCount: number;
  teamsCount: number;
  sessionsCount: number;
  pendingFees: number;
  totalCollected: number;
}

