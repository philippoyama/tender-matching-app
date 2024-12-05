import { TenderContract, ClientProfile } from '../../types';

export function generateMatchAnalysisPrompt(tender: TenderContract, client: ClientProfile): string {
  return `
Analyze this tender opportunity for client match. Focus on specific requirements and expertise alignment:

TENDER DETAILS:
Title: ${tender.title}
Description: ${tender.description}
Value: ${tender.value > 0 ? `£${tender.value.toLocaleString()}` : 'Not stated'}
Region: ${tender.region}

CLIENT EXPERTISE:
Business: ${client.businessName}
Key Services/Expertise: ${client.keywords.join(', ')}
Preferred Location: ${client.preferredLocation}
Additional Preferences: ${client.additionalPreferences}

Analysis Instructions:
Evaluation Criteria:
1. Requirements Analysis (40% weight)
   - Identify explicit technical requirements
   - Map requirements to client's core services
   - Evaluate complexity alignment with client capabilities

2. Geographic & Commercial Fit (30% weight)
   - Calculate distance from client's preferred regions
   - Assess contract value against client's optimal range
   - Evaluate resource availability in target region

3. Strategic Alignment (30% weight)
   - Compare sector alignment with client's experience
   - Assess contract duration feasibility
   - Evaluate competitive positioning

Output Requirements:

1. Numeric Assessment:
   score: [0-1 with precision to 2 decimal places]
   Calculate using weighted criteria:
   - 0.95-1.00: Exceptional match across all criteria
   - 0.80-0.94: Strong match with minor gaps
   - 0.60-0.79: Moderate match with notable considerations
   - Below 0.60: Limited alignment

2. Match Analysis:
   Provide 3 specific evidence-based statements addressing:
   - Direct keyword matches between requirements and expertise (use exact quotes)
   - Quantified geographic and commercial alignment
   - Strategic considerations including risks and advantages

3. Critical Factors:
   Identify any decisive elements that significantly influenced the score, such as:
   - Mandatory requirements alignment
   - Regulatory or certification requirements
   - Resource allocation conflicts
   - Timeline feasibility

Response Format:
[Score]
[Three analysis statements with specific evidence]
[Critical qualifying or disqualifying factors]

Note: All statements must reference specific content from the tender or client profile. Avoid generic assessments.
`;
}