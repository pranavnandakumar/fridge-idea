import { GoogleGenAI } from '@google/genai';
import type { Recipe, ShoppingList, MealPlan, Substitution, AgentMessage, AgentToolResult } from '../types';

const ensureApiKey = async (): Promise<string> => {
  if (process.env.GEMINI_API_KEY || process.env.API_KEY) {
    return process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  }
  throw new Error("API key is not configured. Please set GEMINI_API_KEY in your .env.local file.");
};

// Tool definitions for the agent
const AGENT_TOOLS = [
  {
    name: 'generate_shopping_list',
    description: 'Generate a comprehensive shopping list for one or more recipes. Organizes items by category and indicates optional items.',
    parameters: {
      type: 'object',
      properties: {
        recipes: {
          type: 'array',
          items: { type: 'object' },
          description: 'Array of recipe objects to generate shopping list for'
        },
        includeOptional: {
          type: 'boolean',
          description: 'Whether to include optional items in the shopping list'
        }
      },
      required: ['recipes']
    }
  },
  {
    name: 'find_substitutions',
    description: 'Find ingredient substitutions for dietary restrictions, allergies, or availability issues.',
    parameters: {
      type: 'object',
      properties: {
        ingredient: {
          type: 'string',
          description: 'The ingredient to find substitutions for'
        },
        reason: {
          type: 'string',
          description: 'Reason for substitution (e.g., "vegan", "allergy", "not available")'
        },
        recipeContext: {
          type: 'string',
          description: 'Context about the recipe to help suggest appropriate substitutions'
        }
      },
      required: ['ingredient', 'reason']
    }
  },
  {
    name: 'modify_recipe',
    description: 'Modify a recipe based on user preferences, dietary restrictions, or ingredient availability.',
    parameters: {
      type: 'object',
      properties: {
        recipe: {
          type: 'object',
          description: 'The original recipe to modify'
        },
        modifications: {
          type: 'object',
          description: 'Requested modifications (e.g., { dietaryRestriction: "vegan", spiceLevel: "mild", servings: 4 })'
        }
      },
      required: ['recipe', 'modifications']
    }
  },
  {
    name: 'create_meal_plan',
    description: 'Create a meal plan with multiple recipes, scheduling, and prep notes.',
    parameters: {
      type: 'object',
      properties: {
        recipes: {
          type: 'array',
          items: { type: 'object' },
          description: 'Array of recipes to include in the meal plan'
        },
        days: {
          type: 'number',
          description: 'Number of days to plan for'
        },
        preferences: {
          type: 'object',
          description: 'User preferences for meal planning'
        }
      },
      required: ['recipes', 'days']
    }
  },
  {
    name: 'get_cooking_tips',
    description: 'Get cooking tips, techniques, and troubleshooting advice for a recipe.',
    parameters: {
      type: 'object',
      properties: {
        recipe: {
          type: 'object',
          description: 'The recipe to get tips for'
        },
        step: {
          type: 'number',
          description: 'Specific step number to get tips for (optional)'
        }
      },
      required: ['recipe']
    }
  },
  {
    name: 'calculate_nutrition',
    description: 'Calculate nutritional information for a recipe.',
    parameters: {
      type: 'object',
      properties: {
        recipe: {
          type: 'object',
          description: 'The recipe to calculate nutrition for'
        },
        servings: {
          type: 'number',
          description: 'Number of servings'
        }
      },
      required: ['recipe']
    }
  }
];

