import { TenderContract, ClientProfile, MatchResult } from '../types';
import { analyzeMatchWithAI } from './ai/aiAnalyzer';
import { calculateBaseScore } from './scoreCalculator';
import { MatchCriteria } from './matchCriteria';

const BATCH_SIZE = 3;
const AI_ANALYSIS_THRESHOLD = 0.6;
const PROGRESS_UPDATE_INTERVAL = 50;

export function getSuitabilityLabel(score: number): string {
  if (score >= 0.9) return 'Highly Suitable';
  if (score >= 0.6) return 'Potentially Suitable';
  return 'Not Suitable';
}

export async function matchTendersWithClients(
  tenders: TenderContract[],
  clients: ClientProfile[],
  onProgress: (progress: number) => void,
  shouldStop: () => boolean
): Promise<MatchResult[]> {
  console.log(`Starting matching process with ${tenders.length} tenders and ${clients.length} clients`);
  
  const results: MatchResult[] = [];
  const totalOperations = tenders.length * clients.length;
  let completedOperations = 0;
  let lastProgressUpdate = Date.now();

  try {
    for (let i = 0; i < tenders.length; i += BATCH_SIZE) {
      if (shouldStop()) {
        console.log('Matching process stopped by user');
        return results;
      }

      const batchTenders = tenders.slice(i, i + BATCH_SIZE);
      const batchPromises: Promise<MatchResult[]>[] = [];

      for (const tender of batchTenders) {
        if (shouldStop()) {
          return results;
        }

        const tenderPromises = clients.map(async (client) => {
          if (shouldStop()) {
            return [];
          }

          const { matchScore, matchReasons } = calculateBaseScore(tender, client);
          completedOperations++;

          const now = Date.now();
          if (now - lastProgressUpdate >= PROGRESS_UPDATE_INTERVAL) {
            onProgress(completedOperations / totalOperations);
            lastProgressUpdate = now;
          }

          if (matchScore >= MatchCriteria.MIN_SCORE_THRESHOLD) {
            console.log(`Found potential match: ${tender.title} -> ${client.businessName} (Score: ${matchScore})`);
            
            if (matchScore >= AI_ANALYSIS_THRESHOLD && !shouldStop()) {
              try {
                const aiAnalysis = await analyzeMatchWithAI(tender, client);
                const combinedScore = (matchScore + aiAnalysis.score) / 2;
                return [{
                  tender,
                  client,
                  matchScore: combinedScore,
                  matchReasons: [
                    ...matchReasons,
                    ...aiAnalysis.reasons.map(reason => `AI Analysis: ${reason}`)
                  ]
                }];
              } catch (error) {
                console.error('AI analysis failed:', error);
                return [{
                  tender,
                  client,
                  matchScore,
                  matchReasons: [...matchReasons]
                }];
              }
            } else {
              return [{
                tender,
                client,
                matchScore,
                matchReasons
              }];
            }
          }
          return [];
        });

        batchPromises.push(Promise.all(tenderPromises).then(results => results.flat()));
      }

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.flat());

      await new Promise(resolve => setTimeout(resolve, 10));
    }

    const sortedResults = results.sort((a, b) => b.matchScore - a.matchScore);
    console.log(`Matching process completed. Found ${sortedResults.length} matches`);
    return sortedResults;
  } catch (error) {
    console.error('Error during matching process:', error);
    return results;
  }
}