import { GoogleGenAI, Type } from '@google/genai';
import type { CulinaryPlan, Recipe, Storyboard } from '../types';

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const CULINARY_PLAN_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    ingredients: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Lowercase, singular ingredient names identified from the image."
    },
    recipes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Fun & catchy, <= 6 words" },
          time_minutes: { type: Type.INTEGER, description: "<= 25" },
          difficulty: { type: Type.STRING, description: "Should be 'easy'" },
          steps: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "5–8 short steps, imperative tense, <= 12 words"
          },
          missing_items: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "0-2 optional extras"
          }
        },
        required: ["title", "time_minutes", "difficulty", "steps", "missing_items"]
      }
    },
    storyboard: {
      type: Type.OBJECT,
      properties: {
        hook: { type: Type.STRING, description: "One-sentence attention grabber" },
        voiceover_script: { type: Type.STRING, description: "Natural narration for 10-second video, ~30-40 words" },
        video_description: { type: Type.STRING, description: "Detailed description of the 10-second cooking video, covering key steps and visual elements" },
        caption: { type: Type.STRING, description: "Main on-screen text/caption for the video" }
      },
      required: ["hook", "voiceover_script", "video_description", "caption"]
    },
  },
  required: ["ingredients", "recipes", "storyboard"]
};

const ensureApiKey = async (): Promise<string> => {
    // This function ensures an API key is available for Veo, prompting the user if necessary.
    if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        let hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
            await window.aistudio.openSelectKey();
        }
        // After the dialog, process.env.API_KEY should be populated.
        // We throw an error if it's still missing, preventing the app from hanging.
        if (process.env.API_KEY) {
            return process.env.API_KEY;
        } else {
            throw new Error("API key selection was cancelled or failed. Please try again.");
        }
    } else if (process.env.API_KEY) {
        return process.env.API_KEY;
    }
    
    throw new Error("API key is not configured or could not be obtained.");
};


