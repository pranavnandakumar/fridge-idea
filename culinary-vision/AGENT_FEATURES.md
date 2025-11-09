# Cooking Assistant Agent - Agentic AI Features

## Overview

This application now includes an **Intelligent Cooking Assistant Agent** powered by Google Gemini that demonstrates **Agentic Intelligence** capabilities. The agent can reason, plan, and execute complex cooking-related tasks autonomously.

## Agentic Features

### 1. **Multi-Step Reasoning**
The agent analyzes user requests and decides when to use tools vs. providing direct responses. It reasons through:
- Understanding user intent
- Selecting appropriate tools
- Executing tools with correct parameters
- Synthesizing results into helpful responses

### 2. **Tool-Based Agent System**
The agent has access to 6 specialized tools:

#### 🛒 **Shopping List Generator**
- Generates categorized shopping lists from recipes
- Excludes already available ingredients
- Provides cost estimates and store suggestions
- Marks optional items

#### 🔄 **Ingredient Substitution Finder**
- Finds alternatives for dietary restrictions
- Handles allergies and availability issues
- Provides context-aware substitutions
- Explains why substitutions work

#### ✏️ **Recipe Modifier**
- Modifies recipes for dietary preferences
- Handles vegan, vegetarian, gluten-free, etc.
- Adjusts spice levels and servings
- Maintains flavor and quality

#### 📅 **Meal Planner**
- Creates multi-day meal plans
- Schedules recipes across meals
- Provides prep notes and timing
- Optimizes for efficiency

#### 💡 **Cooking Tips & Troubleshooting**
- Provides step-by-step cooking tips
- Offers troubleshooting advice
- Explains techniques and best practices
- Context-aware guidance

#### 📊 **Nutrition Calculator**
- Estimates nutritional information
- Calculates per-serving values
- Provides macro and micronutrient data

### 3. **Autonomous Decision Making**
The agent autonomously:
- Decides which tools to use based on user requests
- Extracts required parameters from context
- Handles errors and provides fallbacks
- Maintains conversation context

### 4. **Context Awareness**
The agent maintains awareness of:
- Available recipes from the culinary plan
- Ingredients already identified
- User conversation history
- Recipe details and steps

## Technical Implementation

### Architecture
- **Agent Service** (`services/cookingAgent.ts`): Core agent logic with tool execution
- **Agent Component** (`components/CookingAgent.tsx`): Conversational UI
- **Type Definitions** (`types.ts`): Agent message and tool result types

### Agent Workflow
1. User sends a message
2. Agent analyzes request using Gemini 2.5 Flash
3. Agent decides if a tool is needed (structured JSON output)
4. If tool needed:
   - Executes tool with context-aware parameters
   - Gets results from tool
   - Synthesizes results into natural language response
5. Returns response to user

### Key Technologies
- **Google Gemini 2.5 Flash**: For reasoning and tool selection
- **Structured Output**: JSON schema for reliable tool selection
- **Context Management**: Maintains recipe and ingredient context
- **Error Handling**: Graceful fallbacks for tool failures

## Usage Examples

### Example 1: Shopping List
**User**: "Create a shopping list for these recipes"
**Agent**: 
1. Identifies `generate_shopping_list` tool
2. Extracts recipes from context
3. Generates categorized shopping list
4. Returns formatted list with cost estimate

### Example 2: Dietary Modification
**User**: "Make this recipe vegan"
**Agent**:
1. Identifies `modify_recipe` tool
2. Applies vegan modifications
3. Substitutes ingredients
4. Returns modified recipe

### Example 3: Meal Planning
**User**: "Plan meals for the next 3 days"
**Agent**:
1. Identifies `create_meal_plan` tool
2. Distributes recipes across days
3. Creates schedule with prep notes
4. Returns comprehensive meal plan

## Competitive Advantages

### For Hackathon Judging

1. **Agentic Intelligence** ✅
   - Demonstrates autonomous reasoning
   - Multi-step task execution
   - Tool-based decision making

2. **Real-World Utility** ✅
   - Practical cooking assistance
   - Saves time with shopping lists
   - Handles dietary restrictions
   - Meal planning capabilities

3. **Advanced AI Integration** ✅
   - Uses Gemini 2.5 Flash for reasoning
   - Structured output for reliability
   - Context-aware responses
   - Error handling and fallbacks

4. **User Experience** ✅
   - Conversational interface
   - Visual tool result display
   - Real-time responses
   - Helpful suggestions

## Future Enhancements

Potential additions for even more agentic capabilities:
- Multi-agent collaboration (shopping agent + cooking agent)
- Integration with grocery delivery APIs
- Real-time cooking guidance during preparation
- Recipe recommendation based on preferences
- Inventory management and tracking

## How to Use

1. Upload an image of ingredients
2. Wait for recipe generation
3. Click "AI Assistant" button on any recipe
4. Chat with the agent about your recipes
5. Ask for shopping lists, substitutions, modifications, etc.

The agent will autonomously decide which tools to use and provide helpful responses!

