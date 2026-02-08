"use client";

import { useLanguage } from '../contexts/LanguageContext';

export default function MissionSection() {
    const { t } = useLanguage();
    
    return (
        <section className="mission-section">
            {/* Background Decorative Elements */}
            <div className="mission-bg">
                <div className="mission-glow mission-glow-1" />
                <div className="mission-glow mission-glow-2" />
            </div>

            <div className="mission-container">
                <div className="mission-header">
                    <span className="mission-badge">{t.ourVision}</span>
                    <h2 className="mission-title">
                        {t.missionTitle1} <span className="gradient-text">{t.missionTitle2}</span>
                    </h2>
                    <p className="mission-subtitle">
                        {t.missionSubtitle}
                    </p>
                </div>

                <div className="mission-grid">
                    {/* Problem Statement */}
                    <article className="mission-card" aria-labelledby="problem-title">
                        <div className="mission-card-icon mission-card-icon-problem">
                            <span role="img" aria-label="puzzle piece">🧩</span>
                        </div>
                        <h3 id="problem-title" className="mission-card-title">{t.theProblem}</h3>
                        <p className="mission-card-text">
                            {t.problemText}
                        </p>
                    </article>

                    {/* The Solution */}
                    <article className="mission-card mission-card-featured" aria-labelledby="solution-title">
                        <div className="mission-card-icon mission-card-icon-solution">
                            <span role="img" aria-label="chain link">🔗</span>
                        </div>
                        <h3 id="solution-title" className="mission-card-title">{t.theSolution}</h3>
                        <p className="mission-card-text">
                            {t.solutionText}
                        </p>
                    </article>

                    {/* Business & Impact */}
                    <article className="mission-card" aria-labelledby="impact-title">
                        <div className="mission-card-icon mission-card-icon-impact">
                            <span role="img" aria-label="growth chart">📈</span>
                        </div>
                        <h3 id="impact-title" className="mission-card-title">{t.impactModel}</h3>
                        <p className="mission-card-text">
                            {t.impactText}
                        </p>
                    </article>
                </div>
            </div>
        </section>
    );
}