// Tool execution functions
const executeTool = async (toolName: string, args: any, context: { recipes: Recipe[], ingredients: string[] }): Promise<AgentToolResult> => {
  try {
    switch (toolName) {
      case 'generate_shopping_list':
        return {
          toolName,
          success: true,
          result: await generateShoppingList(args.recipes, args.includeOptional, context.ingredients)
        };
      
      case 'find_substitutions':
        return {
          toolName,
          success: true,
          result: await findSubstitutions(args.ingredient, args.reason, args.recipeContext)
        };
      
      case 'modify_recipe':
        return {
          toolName,
          success: true,
          result: await modifyRecipe(args.recipe, args.modifications)
        };
      
      case 'create_meal_plan':
        return {
          toolName,
          success: true,
          result: await createMealPlan(args.recipes, args.days, args.preferences)
        };
      
      case 'get_cooking_tips':
        return {
          toolName,
          success: true,
          result: await getCookingTips(args.recipe, args.step)
        };
      
      case 'calculate_nutrition':
        return {
          toolName,
          success: true,
          result: await calculateNutrition(args.recipe, args.servings)
        };
      
      default:
        return {
          toolName,
          success: false,
          result: null,
          error: `Unknown tool: ${toolName}`
        };
    }
  } catch (error) {
    return {
      toolName,
      success: false,
      result: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Tool implementations using Gemini
const generateShoppingList = async (recipes: Recipe[], includeOptional: boolean = true, availableIngredients: string[]): Promise<ShoppingList> => {
  const apiKey = await ensureApiKey();
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `Generate a shopping list for the following recipes. 
  
Recipes:
${JSON.stringify(recipes, null, 2)}

Available ingredients (don't include these): ${availableIngredients.join(', ')}

Create a categorized shopping list. For each item, provide:
- name: ingredient name
- quantity: amount needed (e.g., "2 cups", "1 lb")
- category: one of: produce, dairy, meat, pantry, spices, other
- optional: true if it's an optional/extra ingredient

${includeOptional ? 'Include optional items.' : 'Exclude optional items.'}

Return a JSON object with this structure:
{
  "items": [
    {"name": "...", "quantity": "...", "category": "...", "optional": false}
  ],
  "totalEstimatedCost": "estimated cost in USD",
  "stores": ["suggested stores"]
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [{ text: prompt }] },
    config: {
      responseMimeType: 'application/json'
    }
  });

  return JSON.parse(response.text);
};

const findSubstitutions = async (ingredient: string, reason: string, recipeContext?: string): Promise<Substitution> => {
  const apiKey = await ensureApiKey();
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `Find substitutions for the ingredient "${ingredient}" in the context of: ${reason}.

${recipeContext ? `Recipe context: ${recipeContext}` : ''}

Provide 3-5 alternative ingredients that can be used. For each alternative, explain why it works as a substitution.

Return JSON:
{
  "original": "${ingredient}",
  "alternatives": ["alternative1", "alternative2", ...],
  "reason": "explanation of why these work as substitutions"
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [{ text: prompt }] },
    config: {
      responseMimeType: 'application/json'
    }
  });

  return JSON.parse(response.text);
};

const modifyRecipe = async (recipe: Recipe, modifications: any): Promise<Recipe> => {
  const apiKey = await ensureApiKey();
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `Modify the following recipe based on these requirements:
${JSON.stringify(modifications, null, 2)}

Original recipe:
${JSON.stringify(recipe, null, 2)}

Modify the recipe to accommodate these requirements while maintaining flavor and quality. Update the steps, ingredients, and cooking instructions accordingly.

Return the modified recipe as JSON with the same structure as the original.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [{ text: prompt }] },
    config: {
      responseMimeType: 'application/json'
    }
  });

  return JSON.parse(response.text);
};

const createMealPlan = async (recipes: Recipe[], days: number, preferences?: any): Promise<MealPlan> => {
  const apiKey = await ensureApiKey();
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `Create a ${days}-day meal plan using these recipes:
${JSON.stringify(recipes, null, 2)}

${preferences ? `Preferences: ${JSON.stringify(preferences, null, 2)}` : ''}

Create a schedule that distributes the recipes across meals. Include prep notes and estimated total time.

Return JSON:
{
  "recipes": [...],
  "schedule": [
    {"day": "Monday", "meal": "dinner", "recipe": {...}, "prepTime": 30}
  ],
  "prepNotes": ["prep note 1", ...],
  "estimatedTotalTime": 120
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [{ text: prompt }] },
    config: {
      responseMimeType: 'application/json'
    }
  });

  return JSON.parse(response.text);
};

