export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy for Receipt Roast</h1>
        <p className="text-sm text-gray-500 mb-8">Effective Date: November 11, 2026</p>

        <div className="space-y-6 text-base leading-relaxed">
          <p>
            This Privacy Policy applies to the Receipt Roast mobile application (the “App”) operated by Creative Apps (“we”, “us”, or “our”). Contact: <a href="mailto:apkdev0411@gmail.com" className="text-blue-600 underline">apkdev0411@gmail.com</a>
          </p>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">1. Information We Collect</h2>
            <p>Receipt Roast is designed to minimize data collection.</p>
            <p className="mt-2"><strong>Information we do NOT store:</strong></p>
            <ul className="list-disc pl-6 mt-1">
              <li>Receipt images are processed in memory only and are <strong>never saved</strong> on our servers or permanently stored.</li>
            </ul>
            <p className="mt-3"><strong>Information stored only on your device:</strong></p>
            <ul className="list-disc pl-6 mt-1">
              <li>Points, levels, badges, and roast history (only if you are a Premium user)</li>
              <li>Premium status</li>
            </ul>
            <p className="mt-3"><strong>Automatically collected information:</strong></p>
            <ul className="list-disc pl-6 mt-1">
              <li>Device information and advertising identifiers (through AdMob)</li>
              <li>Purchase information (through RevenueCat and Google Play)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">2. How We Use Information</h2>
            <ul className="list-disc pl-6">
              <li>To generate sarcastic roasts of your receipts using AI (xAI / Grok)</li>
              <li>To display ads (only to free users)</li>
              <li>To process Premium purchases</li>
              <li>To improve the App</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">3. Artificial Intelligence</h2>
            <p>
              When you upload a receipt, the image is sent to xAI (Grok) solely to analyze the content and generate the roast. The image is processed temporarily and is not retained by us. xAI’s processing is subject to their own privacy policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">4. Third-Party Services</h2>
            <p>The App uses the following third-party services:</p>
            <ul className="list-disc pl-6 mt-2">
              <li><strong>Google Play Services</strong></li>
              <li><strong>Google AdMob</strong> (ads)</li>
              <li><strong>RevenueCat</strong> (in-app purchases)</li>
              <li><strong>xAI</strong> (AI processing)</li>
            </ul>
            <p className="mt-2">Each of these services has its own privacy policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">5. Data Retention</h2>
            <ul className="list-disc pl-6">
              <li>Receipt images: not retained</li>
              <li>Local data (points, badges, Premium status): stored only on your device until you uninstall the App or clear data</li>
              <li>We do not maintain user accounts or server-side personal profiles</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">6. Your Rights</h2>
            <p>
              You can request deletion of any personal data we may hold by contacting us at <a href="mailto:apkdev0411@gmail.com" className="text-blue-600 underline">apkdev0411@gmail.com</a>. Since we store almost no personal data on our servers, most data is deleted simply by uninstalling the App.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">7. Children</h2>
            <p>Receipt Roast is not intended for children under 13.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">8. Changes</h2>
            <p>We may update this Privacy Policy. The updated version will be posted with a new effective date.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">9. Contact</h2>
            <p>
              If you have questions about this Privacy Policy, contact us at: <br />
              <a href="mailto:apkdev0411@gmail.com" className="text-blue-600 underline">apkdev0411@gmail.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}