export interface StaffMember {
  id: string;
  name: string;
  role: string;
  department?: string;
  bylaw?: string;
  termStartYear?: number;
  termEndYear?: number;
  email?: string;
  photoUrl?: string;
  bio?: string;
}
