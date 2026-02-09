"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

type Language = 'en' | 'ne';

interface Translations {
    // Navbar
    solana: string;
    connectWallet: string;
    nepal: string;

    // Hero
    heroBadge: string;
    heroTitle1: string;
    heroTitle2: string;
    heroSubtitle: string;
    exploreCampaigns: string;
    startFundraiser: string;
    solRaised: string;
    activeCampaigns: string;
    donors: string;

    // Trust Signals
    onChain: string;
    fastSettlement: string;
    trustLowFees: string;
    madeForNepal: string;

    // Campaigns
    featuredCampaigns: string;
    discoverCauses: string;
    all: string;
    daysLeft: string;
    dayLeft: string;
    funded: string;
    ended: string;
    almostThere: string;
    donateNow: string;
    raised: string;
    goal: string;
    beneficiaries: string;
    verified: string;

    // Detail
    backToCampaigns: string;
    verifiedCampaign: string;
    blockchainSecured: string;
    instantTransfer: string;
    campaignWallet: string;

    // Donate
    makeADonation: string;
    selectAmount: string;
    enterCustomAmount: string;
    messageOptional: string;
    messagePlaceholder: string;
    donorNameOptional: string;
    donorNamePlaceholder: string;
    addYourName: string;
    donate: string;
    processingTransaction: string;
    securedBySolana: string;
    connectWalletToDonate: string;

    // Mission
    ourVision: string;
    missionTitle1: string;
    missionTitle2: string;
    missionSubtitle: string;
    theProblem: string;
    problemText: string;
    theSolution: string;
    solutionText: string;
    impactModel: string;
    impactText: string;

    // How It Works
    howItWorksTitle: string;
    howItWorksSubtitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;

    // Features
    technicalAdvantages: string;
    noSignupRequired: string;
    noSignupDesc: string;
    instantTransactions: string;
    instantTransactionsDesc: string;
    fullTransparency: string;
    fullTransparencyDesc: string;
    lowFees: string;
    lowFeesDesc: string;

    // Footer
    platform: string;
    howItWorks: string;
    browseCauses: string;
    resources: string;
    documentation: string;
    solanaExplorer: string;
    getTestSol: string;
    community: string;
    builtWithLove: string;
    connectedToDevnet: string;

    // Forms
    organizationName: string;
    representativeName: string;
    fundraiserDescription: string;
    walletAddress: string;
    officialLinks: string;
    verificationDetails: string;
    eventDateTime: string;
    locationAddress: string;
    mapLocation: string;
    cancel: string;
    submitForVerification: string;
    submitting: string;

    // Toasts & Messages
    donationSuccess: string;
    viewOnExplorer: string;
    copied: string;
    error: string;
}

