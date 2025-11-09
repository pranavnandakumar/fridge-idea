import React, { useState, useRef, useEffect } from 'react';
import { chatWithCookingAgent, type AgentContext } from '../services/cookingAgent';
import type { AgentMessage, ShoppingList, MealPlan, Substitution } from '../types';
import { ChefHatIcon, XIcon, SendIcon, SparklesIcon } from './Icons';

interface CookingAgentProps {
  context: AgentContext;
  onClose: () => void;
}

export const CookingAgent: React.FC<CookingAgentProps> = ({ context, onClose }) => {
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      role: 'assistant',
      content: "👋 Hi! I'm your Cooking Assistant Agent. I can help you with:\n\n• 🛒 Generate shopping lists\n• 🔄 Find ingredient substitutions\n• ✏️ Modify recipes (dietary restrictions, preferences)\n• 📅 Create meal plans\n• 💡 Get cooking tips and techniques\n• 📊 Calculate nutrition info\n\nWhat would you like help with?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toolResults, setToolResults] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: AgentMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithCookingAgent(
        userMessage.content,
        context,
        messages
      );

      const assistantMessage: AgentMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (response.toolResults && response.toolResults.length > 0) {
        setToolResults(prev => [...prev, ...response.toolResults!]);
      }
    } catch (error) {
      const errorMessage: AgentMessage = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderToolResult = (result: any) => {
    if (!result || !result.success) return null;

    const { toolName, result: toolData } = result;

    switch (toolName) {
      case 'generate_shopping_list':
        const shoppingList = toolData as ShoppingList;
        return (
          <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 mt-2">
            <h4 className="font-bold text-green-400 mb-2">🛒 Shopping List</h4>
            <div className="space-y-2">
              {shoppingList.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className={item.optional ? 'text-gray-400 line-through' : ''}>
                    {item.quantity} {item.name}
                  </span>
                  <span className="text-xs text-gray-500 capitalize">{item.category}</span>
                </div>
              ))}
              {shoppingList.totalEstimatedCost && (
                <div className="mt-3 pt-3 border-t border-green-700 font-semibold">
                  Estimated Cost: {shoppingList.totalEstimatedCost}
                </div>
              )}
            </div>
          </div>
        );

      case 'find_substitutions':
        const substitution = toolData as Substitution;
        return (
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mt-2">
            <h4 className="font-bold text-blue-400 mb-2">🔄 Substitutions for {substitution.original}</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {substitution.alternatives?.map((alt, idx) => (
                <li key={idx}>{alt}</li>
              ))}
            </ul>
            <p className="text-xs text-gray-400 mt-2">{substitution.reason}</p>
          </div>
        );

      case 'create_meal_plan':
        const mealPlan = toolData as MealPlan;
        return (
          <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-4 mt-2">
            <h4 className="font-bold text-purple-400 mb-2">📅 Meal Plan</h4>
            <div className="space-y-2 text-sm">
              {mealPlan.schedule?.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span><strong>{item.day}</strong> - {item.meal}</span>
                  <span>{item.recipe.title}</span>
                </div>
              ))}
              {mealPlan.prepNotes && mealPlan.prepNotes.length > 0 && (
                <div className="mt-3 pt-3 border-t border-purple-700">
                  <strong>Prep Notes:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {mealPlan.prepNotes.map((note, idx) => (
                      <li key={idx} className="text-xs">{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        );

      case 'modify_recipe':
        return (
          <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 mt-2">
            <h4 className="font-bold text-yellow-400 mb-2">✏️ Recipe Modified</h4>
            <p className="text-sm">Check the conversation for the modified recipe details.</p>
          </div>
        );

      case 'get_cooking_tips':
        return (
          <div className="bg-indigo-900/30 border border-indigo-700 rounded-lg p-4 mt-2">
            <h4 className="font-bold text-indigo-400 mb-2">💡 Cooking Tips</h4>
            <p className="text-sm">Tips are included in my response above!</p>
          </div>
        );

      case 'calculate_nutrition':
        return (
          <div className="bg-teal-900/30 border border-teal-700 rounded-lg p-4 mt-2">
            <h4 className="font-bold text-teal-400 mb-2">📊 Nutrition Info</h4>
            <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(toolData, null, 2)}</pre>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <SparklesIcon className="w-6 h-6 text-indigo-400" />
            <div>
              <h2 className="text-xl font-bold text-white">Cooking Assistant Agent</h2>
              <p className="text-xs text-gray-400">Powered by Google Gemini</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <XIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-100'
                }`}
              >
                <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                {message.timestamp && (
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
          ))}
          {toolResults.map((result, idx) => (
            <div key={idx}>{renderToolResult(result)}</div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your recipes..."
              className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <SendIcon className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Try: "Create a shopping list", "Find substitutions for eggs", "Make this recipe vegan"
          </p>
        </div>
      </div>
    </div>
  );
};

