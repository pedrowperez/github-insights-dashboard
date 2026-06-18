export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface UserSearchItem {
  id: number;
  login: string;
  avatarUrl: string;
  htmlUrl: string;
  type: string;
}

export interface UserSearchResult {
  totalCount: number;
  items: UserSearchItem[];
}

export interface LanguageStat {
  language: string;
  count: number;
}

export interface TopRepo {
  id: number;
  name: string;
  htmlUrl: string;
  description: string | null;
  stars: number;
  forks: number;
  language: string | null;
}

export interface UserProfileResponse {
  profile: {
    id: number;
    login: string;
    name: string | null;
    avatarUrl: string;
    htmlUrl: string;
    bio: string | null;
    company: string | null;
    location: string | null;
    blog: string | null;
    followers: number;
    following: number;
    publicRepos: number;
    createdAt: string;
  };
  stats: {
    totalStars: number;
    totalForks: number;
    reposAnalyzed: number;
  };
  languages: LanguageStat[];
  topRepos: TopRepo[];
}

export interface RepoSearchItem {
  id: number;
  fullName: string;
  name: string;
  owner: string;
  ownerAvatar: string;
  htmlUrl: string;
  description: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  language: string | null;
  updatedAt: string;
}

export interface RepoSearchResult {
  totalCount: number;
  items: RepoSearchItem[];
}
