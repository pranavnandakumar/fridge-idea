import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { RecipeScroller } from './components/RecipeScroller';
import { LoadingSpinner } from './components/LoadingSpinner';
import { CookingAgent } from './components/CookingAgent';
import { generateCulinaryPlan, generateRecipeVideos } from './services/geminiService';
import type { CulinaryPlan, AgentContext } from './types';
import { ChefHatIcon, ErrorIcon } from './components/Icons';

enum AppState {
  UPLOADING,
  GENERATING,
  GENERATING_VIDEOS,
  DISPLAYING_RECIPES,
  ERROR,
}

export default function App(): React.ReactElement {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOADING);
  const [culinaryPlan, setCulinaryPlan] = useState<CulinaryPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoProgress, setVideoProgress] = useState<string>('');
  const [isAgentOpen, setIsAgentOpen] = useState(false);

  const handleImageUpload = useCallback(async (file: File) => {
    try {
      setAppState(AppState.GENERATING);
      setImagePreview(URL.createObjectURL(file));

      const plan = await generateCulinaryPlan(file);
      setCulinaryPlan(plan);
      setAppState(AppState.GENERATING_VIDEOS);

      const onProgress = (message: string) => setVideoProgress(message);
      const videoUrls = await generateRecipeVideos(plan.storyboard, plan.recipes[0], onProgress);
      
      const updatedPlan = { ...plan, videoUrls };
      setCulinaryPlan(updatedPlan);
      setAppState(AppState.DISPLAYING_RECIPES);

    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : 'An unknown error occurred. Please try again.'
      );
      setAppState(AppState.ERROR);
    }
  }, []);

  const handleReset = () => {
    setAppState(AppState.UPLOADING);
    setCulinaryPlan(null);
    setError(null);
    setImagePreview(null);
    setVideoProgress('');
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.UPLOADING:
        return <ImageUploader onImageUpload={handleImageUpload} />;
      case AppState.GENERATING:
        return (
          <div className="flex flex-col items-center justify-center h-screen bg-gray-900 p-4">
            <LoadingSpinner />
            <h2 className="text-xl font-semibold mt-6 text-gray-300">
              Chef is thinking...
            </h2>
            <p className="text-gray-400 mt-2 text-center">
              Analyzing ingredients and crafting your recipes.
            </p>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Uploaded ingredients"
                className="mt-8 rounded-lg max-h-64 shadow-lg object-cover border-2 border-gray-700"
              />
            )}
          </div>
        );
      case AppState.GENERATING_VIDEOS:
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-900 p-4 text-center">
                <LoadingSpinner />
                <h2 className="text-2xl font-semibold mt-6 text-gray-300">
                    Creating your 10-second cooking video...
                </h2>
                {culinaryPlan && (
                    <p className="text-lg text-indigo-400 mt-1">
                        Recipe: {culinaryPlan.recipes[0].title}
                    </p>
                )}
                <p className="text-gray-400 mt-4 h-6">{videoProgress}</p>
                 <div className="mt-8 text-left bg-gray-800/50 p-4 rounded-lg w-full max-w-md">
                    <h3 className="font-bold text-white mb-2">Cooking Tip:</h3>
                    <p className="text-gray-300 text-sm">
                        While you wait, did you know that adding a pinch of sugar to tomato-based sauces can help balance the acidity?
                    </p>
                </div>
            </div>
        )
      case AppState.DISPLAYING_RECIPES:
        return culinaryPlan ? (
          <>
            <RecipeScroller 
              plan={culinaryPlan} 
              onReset={handleReset}
              onOpenAgent={() => setIsAgentOpen(true)}
            />
            {isAgentOpen && (
              <CookingAgent
                context={{
                  recipes: culinaryPlan.recipes,
                  ingredients: culinaryPlan.ingredients,
                  culinaryPlan: culinaryPlan
                }}
                onClose={() => setIsAgentOpen(false)}
              />
            )}
          </>
        ) : null;
      case AppState.ERROR:
        return (
          <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-center p-4">
            <ErrorIcon className="w-16 h-16 text-red-500" />
            <h2 className="text-2xl font-bold mt-4 text-red-400">
              Something went wrong
            </h2>
            <p className="text-gray-300 mt-2 max-w-md">{error}</p>
            <p className="text-gray-400 mt-2 text-sm max-w-md">Note: Video generation is a new feature and can sometimes fail. Please try again.</p>
            <button
              onClick={handleReset}
              className="mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300 flex items-center gap-2"
            >
              <ChefHatIcon className="w-5 h-5"/>
              Try Again
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return <main className="h-screen w-screen bg-gray-900">{renderContent()}</main>;
}
