# Culinary Vision - Complete App Explanation

## 🎯 What Is This App?

**Culinary Vision** is an AI-powered cooking application that transforms a photo of ingredients into:
1. **Multiple recipe suggestions** (5 recipes)
2. **AI-generated cooking videos** (using Google's Veo 3.1)
3. **An intelligent cooking assistant** (agentic AI) that helps with shopping, substitutions, meal planning, and more

Think of it as: **"Take a photo of your fridge → Get TikTok-style recipe videos + AI cooking assistant"**

---

## 🎬 User Journey & Experience

### **Step 1: Landing Screen (Image Upload)**
**What it looks like:**
- Dark background (gray-900)
- Center-aligned layout
- Large title: "Culinary Vision" with a chef hat icon (indigo/purple color)
- Subtitle: "Snap a pic of your ingredients. Get recipe ideas with video guides instantly."
- Large dashed border box for image upload
- Upload area shows:
  - Upload icon when empty
  - "Click to upload an image" text
  - "or drag and drop" hint
  - Preview of selected image once chosen
- Purple "Generate Recipes" button at bottom (disabled until image is selected)

**User action:** Click the upload area, select an image file, click "Generate Recipes"

---

### **Step 2: Recipe Generation (Loading State 1)**
**What it looks like:**
- Same dark background
- Animated loading spinner (spinning circle)
- Text: "Chef is thinking..."
- Subtext: "Analyzing ingredients and crafting your recipes."
- Preview of the uploaded image displayed below (rounded, with border, max height 64)

**What's happening behind the scenes:**
- Image is converted to base64
- Sent to Gemini 2.5 Flash AI model
- AI analyzes the image to identify ingredients
- AI generates 5 recipe ideas
- AI creates a storyboard for video generation (for the first recipe)
- This takes ~5-10 seconds

---

### **Step 3: Video Generation (Loading State 2)**
**What it looks like:**
- Same dark background
- Loading spinner
- Text: "Bringing your recipe to life..."
- Recipe title shown in indigo/purple: "Generating video for: [Recipe Name]"
- Progress message that updates: 
  - "Preparing to film X scenes..."
  - "🎬 Filming scene 1/5: '[step description]'"
  - "🎥 Scene 1 is rendering... this can take a minute."
  - (repeats for each scene)
- A helpful "Cooking Tip" card appears: "While you wait, did you know that adding a pinch of sugar to tomato-based sauces can help balance the acidity?"

**What's happening behind the scenes:**
- For each scene in the storyboard (typically 5-8 scenes):
  - Creates a detailed prompt for Veo 3.1 video generation
  - Calls Google's Veo API to generate a video
  - Polls the API every 10 seconds until video is ready
  - Each video takes 1-3 minutes to generate
  - Videos are 9:16 aspect ratio (vertical, TikTok-style)
  - 720p resolution
  - Each scene is 3-5 seconds long
- Total video generation: 5-15 minutes (depending on number of scenes)

---

### **Step 4: Recipe Display (Main Experience)**
**What it looks like:**
- Full-screen vertical scrolling interface (like TikTok/Instagram Stories)
- Each recipe gets its own full-screen card
- **Snap scrolling** - swiping/scrolling snaps to the next recipe

#### **Recipe Card Layout:**
- **Full-screen video background** (for first recipe, uses generated videos)
- **Gradient overlay** (dark at bottom, transparent at top) for text readability
- **Top right:** Small chef hat icon button (resets to start)
- **Bottom section (overlay):**
  - **Caption bubble** (if storyboard scene has caption): Small rounded pill with bold text
  - **Recipe title:** Large, bold, white text (3xl-5xl font size)
  - **Hook text:** Indigo/purple italic text, e.g., "Turn your leftover veggies into a flavor explosion!"
  - **Two buttons:**
    - **"View Recipe"** button (white/transparent background)
    - **"AI Assistant"** button (purple/indigo background with sparkles icon)

#### **Video Playback:**
- Videos auto-play when recipe card is visible
- Videos are muted
- For first recipe: Cycles through all generated video scenes
- When one video ends, automatically plays the next scene
- For other recipes: Loops a single placeholder video

#### **Recipe Details Modal:**
When user clicks "View Recipe":
- Full-screen overlay appears (dark gray with blur)
- Shows:
  - Recipe title (large, bold)
  - Close button (X icon) in top right
  - **Metadata bar:**
    - Clock icon + cooking time (e.g., "25 min")
    - Chart icon + difficulty level (e.g., "easy")
  - **Steps section:**
    - Numbered list (1, 2, 3...)
    - Each step is concise (imperative tense)
    - Background: Dark gray rounded box
  - **Optional Extras:** (if any)
    - Lists additional ingredients that aren't required
  - **Voiceover Script:** (if available)
    - The AI-generated narration script for the video
    - Displayed in italics

---

### **Step 5: AI Assistant (Agentic Feature)**
**What it looks like:**
- **Modal overlay** (dark backdrop with blur)
- **Chat interface** in center of screen
- **Header:**
  - Sparkles icon (indigo)
  - "Cooking Assistant Agent" title
  - "Powered by Google Gemini" subtitle
  - Close button (X) in top right
- **Chat messages area:**
  - Scrollable message list
  - **User messages:** Right-aligned, purple/indigo background
  - **Agent messages:** Left-aligned, dark gray background
  - Each message shows timestamp
  - Agent's initial greeting lists all capabilities
- **Input area:**
  - Text input field (dark background)
  - Send button (purple, with send icon)
  - Hint text: "Try: 'Create a shopping list', 'Find substitutions for eggs', 'Make this recipe vegan'"

#### **Tool Results Display:**
When the agent uses a tool, results appear as colored cards:
- **🛒 Shopping List** (green card):
  - Categorized items with quantities
  - Optional items shown with strikethrough
  - Estimated cost
  - Store suggestions
- **🔄 Substitutions** (blue card):
  - Original ingredient
  - List of alternatives
  - Explanation of why substitutions work
- **📅 Meal Plan** (purple card):
  - Schedule by day and meal
  - Recipe assignments
  - Prep notes
- **✏️ Recipe Modified** (yellow card):
  - Notification that recipe was modified
- **💡 Cooking Tips** (indigo card):
  - Tips and troubleshooting advice
- **📊 Nutrition Info** (teal card):
  - Nutritional breakdown (calories, protein, carbs, etc.)

---

### **Step 6: Error State**
**What it looks like:**
- Full-screen dark background
- Red error icon (circle with exclamation mark) at top
- "Something went wrong" heading (red/pink text)
- Error message in white text
- Helpful note: "Note: Video generation is a new feature and can sometimes fail. Please try again."
- Purple "Try Again" button with chef hat icon

---

## 🏗️ Technical Architecture

### **Frontend (React + TypeScript)**
- **Framework:** React 19.2.0
- **Build Tool:** Vite 6.2.0
- **Styling:** Tailwind CSS (via CDN)
- **State Management:** React hooks (useState, useCallback)
- **File Structure:**
  ```
  App.tsx                    # Main app component (state machine)
  components/
    ImageUploader.tsx        # Image upload UI
    RecipeScroller.tsx       # Vertical scrolling recipe display
    FullScreenRecipeCard.tsx # Individual recipe card with video
    CookingAgent.tsx         # AI assistant chat interface
    LoadingSpinner.tsx       # Animated loading indicator
    Icons.tsx                # SVG icon components
  services/
    geminiService.ts         # Recipe & video generation
    cookingAgent.ts          # Agentic AI assistant
  types.ts                   # TypeScript type definitions
  ```

### **Backend Services (Google AI APIs)**
1. **Gemini 2.5 Flash** (Image Analysis & Recipe Generation)
   - Analyzes uploaded images
   - Identifies ingredients
   - Generates recipe suggestions
   - Creates video storyboards

2. **Veo 3.1 Fast Generate** (Video Generation)
   - Generates cooking videos from text prompts
   - Vertical 9:16 aspect ratio
   - 720p resolution
   - Async operation (polls for completion)

3. **Gemini 2.5 Flash** (Agentic AI)
   - Powers the cooking assistant
   - Decides which tools to use
   - Executes tool functions
   - Generates natural language responses

---

## 🤖 Agentic AI System

### **How It Works:**
1. **User sends a message** (e.g., "Create a shopping list")
2. **Agent analyzes request** using Gemini 2.5 Flash
3. **Agent decides if tool is needed** (structured JSON output)
4. **If tool needed:**
   - Extracts parameters from context
   - Executes the appropriate tool
   - Gets results
   - Synthesizes results into natural language
5. **Returns response** to user

### **Available Tools:**
1. **generate_shopping_list** - Creates categorized shopping lists
2. **find_substitutions** - Finds ingredient alternatives
3. **modify_recipe** - Adapts recipes for dietary needs
4. **create_meal_plan** - Plans multi-day meals
5. **get_cooking_tips** - Provides cooking advice
6. **calculate_nutrition** - Estimates nutritional info

---

## 🎨 Design & UI Features

### **Color Scheme:**
- **Background:** Dark gray (gray-900)
- **Primary:** Indigo/Purple (indigo-600, indigo-700)
- **Accent:** Various colors for tool results (green, blue, purple, yellow, teal)
- **Text:** White, light gray
- **Errors:** Red

### **Typography:**
- **Headings:** Bold, large (3xl-5xl)
- **Body:** Regular, medium (sm-base)
- **Captions:** Small, light weight

### **Animations:**
- Loading spinner (rotating)
- Button hover effects (scale, color change)
- Smooth scrolling
- Video transitions
- Message animations in chat

### **Responsive Design:**
- Mobile-first approach
- Works on desktop and mobile
- Touch-friendly buttons
- Vertical scrolling optimized for phones

---

## 📊 Data Flow

### **Recipe Generation Flow:**
```
User uploads image
  → Image converted to base64
  → Sent to Gemini 2.5 Flash
  → AI analyzes image
  → AI generates JSON with:
     - Ingredients array
     - 5 Recipes (title, time, difficulty, steps, missing_items)
     - Storyboard (hook, voiceover, scenes)
  → Data parsed and stored in state
  → UI updates to show recipes
```

### **Video Generation Flow:**
```
For each storyboard scene:
  → Create detailed prompt
  → Call Veo 3.1 API
  → Get operation ID
  → Poll API every 10 seconds
  → Check if operation.done === true
  → Get video URL
  → Add API key to URL for authentication
  → Store video URL in array
  → Update progress message
  → When all videos ready, display in UI
```

### **Agent Flow:**
```
User sends message
  → Add to conversation history
  → Send to agent service
  → Agent analyzes with Gemini
  → Agent decides: tool or direct response?
  → If tool:
     - Execute tool function
     - Get results
     - Generate response from results
  → Return response
  → Display in chat UI
  → Show tool results as cards
```

---

## 🚀 Key Features

### **1. Image-to-Recipe Generation**
- Upload any photo of ingredients
- AI identifies edible ingredients
- Generates 5 unique recipe ideas
- All recipes use only available ingredients + pantry staples

### **2. AI Video Generation (Veo 3.1)**
- Generates cinematic cooking videos
- Vertical format (TikTok/Instagram style)
- Multiple scenes per recipe
- Automated storyboarding
- On-screen captions

### **3. Agentic Cooking Assistant**
- Conversational AI interface
- Autonomous tool selection
- Context-aware responses
- Multiple specialized tools
- Visual result display

### **4. Recipe Management**
- Scrollable recipe cards
- Full recipe details
- Video playback
- Easy navigation

### **5. Error Handling**
- Graceful error messages
- Helpful troubleshooting tips
- Retry functionality
- User-friendly error states

---

## 🎯 Use Cases

1. **Home Cook:** "I have these ingredients, what can I make?"
2. **Meal Planner:** "Create a meal plan for the week"
3. **Dietary Restrictions:** "Make this recipe vegan/gluten-free"
4. **Shopping:** "Generate a shopping list for these recipes"
5. **Learning:** "Give me cooking tips for this recipe"
6. **Nutrition:** "Calculate the nutrition for this recipe"

---

## 🔧 Configuration

### **Environment Variables:**
- `GEMINI_API_KEY` - Google Gemini API key (required)
- Must have access to:
  - Gemini API (for recipe generation)
  - Veo API (for video generation)

### **API Requirements:**
- Google Cloud account
- Billing enabled
- Sufficient quota/credits
- Veo access (may require special permission)

---

## 📱 User Experience Highlights

1. **Simple:** Just upload an image and click a button
2. **Visual:** Video-first experience
3. **Interactive:** Chat with AI assistant
4. **Helpful:** Multiple tools for cooking tasks
5. **Modern:** TikTok-style vertical scrolling
6. **Responsive:** Works on all devices
7. **Fast:** Quick recipe generation (~5-10 seconds)
8. **Engaging:** Animated loading states and transitions

---

## 🎓 Technical Highlights

1. **Type Safety:** Full TypeScript implementation
2. **Modern React:** Hooks, functional components
3. **AI Integration:** Multiple Google AI models
4. **Agentic AI:** Autonomous tool selection and execution
5. **Async Operations:** Video generation with polling
6. **Error Handling:** Comprehensive error management
7. **State Management:** React state machine pattern
8. **Performance:** Optimized rendering and video playback

---

## 🏆 Competitive Advantages

1. **Media Mastery:** Veo 3.1 video generation
2. **Agentic Intelligence:** Autonomous AI assistant
3. **Real-World Utility:** Practical cooking assistance
4. **User Experience:** Modern, engaging interface
5. **Advanced AI:** Multiple AI models working together
6. **Comprehensive:** Recipe generation + videos + assistant

---

This app combines **cutting-edge AI** (Veo 3.1, Gemini 2.5 Flash, Agentic AI) with **practical utility** (cooking, meal planning, shopping) in a **modern, user-friendly interface**.

