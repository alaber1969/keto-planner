import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Clock, ShoppingCart, Download, RefreshCw, Calculator, AlertTriangle, Lightbulb, ChefHat } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { useUserData } from '../contexts/UserDataContext';
import { generateMealPlan, getFallbackMealPlan, LLMDayPlan, LLMMeal } from '../lib/llm-service';
import { toast } from 'sonner';

const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Categorize ingredients for shopping list
function categorizeIngredient(name: string): string {
  const lower = name.toLowerCase();
  const proteinKeywords = ['chicken', 'beef', 'pork', 'lamb', 'salmon', 'fish', 'tuna', 'shrimp', 'egg', 'bacon', 'sausage', 'meat', 'steak'];
  const dairyKeywords = ['cheese', 'cream', 'yogurt', 'butter', 'milk', 'cream cheese', 'mozzarella', 'cheddar', 'parmesan'];
  const vegKeywords = ['spinach', 'broccoli', 'cauliflower', 'kale', 'lettuce', 'asparagus', 'zucchini', 'cucumber', 'celery', 'pepper', 'tomato', 'onion', 'garlic', 'mushroom', 'avocado'];
  const fatKeywords = ['oil', 'avocado', 'nuts', 'nut', 'seeds', 'olive', 'coconut oil', 'almond'];
  const fruitKeywords = ['berry', 'berries', 'raspberry', 'strawberry', 'blueberry', 'blackberry'];

  if (proteinKeywords.some(k => lower.includes(k))) return 'Proteins';
  if (dairyKeywords.some(k => lower.includes(k))) return 'Dairy';
  if (vegKeywords.some(k => lower.includes(k))) return 'Vegetables';
  if (fatKeywords.some(k => lower.includes(k))) return 'Fats & Oils';
  if (fruitKeywords.some(k => lower.includes(k))) return 'Fruits';
  return 'Other';
}

