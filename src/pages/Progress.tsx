import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Trash2, Calendar, Download, ChefHat, Calculator, Edit3, Check, X, BarChart3, Clock, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { getAllSavedPlans, deleteSavedPlan, updatePlanName, SavedMealPlan } from '../lib/meal-plan-storage';
import { toast } from 'sonner';

export default function SavedPlans() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SavedMealPlan[]>([]);

  useEffect(() => {
    document.title = 'My Saved Keto Meal Plans — Browse & Compare | KetoPlanner';
  }, []);
  const [selectedPlan, setSelectedPlan] = useState<SavedMealPlan | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = () => {
    setPlans(getAllSavedPlans());
  };

  const handleDelete = (id: string) => {
    deleteSavedPlan(id);
    loadPlans();
    if (selectedPlan?.id === id) setSelectedPlan(null);
    toast.success('Plan deleted');
  };

  const handleRename = (id: string) => {
    if (editName.trim()) {
      updatePlanName(id, editName.trim());
      loadPlans();
      setEditingId(null);
      toast.success('Plan renamed');
    }
  };

  const handleNewPlan = () => {
    navigate('/meal-planner');
  };

  const downloadPlan = (plan: SavedMealPlan) => {
    let content = 'PERSONALIZED KETO MEAL PLAN\n';
    content += '================================\n\n';
    content += `Plan: ${plan.name}\n`;
    content += `Created: ${new Date(plan.savedAt).toLocaleDateString()}\n`;
    content += `Profile: ${plan.userProfile.age}yo, ${plan.userProfile.gender}, ${plan.userProfile.weight}kg, ${plan.userProfile.height}cm\n`;
    content += `Target: ${plan.userProfile.calories} cal/day\n\n`;

    plan.mealPlan.forEach(d => {
      content += `${d.dayName.toUpperCase()}\n`;
      content += '-------------------\n';
      content += `🍳 Breakfast: ${d.breakfast.name} (${d.breakfast.calories} cal)\n`;
      content += `🥗 Lunch: ${d.lunch.name} (${d.lunch.calories} cal)\n`;
      content += `🍽️ Dinner: ${d.dinner.name} (${d.dinner.calories} cal)\n`;
      content += `🥜 Snack: ${d.snack.name} (${d.snack.calories} cal)\n`;
      content += `📊 Total: ${Math.round(d.totalCalories)} cal | Fat ${Math.round(d.totalFat)}g | Protein ${Math.round(d.totalProtein)}g | Carbs ${Math.round(d.totalCarbs)}g\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `keto-plan-${plan.id.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Plan downloaded!');
  };

  const totalPlans = plans.length;
  const aiPlans = plans.filter(p => p.provider === 'ai').length;
  const latestPlan = plans[0];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          My Saved Meal Plans
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Every AI-generated meal plan is saved here — browse, compare, and revisit anytime
        </p>

        <Button
          onClick={handleNewPlan}
          size="lg"
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
        >
          <Sparkles className="mr-2 h-5 w-5" />
          Generate New Plan
        </Button>
      </div>

      {/* Stats */}
      {plans.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-emerald-600">{totalPlans}</div>
              <div className="text-sm text-gray-600">Saved Plans</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-blue-600">{aiPlans}</div>
              <div className="text-sm text-gray-600">AI-Generated</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-purple-600">{totalPlans * 7}</div>
              <div className="text-sm text-gray-600">Total Meals Saved</div>
            </CardContent>
          </Card>
        </div>
      )}

      {plans.length === 0 ? (
        /* Empty State */
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="py-16 text-center">
            <ChefHat className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No saved meal plans yet
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Generate your first AI-powered keto meal plan and it will automatically
              appear here for you to revisit anytime.
            </p>
            <Button
              onClick={handleNewPlan}
              size="lg"
              className="bg-gradient-to-r from-emerald-600 to-teal-600"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Your First Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">
              <BarChart3 className="h-4 w-4 mr-2" />
              All Plans
            </TabsTrigger>
            <TabsTrigger value="latest">
              <Calendar className="h-4 w-4 mr-2" />
              Latest Plan
            </TabsTrigger>
          </TabsList>

          {/* List View */}
          <TabsContent value="list" className="space-y-4">
            {plans.map((plan, idx) => (
              <Card key={plan.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {editingId === plan.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editName}
                              onChange={e => setEditName(e.target.value)}
                              className="h-8 w-64"
                              autoFocus
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleRename(plan.id);
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                            />
                            <Button size="sm" variant="ghost" onClick={() => handleRename(plan.id)}>
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        ) : (
                          <h3 className="font-semibold text-base truncate">{plan.name}</h3>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(plan.savedAt).toLocaleDateString()}
                        </span>
                        <Badge variant={plan.provider === 'ai' ? 'default' : 'secondary'} className="text-xs">
                          {plan.provider === 'ai' ? '🤖 AI' : '📋 Sample'}
                        </Badge>
                        <span>{plan.userProfile.age}yo / {plan.userProfile.gender}</span>
                        <span>{plan.userProfile.calories} cal/day</span>
                        <span>{plan.mealPlan.length} days</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-4 shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => {
                        setEditingId(plan.id);
                        setEditName(plan.name);
                      }}>
                        <Edit3 className="h-4 w-4 text-gray-500" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => downloadPlan(plan)}>
                        <Download className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(plan.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>

                  {/* Mini meal preview */}
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600">
                    {plan.mealPlan.slice(0, 4).map(d => (
                      <div key={d.day} className="bg-gray-50 rounded p-2">
                        <div className="font-medium text-gray-800 mb-1">{d.dayName.slice(0, 3)}</div>
                        <div>🍳 {d.breakfast.name.slice(0, 20)}</div>
                        <div>🥗 {d.lunch.name.slice(0, 20)}</div>
                        <div>🍽️ {d.dinner.name.slice(0, 20)}</div>
                      </div>
                    ))}
                  </div>
                  {plan.mealPlan.length > 4 && (
                    <p className="text-xs text-gray-400 mt-2">+{plan.mealPlan.length - 4} more days</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Latest Plan Detail */}
          <TabsContent value="latest" className="space-y-6">
            {latestPlan && (
              <>
                <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{latestPlan.name}</CardTitle>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => downloadPlan(latestPlan)}>
                          <Download className="h-4 w-4 mr-1" /> Download
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(latestPlan.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      Created {new Date(latestPlan.savedAt).toLocaleDateString()} &middot;
                      {latestPlan.provider === 'ai' ? ' AI Generated' : ' Sample Plan'} &middot;
                      Target: {latestPlan.userProfile.calories} cal/day
                    </CardDescription>
                  </CardHeader>
                </Card>

                {/* Day-by-day breakdown */}
                {latestPlan.mealPlan.map(day => (
                  <Card key={day.day}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{day.dayName}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(day.totalCalories)} cal
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          { meal: day.breakfast, label: '🍳 Breakfast' },
                          { meal: day.lunch, label: '🥗 Lunch' },
                          { meal: day.dinner, label: '🍽️ Dinner' },
                          { meal: day.snack, label: '🥜 Snack' },
                        ].map(({ meal, label }) => (
                          <div key={label} className="bg-gray-50 rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-1">{label}</div>
                            <div className="font-medium text-sm">{meal.name}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {meal.calories} cal · {meal.fat}g fat · {meal.protein}g protein · {meal.carbs}g carbs
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 flex gap-4 text-xs text-gray-500 border-t pt-3">
                        <span>🧈 Fat: {Math.round(day.totalFat)}g</span>
                        <span>🥩 Protein: {Math.round(day.totalProtein)}g</span>
                        <span>🥬 Carbs: {Math.round(day.totalCarbs)}g</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Info */}
      <Alert className="bg-blue-50 border-blue-200">
        <ChefHat className="h-5 w-5 text-blue-600" />
        <AlertDescription className="text-blue-800 text-sm">
          <strong>Saved locally:</strong> Plans are stored in your browser (localStorage). 
          They won't sync across devices. Generate new plans anytime — they auto-save here.
        </AlertDescription>
      </Alert>
    </div>
  );
}
