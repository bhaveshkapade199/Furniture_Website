import { Injectable, signal } from '@angular/core';

export type Language = 'en' | 'hi' | 'mr';

export interface LanguageOption {
  code: Language;
  label: string;
  nativeLabel: string;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  readonly languages: LanguageOption[] = [
    { code: 'en', label: 'English', nativeLabel: 'English' },
    { code: 'hi', label: 'Hindi',   nativeLabel: 'हिन्दी' },
    { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी' }
  ];

  currentLang = signal<Language>(this.getInitialLanguage());

  private readonly translations: Record<Language, Record<string, string>> = {
    // ════════════════════════════════════════════════════════════
    // ENGLISH
    // ════════════════════════════════════════════════════════════
    en: {
      // ── Navbar & Common ──
      'NAV_HOME': 'Home',
      'NAV_GALLERY': 'Gallery',
      'NAV_TEAM': 'Our Team',
      'NAV_ABOUT': 'About',
      'NAV_CONTACT': 'Contact',
      'NAV_MAKE_FURNITURE': '🪑 Make Custom Furniture',
      'NAV_ADMIN': 'Admin',
      'LOGO_TAGLINE': 'Royal Bespoke Studio • Est. 2010',
      'CHOOSE_LANGUAGE': 'Choose Language',
      'LANGUAGE': 'Language',

      // ── Hero Section ──
      'HERO_BADGE': 'RK Furniture • Bespoke Studio Since 2010',
      'HERO_EYEBROW': 'Transform Your Space With',
      'HERO_BRAND': 'RK Furniture',
      'HERO_SERIF': 'Into A Living Masterpiece',
      'HERO_DESC': "We don't sell generic mass-produced furniture. At RK Furniture, our master craftsmen visit your home, inspect your space, and construct 100% custom-tailored furniture directly on-site with Grade-A seasoned Teak and Sheesham wood.",
      'HERO_BTN_MAKE': '🪑 Make Your Furniture',
      'HERO_BTN_GALLERY': 'Explore Collection',
      'HERO_VISIT_TITLE': 'Home Space Laser Inspection: Only ₹200',
      'HERO_VISIT_SUB': 'Expert visits your home, measures the layout, & provides instant transparent quote',
      'TRUST_WOOD': 'Grade-A Solid Wood',
      'TRUST_WOOD_SUB': 'Teak & Sheesham',
      'TRUST_ONSITE': 'On-Site Crafting',
      'TRUST_ONSITE_SUB': 'Built at your house',
      'TRUST_TERMITE': 'Termite Proof',
      'TRUST_TERMITE_SUB': '10-Year Warranty',
      'HERO_FLOAT_ATELIER': 'RK Live Atelier',
      'HERO_FLOAT_ATELIER_SUB': 'Handcrafted Direct On-Site',
      'HERO_FLOAT_RATING': '4.9/5 Rating',
      'HERO_FLOAT_RATING_SUB': '5,000+ Bespoke Homes',
      'HERO_SLIDE_MAT': '✨ Seasoned Teak & Sheesham',
      'HERO_SLIDE_CUSTOM': '100% Customized For Your Room Dimensions',
      'HERO_SLIDE_FROM': 'Starting at',

      // ── Marquee Ribbon ──
      'MARQUEE_1': '✨ 100% Handcrafted Teak & Sheesham Wood',
      'MARQUEE_2': '🏠 ₹200 On-Site Space Laser Inspection',
      'MARQUEE_3': '👥 Full Master Team Crafts At Your Home',
      'MARQUEE_4': '👑 15+ Years Royal Woodworking Mastery',
      'MARQUEE_5': '⭐ 5,000+ Luxury Homes Completed in Gujarat',

      // ── Stats ──
      'STAT_CUSTOM_HOMES': 'Bespoke Homes Crafted',
      'STAT_YEARS': 'Years Royal Mastery',
      'STAT_TEAM': 'Master Artisans',
      'STAT_WARRANTY': 'Warranty Protection',

      // ── Process ──
      'PROCESS_TAG': '🛠️ How On-Site Crafting Works',
      'PROCESS_TITLE': '3-Step Seamless Process At Your Doorstep',
      'PROCESS_SUB': 'Because every house layout is unique, we build directly at your home for a tailored, millimeter-perfect fit.',
      'STEP_1_TITLE': 'Home Space Visit & Measurement',
      'STEP_1_DESC': 'Our master craftsman visits your house with laser measuring tools, assesses room angles, natural lighting, and gives a direct ₹200 transparent quotation.',
      'STEP_2_TITLE': '3D Design & Wood Selection',
      'STEP_2_DESC': 'Pick from Grade-A Seasoned Teak (Sagwan), Sheesham, or Rosewood. We configure internal compartments, hydraulic storage, and designer finishes.',
      'STEP_3_TITLE': 'Full Team Crafts At Your Home',
      'STEP_3_DESC': 'Once finalized, our entire team of artisans arrives directly at your home with specialized tools to cut, assemble, polish, and install on-site.',
      'PROCESS_CTA_TITLE': 'Ready for a flawless custom piece in your home?',
      'PROCESS_CTA_SUB': 'Book a ₹200 space visit inspection today. Our master craftsman visits your house.',
      'PROCESS_CTA_BTN': 'Request Home Visit Now →',

      // ── Categories ──
      'CAT_TAG': '🏰 Royal Catalog',
      'CAT_TITLE': 'Explore Bespoke Categories',
      'CAT_SUB': 'Handcrafted designs for every sacred and functional room of your home',
      'CAT_SOFA': 'Royal Sofa Sets',
      'CAT_SOFA_SUB': 'L-Shape, Chesterfields, Recliners',
      'CAT_BED': 'Luxury Beds & Storage',
      'CAT_BED_SUB': 'Hydraulic, King & Queen Size',
      'CAT_WARDROBE': 'Modular Wardrobes',
      'CAT_WARDROBE_SUB': 'Sliding, Walk-in, Lacquered',
      'CAT_DINING': 'Dining Tables',
      'CAT_DINING_SUB': '6-Seater, 8-Seater Solid Teak',
      'CAT_MANDIR': 'Pooja Mandir',
      'CAT_MANDIR_SUB': 'Intricate Carved Teak Wood',
      'CAT_TV': 'Designer TV Units',
      'CAT_TV_SUB': 'Fluted Panels, LED Float Backlight',
      'CAT_DRESSER': 'Luxury Dressers',
      'CAT_DRESSER_SUB': 'Mirror Consoles & Organizers',
      'CAT_OFFICE': 'Executive Office',
      'CAT_OFFICE_SUB': 'Ergonomic Wood Desks & Credenzas',

      // ── Featured Products ──
      'PROD_TAG': '💎 Masterpieces',
      'PROD_TITLE': 'Signature Creations',
      'PROD_SUB': 'Hand-picked royal furniture recently installed in premier homes',
      'BTN_VIEW_DETAILS': 'Details →',
      'BTN_CRAFT_SIMILAR': 'Craft Similar For My Room',
      'BTN_VIEW_ALL': 'Browse Full 200+ Gallery →',

      // ── Workshop Videos ──
      'VIDEOS_TAG': '🎬 Real Craftsmanship',
      'VIDEOS_TITLE': 'Live On-Site Crafting & Workshop Videos',
      'VIDEOS_SUB': 'Watch our master artisans carving teak wood and crafting furniture live inside client residences',

      // ── Team Home Preview ──
      'TEAM_TAG': '👥 The Master Team',
      'TEAM_TITLE': 'Meet The Artisans Crafting At Your House',
      'TEAM_SUB': 'Decades of collective mastery bringing precision, heritage joinery, and perfection to your home',
      'TEAM_EXP': 'Experience',
      'TEAM_VIEW_ALL': 'Meet All Artisans & View Workshop →',

      // ── Final CTA Home ──
      'HOME_CTA_BADGE': '🏠 Bespoke Home Furniture Service',
      'HOME_CTA_TITLE': 'Want Custom Furniture Made Specifically For Your Home?',
      'HOME_CTA_DESC': "Don't settle for showroom furniture that doesn't fit your room dimensions. Our master team will visit your home for a comprehensive space inspection & tailored estimate (₹200 visit charge).",
      'HOME_CTA_FEAT_1': '₹200 Home Space Inspection: Accurate room laser measurements & layout planning',
      'HOME_CTA_FEAT_2': '100% On-Site Handcrafting: Complete artisan team visits your home with professional machinery',
      'HOME_CTA_FEAT_3': 'Lifetime Termite Warranty: Pure Grade-A Teak & Sheesham solid wood only',
      'HOME_CTA_FEAT_4': 'Direct Workshop Pricing: Zero showroom markup, direct craftsman rates',
      'HOME_CTA_BTN_ONLINE': 'Make Custom Furniture Online →',
      'HOME_CTA_BTN_WA': '💬 Book Space Visit On WhatsApp',
      'HOME_CTA_CARD_TITLE': '₹200 Space Visit',
      'HOME_CTA_CARD_SUB': 'Master artisan visits your address',
      'HOME_CTA_CARD_DESC': 'Space laser measurement, wood catalog & instant quote',
      'HOME_CTA_CARD_CALL': 'Or call directly:',

      // ── Gallery Page ──
      'GALLERY_TITLE': 'Furniture Gallery',
      'GALLERY_SUB': 'Browse our exclusive collection. Share links directly with clients!',
      'SEARCH_PLACEHOLDER': 'Search furniture by name, wood, category…',
      'ALL_CATEGORIES': 'All',
      'SHOWING_RESULTS': 'Showing {count} of {total} items',
      'NO_ITEMS_FOUND': 'No furniture found',
      'NO_ITEMS_HINT': 'Try a different search or category filter',
      'LOADING': 'Loading…',
      'SHARE_COPY': '🔗 Copy Link',
      'SHARE_COPIED': '✅ Copied!',
      'SHARE_WA': '📱 Share',
      'MODAL_CLOSE': 'Close',
      'MODAL_BOOK_VISIT': 'Book ₹200 Home Space Visit For This Design',
      'PRICE_ON_REQUEST': 'Price on Custom Dimensions',

      // ── About Page ──
      'ABOUT_HERO_BADGE': '🏆 Our Story',
      'ABOUT_HERO_TITLE': 'Crafting Dreams Since 2010',
      'ABOUT_HERO_SUB': 'We are a family-owned furniture business dedicated to transforming your living spaces with handcrafted, premium quality furniture.',
      'ABOUT_WHO_WE_ARE': 'Who We Are',
      'ABOUT_STORY_P1': 'RK Furniture was founded in 2010 with a simple vision — to provide every family with beautiful, durable, tailored furniture at honest workshop prices.',
      'ABOUT_STORY_P2': 'Starting with a small workshop and a handful of skilled craftsmen, we have grown into one of the most trusted bespoke furniture studios, serving over 5,000 happy families.',
      'ABOUT_STORY_P3': 'Our furniture is crafted using 100% seasoned solid wood (Teak, Sheesham, and Rosewood), premium fabrics, and high-grade European hardware for lifetime durability.',
      'ABOUT_SERVICES_TITLE': 'Our Services & On-Site Process',
      'ABOUT_SERVICES_SUB': 'From initial space inspection (₹200 charge) to full-team on-site furniture completion at your home',

      // ── Team Page ──
      'TEAM_PAGE_BADGE': '👥 The Artisans & Leaders',
      'TEAM_PAGE_TITLE': 'Meet Our Master Craftsmen & Team',
      'TEAM_PAGE_SUB': 'Decades of collective experience in fine woodworking, luxury joinery, and bespoke client satisfaction.',
      'TEAM_GRID_TAG': '✨ Dedicated Experts',
      'TEAM_GRID_TITLE': 'Our Craftsmanship Specialists',
      'TEAM_GRID_SUB': 'Every piece of furniture from RK Furniture is shaped by the hands of these skilled professionals.',

      // ── Contact Page ──
      'CONTACT_TITLE': 'Contact & Space Inspection',
      'CONTACT_SUB': 'Reach out to book a ₹200 home inspection or share your feedback',
      'GET_IN_TOUCH': 'Get In Touch',
      'GET_IN_TOUCH_SUB': "We'd love to hear from you. Send us a message and we'll respond within 24 hours.",
      'VISIT_US': 'Workshop Address',
      'VISIT_US_TEXT': '123 Furniture Market, Sarkhej Road, Ahmedabad, Gujarat 380001 (Also serving Jalgaon, Maharashtra)',
      'CALL_US': 'Call Us',
      'EMAIL_US': 'Email Us',
      'HOURS': 'Working Hours',
      'HOURS_TEXT': 'Monday - Saturday: 10 AM - 8 PM\nSunday: 11 AM - 6 PM',
      'FORM_TITLE': 'Book ₹200 Home Space Visit or Send Message',
      'FORM_NAME': 'Your Full Name',
      'FORM_PHONE': 'Phone / WhatsApp Number',
      'FORM_EMAIL': 'Email Address (Optional)',
      'FORM_CITY': 'City / Town',
      'FORM_RATING': 'Rate Your Experience',
      'FORM_MESSAGE': 'Describe your furniture requirement or inquiry',
      'FORM_SUBMIT': 'Submit Request →',
      'FORM_SUCCESS_TITLE': 'Thank You! Message Received',
      'FORM_SUCCESS_DESC': 'Our team will contact you within 24 hours to assist you.',
      'FORM_SEND_ANOTHER': 'Send Another Message',

      // ── Custom Order Page ──
      'CUSTOM_TITLE': 'Make Your Dream Furniture',
      'CUSTOM_SUB': "Tell us exactly what you need — we'll craft it on-site at your home",
      'STEP_1_FORM': '1. Furniture Category',
      'STEP_2_FORM': '2. Wood & Style Preference',
      'STEP_3_FORM': '3. Room Dimensions & Notes',
      'STEP_4_FORM': '4. Your Details & Home Visit',
      'SELECT_CATEGORY': 'Select Furniture Type',
      'SELECT_WOOD': 'Select Wood Type',
      'WOOD_TEAK': 'Teak Wood (Sagwan) - Premium Royal Choice',
      'WOOD_SHEESHAM': 'Sheesham Wood (Indian Rosewood) - High Durability',
      'WOOD_PLYWOOD': 'Marine Grade Plywood with Premium Veneer / Laminate',
      'WOOD_CUSTOM': 'Other / Custom Combination',
      'ROOM_DIMENSIONS': 'Approximate Room / Space Size',
      'SPECIAL_REQUESTS': 'Specific Design Requirements or Reference Details',
      'HOME_VISIT_CHECKBOX': '🏠 Yes, I want a Home Visit inspection for laser measurement & quote (₹200 nominal visit charge)',
      'HOME_VISIT_NOTE': 'A senior craftsman visits your home, measures the exact area, shows wood samples, and gives an on-the-spot fixed quote.',
      'SUBMIT_CUSTOM_ORDER': 'Submit Custom Furniture Request →',
      'ORDER_SUCCESS_TITLE': '🎉 Request Successfully Submitted!',
      'ORDER_SUCCESS_MSG': 'Our master craftsman team has received your order and will contact you shortly.',

      // ── Footer ──
      'FOOTER_ABOUT': 'Crafting beautiful, durable furniture for your home and office since 2010. Your dream space is our passion.',
      'FOOTER_QUICK_LINKS': 'Quick Links',
      'FOOTER_CATEGORIES': 'Categories',
      'FOOTER_CONTACT': 'Contact Us',
      'FOOTER_RIGHTS': 'RK Furniture. All rights reserved.',
      'FOOTER_MADE_WITH': 'Handcrafted with ❤️ for Luxury Indian Homes'
    },

    // ════════════════════════════════════════════════════════════
    // HINDI (हिन्दी)
    // ════════════════════════════════════════════════════════════
    hi: {
      // ── Navbar & Common ──
      'NAV_HOME': 'होम',
      'NAV_GALLERY': 'गैलरी',
      'NAV_TEAM': 'हमारी टीम',
      'NAV_ABOUT': 'हमारे बारे में',
      'NAV_CONTACT': 'संपर्क',
      'NAV_MAKE_FURNITURE': '🪑 कस्टम फर्नीचर बनवाएं',
      'NAV_ADMIN': 'एडमिन',
      'LOGO_TAGLINE': 'शाही हस्तनिर्मित स्टूडियो • स्था. २०१०',
      'CHOOSE_LANGUAGE': 'भाषा चुनें',
      'LANGUAGE': 'भाषा',

      // ── Hero Section ──
      'HERO_BADGE': 'आर.के. फर्नीचर • 2010 से शाही हस्तशिल्प स्टूडियो',
      'HERO_EYEBROW': 'अपने घर को नया रूप दें',
      'HERO_BRAND': 'आर.के. फर्नीचर',
      'HERO_SERIF': 'एक जीवंत उत्कृष्ट कृति में बदलें',
      'HERO_DESC': 'हम रेडीमेड या सामान्य फर्नीचर नहीं बेचते। आर.के. फर्नीचर में हमारे कुशल कारीगर सीधे आपके घर आते हैं, कमरे की सटीक नाप लेते हैं और ग्रेड-ए सागवान व शीशम की ठोस लकड़ी से 100% आपकी पसंद का फर्नीचर आपके घर पर ही बनाते हैं।',
      'HERO_BTN_MAKE': '🪑 अपना फर्नीचर बनवाएं',
      'HERO_BTN_GALLERY': 'कलेक्शन देखें',
      'HERO_VISIT_TITLE': 'घर पर लेजर नाप व निरीक्षण: मात्र ₹200',
      'HERO_VISIT_SUB': 'विशेषज्ञ आपके घर आकर नाप लेते हैं और तुरंत पारदर्शी कोटेशन देते हैं',
      'TRUST_WOOD': 'ग्रेड-ए असली ठोस लकड़ी',
      'TRUST_WOOD_SUB': 'शुद्ध सागवान और शीशम',
      'TRUST_ONSITE': 'घर पर ही निर्माण',
      'TRUST_ONSITE_SUB': 'आपकी आंखों के सामने',
      'TRUST_TERMITE': 'दीमक रोधी वारंटी',
      'TRUST_TERMITE_SUB': '10 साल की गारंटी',
      'HERO_FLOAT_ATELIER': 'आर.के. लाइव वर्कशॉप',
      'HERO_FLOAT_ATELIER_SUB': 'सीधे आपके घर पर निर्मित',
      'HERO_FLOAT_RATING': '4.9/5 स्टार रेटिंग',
      'HERO_FLOAT_RATING_SUB': '5,000+ संतुष्ट परिवार',
      'HERO_SLIDE_MAT': '✨ असली सागवान और शीशम की लकड़ी',
      'HERO_SLIDE_CUSTOM': '100% आपके कमरे की नाप अनुसार',
      'HERO_SLIDE_FROM': 'शुरुआती कीमत',

      // ── Marquee Ribbon ──
      'MARQUEE_1': '✨ 100% हस्तनिर्मित शुद्ध सागवान व शीशम लकड़ी',
      'MARQUEE_2': '🏠 मात्र ₹200 में घर पर लेजर नाप व कोटेशन',
      'MARQUEE_3': '👥 पूरी कारीगर टीम आपके घर आकर फर्नीचर बनाएगी',
      'MARQUEE_4': '👑 15+ वर्षों का शाही काष्ठकला अनुभव',
      'MARQUEE_5': '⭐ 5,000+ से अधिक घरों में सफल कार्य',

      // ── Stats ──
      'STAT_CUSTOM_HOMES': 'सुसज्जित घर',
      'STAT_YEARS': 'वर्षों का अनुभव',
      'STAT_TEAM': 'कुशल कारीगर',
      'STAT_WARRANTY': 'वारंटी सुरक्षा',

      // ── Process ──
      'PROCESS_TAG': '🛠️ घर पर निर्माण कैसे होता है',
      'PROCESS_TITLE': '3 आसान चरणों में आपके दरवाजे पर निर्माण',
      'PROCESS_SUB': 'क्योंकि हर घर का आकार अलग होता है, हम सीधे आपके घर पर ही मिलीमीटर की सटीकता से फर्नीचर तैयार करते हैं।',
      'STEP_1_TITLE': '1. घर पर नाप व निरीक्षण',
      'STEP_1_DESC': 'हमारे मुख्य कारीगर लेजर टूल्स के साथ आपके घर आते हैं, कमरों के कोने और रोशनी देखते हैं और मात्र ₹200 में सटीक पारदर्शी कोटेशन देते हैं।',
      'STEP_2_TITLE': '2. 3D डिजाइन व लकड़ी का चयन',
      'STEP_2_DESC': 'ग्रेड-ए सागवान, शीशम या रोजवुड में से चुनें। हम हाइड्रोलिक स्टोरेज, इनर कम्पार्टमेंट्स और बेहतरीन फिनिश तय करते हैं।',
      'STEP_3_TITLE': '3. पूरी टीम आपके घर पर बनाएगी',
      'STEP_3_DESC': 'डिजाइन फाइनल होने के बाद, हमारी पूरी कारीगर टीम अत्याधुनिक उपकरणों के साथ आपके घर आकर फर्नीचर काटती, जोड़ती और पॉलिश करती है।',
      'PROCESS_CTA_TITLE': 'क्या आप अपने घर के लिए परफेक्ट कस्टम फर्नीचर चाहते हैं?',
      'PROCESS_CTA_SUB': 'आज ही ₹200 में घर पर नाप व सलाह बुक करें। हमारे मास्टर कारीगर आपके घर आएंगे।',
      'PROCESS_CTA_BTN': 'होम विजिट बुक करें →',

      // ── Categories ──
      'CAT_TAG': '🏰 शाही कैटलॉग',
      'CAT_TITLE': 'हमारी प्रमुख श्रेणियां',
      'CAT_SUB': 'आपके घर के हर कोने और कमरे के लिए विशेष रूप से हस्तनिर्मित',
      'CAT_SOFA': 'रॉयल सोफा सेट',
      'CAT_SOFA_SUB': 'एल-शेप, चेस्टरफील्ड, रिक्लाइनर',
      'CAT_BED': 'लक्जरी बेड व स्टोरेज',
      'CAT_BED_SUB': 'हाइड्रोलिक, किंग व क्वीन साइज',
      'CAT_WARDROBE': 'मॉड्यूलर अलमारी',
      'CAT_WARDROBE_SUB': 'स्लाइडिंग, वॉक-इन, लैकर फिनिश',
      'CAT_DINING': 'डाइनिंग टेबल',
      'CAT_DINING_SUB': '6-सीटर, 8-सीटर सॉलिड सागवान',
      'CAT_MANDIR': 'पूजा मंदिर',
      'CAT_MANDIR_SUB': 'बारीक नक्काशीदार सागवान लकड़ी',
      'CAT_TV': 'डिजाइनर टीवी यूनिट',
      'CAT_TV_SUB': 'फ्लूटेड पैनल्स, एलईडी बैकलाइट',
      'CAT_DRESSER': 'लक्जरी ड्रेसर',
      'CAT_DRESSER_SUB': 'मिरर कंसोल व ऑर्गनाइजर',
      'CAT_OFFICE': 'एग्जीक्यूटिव ऑफिस',
      'CAT_OFFICE_SUB': 'सॉलिड वुड डेस्क और अलमारियां',

      // ── Featured Products ──
      'PROD_TAG': '💎 उत्कृष्ट कृतियां',
      'PROD_TITLE': 'हमारी खास प्रस्तुतियां',
      'PROD_SUB': 'ग्राहकों के घरों में हाल ही में स्थापित शाही फर्नीचर',
      'BTN_VIEW_DETAILS': 'विवरण देखें →',
      'BTN_CRAFT_SIMILAR': 'मेरे कमरे के लिए ऐसा बनवाएं',
      'BTN_VIEW_ALL': 'पूरी 200+ गैलरी देखें →',

      // ── Workshop Videos ──
      'VIDEOS_TAG': '🎬 वास्तविक कारीगरी',
      'VIDEOS_TITLE': 'लाइव वर्कशॉप व ऑन-साइट मेकिंग वीडियो',
      'VIDEOS_SUB': 'देखें हमारे कुशल कारीगर कैसे ग्राहकों के घरों में लकड़ी की नक्काशी और फिनिशिंग करते हैं',

      // ── Team Home Preview ──
      'TEAM_TAG': '👥 हमारी कारीगर टीम',
      'TEAM_TITLE': 'मिलिए उन कारीगरों से जो आपके घर पर काम करेंगे',
      'TEAM_SUB': 'दशकों का अनुभव, शुद्ध पारंपरिक जोड़ाई और आपके घर के लिए समर्पण',
      'TEAM_EXP': 'अनुभव',
      'TEAM_VIEW_ALL': 'सभी कारीगरों से मिलें व वर्कशॉप देखें →',

      // ── Final CTA Home ──
      'HOME_CTA_BADGE': '🏠 विशेष ऑन-साइट फर्नीचर सेवा',
      'HOME_CTA_TITLE': 'क्या आप अपने घर के लिए खास कस्टम फर्नीचर चाहते हैं?',
      'HOME_CTA_DESC': 'शोरूम के ऐसे फर्नीचर से समझौता न करें जो आपके कमरे में ठीक से फिट न हो। हमारी टीम आपके घर आकर लेजर नाप लेगी (मात्र ₹200 शुल्क)।',
      'HOME_CTA_FEAT_1': '₹200 होम इंस्पेक्शन: कमरे की सटीक लेजर नाप और संपूर्ण लेआउट प्लानिंग',
      'HOME_CTA_FEAT_2': '100% घर पर निर्माण: आधुनिक मशीनों के साथ पूरी कारीगर टीम आपके घर आएगी',
      'HOME_CTA_FEAT_3': 'दीमक रोधी वारंटी: केवल ग्रेड-ए सागवान व शीशम की पक्की लकड़ी',
      'HOME_CTA_FEAT_4': 'सीधे वर्कशॉप की दरें: शोरूम का कोई अतिरिक्त कमीशन या बिचौलिया नहीं',
      'HOME_CTA_BTN_ONLINE': 'ऑनलाइन फर्नीचर ऑर्डर करें →',
      'HOME_CTA_BTN_WA': '💬 व्हाट्सएप पर होम विजिट बुक करें',
      'HOME_CTA_CARD_TITLE': '₹200 में होम विजिट',
      'HOME_CTA_CARD_SUB': 'मास्टर कारीगर आपके पते पर आएंगे',
      'HOME_CTA_CARD_DESC': 'लेजर नाप, लकड़ी के नमूने और तुरंत सटीक कोटेशन',
      'HOME_CTA_CARD_CALL': 'या सीधे फोन करें:',

      // ── Gallery Page ──
      'GALLERY_TITLE': 'फर्नीचर गैलरी',
      'GALLERY_SUB': 'हमारे विशेष डिज़ाइनों को देखें और सीधे अपने परिवार के साथ शेयर करें!',
      'SEARCH_PLACEHOLDER': 'नाम, लकड़ी या श्रेणी से खोजें…',
      'ALL_CATEGORIES': 'सभी',
      'SHOWING_RESULTS': '{total} में से {count} उत्पाद दिखाए जा रहे हैं',
      'NO_ITEMS_FOUND': 'कोई फर्नीचर नहीं मिला',
      'NO_ITEMS_HINT': 'कृपया अन्य नाम या श्रेणी चुनकर खोजें',
      'LOADING': 'लोड हो रहा है…',
      'SHARE_COPY': '🔗 लिंक कॉपी करें',
      'SHARE_COPIED': '✅ कॉपी हो गया!',
      'SHARE_WA': '📱 शेयर करें',
      'MODAL_CLOSE': 'बंद करें',
      'MODAL_BOOK_VISIT': 'इस डिज़ाइन के लिए ₹200 होम विजिट बुक करें',
      'PRICE_ON_REQUEST': 'कमरे की नाप पर आधारित कीमत',

      // ── About Page ──
      'ABOUT_HERO_BADGE': '🏆 हमारी कहानी',
      'ABOUT_HERO_TITLE': '2010 से सपनों को साकार करते हुए',
      'ABOUT_HERO_SUB': 'हम एक पारिवारिक फर्नीचर स्टूडियो हैं जो आपके घर को प्रीमियम और टिकाऊ हस्तनिर्मित फर्नीचर से सजाते हैं।',
      'ABOUT_WHO_WE_ARE': 'हम कौन हैं',
      'ABOUT_STORY_P1': 'आर.के. फर्नीचर की शुरुआत 2010 में एक सरल सोच के साथ हुई थी — हर भारतीय परिवार को सही दाम में मजबूत और सुंदर फर्नीचर मिले।',
      'ABOUT_STORY_P2': 'एक छोटी सी कार्यशाला से शुरू होकर आज हम 5,000 से अधिक संतुष्ट परिवारों की सेवा कर चुके हैं।',
      'ABOUT_STORY_P3': 'हमारा फर्नीचर केवल 100% पकी हुई सागवान, शीशम और रोजवुड लकड़ी से बनता है, जिससे यह पीढ़ियों तक चले।',
      'ABOUT_SERVICES_TITLE': 'हमारी सेवाएं व कार्यप्रणाली',
      'ABOUT_SERVICES_SUB': '₹200 में प्रारंभिक नाप से लेकर आपके घर पर पूरे फर्नीचर की फिनिशिंग तक',

      // ── Team Page ──
      'TEAM_PAGE_BADGE': '👥 शिल्पकार व टीम',
      'TEAM_PAGE_TITLE': 'हमारे मुख्य कारीगरों से मिलें',
      'TEAM_PAGE_SUB': 'लकड़ी की बारीक नक्काशी, मॉड्युलर तकनीक और उच्च गुणवत्ता में दशकों का अनुभव।',
      'TEAM_GRID_TAG': '✨ कुशल विशेषज्ञ',
      'TEAM_GRID_TITLE': 'हमारे काष्ठकला विशेषज्ञ',
      'TEAM_GRID_SUB': 'आर.के. फर्नीचर का हर उत्पाद इन्हीं अनुभवी हाथों द्वारा गढ़ा जाता है।',

      // ── Contact Page ──
      'CONTACT_TITLE': 'संपर्क एवं होम इंस्पेक्शन',
      'CONTACT_SUB': '₹200 में होम विजिट बुक करें या अपनी आवश्यकता साझा करें',
      'GET_IN_TOUCH': 'हमसे संपर्क करें',
      'GET_IN_TOUCH_SUB': 'हमें संदेश भेजें, हम 24 घंटे के भीतर आपसे संपर्क करेंगे।',
      'VISIT_US': 'वर्कशॉप का पता',
      'VISIT_US_TEXT': '123 फर्नीचर मार्केट, सरखेज रोड, अहमदाबाद, गुजरात 380001 (जलगांव, महाराष्ट्र में भी उपलब्ध)',
      'CALL_US': 'फोन करें',
      'EMAIL_US': 'ईमेल करें',
      'HOURS': 'कार्य समय',
      'HOURS_TEXT': 'सोमवार - शनिवार: सुबह 10 से रात 8 बजे\nरविवार: सुबह 11 से शाम 6 बजे',
      'FORM_TITLE': '₹200 होम विजिट बुक करें या संदेश भेजें',
      'FORM_NAME': 'आपका पूरा नाम',
      'FORM_PHONE': 'फोन / व्हाट्सएप नंबर',
      'FORM_EMAIL': 'ईमेल (वैकल्पिक)',
      'FORM_CITY': 'शहर / कस्बा',
      'FORM_RATING': 'अनुभव रेटिंग',
      'FORM_MESSAGE': 'फर्नीचर की आवश्यकता या विवरण लिखें',
      'FORM_SUBMIT': 'अनुरोध भेजें →',
      'FORM_SUCCESS_TITLE': 'धन्यवाद! आपका संदेश प्राप्त हुआ',
      'FORM_SUCCESS_DESC': 'हमारी टीम जल्द ही आपसे संपर्क करेगी।',
      'FORM_SEND_ANOTHER': 'दूसरा संदेश भेजें',

      // ── Custom Order Page ──
      'CUSTOM_TITLE': 'मनपसंद फर्नीचर बनवाएं',
      'CUSTOM_SUB': 'अपनी आवश्यकता बताएं — हम सीधे आपके घर आकर इसे बनाएंगे',
      'STEP_1_FORM': '1. फर्नीचर श्रेणी',
      'STEP_2_FORM': '2. लकड़ी व डिज़ाइन पसंद',
      'STEP_3_FORM': '3. कमरे की नाप व विवरण',
      'STEP_4_FORM': '4. संपर्क विवरण व होम विजिट',
      'SELECT_CATEGORY': 'फर्नीचर का प्रकार चुनें',
      'SELECT_WOOD': 'लकड़ी का प्रकार चुनें',
      'WOOD_TEAK': 'सागवान लकड़ी (Teak) - सबसे मजबूत व शाही पसंद',
      'WOOD_SHEESHAM': 'शीशम लकड़ी (Sheesham) - सुंदर दानेदार व टिकाऊ',
      'WOOD_PLYWOOD': 'मरीन ग्रेड प्लाईवुड (प्रीमियम विनियर / लैमिनेट के साथ)',
      'WOOD_CUSTOM': 'अन्य / कस्टम मिश्रण',
      'ROOM_DIMENSIONS': 'कमरे या जगह की अनुमानित नाप',
      'SPECIAL_REQUESTS': 'कोई विशेष डिज़ाइन या संदर्भ विवरण',
      'HOME_VISIT_CHECKBOX': '🏠 हां, मुझे लेजर नाप व कोटेशन के लिए होम विजिट चाहिए (मात्र ₹200 शुल्क)',
      'HOME_VISIT_NOTE': 'वरिष्ठ कारीगर आपके घर आएंगे, जगह की नाप लेंगे, लकड़ी के नमूने दिखाएंगे और तुरंत पक्का कोटेशन देंगे।',
      'SUBMIT_CUSTOM_ORDER': 'कस्टम फर्नीचर अनुरोध भेजें →',
      'ORDER_SUCCESS_TITLE': '🎉 आपका अनुरोध सफलतापूर्वक प्राप्त हुआ!',
      'ORDER_SUCCESS_MSG': 'हमारे मुख्य कारीगर जल्द ही आपसे संपर्क करेंगे।',

      // ── Footer ──
      'FOOTER_ABOUT': '2010 से आपके घर और कार्यालय के लिए टिकाऊ, सुंदर और मजबूत फर्नीचर का निर्माण।',
      'FOOTER_QUICK_LINKS': 'त्वरित लिंक',
      'FOOTER_CATEGORIES': 'श्रेणियां',
      'FOOTER_CONTACT': 'संपर्क सूत्र',
      'FOOTER_RIGHTS': 'आर.के. फर्नीचर. सर्वाधिकार सुरक्षित।',
      'FOOTER_MADE_WITH': 'भारतीय घरों के लिए प्रेमपूर्वक ❤️ हस्तनिर्मित'
    },

    // ════════════════════════════════════════════════════════════
    // MARATHI (मराठी)
    // ════════════════════════════════════════════════════════════
    mr: {
      // ── Navbar & Common ──
      'NAV_HOME': 'मुख्यपृष्ठ',
      'NAV_GALLERY': 'दालन (गॅलरी)',
      'NAV_TEAM': 'आमची टीम',
      'NAV_ABOUT': 'आमच्याबद्दल',
      'NAV_CONTACT': 'संपर्क',
      'NAV_MAKE_FURNITURE': '🪑 फर्निचर तयार करा',
      'NAV_ADMIN': 'ॲडमिन',
      'LOGO_TAGLINE': 'शाही हस्तकला स्टुडिओ • स्था. २०१०',
      'CHOOSE_LANGUAGE': 'भाषा निवडा',
      'LANGUAGE': 'भाषा',

      // ── Hero Section ──
      'HERO_BADGE': 'आर.के. फर्निचर • २०१० पासून शाही हस्तकला स्टुडिओ',
      'HERO_EYEBROW': 'आपल्या घराला नवा रूप द्या',
      'HERO_BRAND': 'आर.के. फर्निचर',
      'HERO_SERIF': 'एका जिवंत उत्कृष्ट नमुन्यात रुपांतरित करा',
      'HERO_DESC': 'आम्ही साधे किंवा कारखान्यातील रेडीमेड फर्निचर विकत नाही. आर.के. फर्निचरचे निष्णात कारागीर थेट तुमच्या घरी भेट देतात, जागेची अचूक मोजणी करतात आणि १००% अस्सल सागवान व शिसम लाकडापासून तुमच्या आवडीनुसार थेट घरातच फर्निचर बनवतात.',
      'HERO_BTN_MAKE': '🪑 आपले फर्निचर बनवा',
      'HERO_BTN_GALLERY': 'कलेक्शन पहा',
      'HERO_VISIT_TITLE': 'घरी लेझर मोजणी व पाहणी: फक्त ₹२००',
      'HERO_VISIT_SUB': 'तज्ज्ञ कारागीर घरी येऊन मोजणी करतात आणि जागेवरच पारदर्शक कोटेशन देतात',
      'TRUST_WOOD': 'ग्रेड-ए अस्सल लाकूड',
      'TRUST_WOOD_SUB': 'सागवान आणि शिसम',
      'TRUST_ONSITE': 'थेट घरीच निर्मिती',
      'TRUST_ONSITE_SUB': 'आपल्या डोळ्यांसमोर',
      'TRUST_TERMITE': 'वाळवी-प्रतिबंधक हमी',
      'TRUST_TERMITE_SUB': '१० वर्षांची वॉरंटी',
      'HERO_FLOAT_ATELIER': 'आर.के. थेट कार्यशाळा',
      'HERO_FLOAT_ATELIER_SUB': 'थेट आपल्या घरात तयार',
      'HERO_FLOAT_RATING': '४.९/५ स्टार रेटिंग',
      'HERO_FLOAT_RATING_SUB': '५,०००+ समाधानी कुटुंबे',
      'HERO_SLIDE_MAT': '✨ अस्सल सागवान व शिसम लाकूड',
      'HERO_SLIDE_CUSTOM': '१००% आपल्या खोलीच्या अचूक मापांनुसार',
      'HERO_SLIDE_FROM': 'सुरुवातीची किंमत',

      // ── Marquee Ribbon ──
      'MARQUEE_1': '✨ १००% हस्तकलेने बनवलेले शुद्ध सागवान व शिसम फर्निचर',
      'MARQUEE_2': '🏠 फक्त ₹२०० मध्ये घरी लेझर मोजणी व कोटेशन',
      'MARQUEE_3': '👥 संपूर्ण कारागीर टीम आपल्या घरी येऊन फर्निचर बनवते',
      'MARQUEE_4': '👑 १५+ वर्षांचा शाही लाकूडकामाचा समृद्ध अनुभव',
      'MARQUEE_5': '⭐ ५,०००+ हून अधिक घरांमध्ये दर्जेदार काम पूर्ण',

      // ── Stats ──
      'STAT_CUSTOM_HOMES': 'सजलेली सुंदर घरे',
      'STAT_YEARS': 'वर्षांचा अनुभव',
      'STAT_TEAM': 'निष्णात कारागीर',
      'STAT_WARRANTY': 'वॉरंटी संरक्षण',

      // ── Process ──
      'PROCESS_TAG': '🛠️ घरातच फर्निचर कसे तयार होते',
      'PROCESS_TITLE': '३ सोप्या टप्प्यांत आपल्या दारात निर्मिती',
      'PROCESS_SUB': 'प्रत्येक घराची रचना वेगळी असल्याने, आम्ही मिलीमीटरच्या अचूकतेने थेट आपल्या घरातच फर्निचर बनवतो.',
      'STEP_1_TITLE': '१. घरी मोजणी व पाहणी',
      'STEP_1_DESC': 'आमचे मुख्य कारागीर लेझर उपकरणांसह आपल्या घरी येतात, कोपरे व जागा तपासतात आणि फक्त ₹२०० मध्ये पारदर्शक कोटेशन देतात.',
      'STEP_2_TITLE': '२. ३D डिझाइन व लाकूड निवड',
      'STEP_2_DESC': 'दर्जेदार सागवान, शिसम किंवा रोझवूडची निवड करा. हायड्रॉलिक स्टोरेज, अंतर्गत कप्पे आणि पॉलिश निश्चित केली जाते.',
      'STEP_3_TITLE': '३. संपूर्ण टीम घरी येऊन काम करते',
      'STEP_3_DESC': 'डिझाइन पक्के झाल्यावर, आमची संपूर्ण कारागीर टीम आधुनिक मशिनरीसह आपल्या घरी येऊन फर्निचर कापते, जोडते व पॉलिश करते.',
      'PROCESS_CTA_TITLE': 'आपल्या घरासाठी परिपूर्ण फर्निचर बनवायचे आहे का?',
      'PROCESS_CTA_SUB': 'आजच ₹२०० मध्ये होम व्हिजिट बुक करा. आमचे मुख्य कारागीर आपल्या घरी येतील.',
      'PROCESS_CTA_BTN': 'होम व्हिजिट बुक करा →',

      // ── Categories ──
      'CAT_TAG': '🏰 शाही कॅटलॉग',
      'CAT_TITLE': 'आमच्या लोकप्रिय श्रेणी',
      'CAT_SUB': 'आपल्या घरातील प्रत्येक सुंदर खोलीसाठी खास हातांनी घडवलेले फर्निचर',
      'CAT_SOFA': 'रॉयल सोफा सेट',
      'CAT_SOFA_SUB': 'एल-आकार, चेस्टरफील्ड, रिक्लायनर',
      'CAT_BED': 'लक्झरी बेड व स्टोरेज',
      'CAT_BED_SUB': 'हायड्रॉलिक, किंग व क्वीन साईज',
      'CAT_WARDROBE': 'मॉड्यूलर कपाट (वॉर्डरोब)',
      'CAT_WARDROBE_SUB': 'स्लायडिंग, वॉक-इन, लॅकर फिनिश',
      'CAT_DINING': 'डायनिंग टेबल संच',
      'CAT_DINING_SUB': '६-आसनी, ८-आसनी अस्सल सागवान',
      'CAT_MANDIR': 'देवघर / पूजा मंदिर',
      'CAT_MANDIR_SUB': 'बारीक कोरीव काम असलेले सागवान मंदिर',
      'CAT_TV': 'डिझायनर टीव्ही युनिट',
      'CAT_TV_SUB': 'फ्लूटेड पॅनेल्स, एलईडी बॅकलाइट',
      'CAT_DRESSER': 'लक्झरी ड्रेसिंग टेबल',
      'CAT_DRESSER_SUB': 'मिरर कन्सोल व ड्रॉअर्स',
      'CAT_OFFICE': 'कार्यालयीन फर्निचर',
      'CAT_OFFICE_SUB': 'मजबूत लाकडी डेस्क व कपाटे',

      // ── Featured Products ──
      'PROD_TAG': '💎 उत्कृष्ट नमुने',
      'PROD_TITLE': 'आमची खास वैशिष्ट्ये',
      'PROD_SUB': 'ग्राहकांच्या घरांमध्ये नुकतीच बसवण्यात आलेली शाही फर्निचर उत्पादने',
      'BTN_VIEW_DETAILS': 'तपशील पहा →',
      'BTN_CRAFT_SIMILAR': 'माझ्या खोलीसाठी असे बनवा',
      'BTN_VIEW_ALL': 'पूर्ण २००+ गॅलरी पहा →',

      // ── Workshop Videos ──
      'VIDEOS_TAG': '🎬 प्रत्यक्ष कारागिरी',
      'VIDEOS_TITLE': 'थेट कार्यशाळा व ऑन-साइट मेकिंग व्हिडिओ',
      'VIDEOS_SUB': 'पहा आमचे कुशल कारागीर ग्राहकांच्या घरातच लाकडावर कोरीव काम आणि फिनिशिंग कसे करतात',

      // ── Team Home Preview ──
      'TEAM_TAG': '👥 आमची कारागीर टीम',
      'TEAM_TITLE': 'आपल्या घरी काम करणाऱ्या कारागिरांना भेटा',
      'TEAM_SUB': 'दशकांचा अनुभव, अस्सल पारंपरिक जोडकाम आणि आपल्या स्वप्नातील घरासाठी निष्ठा',
      'TEAM_EXP': 'अनुभव',
      'TEAM_VIEW_ALL': 'सर्व कारागिरांना भेटा व कार्यशाळा पहा →',

      // ── Final CTA Home ──
      'HOME_CTA_BADGE': '🏠 विशेष ऑन-साइट फर्निचर सेवा',
      'HOME_CTA_TITLE': 'आपल्या घरासाठी खास कस्टमाईज्ड फर्निचर हवे आहे का?',
      'HOME_CTA_DESC': 'खोलीच्या मापात न बसणाऱ्या शोरूममधील फर्निचरशी तडजोड करू नका. आमचे तज्ज्ञ आपल्या घरी येऊन लेझर मोजणी करतील (फक्त ₹२०० शुल्क).',
      'HOME_CTA_FEAT_1': '₹२०० होम व्हिजिट: अचूक लेझर मोजणी आणि जागेचे संपूर्ण नियोजन',
      'HOME_CTA_FEAT_2': '१००% घरातच निर्मिती: अत्याधुनिक मशिनसह संपूर्ण टीम आपल्या घरी काम करेल',
      'HOME_CTA_FEAT_3': 'वाळवी-प्रतिबंधक वॉरंटी: फक्त ग्रेड-ए पक्के सागवान व शिसम लाकूड',
      'HOME_CTA_FEAT_4': 'थेट कारखान्याचे दर: शोरूमचे कोणतेही कमिशन किंवा मध्यस्थ नाही',
      'HOME_CTA_BTN_ONLINE': 'ऑनलाइन फर्निचर ऑर्डर करा →',
      'HOME_CTA_BTN_WA': '💬 व्हॉट्सॲपवर होम व्हिजिट बुक करा',
      'HOME_CTA_CARD_TITLE': '₹२०० मध्ये होम व्हिजिट',
      'HOME_CTA_CARD_SUB': 'मुख्य कारागीर आपल्या घरी येतील',
      'HOME_CTA_CARD_DESC': 'लेझर मोजणी, लाकडाचे सॅम्पल आणि जागेवरच पक्के कोटेशन',
      'HOME_CTA_CARD_CALL': 'किंवा थेट फोन करा:',

      // ── Gallery Page ──
      'GALLERY_TITLE': 'फर्निचर गॅलरी',
      'GALLERY_SUB': 'आमचे सर्व विशेष डिझाइन्स पहा आणि थेट लिंक मित्रांना शेअर करा!',
      'SEARCH_PLACEHOLDER': 'नाव, लाकूड किंवा श्रेणीनुसार शोधा…',
      'ALL_CATEGORIES': 'सर्व',
      'SHOWING_RESULTS': '{total} पैकी {count} फर्निचर दाखवत आहोत',
      'NO_ITEMS_FOUND': 'फर्निचर सापडले नाही',
      'NO_ITEMS_HINT': 'कृपया वेगळे नाव किंवा वर्गवारी निवडून शोधा',
      'LOADING': 'लोड होत आहे…',
      'SHARE_COPY': '🔗 लिंक कॉपी करा',
      'SHARE_COPIED': '✅ कॉपी झाले!',
      'SHARE_WA': '📱 शेअर करा',
      'MODAL_CLOSE': 'बंद करा',
      'MODAL_BOOK_VISIT': 'या डिझाइनसाठी ₹२०० होम व्हिजिट बुक करा',
      'PRICE_ON_REQUEST': 'खोलीच्या मापांनुसार किंमत',

      // ── About Page ──
      'ABOUT_HERO_BADGE': '🏆 आमची कथा',
      'ABOUT_HERO_TITLE': '२०१० पासून स्वप्ने साकारत आहोत',
      'ABOUT_HERO_SUB': 'आम्ही एक कौटुंबिक फर्निचर स्टुडिओ असून आपले घर सुंदर व दर्जेदार हस्तकलेने सजवण्यासाठी कटिबद्ध आहोत.',
      'ABOUT_WHO_WE_ARE': 'आम्ही कोण आहोत',
      'ABOUT_STORY_P1': 'आर.के. फर्निचरची स्थापना २०१० मध्ये एका साध्या उद्दिष्टाने झाली — प्रत्येक भारतीय कुटुंबाला योग्य दरात मजबूत आणि सुंदर फर्निचर मिळावे.',
      'ABOUT_STORY_P2': 'एका लहान कार्यशाळेतून सुरू झालेला हा प्रवास आज ५,००० हून अधिक समाधानी कुटुंबांपर्यंत पोहोचला आहे.',
      'ABOUT_STORY_P3': 'आमचे फर्निचर केवळ १००% परिपक्व सागवान, शिसम आणि रोझवूडपासून तयार केले जाते, ज्यामुळे ते पिढ्यानपिढ्या टिकते.',
      'ABOUT_SERVICES_TITLE': 'आमच्या सेवा व कामाची पद्धत',
      'ABOUT_SERVICES_SUB': '₹२०० मध्ये मोजणीपासून ते आपल्या घरातच संपूर्ण फर्निचर पूर्ण करण्यापर्यंत',

      // ── Team Page ──
      'TEAM_PAGE_BADGE': '👥 कारागीर व नेतृत्व',
      'TEAM_PAGE_TITLE': 'आमच्या मुख्य कारागिरांना भेटा',
      'TEAM_PAGE_SUB': 'लाकडावरील बारीक कोरीव काम, मॉड्यूलर डिझाइन आणि उच्च गुणवत्तेत दशकांचा समृद्ध अनुभव.',
      'TEAM_GRID_TAG': '✨ निष्णात तज्ज्ञ',
      'TEAM_GRID_TITLE': 'आमचे काष्ठकला विशेषज्ञ',
      'TEAM_GRID_SUB': 'आर.के. फर्निचरचे प्रत्येक उत्पादन याच कुशल हातांनी साकारले जाते.',

      // ── Contact Page ──
      'CONTACT_TITLE': 'संपर्क व जागा पाहणी',
      'CONTACT_SUB': '₹२०० मध्ये होम व्हिजिट बुक करा किंवा आपल्या प्रतिक्रिया कळवा',
      'GET_IN_TOUCH': 'संपर्क साधा',
      'GET_IN_TOUCH_SUB': 'आम्हाला संदेश पाठवा, आम्ही २४ तासांच्या आत आपल्याशी संपर्क करू.',
      'VISIT_US': 'वर्कशॉपचा पत्ता',
      'VISIT_US_TEXT': '१२३ फर्निचर मार्केट, सरखेज रोड, अहमदाबाद, गुजरात ३८०००१ (जळगाव, महाराष्ट्र येथेही सेवा उपलब्ध)',
      'CALL_US': 'कॉल करा',
      'EMAIL_US': 'ईमेल करा',
      'HOURS': 'कामाची वेळ',
      'HOURS_TEXT': 'सोमवार - शनिवार: सकाळी १० ते रात्री ८\nरविवार: सकाळी ११ ते संध्याकाळी ६',
      'FORM_TITLE': '₹२०० होम व्हिजिट बुक करा किंवा संदेश पाठवा',
      'FORM_NAME': 'आपले पूर्ण नाव',
      'FORM_PHONE': 'फोन / व्हॉट्सॲप नंबर',
      'FORM_EMAIL': 'ईमेल (पर्यायी)',
      'FORM_CITY': 'शहर / गाव',
      'FORM_RATING': 'अनुभव रेटिंग',
      'FORM_MESSAGE': 'फर्निचरची आवश्यकता किंवा तपशील लिहा',
      'FORM_SUBMIT': 'विनंती पाठवा →',
      'FORM_SUCCESS_TITLE': 'धन्यवाद! आपला संदेश प्राप्त झाला',
      'FORM_SUCCESS_DESC': 'आमची टीम लवकरच आपल्याशी संपर्क करेल.',
      'FORM_SEND_ANOTHER': 'दुसरा संदेश पाठवा',

      // ── Custom Order Page ──
      'CUSTOM_TITLE': 'मनपसंत फर्निचर तयार करा',
      'CUSTOM_SUB': 'आपली आवश्यकता सांगा — आम्ही थेट आपल्या घरी येऊन फर्निचर बनवू',
      'STEP_1_FORM': '१. फर्निचरचा प्रकार',
      'STEP_2_FORM': '२. लाकूड व डिझाइन पसंती',
      'STEP_3_FORM': '३. खोलीचे माप व नोंदी',
      'STEP_4_FORM': '४. संपर्क माहिती व होम व्हिजिट',
      'SELECT_CATEGORY': 'फर्निचरची श्रेणी निवडा',
      'SELECT_WOOD': 'लाकडाचा प्रकार निवडा',
      'WOOD_TEAK': 'सागवान लाकूड (Teak) - अत्यंत मजबूत व शाही पसंती',
      'WOOD_SHEESHAM': 'शिसम लाकूड (Sheesham) - सुंदर नक्षीदार व दीर्घकाळ टिकणारे',
      'WOOD_PLYWOOD': 'मरीन ग्रेड प्लायवूड (प्रीमियम व्हिनिअर / लॅमिनेटसह)',
      'WOOD_CUSTOM': 'इतर / संमिश्र लाकूड',
      'ROOM_DIMENSIONS': 'खोलीचे किंवा जागेचे अंदाजे माप',
      'SPECIAL_REQUESTS': 'काही विशिष्ट डिझाइन किंवा संदर्भ नोंदी',
      'HOME_VISIT_CHECKBOX': '🏠 होय, मला लेझर मोजणी व कोटेशनसाठी होम व्हिजिट हवी आहे (फक्त ₹२०० शुल्क)',
      'HOME_VISIT_NOTE': 'वरिष्ठ कारागीर आपल्या घरी येतील, जागेची मोजणी करतील, लाकडाचे नमुने दाखवतील आणि जागेवरच पक्के कोटेशन देतील.',
      'SUBMIT_CUSTOM_ORDER': 'कस्टम फर्निचर विनंती पाठवा →',
      'ORDER_SUCCESS_TITLE': '🎉 आपली विनंती यशस्वीरीत्या प्राप्त झाली!',
      'ORDER_SUCCESS_MSG': 'आमचे मुख्य कारागीर लवकरच आपल्याशी संपर्क करतील.',

      // ── Footer ──
      'FOOTER_ABOUT': '२०१० पासून आपल्या घरासाठी व कार्यालयासाठी सुंदर, मजबूत आणि दर्जेदार फर्निचरची निर्मिती.',
      'FOOTER_QUICK_LINKS': 'महत्त्वाच्या लिंक्स',
      'FOOTER_CATEGORIES': 'श्रेण्या',
      'FOOTER_CONTACT': 'संपर्क माहिती',
      'FOOTER_RIGHTS': 'आर.के. फर्निचर. सर्व हक्क राखीव.',
      'FOOTER_MADE_WITH': 'भारतीय घरांसाठी प्रेमाने ❤️ हस्तनिर्मित'
    }
  };

  private getInitialLanguage(): Language {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem('rk_furniture_lang') as Language;
      if (saved && (saved === 'en' || saved === 'hi' || saved === 'mr')) {
        return saved;
      }
    }
    return 'en';
  }

