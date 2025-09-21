import React from "react";


function LandingPage() {
  return (

    



    <div className="landing-container">
      {/* Hero Section */}
      <header className="landing-hero">
        <nav className="landing-nav">
          <h2 className="logo">EcoTracker</h2>
          <ul className="nav-links">
            <li>Features</li>
            <li>Community</li>
            <li>How It Works</li>
            <li>
              <button className="cta-button">Get Started</button>
            </li>
          </ul>
        </nav>

        <div className="hero-content">
          <h1>Track Your Carbon Footprint, Make an Impact 🌍</h1>
          <p>
            Join thousands of people reducing emissions, building streaks, and
            competing for a healthier planet.
          </p>
          <div className="hero-cta">
            <button className="cta-button">Start Free</button>
            <button className="add-activity-btn">Learn More</button>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="features-section">
        <h2>Why EcoTracker?</h2>
        <div className="dashboard-cards">
          <div className="card">
            <h3>Personal Insights</h3>
            <p>See your total emissions in real time and monitor progress.</p>
          </div>
          <div className="card">
            <h3>Community Average</h3>
            <p>Compare your footprint with friends and local communities.</p>
          </div>
          <div className="card">
            <h3>Gamified Progress</h3>
            <p>Build streaks and climb the leaderboard while helping the planet.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section>
        <h2>How It Works</h2>
        <ol>
          <li>Log your daily eco-friendly activities easily.</li>
          <li>Track your carbon reduction progress over time.</li>
          <li>Share achievements and compete in the leaderboard.</li>
        </ol>
      </section>

      {/* Community Section */}
      <section>
        <h2>Join the Movement</h2>
        <p>
          Be part of a growing community of climate-conscious individuals
          working together to create lasting change.
        </p>
        <button className="cta-button">Join Now</button>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} EcoTracker. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default LandingPage;
