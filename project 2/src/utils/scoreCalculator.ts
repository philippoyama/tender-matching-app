import { TenderContract, ClientProfile } from '../types';
import { MatchCriteria } from './matchCriteria';

interface ScoreResult {
  matchScore: number;
  matchReasons: string[];
}

export function calculateBaseScore(
  tender: TenderContract,
  client: ClientProfile
): ScoreResult {
  const matchReasons: string[] = [];
  let totalScore = 0;
  let weightSum = 0;

  // Description match (80% weight)
  const { score: descriptionScore, matches: keywordMatches } = calculateDetailedKeywordMatch(
    tender.description + ' ' + tender.title, // Include title in keyword matching
    client.keywords
  );
  
  if (descriptionScore > 0) {
    totalScore += descriptionScore * MatchCriteria.DESCRIPTION_WEIGHT;
    if (keywordMatches.length > 0) {
      matchReasons.push(`Found expertise matches: ${keywordMatches.join(', ')}`);
    }
  }
  weightSum += MatchCriteria.DESCRIPTION_WEIGHT;

  // Location match (10% weight)
  const locationScore = calculateLocationMatch(tender.region, client.preferredLocation);
  if (locationScore > 0) {
    totalScore += locationScore * MatchCriteria.LOCATION_WEIGHT;
    matchReasons.push(`Location match: ${tender.region} aligns with preferred location ${client.preferredLocation}`);
  }
  weightSum += MatchCriteria.LOCATION_WEIGHT;

  // Value match (10% weight)
  if (isValueMatch(tender.value, client.preferredContractValue)) {
    totalScore += MatchCriteria.VALUE_WEIGHT;
    matchReasons.push(
      tender.value > 0
        ? `Contract value £${tender.value.toLocaleString()} matches preferred value`
        : 'Contract value not specified - considered compatible'
    );
  }
  weightSum += MatchCriteria.VALUE_WEIGHT;

  // CPV code match (bonus points)
  if (client.preferredCPVs.length > 0) {
    const cpvMatch = client.preferredCPVs.some(cpv => 
      tender.cpvLevel1.includes(cpv) || tender.cpvLevel2.includes(cpv)
    );
    if (cpvMatch) {
      totalScore += 0.1; // Bonus points for CPV match
      matchReasons.push('CPV code matches client preferences');
    }
  }

  // Normalize score
  const normalizedScore = weightSum > 0 ? Math.min(1, totalScore / weightSum) : 0;

  return {
    matchScore: normalizedScore,
    matchReasons: matchReasons.length > 0 ? matchReasons : ['No specific matches found']
  };
}

function calculateDetailedKeywordMatch(text: string, keywords: string[]): { score: number; matches: string[] } {
  const lowerText = text.toLowerCase();
  const matches = keywords.filter(keyword => {
    const keywordLower = keyword.toLowerCase().trim();
    if (!keywordLower) return false;
    
    // Check for exact word matches using word boundaries
    const regex = new RegExp(`\\b${keywordLower}\\b|\\b${keywordLower}s\\b|\\b${keywordLower}ing\\b`, 'i');
    return regex.test(lowerText);
  });

  // Calculate score based on matches and their context
  const score = matches.length / Math.max(1, keywords.length);
  
  return {
    score: Math.min(1, score), // Cap score at 1
    matches
  };
}

function calculateLocationMatch(tenderRegion: string, preferredLocation: string): number {
  if (!tenderRegion || !preferredLocation) return 0;
  
  const tenderLower = tenderRegion.toLowerCase().trim();
  const preferredLower = preferredLocation.toLowerCase().trim();

  // Check for "UK Wide" or similar variations
  if (preferredLower.includes('uk wide') || preferredLower.includes('nationwide')) {
    return 1;
  }

  // Check for region match
  if (tenderLower.includes(preferredLower) || preferredLower.includes(tenderLower)) {
    return 1;
  }

  return 0;
}

function isValueMatch(tenderValue: number, preferredValue: number): boolean {
  if (tenderValue === 0 || preferredValue === 0) return true; // Don't penalize if value is not stated
  // Allow for 30% variation from preferred value
  const lowerBound = preferredValue * 0.7;
  const upperBound = preferredValue * 1.3;
  return tenderValue >= lowerBound && tenderValue <= upperBound;
}