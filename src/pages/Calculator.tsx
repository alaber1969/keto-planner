import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Calculator as CalculatorIcon, ArrowRight, User, Activity, Target, Sparkles, Share2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useUserData } from '../contexts/UserDataContext';
import {
  calculateBMR,
  calculateTDEE,
  calculateMacros,
  calculateBMI,
  getBMICategory,
  calculateWeightLossProjection,
  validateUserData,
  UserData
} from '../lib/calculations';
import SocialShare from '../components/SocialShare';
import { toast } from 'sonner';

const formSchema = z.object({
  age: z.number().min(18, 'Must be at least 18 years old').max(100, 'Must be less than 100 years old'),
  gender: z.enum(['male', 'female']),
  weight: z.number().min(40, 'Weight must be at least 40 kg').max(300, 'Weight must be less than 300 kg'),
  height: z.number().min(140, 'Height must be at least 140 cm').max(220, 'Height must be less than 220 cm'),
  activityLevel: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'super_active']),
  goalWeightLoss: z.number().min(0.5, 'Minimum safe weight loss is 0.5 lbs/week').max(2, 'Maximum safe weight loss is 2 lbs/week'),
  targetWeight: z.number().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function Calculator() {
  const [step, setStep] = useState(1);
  const [results, setResults] = useState<any>(null);
  const { setUserData, setMacroTargets, setWeightLossProjection } = useUserData();
  const navigate = useNavigate();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      gender: undefined,
      weight: undefined,
      height: undefined,
      activityLevel: undefined,
      goalWeightLoss: 1,
      targetWeight: undefined,
    },
  });

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const activityLevels = [
    {
      value: 'sedentary',
      label: 'Sedentary',
      description: 'Little to no exercise + desk job',
      multiplier: '1.2x BMR',
    },
    {
      value: 'lightly_active',
      label: 'Lightly Active',
      description: 'Light exercise 1-3 days/week',
      multiplier: '1.375x BMR',
    },
    {
      value: 'moderately_active',
      label: 'Moderately Active',
      description: 'Moderate exercise 3-5 days/week',
      multiplier: '1.55x BMR',
    },
    {
      value: 'very_active',
      label: 'Very Active',
      description: 'Hard exercise 6-7 days/week',
      multiplier: '1.725x BMR',
    },
    {
      value: 'super_active',
      label: 'Super Active',
      description: 'Very hard exercise + physical job',
      multiplier: '1.9x BMR',
    },
  ];

  const onSubmit = (data: FormData) => {
    const userData: UserData = {
      age: data.age,
      gender: data.gender,
      weight: data.weight,
      height: data.height,
      activityLevel: data.activityLevel,
      goalWeightLoss: data.goalWeightLoss,
      targetWeight: data.targetWeight || data.weight - 10,
    };

    // Validate data
    const errors = validateUserData(userData);
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    // Calculate results
    const bmr = calculateBMR(userData);
    const tdee = calculateTDEE(userData);
    const macros = calculateMacros(userData);
    const bmi = calculateBMI(userData.weight, userData.height);
    const bmiCategory = getBMICategory(bmi);
    const projection = calculateWeightLossProjection(userData);

    const calculationResults = {
      userData,
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      macros,
      bmi: Math.round(bmi * 10) / 10,
      bmiCategory,
      projection,
    };

    setResults(calculationResults);
    setUserData(userData);
    setMacroTargets(macros);
    setWeightLossProjection(projection);
    
    toast.success('Calculations completed successfully!');
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const goToMealPlanner = () => {
    navigate('/meal-planner');
  };

  if (results) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Your Personalized Keto Plan
          </h1>
          <p className="text-lg text-gray-600">
            Based on your information, here are your customized calculations and recommendations.
          </p>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* BMI Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>BMI Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600 mb-2">
                {results.bmi}
              </div>
              <Badge variant={results.bmiCategory === 'Normal weight' ? 'default' : 'secondary'}>
                {results.bmiCategory}
              </Badge>
            </CardContent>
          </Card>

          {/* BMR Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Basal Metabolic Rate</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {results.bmr}
              </div>
              <p className="text-sm text-gray-600">calories/day at rest</p>
            </CardContent>
          </Card>

          {/* TDEE Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Total Daily Energy</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {results.tdee}
              </div>
              <p className="text-sm text-gray-600">calories/day with activity</p>
            </CardContent>
          </Card>
        </div>

        {/* Macros Card */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Macro Targets</CardTitle>
            <CardDescription>
              Optimized for ketogenic diet and your weight loss goal of {results.userData.goalWeightLoss} lbs/week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {results.macros.calories}
                </div>
                <div className="text-sm text-gray-600">Daily Calories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {results.macros.fat}g
                </div>
                <div className="text-sm text-gray-600">Fat ({results.macros.fatPercentage}%)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {results.macros.protein}g
                </div>
                <div className="text-sm text-gray-600">Protein ({results.macros.proteinPercentage}%)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {results.macros.carbs}g
                </div>
                <div className="text-sm text-gray-600">Carbs ({results.macros.carbPercentage}%)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weight Loss Projection */}
        <Card>
          <CardHeader>
            <CardTitle>Weight Loss Projection</CardTitle>
            <CardDescription>
              Based on your goal of {results.userData.goalWeightLoss} lbs per week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600 mb-1">
                  {results.projection.weeksToGoal}
                </div>
                <div className="text-sm text-gray-600">Weeks to Goal</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {results.projection.targetDate.toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-600">Target Date</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {results.projection.dailyDeficit}
                </div>
                <div className="text-sm text-gray-600">Daily Calorie Deficit</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={goToMealPlanner} className="bg-emerald-600 hover:bg-emerald-700">
            Create Meal Plan <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            size="lg"
            onClick={() => navigate('/meal-planner')}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Generate AI Meal Plan
          </Button>
          <Button size="lg" variant="outline" onClick={() => setResults(null)}>
            Recalculate
          </Button>
        </div>

        {/* Share Results */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200">
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Share2 className="h-4 w-4" />
              Share your results:
            </span>
            <SocialShare
              title="I just calculated my keto macros on KetoPlanner!"
              description={`My targets: ${results.macros.calories} cal/day, ${results.macros.fat}g fat, ${results.macros.protein}g protein, ${results.macros.carbs}g carbs. BMI: ${results.bmi}.`}
              url="https://ketoai.app/calculator"
            />
          </div>
        </div>

        {/* AI Prompt */}
        <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="p-2 bg-yellow-100 rounded-full flex-shrink-0">
              <Sparkles className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">AI-Powered Meal Plans</h3>
              <p className="text-sm text-gray-600">
                Click "Generate AI Meal Plan" to get a personalized 7-day keto menu with breakfast, lunch, dinner,
                and snacks — all generated live by artificial intelligence based on your exact macros above.
                Each meal includes ingredients, instructions, and macro breakdown.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Safety Notice */}
        <Alert>
          <AlertDescription>
            These calculations are estimates based on established formulas. Individual results may vary. 
            Consult with a healthcare professional before starting any new diet regimen.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Keto Calculator
        </h1>
        <p className="text-lg text-gray-600">
          Get personalized macro calculations and weight loss projections
        </p>
        <div className="mt-6">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Basic Information</span>
                </CardTitle>
                <CardDescription>
                  Tell us about yourself to calculate your metabolic needs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="25" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex space-x-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="male" id="male" />
                              <Label htmlFor="male">Male</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="female" id="female" />
                              <Label htmlFor="female">Female</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Weight (kg)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="70" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter your current weight in kilograms
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height (cm)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="170" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter your height in centimeters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="button" onClick={nextStep}>
                    Next Step <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Activity Level</span>
                </CardTitle>
                <CardDescription>
                  Select your typical daily activity level to calculate energy expenditure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="activityLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="space-y-4"
                        >
                          {activityLevels.map((level) => (
                            <div key={level.value} className="border rounded-lg p-4 hover:bg-gray-50">
                              <div className="flex items-center space-x-3">
                                <RadioGroupItem value={level.value} id={level.value} />
                                <div className="flex-1">
                                  <Label htmlFor={level.value} className="text-base font-medium cursor-pointer">
                                    {level.label}
                                  </Label>
                                  <p className="text-sm text-gray-600">{level.description}</p>
                                  <Badge variant="outline" className="mt-1">
                                    {level.multiplier}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                  <Button type="button" onClick={nextStep}>
                    Next Step <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Weight Loss Goals</span>
                </CardTitle>
                <CardDescription>
                  Set your weight loss targets for personalized recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="goalWeightLoss"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weekly Weight Loss Goal (lbs)</FormLabel>
                      <FormControl>
                        <Select 
                          onValueChange={(value) => field.onChange(parseFloat(value))}
                          value={field.value?.toString()}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your goal" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0.5">0.5 lbs/week (Conservative)</SelectItem>
                            <SelectItem value="1">1 lb/week (Moderate)</SelectItem>
                            <SelectItem value="1.5">1.5 lbs/week (Aggressive)</SelectItem>
                            <SelectItem value="2">2 lbs/week (Maximum Safe)</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>
                        Recommended: 1-2 lbs per week for safe, sustainable weight loss
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetWeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Weight (kg) - Optional</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="60" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormDescription>
                        Leave empty to use default calculation
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                    <CalculatorIcon className="mr-2 h-4 w-4" />
                    Calculate Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </Form>
    </div>
  );
}