const getCookingTips = async (recipe: Recipe, step?: number): Promise<{ tips: string[], troubleshooting: string[] }> => {
  const apiKey = await ensureApiKey();
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `Provide cooking tips and troubleshooting advice for this recipe:
${JSON.stringify(recipe, null, 2)}

${step ? `Focus on step ${step}.` : 'Provide general tips for the entire recipe.'}

Return JSON:
{
  "tips": ["tip 1", "tip 2", ...],
  "troubleshooting": ["common issue 1 and solution", ...]
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [{ text: prompt }] },
    config: {
      responseMimeType: 'application/json'
    }
  });

  return JSON.parse(response.text);
};

const calculateNutrition = async (recipe: Recipe, servings: number = 1): Promise<any> => {
  const apiKey = await ensureApiKey();
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `Estimate nutritional information for this recipe:
${JSON.stringify(recipe, null, 2)}

Servings: ${servings}

Provide estimated nutritional values per serving. Return JSON:
{
  "calories": 250,
  "protein": "15g",
  "carbs": "30g",
  "fat": "8g",
  "fiber": "5g",
  "sodium": "500mg"
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [{ text: prompt }] },
    config: {
      responseMimeType: 'application/json'
    }
  });

  return JSON.parse(response.text);
};

// Main agent conversation handler
export interface AgentContext {
  recipes: Recipe[];
  ingredients: string[];
  culinaryPlan?: any;
}

