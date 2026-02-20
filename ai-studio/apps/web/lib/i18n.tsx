import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'hi' | 'mr';

interface I18nContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const TRANSLATIONS: Record<Language, Record<string, string>> = {
    en: {
        cinematicVideo: "Cinematic Video",
        studioActive: "Studio Active",
        connecting: "Connecting...",
        studioOffline: "Studio Offline",
        produceHollywood: "Produce Hollywood-grade cinematic motion using the state-of-the-art Wan 2.1 engine.",
        creditsLeft: "Credits left",
        cost: "Cost",
        t2v: "Text to Video",
        i2v: "Image to Video",
        video_inpaint: "Video Auto-Mask",
        uploadBaseVideo: "Upload Base Video",
        uploadImageRef: "Upload image for reference",
        whatToHide: "What to Hide/Mask?",
        hideMaskPlaceholder: "Describe what the AI should find and mask... e.g., 'the person's red shirt', 'the car in background'",
        smartAiDesc: "Smart AI detection will automatically find and mask these objects across all frames.",
        refinementPrompt: "Refinement / Inpaint Prompt",
        motionPrompt: "Motion Prompt",
        refinePlaceholder: "What to put in the masked area? e.g., 'a blue denium jacket', 'a futuristic electric car'",
        motionPlaceholder: "Describe the action and atmosphere... e.g., 'A high-speed chase through a neon-drenched futuristic city...'",
        tokensUsed: "tokens used",
        refineWithAi: "Refine with AI",
        aspectRatio: "Aspect Ratio",
        durationFps: "Duration & FPS",
        standard5s: "Standard (5s)",
        extended7s: "Extended (7.5s)",
        snapshot2s: "Snapshot (2.5s)",
        cinematic16: "Cinematic (16 FPS)",
        smooth24: "Smooth (24 FPS)",
        fluid30: "Fluid (30 FPS)",
        startProduction: "Start Production",
        stopResetUI: "Stop & Reset Production UI",
        cinemaOutput: "Cinema Output",
        stageEmpty: "Stage is empty. Start production to see magic.",
        calculatingMotion: "Calculating Motion Vectors...",
        temporalFrame: "Temporal Frame Synthesis",
        productionMetadata: "Production Metadata",
        format: "Format:",
        engine: "Engine:",
        resolution: "Resolution:",
        frames: "Frames:",
        studioArchives: "Studio Archives",
        pastGenerations: "Your past cinematic generations",
        browseAll: "Browse All"
    },
    hi: {
        cinematicVideo: "सिनेमैटिक वीडियो",
        studioActive: "स्टूडियो सक्रिय",
        connecting: "कनेक्ट हो रहा है...",
        studioOffline: "स्टूडियो ऑफ़लाइन",
        produceHollywood: "अत्याधुनिक Wan 2.1 इंजन का उपयोग करके हॉलीवुड-ग्रेड सिनेमैटिक मोशन तैयार करें।",
        creditsLeft: "क्रेडिट शेष",
        cost: "लागत",
        t2v: "टेक्स्ट से वीडियो",
        i2v: "इमेज से वीडियो",
        video_inpaint: "वीडियो ऑटो-मास्क",
        uploadBaseVideo: "वीडियो अपलोड करें",
        uploadImageRef: "संदर्भ के लिए छवि अपलोड करें",
        whatToHide: "क्या छिपाएं/मास्क करें?",
        hideMaskPlaceholder: "वर्णन करें कि एआई को क्या खोजना और मास्क करना चाहिए... जैसे, 'व्यक्ति की लाल कमीज'",
        smartAiDesc: "स्मार्ट एआई डिटेक्शन सभी फ़्रेमों में इन वस्तुओं को स्वचालित रूप से खोज और मास्क करेगा।",
        refinementPrompt: "रिफाइनमेंट / इनपेंट प्रॉम्प्ट",
        motionPrompt: "मोशन प्रॉम्प्ट",
        refinePlaceholder: "मास्क किए गए क्षेत्र में क्या रखना है? जैसे, 'एक नीली डेनिम जैकेट'",
        motionPlaceholder: "माहौल का वर्णन करें... जैसे, 'नियॉन रोशनी वाले भविष्य के शहर में एक तेज़ रफ़्तार पीछा...'",
        tokensUsed: "टोकन उपयोग किए गए",
        refineWithAi: "एआई के साथ परिष्कृत करें",
        aspectRatio: "पहलू अनुपात",
        durationFps: "अवधि और एफपीएस",
        standard5s: "मानक (5s)",
        extended7s: "विस्तारित (7.5s)",
        snapshot2s: "स्नैपशॉट (2.5s)",
        cinematic16: "सिनेमैटिक (16 FPS)",
        smooth24: "स्मूथ (24 FPS)",
        fluid30: "फ्लूइड (30 FPS)",
        startProduction: "उत्पादन शुरू करें",
        stopResetUI: "उत्पादन UI रोकें और रीसेट करें",
        cinemaOutput: "सिनेमा आउटपुट",
        stageEmpty: "स्टेज खाली है। जादू देखने के लिए उत्पादन शुरू करें।",
        calculatingMotion: "मोशन वेक्टर्स की गणना हो रही है...",
        temporalFrame: "टेम्पोरल फ्रेम सिंथेसिस",
        productionMetadata: "उत्पादन मेटाडेटा",
        format: "प्रारूप:",
        engine: "इंजन:",
        resolution: "रिज़ॉल्यूशन:",
        frames: "फ़्रेम:",
        studioArchives: "स्टूडियो आर्काइव्स",
        pastGenerations: "आपकी पिछली पीढ़ी के वीडियो",
        browseAll: "सभी ब्राउज़ करें"
    },
    mr: {
        cinematicVideo: "सिनेमॅटिक व्हिडिओ",
        studioActive: "स्टुडिओ सक्रिय",
        connecting: "जोडत आहे...",
        studioOffline: "स्टुडिओ ऑफलाइन",
        produceHollywood: "अत्याधुनिक Wan 2.1 इंजिन वापरून बॉलीवूड-दर्जाचे सिनेमॅटिक मोशन तयार करा.",
        creditsLeft: "क्रेडिट्स शिल्लक",
        cost: "खर्च",
        t2v: "मजकुरावरून व्हिडिओ",
        i2v: "चित्रावरून व्हिडिओ",
        video_inpaint: "व्हिडिओ ऑटो-मास्क",
        uploadBaseVideo: "व्हिडिओ अपलोड करा",
        uploadImageRef: "संदर्भासाठी चित्र अपलोड करा",
        whatToHide: "काय लपवायचे/मास्क करायचे?",
        hideMaskPlaceholder: "AI ने काय शोधायचे आणि मास्क करायचे याचे वर्णन करा... उदा., 'व्यक्तीचा लाल शर्ट'",
        smartAiDesc: "स्मार्ट एआय डिटेक्शन स्वयंचलितपणे सर्व फ्रेमवर या वस्तू शोधून मास्क करेल.",
        refinementPrompt: "सुधारणा / इनपेंट प्रॉम्प्ट",
        motionPrompt: "मोशन प्रॉम्प्ट",
        refinePlaceholder: "मास्क केलेल्या भागात काय ठेवायचे? उदा., 'एक निळे डेनिम जॅकेट'",
        motionPlaceholder: "वातावरणाचे वर्णन करा... उदा., 'निऑन-प्रकाशाच्या भविष्यातील शहरातून वेगाने पाठलाग...'",
        tokensUsed: "टोकन वापरले",
        refineWithAi: "AI सह सुधारा",
        aspectRatio: "आकार गुणोत्तर",
        durationFps: "कालावधी आणि एफपीएस",
        standard5s: "मानक (5s)",
        extended7s: "विस्तारित (7.5s)",
        snapshot2s: "स्नॅपशॉट (2.5s)",
        cinematic16: "सिनेमॅटिक (16 FPS)",
        smooth24: "स्मूथ (24 FPS)",
        fluid30: "फ्लुइड (30 FPS)",
        startProduction: "उत्पादन सुरू करा",
        stopResetUI: "उत्पादन UI थांबवा आणि रीसेट करा",
        cinemaOutput: "सिनेमा आउटपुट",
        stageEmpty: "स्टेज रिकामा आहे. जादू पाहण्यासाठी उत्पादन सुरू करा.",
        calculatingMotion: "मोशन वेक्टर्सची गणना करत आहे...",
        temporalFrame: "टेम्पोरल फ्रेम सिंथेसिस",
        productionMetadata: "उत्पादन मेटाडेटा",
        format: "स्वरूप:",
        engine: "इंजिन:",
        resolution: "रिझोल्यूशन:",
        frames: "फ्रेम:",
        studioArchives: "स्टुडिओ आर्काइव्हज",
        pastGenerations: "तुमचे मागील सिनेमॅटिक जनरेशन",
        browseAll: "सर्व ब्राउझ करा"
    }
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en');

    useEffect(() => {
        const saved = localStorage.getItem('ui_lang_pref') as Language;
        if (saved && ['en', 'hi', 'mr'].includes(saved)) {
            setLanguageState(saved);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('ui_lang_pref', lang);
    };

    const t = (key: string) => {
        return TRANSLATIONS[language][key] || TRANSLATIONS['en'][key] || key;
    };

    return (
        <I18nContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    const context = useContext(I18nContext);
    if (context === undefined) {
        throw new Error('useI18n must be used within an I18nProvider');
    }
    return context;
}
