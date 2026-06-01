import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: May 31, 2026</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/"><ArrowLeft className="h-4 w-4 mr-2" /> Back</Link>
        </Button>
      </div>

      <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
        <h2 className="text-xl font-semibold text-gray-900">Overview</h2>
        <p>
          KetoPlanner is designed with your privacy first. We collect minimal data and store everything 
          locally in your browser. This policy explains how your information is handled.
        </p>

        <h2 className="text-xl font-semibold text-gray-900">1. No Account Required</h2>
        <p>
          KetoPlanner does not require user accounts, registration, or login. You can use the full 
          Service anonymously without providing any personal information.
        </p>

        <h2 className="text-xl font-semibold text-gray-900">2. Local Storage</h2>
        <p>
          All your data — including calculator results, saved meal plans, and preferences — is stored 
          in your browser's localStorage. This means:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Your data never leaves your device</li>
          <li>No servers store your personal information</li>
          <li>You can clear your data at any time via browser settings</li>
          <li>Data is specific to the browser/device you're using</li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-900">3. AI-Generated Meal Plans</h2>
        <p>
          When you generate a meal plan, your basic health metrics (age, gender, weight, height, 
          activity level) are sent to our backend serverless function, which forwards them to 
          DeepSeek (or your configured LLM provider) solely for the purpose of generating the meal plan.
          This data is not stored, logged, or used for any other purpose.
        </p>

        <h2 className="text-xl font-semibold text-gray-900">4. Third-Party Services</h2>
        <p>KetoPlanner uses the following third-party services:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Netlify</strong> — Hosting and serverless functions (see Netlify's privacy policy)</li>
          <li><strong>DeepSeek / OpenAI</strong> — AI meal plan generation (see their respective privacy policies)</li>
        </ul>
        <p>
          These services have their own privacy policies governing data handling. We have configured 
          them to not store your data. No API keys or personal data are shared beyond what is necessary 
          to generate the meal plan.
        </p>

        <h2 className="text-xl font-semibold text-gray-900">5. Cookies</h2>
        <p>
          KetoPlanner does not use tracking cookies, analytics cookies, or any form of user tracking. 
          We do not serve ads, collect analytics, or monetize user data.
        </p>

        <h2 className="text-xl font-semibold text-gray-900">6. Data Deletion</h2>
        <p>
          Since all data is stored in your browser's localStorage, you can delete it at any time by:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Clearing your browser's site data for ketoplanner.netlify.app</li>
          <li>Using the "Clear Data" option in your browser settings</li>
          <li>Using incognito/private mode (data disappears when you close the window)</li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-900">7. Changes to Policy</h2>
        <p>
          We may update this privacy policy as needed. Changes will be posted on this page with an 
          updated date.
        </p>

        <h2 className="text-xl font-semibold text-gray-900">8. Contact</h2>
        <p>
          For privacy concerns, please open an issue at 
          <a href="https://gitlab.com/alaber/keto-planner" className="text-emerald-600 hover:underline ml-1">
            gitlab.com/alaber/keto-planner
          </a>.
        </p>
      </div>
    </div>
  );
}
