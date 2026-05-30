import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronRight, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

export default function Education() {
  const [activeSection, setActiveSection] = useState('basics');

  const ketoFoods = {
    allowed: [
      {
        category: 'Fats & Oils',
        items: ['Olive oil', 'Coconut oil', 'Avocado oil', 'Butter', 'MCT oil'],
        description: 'High-quality fats are the cornerstone of the keto diet'
      },
      {
        category: 'Proteins',
        items: ['Grass-fed beef', 'Wild-caught fish', 'Free-range poultry', 'Eggs', 'Organ meats'],
        description: 'Choose high-quality, unprocessed protein sources'
      },
      {
        category: 'Low-Carb Vegetables',
        items: ['Spinach', 'Kale', 'Broccoli', 'Cauliflower', 'Brussels sprouts'],
        description: 'Nutrient-dense vegetables that are low in net carbs'
      },
      {
        category: 'Dairy',
        items: ['Hard cheeses', 'Greek yogurt (full-fat)', 'Heavy cream'],
        description: 'Full-fat dairy products in moderation'
      },
      {
        category: 'Nuts & Seeds',
        items: ['Macadamia nuts', 'Walnuts', 'Almonds', 'Chia seeds', 'Flax seeds'],
        description: 'Low-carb nuts and seeds for healthy fats and fiber'
      },
      {
        category: 'Berries',
        items: ['Strawberries', 'Raspberries', 'Blackberries (small portions)'],
        description: 'The only fruits allowed, and only in small amounts'
      }
    ],
    avoid: [
      {
        category: 'Grains & Starches',
        items: ['Bread', 'Rice', 'Pasta', 'Cereals', 'Potatoes'],
        reason: 'Too high in carbohydrates'
      },
      {
        category: 'Sugars',
        items: ['Table sugar', 'Honey', 'Maple syrup', 'Agave', 'Candy'],
        reason: 'Cause rapid blood sugar spikes'
      },
      {
        category: 'Most Fruits',
        items: ['Bananas', 'Apples', 'Oranges', 'Grapes', 'Mangoes'],
        reason: 'High in natural sugars'
      },
      {
        category: 'Legumes',
        items: ['Beans', 'Lentils', 'Chickpeas', 'Peanuts'],
        reason: 'High carb content'
      },
      {
        category: 'Processed Foods',
        items: ['Chips', 'Crackers', 'Fast food', 'Packaged snacks'],
        reason: 'Often high in carbs and unhealthy additives'
      }
    ]
  };

  const macroBreakdown = [
    {
      macro: 'Fat',
      percentage: '70-80%',
      grams: '9 calories per gram',
      sources: 'Oils, nuts, fatty fish, avocados',
      color: 'bg-orange-500'
    },
    {
      macro: 'Protein',
      percentage: '15-25%',
      grams: '4 calories per gram',
      sources: 'Meat, fish, eggs, dairy',
      color: 'bg-red-500'
    },
    {
      macro: 'Carbohydrates',
      percentage: '5-10%',
      grams: '4 calories per gram',
      sources: 'Vegetables, small amounts of berries',
      color: 'bg-green-500'
    }
  ];

  const benefitsAndRisks = {
    benefits: [
      'Rapid initial weight loss (water weight)',
      'Reduced appetite and hunger',
      'Improved mental clarity and focus',
      'Better blood sugar control',
      'Increased fat burning',
      'Potential cardiovascular benefits'
    ],
    risks: [
      'Keto flu (initial adaptation symptoms)',
      'Digestive issues and constipation',
      'Nutrient deficiencies if not well-planned',
      'Kidney stones (rare)',
      'Bad breath (ketosis breath)',
      'Social and lifestyle challenges'
    ],
    contraindications: [
      'Pancreatitis',
      'Liver failure',
      'Disorders of fat metabolism',
      'Primary carnitine deficiency',
      'Carnitine palmitoyltransferase (CPT) deficiency',
      'Carnitine translocase deficiency',
      'Porphyrias'
    ]
  };

  const ketoTips = [
    {
      title: 'Start Gradually',
      description: 'Reduce carbs slowly over a week to minimize keto flu symptoms.',
      icon: '🎯'
    },
    {
      title: 'Stay Hydrated',
      description: 'Drink plenty of water and consider electrolyte supplementation.',
      icon: '💧'
    },
    {
      title: 'Plan Your Meals',
      description: 'Meal planning prevents poor food choices when hungry.',
      icon: '📝'
    },
    {
      title: 'Track Your Macros',
      description: 'Use apps or tools to monitor your fat, protein, and carb intake.',
      icon: '📊'
    },
    {
      title: 'Be Patient',
      description: 'It takes 2-4 weeks to become fully keto-adapted.',
      icon: '⏰'
    },
    {
      title: 'Listen to Your Body',
      description: 'Adjust your approach based on how you feel and your results.',
      icon: '🎧'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Keto Diet Education
        </h1>
        <p className="text-lg text-gray-600">
          Everything you need to know about the ketogenic diet for safe and effective weight loss
        </p>
      </div>

      <Tabs defaultValue="basics" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="basics">Basics</TabsTrigger>
          <TabsTrigger value="foods">Foods</TabsTrigger>
          <TabsTrigger value="benefits">Benefits & Risks</TabsTrigger>
          <TabsTrigger value="tips">Tips</TabsTrigger>
        </TabsList>

        <TabsContent value="basics" className="space-y-6">
          {/* What is Keto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>What is the Ketogenic Diet?</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                The ketogenic or "keto" diet is a low-carbohydrate, fat-rich eating plan that has been used historically 
                to treat medical conditions like diabetes (19th century) and epilepsy in children (1920s). More recently, 
                it has gained attention as a potential weight-loss strategy.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Unlike other low-carb diets which are high in protein and moderate in fat, the ketogenic diet is distinctive 
                for its exceptionally high-fat content with only a moderate intake of protein.
              </p>
              
              <div className="bg-emerald-50 p-4 rounded-lg">
                <h4 className="font-semibold text-emerald-800 mb-2">How It Works:</h4>
                <p className="text-emerald-700 text-sm">
                  The diet's core principle is to deprive the body of glucose (its primary energy source), leading to the 
                  production of ketones from stored fat. This metabolic state is called ketosis, where ketones become 
                  the body's main fuel source instead of glucose.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Macro Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Macronutrient Breakdown</CardTitle>
              <CardDescription>
                The specific ratios that define a ketogenic diet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {macroBreakdown.map((macro, index) => (
                  <div key={index} className="text-center space-y-4">
                    <div className={`w-20 h-20 ${macro.color} rounded-full mx-auto flex items-center justify-center text-white font-bold text-lg`}>
                      {macro.percentage}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{macro.macro}</h3>
                      <p className="text-sm text-gray-600 mb-2">{macro.grams}</p>
                      <p className="text-sm text-gray-700">{macro.sources}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weight Loss Mechanism */}
          <Card>
            <CardHeader>
              <CardTitle>How Keto Promotes Weight Loss</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-emerald-600 text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Satiating Effect</h4>
                    <p className="text-sm text-gray-600">High-fat content may decrease food cravings and increase feelings of fullness.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-emerald-600 text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Hormone Regulation</h4>
                    <p className="text-sm text-gray-600">Restricted carbohydrates may decrease appetite-stimulating hormones like insulin and ghrelin.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-emerald-600 text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Direct Hunger Reduction</h4>
                    <p className="text-sm text-gray-600">Ketone bodies as the main fuel source may directly reduce hunger sensations.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-emerald-600 text-sm font-bold">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Increased Energy Expenditure</h4>
                    <p className="text-sm text-gray-600">Converting fat and protein to glucose may increase calorie burn through metabolic processes.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="foods" className="space-y-6">
          {/* Foods to Eat */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Foods to Eat</span>
              </CardTitle>
              <CardDescription>
                Keto-friendly foods that support ketosis and provide essential nutrients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ketoFoods.allowed.map((category, index) => (
                  <div key={index} className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-emerald-600 mb-1">{category.category}</h3>
                      <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {category.items.map((item, itemIndex) => (
                        <Badge key={itemIndex} variant="outline" className="border-green-200 text-green-700">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Foods to Avoid */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <span>Foods to Avoid</span>
              </CardTitle>
              <CardDescription>
                High-carb foods that will prevent ketosis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {ketoFoods.avoid.map((category, index) => (
                  <div key={index} className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-red-600 mb-1">{category.category}</h3>
                      <p className="text-sm text-gray-600 mb-3">{category.reason}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {category.items.map((item, itemIndex) => (
                        <Badge key={itemIndex} variant="outline" className="border-red-200 text-red-700">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Net Carbs Explanation */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-800">
                <Info className="h-5 w-5" />
                <span>Understanding Net Carbs</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-blue-700">
                <p className="font-semibold">Net Carbs = Total Carbs - Fiber</p>
                <p className="text-sm">
                  On keto, you track "net carbs" rather than total carbs. Fiber doesn't raise blood sugar, 
                  so it's subtracted from total carbs. Aim for 20-25g net carbs per day to maintain ketosis.
                </p>
                <div className="bg-white p-3 rounded border">
                  <p className="text-sm text-gray-700">
                    <strong>Example:</strong> 1 cup of broccoli has 6g total carbs and 2g fiber = 4g net carbs
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benefits" className="space-y-6">
          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Potential Benefits</span>
              </CardTitle>
              <CardDescription>
                Research-backed benefits of the ketogenic diet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {benefitsAndRisks.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Risks and Side Effects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span>Potential Risks & Side Effects</span>
              </CardTitle>
              <CardDescription>
                Important considerations and potential drawbacks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {benefitsAndRisks.risks.map((risk, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                    <span className="text-gray-700">{risk}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contraindications */}
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription>
              <div className="space-y-3">
                <div>
                  <strong className="text-red-800">Important: Who Should NOT Try Keto</strong>
                  <p className="text-red-700 mt-1">
                    The ketogenic diet is not suitable for everyone. People with the following conditions should avoid keto:
                  </p>
                </div>
                <ul className="space-y-1 text-red-700 text-sm">
                  {benefitsAndRisks.contraindications.map((condition, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 flex-shrink-0" />
                      <span>{condition}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-red-700 text-sm font-medium">
                  Always consult with a healthcare professional before starting any new diet, especially if you have pre-existing health conditions.
                </p>
              </div>
            </AlertDescription>
          </Alert>

          {/* Safe Weight Loss */}
          <Card>
            <CardHeader>
              <CardTitle>Safe Weight Loss Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-emerald-50 p-4 rounded-lg">
                <h4 className="font-semibold text-emerald-800 mb-2">Recommended Rate:</h4>
                <p className="text-emerald-700 text-sm">
                  A safe and sustainable rate of weight loss on keto is 1-2 pounds (0.5-1 kg) per week after the initial 
                  phase of rapid water weight loss. In the first week, it's common to lose up to 10 pounds due to the diuretic effect.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">What to Expect:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• <strong>Week 1-2:</strong> Rapid water weight loss (2-10 lbs)</li>
                  <li>• <strong>Week 3-4:</strong> Beginning of fat adaptation</li>
                  <li>• <strong>Week 4+:</strong> Steady fat loss (1-2 lbs/week)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tips" className="space-y-6">
          {/* Success Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ketoTips.map((tip, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <span className="text-2xl">{tip.icon}</span>
                    <span>{tip.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{tip.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Common Mistakes */}
          <Card>
            <CardHeader>
              <CardTitle>Common Mistakes to Avoid</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="mistake-1">
                  <AccordionTrigger>Not tracking macros properly</AccordionTrigger>
                  <AccordionContent>
                    Many beginners underestimate carb intake or don't eat enough fat. Use a food tracking app 
                    to monitor your macronutrient ratios accurately, especially in the first few weeks.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="mistake-2">
                  <AccordionTrigger>Ignoring electrolytes</AccordionTrigger>
                  <AccordionContent>
                    Keto has a diuretic effect, causing loss of sodium, potassium, and magnesium. Supplement 
                    these electrolytes or increase intake through food to avoid fatigue, headaches, and cramps.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="mistake-3">
                  <AccordionTrigger>Eating too much protein</AccordionTrigger>
                  <AccordionContent>
                    Excess protein can be converted to glucose through gluconeogenesis, potentially interfering 
                    with ketosis. Stick to moderate protein intake (15-25% of calories).
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="mistake-4">
                  <AccordionTrigger>Not planning meals</AccordionTrigger>
                  <AccordionContent>
                    Without meal planning, it's easy to resort to high-carb convenience foods. Plan your meals 
                    and have keto-friendly snacks readily available.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="mistake-5">
                  <AccordionTrigger>Giving up too early</AccordionTrigger>
                  <AccordionContent>
                    It takes 2-4 weeks to become fully keto-adapted. The initial "keto flu" is temporary. 
                    Stay consistent and be patient with the adaptation process.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Keto Flu Management */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-yellow-800">Managing the "Keto Flu"</CardTitle>
              <CardDescription className="text-yellow-700">
                Common symptoms during the first 1-2 weeks of keto adaptation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-2">Symptoms:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Fatigue and low energy</li>
                    <li>• Headaches</li>
                    <li>• Irritability</li>
                    <li>• Difficulty sleeping</li>
                    <li>• Constipation</li>
                    <li>• Brain fog</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-2">Solutions:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Increase water intake</li>
                    <li>• Add extra salt to food</li>
                    <li>• Take magnesium supplements</li>
                    <li>• Eat potassium-rich foods</li>
                    <li>• Get adequate sleep</li>
                    <li>• Reduce exercise intensity temporarily</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Final Disclaimer */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Medical Disclaimer:</strong> This information is for educational purposes only and should not replace 
          professional medical advice. Always consult with a healthcare provider before starting any new diet, especially 
          if you have pre-existing health conditions or are taking medications.
        </AlertDescription>
      </Alert>
    </div>
  );
}
