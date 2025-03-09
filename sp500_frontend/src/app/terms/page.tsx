export default function Terms() {
  return (
    <main className="max-w-3xl mx-auto py-6 px-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">1. Introduction</h2>
        <p className="mt-2">
          Welcome to this stock analytics project. This application is a **portfolio project**
          designed for educational purposes and **does not provide financial advice**. By using this
          website, you acknowledge that all data is for informational use only.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">2. Data Sources</h2>
        <p className="mt-2">
          This project utilizes financial data from **Yahoo Finance (yFinance API)**. While we strive
          to provide accurate and up-to-date information, we do **not guarantee** the accuracy,
          completeness, or timeliness of the data presented.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">3. No Financial Advice</h2>
        <p className="mt-2">
          The information on this site is for **educational and research purposes only**. Nothing on
          this site constitutes professional financial, investment, or trading advice. **You should
          always consult with a qualified financial professional before making any investment
          decisions.**
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">4. No User Data Collection</h2>
        <p className="mt-2">
          At this time, this application **does not collect or store any user data**. No personal
          information, login credentials, or financial records are retained by this website.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">5. Limitation of Liability</h2>
        <p className="mt-2">
          The creator of this project shall **not be held liable** for any losses, damages, or
          inaccuracies that may arise from the use of this application. **Use at your own risk.**
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold">6. Changes to These Terms</h2>
        <p className="mt-2">
          These terms may be updated at any time. It is your responsibility to review this page for
          any changes.
        </p>
      </section>

      <section className="mt-8">
        <p className="text-gray-400 text-sm">Last updated: {new Date().toLocaleDateString()}</p>
      </section>
    </main>
  );
}

