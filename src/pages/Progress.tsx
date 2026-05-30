import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingDown, TrendingUp, Target, Calendar, Plus, Scale } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useUserData } from '../contexts/UserDataContext';
import { calculateBMI, getBMICategory } from '../lib/calculations';
import { toast } from 'sonner';

interface ProgressEntry {
  date: string;
  weight: number;
  bodyFat?: number;
  notes?: string;
}

interface MacroEntry {
  date: string;
  calories: number;
  fat: number;
  protein: number;
  carbs: number;
}

export default function Progress() {
  const { state } = useUserData();
  const [progressData, setProgressData] = useState<ProgressEntry[]>([]);
  const [macroData, setMacroData] = useState<MacroEntry[]>([]);
  const [newWeight, setNewWeight] = useState('');
  const [newBodyFat, setNewBodyFat] = useState('');
  const [notes, setNotes] = useState('');
  const [isAddingProgress, setIsAddingProgress] = useState(false);

  // Load progress data from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('keto-progress-data');
    const savedMacros = localStorage.getItem('keto-macro-data');
    
    if (savedProgress) {
      try {
        setProgressData(JSON.parse(savedProgress));
      } catch (error) {
        console.error('Error loading progress data:', error);
      }
    }

    if (savedMacros) {
      try {
        setMacroData(JSON.parse(savedMacros));
      } catch (error) {
        console.error('Error loading macro data:', error);
      }
    }
  }, []);

  // Save progress data to localStorage
  useEffect(() => {
    if (progressData.length > 0) {
      localStorage.setItem('keto-progress-data', JSON.stringify(progressData));
    }
  }, [progressData]);

  useEffect(() => {
    if (macroData.length > 0) {
      localStorage.setItem('keto-macro-data', JSON.stringify(macroData));
    }
  }, [macroData]);

  const addProgressEntry = () => {
    if (!newWeight) {
      toast.error('Please enter your weight');
      return;
    }

    const entry: ProgressEntry = {
      date: new Date().toISOString().split('T')[0],
      weight: parseFloat(newWeight),
      bodyFat: newBodyFat ? parseFloat(newBodyFat) : undefined,
      notes: notes || undefined,
    };

    setProgressData(prev => [...prev, entry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setNewWeight('');
    setNewBodyFat('');
    setNotes('');
    setIsAddingProgress(false);
    toast.success('Progress entry added successfully!');
  };

  const addMacroEntry = (calories: number, fat: number, protein: number, carbs: number) => {
    const entry: MacroEntry = {
      date: new Date().toISOString().split('T')[0],
      calories,
      fat,
      protein,
      carbs,
    };

    setMacroData(prev => [...prev, entry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    toast.success('Daily macros logged!');
  };

  const getWeightTrend = () => {
    if (progressData.length < 2) return null;
    
    const latest = progressData[progressData.length - 1];
    const previous = progressData[progressData.length - 2];
    const change = latest.weight - previous.weight;
    
    return {
      change: Math.abs(change),
      direction: change < 0 ? 'down' : 'up',
      percentage: Math.abs((change / previous.weight) * 100),
    };
  };

  const getCurrentBMI = () => {
    if (!state.userData || progressData.length === 0) return null;
    
    const latestWeight = progressData[progressData.length - 1].weight;
    const bmi = calculateBMI(latestWeight, state.userData.height);
    
    return {
      value: Math.round(bmi * 10) / 10,
      category: getBMICategory(bmi),
    };
  };

  const getProgressToGoal = () => {
    if (!state.userData || progressData.length === 0) return null;
    
    const startWeight = state.userData.weight;
    const currentWeight = progressData[progressData.length - 1].weight;
    const targetWeight = state.userData.targetWeight || startWeight - 10;
    
    const totalToLose = startWeight - targetWeight;
    const lostSoFar = startWeight - currentWeight;
    const percentage = Math.min((lostSoFar / totalToLose) * 100, 100);
    
    return {
      startWeight,
      currentWeight,
      targetWeight,
      lostSoFar,
      remaining: Math.max(currentWeight - targetWeight, 0),
      percentage: Math.max(percentage, 0),
    };
  };

  const trend = getWeightTrend();
  const currentBMI = getCurrentBMI();
  const goalProgress = getProgressToGoal();

  // Prepare chart data
  const weightChartData = progressData.map(entry => ({
    date: new Date(entry.date).toLocaleDateString(),
    weight: entry.weight,
  }));

  const macroChartData = state.macroTargets ? [
    { name: 'Fat', value: state.macroTargets.fat, color: '#f97316' },
    { name: 'Protein', value: state.macroTargets.protein, color: '#ef4444' },
    { name: 'Carbs', value: state.macroTargets.carbs, color: '#22c55e' },
  ] : [];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Progress Tracking
        </h1>
        <p className="text-lg text-gray-600">
          Monitor your weight loss journey and stay on track with your keto goals
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Current Weight */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Current Weight</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {progressData.length > 0 ? `${progressData[progressData.length - 1].weight} kg` : 'No data'}
            </div>
            {trend && (
              <div className={`flex items-center text-sm ${trend.direction === 'down' ? 'text-green-600' : 'text-red-600'}`}>
                {trend.direction === 'down' ? (
                  <TrendingDown className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingUp className="h-4 w-4 mr-1" />
                )}
                {trend.change.toFixed(1)} kg ({trend.percentage.toFixed(1)}%)
              </div>
            )}
          </CardContent>
        </Card>

        {/* BMI */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Current BMI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentBMI ? currentBMI.value : 'No data'}
            </div>
            {currentBMI && (
              <Badge variant={currentBMI.category === 'Normal weight' ? 'default' : 'secondary'}>
                {currentBMI.category}
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Goal Progress */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Goal Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {goalProgress ? `${goalProgress.percentage.toFixed(0)}%` : 'No goal set'}
            </div>
            {goalProgress && (
              <div className="text-sm text-gray-600">
                {goalProgress.lostSoFar.toFixed(1)} kg lost
              </div>
            )}
          </CardContent>
        </Card>

        {/* Days Tracking */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Days Tracked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressData.length}</div>
            <div className="text-sm text-gray-600">
              {progressData.length > 0 ? `Since ${new Date(progressData[0].date).toLocaleDateString()}` : 'Start tracking today'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Weight Progress</span>
              <Dialog open={isAddingProgress} onOpenChange={setIsAddingProgress}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Entry
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Progress Entry</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="weight">Weight (kg) *</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={newWeight}
                        onChange={(e) => setNewWeight(e.target.value)}
                        placeholder="70.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bodyFat">Body Fat % (optional)</Label>
                      <Input
                        id="bodyFat"
                        type="number"
                        value={newBodyFat}
                        onChange={(e) => setNewBodyFat(e.target.value)}
                        placeholder="15.0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes (optional)</Label>
                      <Input
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Feeling great today!"
                      />
                    </div>
                    <Button onClick={addProgressEntry} className="w-full">
                      Add Entry
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardTitle>
            <CardDescription>Track your weight loss over time</CardDescription>
          </CardHeader>
          <CardContent>
            {weightChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weightChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Scale className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No weight data yet</p>
                  <p className="text-sm">Add your first entry to start tracking</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Macro Targets */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Macro Targets</CardTitle>
            <CardDescription>Your personalized keto macronutrient goals</CardDescription>
          </CardHeader>
          <CardContent>
            {macroChartData.length > 0 ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={macroChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {macroChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-3 gap-4 text-center">
                  {macroChartData.map((macro) => (
                    <div key={macro.name}>
                      <div className="text-lg font-bold" style={{ color: macro.color }}>
                        {macro.value}g
                      </div>
                      <div className="text-sm text-gray-600">{macro.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-200 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Complete the calculator first</p>
                  <p className="text-sm">Set your macro targets to see the breakdown</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Goal Progress Details */}
      {goalProgress && (
        <Card>
          <CardHeader>
            <CardTitle>Goal Progress Details</CardTitle>
            <CardDescription>Detailed breakdown of your weight loss journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {goalProgress.startWeight} kg
                  </div>
                  <div className="text-sm text-gray-600">Starting Weight</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {goalProgress.currentWeight} kg
                  </div>
                  <div className="text-sm text-gray-600">Current Weight</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {goalProgress.targetWeight} kg
                  </div>
                  <div className="text-sm text-gray-600">Target Weight</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress to Goal</span>
                  <span>{goalProgress.percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(goalProgress.percentage, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{goalProgress.lostSoFar.toFixed(1)} kg lost</span>
                  <span>{goalProgress.remaining.toFixed(1)} kg remaining</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress History */}
      {progressData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Progress History</CardTitle>
            <CardDescription>Your recent weight tracking entries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {progressData.slice(-10).reverse().map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium">{new Date(entry.date).toLocaleDateString()}</div>
                      {entry.notes && (
                        <div className="text-sm text-gray-600">{entry.notes}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{entry.weight} kg</div>
                    {entry.bodyFat && (
                      <div className="text-sm text-gray-600">{entry.bodyFat}% body fat</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Motivation Section */}
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-bold text-gray-900">Keep Going! 💪</h3>
            {progressData.length > 0 ? (
              <p className="text-gray-600">
                You've been tracking for {progressData.length} days. Consistency is key to success!
              </p>
            ) : (
              <p className="text-gray-600">
                Start tracking your progress today and watch your transformation unfold!
              </p>
            )}
            <div className="flex justify-center">
              <Dialog open={isAddingProgress} onOpenChange={setIsAddingProgress}>
                <DialogTrigger asChild>
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Log Today's Progress
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Alert>
        <AlertDescription>
          <strong>Progress Tracking Tips:</strong> Weigh yourself at the same time each day, preferably in the morning after using the bathroom and before eating. Weight can fluctuate daily due to water retention, hormones, and other factors. Focus on weekly trends rather than daily changes.
        </AlertDescription>
      </Alert>
    </div>
  );
}
