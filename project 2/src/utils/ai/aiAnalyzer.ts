import { TenderContract, ClientProfile } from '../../types';
import { openai } from './openaiClient';
import { generateMatchAnalysisPrompt } from './aiPrompts';

interface AIAnalysisResult {
  score: number;
  reasons: string[];
}

let currentController: AbortController | null = null;

export function cancelPendingRequests() {
  if (currentController) {
    currentController.abort();
    currentController = null;
  }
}

export async function analyzeMatchWithAI(
  tender: TenderContract,
  client: ClientProfile
): Promise<AIAnalysisResult> {
  try {
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    // Cancel any existing request
    cancelPendingRequests();
    
    // Create new controller for this request
    currentController = new AbortController();

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert in analyzing tender opportunities and matching them with business profiles. Provide a concise analysis focusing on key matching criteria. Format your responses as clear statements without prefixes or special formatting."
        },
        {
          role: "user",
          content: generateMatchAnalysisPrompt(tender, client)
        }
      ],
      temperature: 0.2,
      max_tokens: 500
    }, { signal: currentController.signal });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response content from AI');
    }

    return parseAIResponse(content);
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Analysis cancelled');
    }
    
    const errorMessage = error.message || 'Unknown error occurred';
    console.error('AI analysis failed:', { error: errorMessage });
    
    // Return a fallback result instead of throwing
    return {
      score: 0.5,
      reasons: [`Unable to complete analysis: ${errorMessage}`]
    };
  } finally {
    currentController = null;
  }
}

function parseAIResponse(content: string): AIAnalysisResult {
  try {
    const scoreMatch = content.match(/score: (0\.\d+)/i);
    const score = scoreMatch ? parseFloat(scoreMatch[1]) : 0.5;

    // Extract reasons, removing any asterisks and "AI Analysis:" prefixes
    const reasons = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.toLowerCase().includes('score:'))
      .map(line => line.replace(/^\*+\s*|\*+\s*$|^-\s*|^AI Analysis:\s*/gi, '').trim())
      .filter(reason => reason.length > 0)
      .slice(0, 3);

    return {
      score: Math.max(0, Math.min(1, score)),
      reasons: reasons.length > 0 ? reasons : ['Analysis completed']
    };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return {
      score: 0.5,
      reasons: ['Error parsing analysis response']
    };
  }
}