export default function MealPlanner() {
  const { state } = useUserData();
  const [mealPlans, setMealPlans] = useState<LLMDayPlan[]>([]);
  const [shoppingList, setShoppingList] = useState<Array<{ item: string; amount: string; category: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const [generationMode, setGenerationMode] = useState<'ai' | 'fallback'>('ai');
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
  const [useFallback, setUseFallback] = useState(false);

  const selectedPlan = mealPlans.find(plan => plan.day === selectedDay);

  // Auto-generate when macro targets are available and no plan exists
  useEffect(() => {
    if (state.macroTargets && mealPlans.length === 0 && !loading) {
      handleGeneratePlan();
    }
  }, [state.macroTargets]);

  const handleGeneratePlan = async () => {
    if (!state.userData || !state.macroTargets) {
      toast.error('Please complete the calculator first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (useFallback) {
        // Use built-in fallback plan (no API needed)
        const fallback = getFallbackMealPlan();
        setMealPlans(fallback.mealPlan);
        generateShoppingList(fallback.mealPlan);
        setGenerationMode('fallback');
        toast.success('Sample meal plan loaded!');
        return;
      }

      // Call the LLM API via backend
      setGenerationMode('ai');
      const result = await generateMealPlan({
        age: state.userData.age,
        gender: state.userData.gender,
        weight: state.userData.weight,
        height: state.userData.height,
        activityLevel: state.userData.activityLevel,
        goalWeightLoss: state.userData.goalWeightLoss,
        macros: state.macroTargets,
        dietaryPreferences: dietaryPreferences.length > 0 ? dietaryPreferences : undefined,
        language: 'en',
      });

      setMealPlans(result.mealPlan);
      generateShoppingList(result.mealPlan);
      toast.success('AI-generated meal plan ready! 🎉');
    } catch (err: any) {
      console.error('Meal plan generation error:', err);
      setError(err.message || 'Failed to generate meal plan');

      // On failure, offer fallback
      toast.error(err.message || 'AI generation failed', {
        action: {
          label: 'Use Sample Plan',
          onClick: () => {
            const fallback = getFallbackMealPlan();
            setMealPlans(fallback.mealPlan);
            generateShoppingList(fallback.mealPlan);
            setGenerationMode('fallback');
            setError(null);
            toast.success('Sample meal plan loaded');
          },
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const generateShoppingList = (plans: LLMDayPlan[]) => {
    const ingredientMap = new Map<string, { name: string; amount: number; unit: string }>();

    plans.forEach(plan => {
      [plan.breakfast, plan.lunch, plan.dinner, plan.snack].forEach(meal => {
        meal.ingredients.forEach(ingredient => {
          const key = ingredient.name.toLowerCase().trim();
          const existing = ingredientMap.get(key);
          if (existing) {
            // Try to combine amounts if same unit
            if (existing.unit === ingredient.unit) {
              existing.amount += ingredient.amount;
            } else {
              // Different units — keep as separate entry with a note
              existing.amount += ingredient.amount;
              existing.unit = existing.unit + ' + ' + ingredient.unit;
            }
          } else {
            ingredientMap.set(key, {
              name: ingredient.name,
              amount: ingredient.amount,
              unit: ingredient.unit,
            });
          }
        });
      });
    });

    const list = Array.from(ingredientMap.values()).map(item => ({
      item: item.name,
      amount: `${item.amount} ${item.unit}`,
      category: categorizeIngredient(item.name),
    }));

    // Sort by category
    list.sort((a, b) => a.category.localeCompare(b.category));
    setShoppingList(list);
  };

  const downloadMealPlan = () => {
    const content = generatePrintableMealPlan();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'keto-meal-plan.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadShoppingList = () => {
    const groupedList = shoppingList.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(`- ${item.item}: ${item.amount}`);
      return acc;
    }, {} as Record<string, string[]>);

    const content = Object.entries(groupedList)
      .map(([category, items]) => `${category}:\n${items.join('\n')}\n`)
      .join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'keto-shopping-list.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generatePrintableMealPlan = () => {
    let content = 'PERSONALIZED KETO MEAL PLAN\n';
    content += '================================\n\n';

    if (state.macroTargets) {
      content += `Daily Targets:\n`;
      content += `- Calories: ${state.macroTargets.calories}\n`;
      content += `- Fat: ${state.macroTargets.fat}g\n`;
      content += `- Protein: ${state.macroTargets.protein}g\n`;
      content += `- Carbs: ${state.macroTargets.carbs}g\n\n`;
    }

    mealPlans.forEach(plan => {
      content += `${plan.dayName.toUpperCase()}\n`;
      content += '-------------------\n';
      content += `Breakfast: ${plan.breakfast.name}\n`;
      content += `Lunch: ${plan.lunch.name}\n`;
      content += `Dinner: ${plan.dinner.name}\n`;
      content += `Snack: ${plan.snack.name}\n`;
      content += `Total: ${Math.round(plan.totalCalories)} cal, ${Math.round(plan.totalFat)}g fat, ${Math.round(plan.totalProtein)}g protein, ${Math.round(plan.totalCarbs)}g carbs\n\n`;
    });

    return content;
  };

  // --- No data state ---
  if (!state.macroTargets) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="p-12">
          <Calculator className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Complete Your Calculations First
          </h2>
          <p className="text-gray-600 mb-6">
            To generate a personalized AI-powered meal plan, first complete the keto calculator
            to determine your macro targets and caloric needs.
          </p>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link to="/calculator">
              Go to Calculator
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            AI-Powered Meal Plan
          </h1>
          <Sparkles className="h-8 w-8 text-yellow-500" />
        </div>
        <p className="text-lg text-gray-600 mb-6">
          {generationMode === 'ai'
            ? 'Custom keto meals generated by AI to match your exact macro targets'
            : 'Sample keto meal plan — generate an AI version for personalized results'}
        </p>

        {/* Macro Targets Badges */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <Badge variant="outline" className="px-3 py-1 text-base">
            🎯 {state.macroTargets.calories} cal
          </Badge>
          <Badge variant="outline" className="px-3 py-1 text-base text-orange-600 border-orange-300">
            🧈 {state.macroTargets.fat}g fat
          </Badge>
          <Badge variant="outline" className="px-3 py-1 text-base text-red-600 border-red-300">
            🥩 {state.macroTargets.protein}g protein
          </Badge>
          <Badge variant="outline" className="px-3 py-1 text-base text-green-600 border-green-300">
            🥬 {state.macroTargets.carbs}g carbs
          </Badge>
          {generationMode === 'ai' && (
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 text-base">
              <Sparkles className="h-4 w-4 mr-1" /> AI Generated
            </Badge>
          )}
          {generationMode === 'fallback' && (
            <Badge variant="secondary" className="px-3 py-1 text-base">
              Sample Plan
            </Badge>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap justify-center gap-4">
          {/* Dietary Preference Toggle */}
          <Select
            value={dietaryPreferences[0] || ''}
            onValueChange={(value) => {
              if (value === 'none') {
                setDietaryPreferences([]);
              } else {
                setDietaryPreferences([value]);
              }
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Preferences" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No preference</SelectItem>
              <SelectItem value="dairy-free">Dairy-Free</SelectItem>
              <SelectItem value="nut-free">Nut-Free</SelectItem>
              <SelectItem value="shellfish-free">No Shellfish</SelectItem>
              <SelectItem value="high-protein">High Protein</SelectItem>
              <SelectItem value="high-fat">High Fat</SelectItem>
              <SelectItem value="low-carb">Very Low Carb</SelectItem>
            </SelectContent>
          </Select>

          {/* Fallback Toggle */}
          <Button
            variant={useFallback ? 'default' : 'outline'}
            size="sm"
            onClick={() => setUseFallback(!useFallback)}
            className={useFallback ? 'bg-amber-600 hover:bg-amber-700' : ''}
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            {useFallback ? 'Sample Mode' : 'AI Mode'}
          </Button>

          {/* Generate Button */}
          <Button
            onClick={handleGeneratePlan}
            disabled={loading}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Generating with AI...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {useFallback ? 'Load Sample Plan' : 'Generate AI Meal Plan'}
              </>
            )}
          </Button>

          {/* Download Buttons */}
          {mealPlans.length > 0 && (
            <>
              <Button onClick={downloadMealPlan} variant="outline" disabled={mealPlans.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                Plan
              </Button>
              <Button onClick={downloadShoppingList} variant="outline" disabled={shoppingList.length === 0}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Shopping List
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Error Display with Retry */}
      {error && (
        <Alert variant="destructive" className="border-red-300 bg-red-50">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Generation failed:</strong> {error}
            <div className="mt-2 flex gap-2">
              <Button size="sm" variant="outline" onClick={handleGeneratePlan} className="text-red-700 border-red-300">
                <RefreshCw className="h-3 w-3 mr-1" /> Retry
              </Button>
              <Button size="sm" variant="outline" onClick={() => {
                const fallback = getFallbackMealPlan();
                setMealPlans(fallback.mealPlan);
                generateShoppingList(fallback.mealPlan);
                setGenerationMode('fallback');
                setError(null);
                toast.success('Sample meal plan loaded');
              }}>
                <Lightbulb className="h-3 w-3 mr-1" /> Use Sample
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Meal Plan Display */}
      {mealPlans.length > 0 && (
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="daily">
              <ChefHat className="h-4 w-4 mr-2" />
              Daily View
            </TabsTrigger>
            <TabsTrigger value="weekly">
              <CalendarDaysIcon className="h-4 w-4 mr-2" />
              Weekly Overview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-6">
            {/* Day Selector */}
            <div className="flex flex-wrap justify-center gap-2">
              {dayNames.map((day, index) => (
                <Button
                  key={index}
                  variant={selectedDay === index + 1 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDay(index + 1)}
                  className={selectedDay === index + 1 ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                >
                  {day}
                </Button>
              ))}
            </div>

            {selectedPlan && (
              <div className="space-y-6">
                {/* Daily Summary */}
                <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between">
                      <span>{selectedPlan.dayName} — Daily Totals</span>
                      <Badge variant="outline" className="text-sm">
                        {Math.round(
                          ((selectedPlan.totalCalories / state.macroTargets!.calories) * 100)
                        )}% of target
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      How this day's meals compare to your macro targets
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">
                          {Math.round(selectedPlan.totalCalories)}
                        </div>
                        <div className="text-sm text-gray-600">Calories</div>
                        <div className="text-xs text-gray-400">target: {state.macroTargets?.calories}</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {Math.round(selectedPlan.totalFat)}g
                        </div>
                        <div className="text-sm text-gray-600">Fat</div>
                        <div className="text-xs text-gray-400">target: {state.macroTargets?.fat}g</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {Math.round(selectedPlan.totalProtein)}g
                        </div>
                        <div className="text-sm text-gray-600">Protein</div>
                        <div className="text-xs text-gray-400">target: {state.macroTargets?.protein}g</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {Math.round(selectedPlan.totalCarbs)}g
                        </div>
                        <div className="text-sm text-gray-600">Carbs</div>
                        <div className="text-xs text-gray-400">target: {state.macroTargets?.carbs}g</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Meal Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { meal: selectedPlan.breakfast, title: 'Breakfast', icon: '🍳' },
                    { meal: selectedPlan.lunch, title: 'Lunch', icon: '🥗' },
                    { meal: selectedPlan.dinner, title: 'Dinner', icon: '🍽️' },
                    { meal: selectedPlan.snack, title: 'Snack', icon: '🥜' },
                  ].map(({ meal, title, icon }) => (
                    <MealCard key={title} meal={meal} title={title} icon={icon} />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="weekly" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>7-Day Meal Overview</CardTitle>
                  <CardDescription>
                    Your complete weekly keto meal schedule — {generationMode === 'ai' ? 'AI generated' : 'sample plan'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mealPlans.map((plan) => (
                      <div key={plan.day} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-semibold text-base">{plan.dayName}</h3>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(plan.totalCalories)} cal
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>🍳 <span className="font-medium">{plan.breakfast.name}</span></div>
                          <div>🥗 <span className="font-medium">{plan.lunch.name}</span></div>
                          <div>🍽️ <span className="font-medium">{plan.dinner.name}</span></div>
                          <div>🥜 <span className="font-medium">{plan.snack.name}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Shopping List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>
                      <ShoppingCart className="h-5 w-5 inline mr-2 text-emerald-600" />
                      Shopping List
                    </span>
                    <Button size="sm" variant="outline" onClick={downloadShoppingList}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Everything you need for {generationMode === 'ai' ? 'your AI-generated' : 'the sample'} weekly menu
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(
                      shoppingList.reduce((acc, item) => {
                        if (!acc[item.category]) acc[item.category] = [];
                        acc[item.category].push(item);
                        return acc;
                      }, {} as Record<string, typeof shoppingList>)
                    ).map(([category, items]) => (
                      <div key={category}>
                        <h4 className="font-semibold text-emerald-600 mb-2 text-sm uppercase tracking-wide">
                          {category}
                        </h4>
                        <ul className="text-sm text-gray-600 space-y-1 ml-4">
                          {items.map((item, index) => (
                            <li key={index} className="flex justify-between">
                              <span>• {item.item}</span>
                              <span className="text-gray-400 ml-4">{item.amount}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    {shoppingList.length === 0 && (
                      <p className="text-gray-400 text-center py-4">
                        Generate a meal plan to see your shopping list
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="border-emerald-200">
          <CardContent className="py-12 text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin"></div>
              <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Cooking up your personalized meal plan...
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              The AI is creating 7 days of breakfasts, lunches, dinners, and snacks
              tailored to your exact macro targets. This takes about 30-60 seconds.
            </p>
            <div className="mt-6 flex justify-center gap-2 text-sm text-gray-400">
              <span className="animate-pulse">🍳 Creating meals</span>
              <span>·</span>
              <span className="animate-pulse" style={{ animationDelay: '0.3s' }}>🥗 Calculating macros</span>
              <span>·</span>
              <span className="animate-pulse" style={{ animationDelay: '0.6s' }}>📝 Writing instructions</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && mealPlans.length === 0 && !error && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="py-16 text-center">
            <ChefHat className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Ready for your AI meal plan?
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Click "Generate AI Meal Plan" to get a custom 7-day keto menu designed
              specifically for your {state.macroTargets.calories}-calorie target.
            </p>
            <Button
              onClick={handleGeneratePlan}
              size="lg"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Generate AI Meal Plan
            </Button>
            <div className="mt-4">
              <Button variant="ghost" size="sm" onClick={() => {
                setUseFallback(true);
                setTimeout(() => handleGeneratePlan(), 100);
              }}>
                <Lightbulb className="h-3 w-3 mr-1" />
                Or load a sample plan (no AI needed)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Footer */}
      <Alert className="bg-blue-50 border-blue-200">
        <Lightbulb className="h-5 w-5 text-blue-600" />
        <AlertDescription className="text-blue-800 text-sm">
          <strong>AI-Powered:</strong> Each meal is generated live by an AI based on your personal data.
          {generationMode === 'fallback' && ' You are viewing a sample plan. Click "Generate AI Meal Plan" for a personalized version.'}
          {generationMode === 'ai' && ' Regenerate anytime to get new variety. Macros are approximate — adjust portions to fit your exact targets.'}
        </AlertDescription>
      </Alert>
    </div>
  );
}

// --- Meal Card Sub-component ---
function MealCard({ meal, title, icon }: { meal: LLMMeal; title: string; icon: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="overflow-hidden border-gray-200 hover:shadow-md transition-shadow">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3">
        <div className="flex items-center justify-between">
          <Badge className="bg-white/20 text-white border-0 text-sm">
            {icon} {title}
          </Badge>
          <div className="flex items-center text-white/90 text-sm">
            <Clock className="h-3 w-3 mr-1" />
            {meal.prepTime}min
          </div>
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{meal.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Macro quick view */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs bg-gray-50 rounded-lg p-2">
          <div>
            <div className="font-bold text-gray-800">{Math.round(meal.calories)}</div>
            <div className="text-gray-500">cal</div>
          </div>
          <div>
            <div className="font-bold text-orange-600">{Math.round(meal.fat)}g</div>
            <div className="text-gray-500">fat</div>
          </div>
          <div>
            <div className="font-bold text-red-600">{Math.round(meal.protein)}g</div>
            <div className="text-gray-500">protein</div>
          </div>
          <div>
            <div className="font-bold text-green-600">{Math.round(meal.carbs)}g</div>
            <div className="text-gray-500">carbs</div>
          </div>
        </div>

        {/* Expandable content */}
        <div className="space-y-2">
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-1">Ingredients:</h4>
            <ul className="text-sm text-gray-600 space-y-0.5">
              {meal.ingredients.slice(0, expanded ? undefined : 4).map((ing, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-emerald-600 mr-2">•</span>
                  {ing.amount} {ing.unit} {ing.name}
                </li>
              ))}
              {!expanded && meal.ingredients.length > 4 && (
                <li>
                  <button
                    onClick={() => setExpanded(true)}
                    className="text-emerald-600 hover:text-emerald-700 text-xs font-medium"
                  >
                    +{meal.ingredients.length - 4} more ingredients
                  </button>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-1">Instructions:</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              {expanded || meal.instructions.length < 120
                ? meal.instructions
                : meal.instructions.slice(0, 120) + '...'}
            </p>
            {meal.instructions.length >= 120 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-emerald-600 hover:text-emerald-700 text-xs font-medium mt-1"
              >
                {expanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Calendar icon component (lucide doesn't have CalendarDays)
function CalendarDaysIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="14" x2="8" y2="14" />
      <line x1="12" y1="14" x2="12" y2="14" />
      <line x1="16" y1="14" x2="16" y2="14" />
      <line x1="8" y1="18" x2="8" y2="18" />
      <line x1="12" y1="18" x2="12" y2="18" />
      <line x1="16" y1="18" x2="16" y2="18" />
    </svg>
  );
}