  setLanguage(lang: Language): void {
    if (lang === 'en' || lang === 'hi' || lang === 'mr') {
      this.currentLang.set(lang);
      if (typeof window !== 'undefined') {
        if (window.localStorage) {
          window.localStorage.setItem('rk_furniture_lang', lang);
        }
        document.documentElement.lang = lang;
      }
    }
  }

  t(key: string, fallback?: string): string {
    const lang = this.currentLang();
    const langDict = this.translations[lang];
    if (langDict && langDict[key] !== undefined) {
      return langDict[key];
    }
    // Fallback to English
    const enDict = this.translations['en'];
    if (enDict && enDict[key] !== undefined) {
      return enDict[key];
    }
    return fallback || key;
  }

  /**
   * Helper to translate category names (e.g. 'Sofa Set' -> 'सोफा सेट' / 'रॉयल सोफा सेट')
   */
  translateCategory(category: string): string {
    const lang = this.currentLang();
    if (lang === 'en') return category;

    const lower = (category || '').toLowerCase().trim();
    if (lower.includes('sofa')) return lang === 'hi' ? 'सोफा सेट' : 'सोफा संच';
    if (lower.includes('bed') || lower.includes('room')) return lang === 'hi' ? 'बेडरूम / बेड' : 'शयनकक्ष / बेड';
    if (lower.includes('dining')) return lang === 'hi' ? 'डाइनिंग टेबल' : 'डायनिंग संच';
    if (lower.includes('wardrobe')) return lang === 'hi' ? 'अलमारी / वॉर्डरोब' : 'कपाट / वॉर्डरोब';
    if (lower.includes('mandir') || lower.includes('temple')) return lang === 'hi' ? 'पूजा मंदिर' : 'देवघर / मंदिर';
    if (lower.includes('tv')) return lang === 'hi' ? 'टीवी यूनिट' : 'टीव्ही युनिट';
    if (lower.includes('office')) return lang === 'hi' ? 'ऑफिस फर्निचर' : 'कार्यालयीन फर्निचर';
    if (lower.includes('chair')) return lang === 'hi' ? 'कुर्सी' : 'खुर्च्या';
    if (lower.includes('table')) return lang === 'hi' ? 'टेबल' : 'टेबल';
    if (lower.includes('all')) return lang === 'hi' ? 'सभी' : 'सर्व';

    return category;
  }
}
