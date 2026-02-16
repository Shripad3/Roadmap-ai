export default function AIBreakdown() {
  return (
    <div className="space-y-8">
      <div className="card">
        <h1 className="text-3xl font-bold mb-4">AI Task Breakdown</h1>
        <p className="text-gray-600 mb-6">
          Learn how our AI breaks down complex tasks into manageable subtasks.
        </p>

        <div className="space-y-6">
          <div className="border-l-4 border-primary-600 pl-4">
            <h2 className="text-xl font-semibold mb-2">How it Works</h2>
            <p className="text-gray-700">
              Our AI uses Google's Gemini model to analyze your task and create 
              a structured breakdown of actionable subtasks. It considers the context, 
              dependencies, and logical order of steps needed to complete your goal.
            </p>
          </div>

          <div className="border-l-4 border-primary-600 pl-4">
            <h2 className="text-xl font-semibold mb-2">Benefits</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Save time planning complex projects</li>
              <li>Never miss important steps</li>
              <li>Get organized instantly</li>
              <li>See the logical flow of work</li>
              <li>Track progress on each subtask</li>
            </ul>
          </div>

          <div className="border-l-4 border-primary-600 pl-4">
            <h2 className="text-xl font-semibold mb-2">Example</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium mb-2">Task: "Launch a new product"</p>
              <p className="text-sm text-gray-600">AI generates:</p>
              <ul className="mt-2 space-y-1 text-sm text-gray-700">
                <li>1. Define product requirements and specifications</li>
                <li>2. Conduct market research and competitive analysis</li>
                <li>3. Create marketing materials and landing page</li>
                <li>4. Set up payment processing and billing</li>
                <li>5. Plan and execute launch campaign</li>
              </ul>
            </div>
          </div>

          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <p className="text-primary-800">
              💡 <strong>Tip:</strong> The more context you provide in the description, 
              the better and more specific the AI breakdown will be!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}