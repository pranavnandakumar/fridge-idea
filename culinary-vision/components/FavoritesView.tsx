import React, { useState, useEffect, useRef, useCallback } from 'react';
import { favoritesService, type FavoriteRecipe } from '../services/favoritesService';
import { FullScreenRecipeCard } from './FullScreenRecipeCard';
import { HeartFilledIcon, XIcon, HomeIcon, PlayIcon } from './Icons';
import type { CulinaryPlan } from '../types';

interface FavoritesViewProps {
  onBack: () => void;
  onOpenAgent?: (culinaryPlan: CulinaryPlan) => void;
  onFavoriteChange?: () => void;
  onViewFavorite?: (favorite: FavoriteRecipe) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({ onBack, onOpenAgent, onFavoriteChange, onViewFavorite }) => {
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    const favs = favoritesService.getFavorites();
    setFavorites(favs);
    console.log('Loaded favorites:', favs.length);
  };

  const handleRemoveFavorite = useCallback((favoriteId: string) => {
    favoritesService.removeFavoriteById(favoriteId);
    const updatedFavorites = favoritesService.getFavorites();
    setFavorites(updatedFavorites);
    onFavoriteChange?.();
  }, [onFavoriteChange]);

  const handleViewFavorite = useCallback((favorite: FavoriteRecipe) => {
    if (onViewFavorite) {
      onViewFavorite(favorite);
    }
  }, [onViewFavorite]);

  if (favorites.length === 0) {
    return (
      <div className="h-screen w-screen bg-gradient-to-b from-pink-100 via-pink-50 to-white flex flex-col items-center justify-center p-4 pb-24">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-pink-500 to-pink-600 p-4 shadow-md z-10">
          <h1 className="text-white text-2xl font-bold">foogle</h1>
        </div>
        
        <div className="text-center max-w-md mt-20">
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-pink-100">
            <div className="mb-4">
              <HeartFilledIcon className="w-20 h-20 text-pink-500 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Favorites Yet</h2>
            <p className="text-gray-600 mb-6">
              Start exploring recipes and heart your favorites to see them here!
            </p>
            <p className="text-sm text-gray-500">
              Your favorite recipes will appear here for easy access
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-b from-pink-100 via-pink-50 to-white relative pb-20">
      {/* Header */}
      <div className="sticky top-0 left-0 right-0 bg-gradient-to-r from-pink-500 to-pink-600 p-4 shadow-lg z-20">
        <h1 className="text-white text-2xl font-bold mb-1">foogle</h1>
        <h2 className="text-white text-lg font-semibold">Your favorites</h2>
        <p className="text-white text-xs opacity-90">{favorites.length} {favorites.length === 1 ? 'favorite' : 'favorites'}</p>
      </div>
      
      {/* Favorites grid */}
      <div className="px-4 py-4 overflow-y-auto h-full" style={{ maxHeight: 'calc(100vh - 120px)' }}>
        <div className="grid grid-cols-1 gap-4">
          {favorites.map((favorite, index) => (
            <div
              key={favorite.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
              onClick={() => handleViewFavorite(favorite)}
            >
              <div className="flex items-center">
                {/* Video thumbnail */}
                <div className="relative w-32 h-32 flex-shrink-0 bg-gradient-to-br from-pink-200 to-pink-300">
                  {favorite.videoUrls && favorite.videoUrls.length > 0 ? (
                    <>
                      <video
                        src={favorite.videoUrls[0]}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                        <div className="bg-white bg-opacity-90 rounded-full p-2">
                          <PlayIcon className="w-6 h-6 text-pink-600" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">{favorite.recipe.title.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                </div>
                
                {/* Recipe info */}
                <div className="flex-1 p-4 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">{favorite.recipe.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <span>{favorite.recipe.time_minutes} min</span>
                    <span>•</span>
                    <span className="capitalize">{favorite.recipe.difficulty}</span>
                  </div>
                  {favorite.recipe.ingredients && favorite.recipe.ingredients.length > 0 && (
                    <p className="text-xs text-gray-500 truncate">
                      {favorite.recipe.ingredients.slice(0, 3).join(', ')}
                      {favorite.recipe.ingredients.length > 3 && '...'}
                    </p>
                  )}
                </div>
                
                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFavorite(favorite.id);
                  }}
                  className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors rounded-full m-2"
                  title="Remove from favorites"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

