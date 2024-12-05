export interface TenderContract {
  title: string;
  noticeUrl: string;
  value: number;
  deadline: string;
  buyer: string;
  description: string;
  cpvLevel1: string;
  cpvLevel2: string;
  region: string;
}

export interface ClientProfile {
  id: string;
  businessName: string;
  keywords: string[];
  preferredLocation: string;
  preferredContractValue: number;
  preferredCPVs: string[];
  additionalPreferences: string;
}

export interface MatchResult {
  tender: TenderContract;
  client: ClientProfile;
  matchScore: number;
  matchReasons: string[];
}