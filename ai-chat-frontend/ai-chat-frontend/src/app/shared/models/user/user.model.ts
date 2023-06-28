export interface ApplicationUser {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  initials: string;
  email: string;
  isAdmin: boolean;
  emailVerified: boolean;
  roles: string[];
}