export const generateCulinaryPlan = async (imageFile: File): Promise<CulinaryPlan> => {
  // Use a default API key for text generation as it doesn't require the same setup as Veo.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const imagePart = await fileToGenerativePart(imageFile);

  const prompt = `You are a culinary assistant and short-form recipe video generator.
  
### STEP 1 — INGREDIENTS
Given the uploaded image, identify only edible ingredients. Ignore containers, brands, packaging text, and kitchen items.
Return ingredients as a JSON array of lowercase singular ingredient names.

### STEP 2 — RECIPE OPTIONS
Using only these ingredients plus basic pantry staples (salt, pepper, oil, water), propose 5 recipe ideas.
For each recipe, provide:
- title (fun & catchy, <= 6 words)
- time_minutes (<= 25)
- difficulty: "easy"
- steps: 5–8 short steps, each imperative tense and <= 12 words
- missing_items: at most 0–2 optional extras

### STEP 3 — STORYBOARD GENERATION (FOR THE FIRST RECIPE)
Take the FIRST recipe you listed and generate a single 10-second vertical video storyboard.
Provide:
- "hook": "One-sentence attention grabber, fun, casual"
- "voiceover_script": "Natural narration for 10-second video, ~30-40 words, casual like TikTok"
- "video_description": "Detailed description of the cooking video covering the key visual steps and actions that will happen in 10 seconds. Include transitions between steps."
- "caption": "Main on-screen text/caption that will appear during the video (keep it short and punchy)"

### OUTPUT FORMAT (IMPORTANT)
Return a single, valid JSON object matching the provided schema. Do not add explanations or commentary.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, {text: prompt}] },
    config: {
        responseMimeType: "application/json",
        responseSchema: CULINARY_PLAN_SCHEMA,
    }
  });

  const jsonText = response.text.trim();
  try {
    return JSON.parse(jsonText) as CulinaryPlan;
  } catch (e) {
    console.error("Failed to parse Gemini response as JSON:", jsonText);
    throw new Error("The AI returned an invalid response. This can happen with complex images. Please try a different image or try again.");
  }
};

export const generateRecipeVideos = async (
  storyboard: Storyboard, 
  recipe: Recipe, 
  onProgress?: (message: string) => void
): Promise<string[]> => {
  const apiKey = await ensureApiKey();
  
  onProgress?.(`Preparing to generate your 10-second cooking video...`);
  await new Promise(resolve => setTimeout(resolve, 1500)); 

  onProgress?.(`🎬 Creating video for: "${recipe.title}"`);

  // Build a comprehensive prompt for a 10-second video
  const videoPrompt = `A cinematic, high-quality cooking video, vertical 9:16 aspect ratio, exactly 10 seconds long. Recipe: "${recipe.title}". 

Video description: ${storyboard.video_description}

Key elements:
- Show the main cooking steps in a fast-paced, engaging way
- On-screen text: "${storyboard.caption}"
- Vertical format optimized for mobile viewing
- Minimalist, clean kitchen setting
- Smooth transitions between steps
- Close-up shots of ingredients and cooking actions
- Visual appeal and professional quality

Make it engaging and TikTok-style, showing the essence of the recipe in 10 seconds.`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    onProgress?.(`🎥 Generating your 10-second video... this can take a minute.`);
    
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: videoPrompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '9:16'
      }
    });
    
    let pollCount = 0;
    const maxPolls = 60; // 10 minutes max (60 * 10 seconds)
    
    while (!operation.done) {
      if (pollCount >= maxPolls) {
        throw new Error("Video generation is taking too long. Please try again with a simpler recipe or check your API quota.");
      }
      
      await new Promise(resolve => setTimeout(resolve, 10000));
      pollCount++;
      
      try {
        operation = await ai.operations.getVideosOperation({operation: operation});
        onProgress?.(`🎥 Video is rendering... (${pollCount * 10}s elapsed)`);
      } catch (pollError) {
        console.error('Error polling video operation:', pollError);
        throw new Error(`Failed to check video generation status: ${pollError instanceof Error ? pollError.message : 'Unknown error'}`);
      }
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      throw new Error(`Video generation failed.`);
    }

    onProgress?.('✨ Your video is ready!');
    return [`${downloadLink}&key=${apiKey}`];

  } catch (e) {
    // Log the full error for debugging
    console.error(`Error generating video:`, e);
    console.error('Error details:', JSON.stringify(e, null, 2));
    
    let errorBody: any = {};
    let errorMessage = 'Unknown error';
    let errorStatus = '';
    
    if (e instanceof Error) {
      errorMessage = e.message;
      try {
        // Try to parse if it's JSON
        errorBody = JSON.parse(e.message);
        errorStatus = errorBody?.error?.status || '';
        errorMessage = errorBody?.error?.message || e.message;
      } catch (parseError) {
        // Not JSON, use the message directly
        errorBody = { error: { message: e.message, status: '' } };
      }
    } else if (typeof e === 'object' && e !== null) {
      errorBody = e;
      errorStatus = (e as any)?.error?.status || (e as any)?.status || '';
      errorMessage = (e as any)?.error?.message || (e as any)?.message || JSON.stringify(e);
    } else {
      errorMessage = String(e);
    }

    const status = errorStatus.toLowerCase();
    const message = errorMessage.toLowerCase();

    // Handle 404 Not Found - Invalid API key or no Veo access
    if (status.includes("not_found") || message.includes("not found") || message.includes("404")) {
      throw new Error("Your API key is invalid or lacks Veo access. Please select a valid key and try again. For more info on billing, visit ai.google.dev/gemini-api/docs/billing.");
    }
    
    // Handle 429 Resource Exhausted - Quota exceeded
    if (status.includes("resource_exhausted") || message.includes("quota") || message.includes("429")) {
      throw new Error("You've exceeded your video generation quota. Please check your plan and billing details. For more info, visit ai.google.dev/gemini-api/docs/rate-limits.");
    }
    
    // Handle permission denied / leaked API key
    if (status.includes("permission_denied") || message.includes("permission denied") || message.includes("403") || message.includes("leaked")) {
      throw new Error("Your API key was reported as leaked or doesn't have permission. Please get a new API key from https://ai.google.dev/ and update your .env.local file.");
    }
    
    // Provide more detailed error message if available
    const userFriendlyMessage = errorMessage.length > 200 
      ? `An unexpected error occurred: ${errorMessage.substring(0, 200)}...` 
      : `An unexpected error occurred: ${errorMessage}`;
    
    throw new Error(userFriendlyMessage + " Please try again. If the issue persists, check your API key and Veo access.");
  }
};