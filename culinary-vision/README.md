<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Culinary Vision - AI-Powered Recipe Video Generator

## 🚀 Features

### 🎬 Media Mastery
- **Veo 3.1 Video Generation**: Generate cinematic cooking videos from recipes
- **Gemini 2.5 Flash**: Advanced image analysis and recipe generation
- **Automated Storyboarding**: AI-generated video storyboards with timing

### 🤖 Agentic Intelligence (NEW!)
- **Intelligent Cooking Assistant Agent**: Autonomous AI agent that helps with cooking tasks
- **Multi-Tool System**: 6 specialized tools for shopping, substitutions, meal planning, and more
- **Autonomous Reasoning**: Agent decides when to use tools vs. providing direct responses
- **Context-Aware**: Maintains awareness of recipes, ingredients, and conversation history

### 🛠️ Agent Capabilities
- 🛒 Generate shopping lists
- 🔄 Find ingredient substitutions
- ✏️ Modify recipes (dietary restrictions, preferences)
- 📅 Create meal plans
- 💡 Get cooking tips and techniques
- 📊 Calculate nutrition information

**Learn more**: See [AGENT_FEATURES.md](./AGENT_FEATURES.md) for detailed agent capabilities.

View your app in AI Studio: https://ai.studio/apps/drive/1k0AMY0TAcRF9G9RK3s-T85so3R1lNSyY

## Run Locally

**Prerequisites:**  
- Node.js (v18 or higher recommended)
- A Google Gemini API key with Veo access

### Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up your API key:**
   - Get your Gemini API key from [https://ai.google.dev/](https://ai.google.dev/)
   - Create a `.env.local` file in the project root (copy from `.env.example` if needed):
     ```bash
     cp .env.example .env.local
     ```
   - Edit `.env.local` and replace `your_api_key_here` with your actual API key:
     ```
     GEMINI_API_KEY=your_actual_api_key_here
     ```
   - **Important:** Make sure your API key has access to Veo for video generation features

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:3000`

### Building for Production

To build the app for production:
```bash
npm run build
```

To preview the production build:
```bash
npm run preview
```

### Troubleshooting

- **API Key Issues:** If you get errors about API keys, make sure:
  - Your `.env.local` file exists and contains `GEMINI_API_KEY=your_key`
  - Your API key is valid and has Veo access enabled
  - You've restarted the dev server after adding the API key

- **Video Generation:** Video generation requires:
  - A valid Gemini API key with Veo access
  - Sufficient quota/credits in your Google Cloud account
  - Note: Video generation can take several minutes per scene

## 🤖 Using the Cooking Assistant Agent

After generating recipes, you can interact with the intelligent Cooking Assistant Agent:

1. **Open the Agent**: Click the "AI Assistant" button on any recipe card
2. **Ask Questions**: The agent can help with:
   - "Create a shopping list for these recipes"
   - "Find a substitution for eggs" (for vegan/allergy needs)
   - "Make this recipe vegan/gluten-free"
   - "Create a meal plan for the next 3 days"
   - "Give me cooking tips for this recipe"
   - "Calculate nutrition information"

3. **Autonomous Tool Use**: The agent automatically decides which tools to use based on your request
4. **Visual Results**: Tool results are displayed in formatted cards (shopping lists, substitutions, etc.)

The agent maintains context about your recipes and ingredients, making it a true cooking assistant!
