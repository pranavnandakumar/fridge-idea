import React from 'react';
import type { CulinaryPlan } from '../types';
import { FullScreenRecipeCard } from './FullScreenRecipeCard';

interface RecipeScrollerProps {
  plan: CulinaryPlan;
  onReset: () => void;
  onOpenAgent?: () => void;
}

// Placeholder videos to use for the UI layout while generation is disabled.
const PLACEHOLDER_VIDEOS = [
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
];


export const RecipeScroller: React.FC<RecipeScrollerProps> = ({ plan, onReset, onOpenAgent }) => {
  return (
    <div className="h-screen w-screen overflow-y-auto snap-y snap-mandatory">
      {plan.recipes.map((recipe, index) => {
        let videoUrls: string[];
        const isFirstRecipe = index === 0;

        if (isFirstRecipe) {
          // Use generated video for the first recipe if it exists.
          if (plan.videoUrls && plan.videoUrls.length > 0) {
            videoUrls = plan.videoUrls;
          } 
          // Fallback to placeholder.
          else {
            videoUrls = [PLACEHOLDER_VIDEOS[0]];
          }
        } else {
          // Other recipes get a single, looping placeholder video.
          videoUrls = [PLACEHOLDER_VIDEOS[index % PLACEHOLDER_VIDEOS.length]];
        }

        return (
          <div key={recipe.title} className="h-screen w-screen snap-start flex items-center justify-center bg-black">
            <FullScreenRecipeCard
              recipe={recipe}
              storyboard={isFirstRecipe ? plan.storyboard : undefined}
              videoUrls={videoUrls}
              onReset={onReset}
              onOpenAgent={onOpenAgent}
              culinaryPlan={plan}
            />
          </div>
        );
      })}
    </div>
  );
};