export const chatWithCookingAgent = async (
  message: string,
  context: AgentContext,
  conversationHistory: AgentMessage[] = []
): Promise<{ response: string; toolResults?: AgentToolResult[]; updatedContext?: AgentContext }> => {
  const apiKey = await ensureApiKey();
  const ai = new GoogleGenAI({ apiKey });

  // Build system prompt
  const systemPrompt = `You are an intelligent Cooking Assistant Agent. You help users with recipes, meal planning, shopping, and cooking guidance.

Available context:
- Recipes: ${JSON.stringify(context.recipes, null, 2)}
- Available ingredients: ${context.ingredients.join(', ')}

You have access to these tools:
${AGENT_TOOLS.map(tool => `- ${tool.name}: ${tool.description}`).join('\n')}

When the user asks for something that requires a tool, you should call the appropriate tool. Be helpful, friendly, and proactive in suggesting ways to help the user.`;

  // Build conversation history (limit to last 10 messages to avoid token limits)
  const recentHistory = conversationHistory.slice(-10);
  
  const messages: any[] = [];
  
  // Add system context as first message
  messages.push({
    role: 'user',
    parts: [{ text: systemPrompt }]
  });
  
  messages.push({
    role: 'model',
    parts: [{ text: 'I understand. I\'m your Cooking Assistant Agent. How can I help you with your recipes today?' }]
  });

  // Add recent conversation history (skip the initial greeting if it exists)
  recentHistory.forEach((msg, idx) => {
    // Skip the first assistant message if it's the greeting
    if (idx === 0 && msg.role === 'assistant' && msg.content.includes('Cooking Assistant Agent')) {
      return;
    }
    messages.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    });
  });

  // Add current user message
  messages.push({
    role: 'user',
    parts: [{ text: message }]
  });

  try {
    // Enhanced prompt for tool selection
    const toolDescriptions = AGENT_TOOLS.map(tool => 
      `${tool.name}: ${tool.description}\n  Parameters: ${JSON.stringify(tool.parameters)}`
    ).join('\n\n');

    const actionPrompt = `User asked: "${message}"

Available tools:
${toolDescriptions}

Analyze the user's request and determine the best course of action. If a tool would be helpful, use it. Otherwise, provide a direct helpful response.

Respond with JSON only:
{
  "needsTool": true/false,
  "toolName": "tool_name (if needsTool is true)",
  "toolArgs": { ... } (if needsTool is true, include all required parameters),
  "response": "your response (if needsTool is false)"
}

Important: 
- For shopping lists, toolArgs should include: { "recipes": [...], "includeOptional": true/false }
- For substitutions, toolArgs should include: { "ingredient": "...", "reason": "...", "recipeContext": "..." }
- For modifications, toolArgs should include: { "recipe": {...}, "modifications": {...} }
- For meal plans, toolArgs should include: { "recipes": [...], "days": number, "preferences": {...} }
- For cooking tips, toolArgs should include: { "recipe": {...}, "step": number (optional) }
- For nutrition, toolArgs should include: { "recipe": {...}, "servings": number }`;

    const actionMessages = [...messages];
    actionMessages[actionMessages.length - 1] = {
      role: 'user',
      parts: [{ text: actionPrompt }]
    };

    const actionResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: actionMessages,
      config: {
        responseMimeType: 'application/json'
      }
    });

    let action: any;
    try {
      const responseText = actionResponse.text.trim();
      // Try to extract JSON if it's wrapped in markdown code blocks
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || responseText.match(/```\s*([\s\S]*?)\s*```/);
      action = JSON.parse(jsonMatch ? jsonMatch[1] : responseText);
    } catch (parseError) {
      // If parsing fails, assume no tool is needed
      console.warn('Failed to parse agent action, defaulting to direct response:', parseError);
      action = {
        needsTool: false,
        response: actionResponse.text
      };
    }

    if (action.needsTool && action.toolName) {
      // Prepare tool args - ensure recipes are included from context if needed
      let toolArgs = action.toolArgs || {};
      
      // If tool needs recipes but they're not in args, use context recipes
      if ((action.toolName === 'generate_shopping_list' || 
           action.toolName === 'create_meal_plan' || 
           action.toolName === 'modify_recipe') && 
          !toolArgs.recipes) {
        toolArgs.recipes = context.recipes;
      }
      
      // If tool needs a recipe but only recipe name/description provided, find it in context
      if ((action.toolName === 'get_cooking_tips' || 
           action.toolName === 'calculate_nutrition' || 
           action.toolName === 'modify_recipe') && 
          toolArgs.recipe && 
          typeof toolArgs.recipe === 'string') {
        // Try to find recipe by title
        const foundRecipe = context.recipes.find(r => 
          r.title.toLowerCase().includes(toolArgs.recipe.toLowerCase())
        );
        if (foundRecipe) {
          toolArgs.recipe = foundRecipe;
        } else {
          // Use first recipe as default
          toolArgs.recipe = context.recipes[0];
        }
      }
      
      // Execute the tool
      const toolResult = await executeTool(action.toolName, toolArgs, context);
      
      // Get final response with tool results
      const finalPrompt = `The user asked: "${message}"

I executed the tool "${action.toolName}" with these results:
${JSON.stringify(toolResult.result, null, 2)}

${toolResult.success ? '' : `Error: ${toolResult.error}`}

Now provide a helpful response to the user based on these results. Be conversational and helpful.`;

      const finalMessages = [...messages];
      finalMessages[finalMessages.length - 1] = {
        role: 'user',
        parts: [{ text: finalPrompt }]
      };

      const finalResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: finalMessages
      });

      return {
        response: finalResponse.text,
        toolResults: [toolResult],
        updatedContext: context
      };
    }

    // No tool needed, return direct response
    return {
      response: action.response || actionResponse.text
    };
  } catch (error) {
    console.error('Agent error:', error);
    // Fallback to simple response
    try {
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: messages
      });
      return {
        response: fallbackResponse.text
      };
    } catch (fallbackError) {
      return {
        response: `I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`
      };
    }
  }
};