const translations: Record<Language, Translations> = {
    en: {
        // Navbar
        solana: 'Solana',
        connectWallet: 'Connect Wallet',
        nepal: 'Nepal',

        // Hero
        heroBadge: 'Powered by Solana Blockchain',
        heroTitle1: 'Crowdfunding Platform',
        heroTitle2: 'for Social Causes',
        heroSubtitle: 'Donate instantly to verified causes on Solana. No intermediaries, 100% transparent, and secure.',
        exploreCampaigns: 'Explore Campaigns',
        startFundraiser: 'Start a Campaign',
        solRaised: 'SOL Raised',
        activeCampaigns: 'Active Campaigns',
        donors: 'Donors',

        // Trust Signals
        onChain: '100% On-Chain Transparency',
        fastSettlement: 'Instant Settlement',
        trustLowFees: 'Near-Zero Fees',
        madeForNepal: 'Verified Campaigns',

        // Campaigns
        featuredCampaigns: 'Featured Campaigns',
        discoverCauses: 'Discover verified causes making real-world impact',
        all: 'All',
        daysLeft: 'days left',
        dayLeft: 'day left',
        funded: 'Funded!',
        ended: 'Ended',
        almostThere: '🔥 Almost there!',
        donateNow: 'Donate Now',
        raised: 'raised',
        goal: 'goal',
        beneficiaries: 'beneficiaries',
        verified: 'Verified',

        // Detail
        backToCampaigns: 'Back to Campaigns',
        verifiedCampaign: 'Verified Campaign',
        blockchainSecured: 'Blockchain Secured',
        instantTransfer: 'Instant Transfer',
        campaignWallet: 'Campaign Wallet',

        // Donate
        makeADonation: 'Make a Donation',
        selectAmount: 'Select Amount (SOL)',
        enterCustomAmount: 'Enter Custom Amount',
        messageOptional: 'Message to Fund (Optional)',
        messagePlaceholder: 'Share your support...',
        donorNameOptional: 'Add your name (appears publicly)',
        donorNamePlaceholder: 'Your name or nickname',
        addYourName: 'Add your name',
        donate: 'Donate',
        processingTransaction: 'Processing Transaction...',
        securedBySolana: 'Secured by Solana Blockchain',
        connectWalletToDonate: 'Connect your wallet to donate',

        // Mission
        ourVision: 'Our Vision',
        missionTitle1: 'Reimagining Charity for the',
        missionTitle2: 'Digital Age',
        missionSubtitle: "We are solving the transparency crisis in global philanthropy using Solana's high-speed blockchain.",
        theProblem: 'The Problem',
        problemText: 'Traditional charity is plagued by opacity and inefficiency. Donors rarely know if their money reached the beneficiary, and up to 30% of funds are lost to administrative overhead and banking intermediaries.',
        theSolution: 'The Solution',
        solutionText: 'SahayogFund utilizes smart contracts to automate the flow of funds. We remove the middleman, ensuring 100% traceability from wallet to cause. Every transaction is verifiable on the Solana blockchain in real-time.',
        impactModel: 'Impact & Model',
        impactText: 'We operate on a sustainable 1% platform fee model, far lower than the industry standard (5-8%). This enables micro-donations across borders with near-zero gas fees, unlocking global community support.',

        // How It Works
        howItWorksTitle: 'How It Works',
        howItWorksSubtitle: 'Three simple steps to make a real impact. No middlemen, no hidden fees.',
        step1Title: 'Connect Wallet',
        step1Desc: 'Link your Solana wallet in one click. No signup, no passwords, no barriers.',
        step2Title: 'Choose a Cause',
        step2Desc: 'Browse verified campaigns with real stories. Every cause is vetted and transparent.',
        step3Title: 'Donate & Track',
        step3Desc: 'Your donation arrives instantly and is recorded on-chain forever. Full traceability.',

        // Features
        technicalAdvantages: 'Why SahayogFund?',
        noSignupRequired: 'No Signup Required',
        noSignupDesc: 'Connect your Web3 wallet and start donating instantly. No forms, no passwords.',
        instantTransactions: 'Instant Transactions',
        instantTransactionsDesc: "Solana's lightning-fast blockchain ensures your donation arrives in seconds.",
        fullTransparency: 'Full Transparency',
        fullTransparencyDesc: 'Every transaction is recorded on-chain. Track your impact with complete visibility.',
        lowFees: 'Near-Zero Fees',
        lowFeesDesc: "Solana's minimal transaction fees mean more of your donation reaches the cause. Not the platform.",

        // Footer
        platform: 'Platform',
        howItWorks: 'How it Works',
        browseCauses: 'Browse Causes',
        resources: 'Resources',
        documentation: 'Documentation',
        solanaExplorer: 'Solana Explorer',
        getTestSol: 'Get Test SOL',
        community: 'Community',
        builtWithLove: 'सहयोग — Built with ❤️ on Solana',
        connectedToDevnet: 'Connected to Devnet',

        // Forms
        organizationName: 'Organization Name',
        representativeName: 'Representative Name',
        fundraiserDescription: 'Fundraiser Description',
        walletAddress: 'Solana Wallet Address',
        officialLinks: 'Official Links (Social, Website)',
        verificationDetails: 'Verification Details',
        eventDateTime: 'Event Date/Time',
        locationAddress: 'Location Address',
        mapLocation: 'Map Location Verification',
        cancel: 'Cancel',
        submitForVerification: 'Submit for Verification',
        submitting: 'Submitting...',

        // Toasts
        donationSuccess: 'Donation Successful!',
        viewOnExplorer: 'View on Explorer',
        copied: 'Copied!',
        error: 'Error',
    },
    ne: {
        // Navbar
        solana: 'सोलाना',
        connectWallet: 'वालेट जडान',
        nepal: 'नेपाल',

        // Hero
        heroBadge: 'सोलाना ब्लकचेनद्वारा संचालित',
        heroTitle1: 'सामाजिक सरोकारका लागि',
        heroTitle2: 'क्राउडफन्डिङ प्लेटफर्म',
        heroSubtitle: 'सोलानामा प्रमाणित अभियानहरूमा तुरुन्तै दान गर्नुहोस्। कुनै बिचौलिया छैन, १००% पारदर्शी र सुरक्षित।',
        exploreCampaigns: 'अभियानहरू हेर्नुहोस्',
        startFundraiser: 'अभियान सुरु गर्नुहोस्',
        solRaised: 'SOL संकलित',
        activeCampaigns: 'सक्रिय अभियानहरू',
        donors: 'दाताहरू',

        // Trust Signals
        onChain: '१००% अन-चेन पारदर्शिता',
        fastSettlement: 'तत्काल भुक्तानी',
        trustLowFees: 'लगभग शून्य शुल्क',
        madeForNepal: 'प्रमाणित अभियानहरू',

        // Campaigns
        featuredCampaigns: 'विशेष अभियानहरू',
        discoverCauses: 'वास्तविक प्रभाव पार्ने प्रमाणित अभियानहरू पत्ता लगाउनुहोस्',
        all: 'सबै',
        daysLeft: 'दिन बाँकी',
        dayLeft: 'दिन बाँकी',
        funded: 'लक्ष्य पूरा!',
        ended: 'समाप्त',
        almostThere: '🔥 लगभग पुग्यो!',
        donateNow: 'अहिले दान गर्नुहोस्',
        raised: 'संकलित',
        goal: 'लक्ष्य',
        beneficiaries: 'लाभार्थीहरू',
        verified: 'प्रमाणित',

        // Detail
        backToCampaigns: 'अभियानहरूमा फर्कनुहोस्',
        verifiedCampaign: 'प्रमाणित अभियान',
        blockchainSecured: 'ब्लकचेनद्वारा सुरक्षित',
        instantTransfer: 'तत्काल स्थानान्तरण',
        campaignWallet: 'अभियान वालेट',

        // Donate
        makeADonation: 'दान गर्नुहोस्',
        selectAmount: 'रकम छान्नुहोस् (SOL)',
        enterCustomAmount: 'आफ्नो रकम लेख्नुहोस्',
        messageOptional: 'कोषलाई सन्देश (ऐच्छिक)',
        messagePlaceholder: 'आफ्नो समर्थन व्यक्त गर्नुहोस्...',
        donorNameOptional: 'आफ्नो नाम थप्नुहोस् (सार्वजनिक रूपमा देखिन्छ)',
        donorNamePlaceholder: 'तपाईंको नाम वा उपनाम',
        addYourName: 'नाम थप्नुहोस्',
        donate: 'दान गर्नुहोस्',
        processingTransaction: 'कारोबार प्रक्रियामा छ...',
        securedBySolana: 'सोलाना ब्लकचेनद्वारा सुरक्षित',
        connectWalletToDonate: 'दान गर्न वालेट जडान गर्नुहोस्',

        // Mission
        ourVision: 'हाम्रो दृष्टिकोण',
        missionTitle1: 'डिजिटल युगको लागि',
        missionTitle2: 'परोपकारको पुनर्कल्पना',
        missionSubtitle: 'हामी सोलानाको उच्च-गति ब्लकचेन प्रयोग गरेर विश्वव्यापी परोपकारमा पारदर्शिता संकट समाधान गर्दैछौं।',
        theProblem: 'समस्या',
        problemText: 'परम्परागत दान प्रणाली अपारदर्शिता र अकुशलताले ग्रसित छ। दाताहरूलाई आफ्नो रकम लाभार्थीसम्म पुग्यो कि थाहा हुँदैन, र ३०% सम्म कोष प्रशासनिक खर्च र बैंकिङ बिचौलियामा हराउँछ।',
        theSolution: 'समाधान',
        solutionText: 'सहयोगफन्डले स्मार्ट कन्ट्र्याक्ट प्रयोग गरेर कोषको प्रवाह स्वचालित गर्छ। हामी बिचौलिया हटाउँछौं र वालेटदेखि अभियानसम्म १००% ट्रेसेबिलिटी सुनिश्चित गर्छौं। प्रत्येक कारोबार सोलाना ब्लकचेनमा वास्तविक समयमा प्रमाणित हुन्छ।',
        impactModel: 'प्रभाव र मोडेल',
        impactText: 'हामी दिगो १% प्लेटफर्म शुल्क मोडेलमा सञ्चालन गर्छौं, जुन उद्योग मानक (५-८%) भन्दा धेरै कम छ। यसले लगभग शून्य ग्यास शुल्कमा सीमापारि माइक्रो-दानहरू सम्भव बनाउँछ।',

        // How It Works
        howItWorksTitle: 'यसरी काम गर्छ',
        howItWorksSubtitle: 'तीनवटा सरल चरणमा वास्तविक प्रभाव पार्नुहोस्। बिचौलिया छैन, लुकेको शुल्क छैन।',
        step1Title: 'वालेट जडान गर्नुहोस्',
        step1Desc: 'एक क्लिकमा आफ्नो सोलाना वालेट जडान गर्नुहोस्। साइन अप छैन, पासवर्ड छैन, कुनै बाधा छैन।',
        step2Title: 'अभियान छान्नुहोस्',
        step2Desc: 'वास्तविक कथाहरू भएका प्रमाणित अभियानहरू हेर्नुहोस्। हरेक अभियान जाँचिएको र पारदर्शी छ।',
        step3Title: 'दान गर्नुहोस् र ट्र्याक गर्नुहोस्',
        step3Desc: 'तपाईंको दान तुरुन्तै पुग्छ र सधैंका लागि अन-चेनमा रेकर्ड हुन्छ। पूर्ण ट्रेसेबिलिटी।',

        // Features
        technicalAdvantages: 'सहयोगफन्ड किन?',
        noSignupRequired: 'साइन अप आवश्यक छैन',
        noSignupDesc: 'आफ्नो Web3 वालेट जडान गर्नुहोस् र तुरुन्तै दान सुरु गर्नुहोस्। फारम छैन, पासवर्ड छैन।',
        instantTransactions: 'तत्काल कारोबार',
        instantTransactionsDesc: 'सोलानाको अति छिटो ब्लकचेनले तपाईंको दान सेकेन्डमै पुर्‍याउँछ।',
        fullTransparency: 'पूर्ण पारदर्शिता',
        fullTransparencyDesc: 'प्रत्येक कारोबार अन-चेनमा रेकर्ड हुन्छ। पूर्ण दृश्यताका साथ आफ्नो प्रभाव ट्र्याक गर्नुहोस्।',
        lowFees: 'लगभग शून्य शुल्क',
        lowFeesDesc: 'सोलानाको न्यूनतम कारोबार शुल्कले तपाईंको दानको बढी भाग अभियानमा पुग्छ, प्लेटफर्ममा होइन।',

        // Footer
        platform: 'प्लेटफर्म',
        howItWorks: 'यसरी काम गर्छ',
        browseCauses: 'अभियानहरू हेर्नुहोस्',
        resources: 'स्रोतहरू',
        documentation: 'प्रलेखन',
        solanaExplorer: 'सोलाना एक्सप्लोरर',
        getTestSol: 'टेस्ट SOL लिनुहोस्',
        community: 'समुदाय',
        builtWithLove: 'सहयोग — सोलानामा ❤️ सहित निर्मित',
        connectedToDevnet: 'Devnet मा जडित',

        // Forms
        organizationName: 'संस्थाको नाम',
        representativeName: 'प्रतिनिधिको नाम',
        fundraiserDescription: 'कोष संकलनको विवरण',
        walletAddress: 'सोलाना वालेट ठेगाना',
        officialLinks: 'आधिकारिक लिङ्कहरू (सामाजिक, वेबसाइट)',
        verificationDetails: 'प्रमाणीकरण विवरण',
        eventDateTime: 'कार्यक्रमको मिति/समय',
        locationAddress: 'स्थानको ठेगाना',
        mapLocation: 'नक्सामा स्थान प्रमाणीकरण',
        cancel: 'रद्द गर्नुहोस्',
        submitForVerification: 'प्रमाणीकरणका लागि पेश गर्नुहोस्',
        submitting: 'पेश गर्दै...',

        // Toasts
        donationSuccess: 'दान सफल भयो!',
        viewOnExplorer: 'एक्सप्लोररमा हेर्नुहोस्',
        copied: 'प्रतिलिपि गरियो!',
        error: 'त्रुटि',
    }
};

interface LanguageContextValue {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: Translations;
    toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en');

    // Persist language preference
    useEffect(() => {
        const saved = localStorage.getItem('sahayog-language') as Language;
        if (saved && (saved === 'en' || saved === 'ne')) {
            setLanguageState(saved);
        }
    }, []);

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('sahayog-language', lang);
        // Update html lang attribute for accessibility
        document.documentElement.lang = lang;
    }, []);

    const toggleLanguage = useCallback(() => {
        const newLang = language === 'en' ? 'ne' : 'en';
        setLanguage(newLang);
    }, [language, setLanguage]);

    const value: LanguageContextValue = {
        language,
        setLanguage,
        t: translations[language],
        toggleLanguage,
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}

export default LanguageContext;
