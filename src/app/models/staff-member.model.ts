export interface StaffTerm {
  role: string;
  department?: string;
  bylaw?: string;
  termStartYear?: number;
  termEndYear?: number;
  isCurrent?: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  department?: string;
  bylaw?: string;
  termStartYear?: number;
  termEndYear?: number;
  email?: string;
  phone?: string;
  photoUrl?: string;
  bio?: string;
  terms?: StaffTerm[];
}
