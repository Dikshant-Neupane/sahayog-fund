"use client";

import { useLanguage } from '../contexts/LanguageContext';

const LanguageToggle = () => {
    const { language, toggleLanguage } = useLanguage();

    return (
        <button
            type="button"
            onClick={toggleLanguage}
            className="language-toggle"
            aria-label={`Switch to ${language === 'en' ? 'Nepali' : 'English'}`}
            title={`Switch to ${language === 'en' ? 'नेपाली' : 'English'}`}
        >
            <span className={`lang-option ${language === 'en' ? 'active' : ''}`}>
                EN
            </span>
            <span className="lang-divider">/</span>
            <span className={`lang-option ${language === 'ne' ? 'active' : ''}`}>
                ने
            </span>
        </button>
    );
};

export default LanguageToggle;
