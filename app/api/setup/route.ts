import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

// Public, stable image URLs from Unsplash (free, reliable, CDN-backed)
// Doctors - professional medical portraits
const DOCTOR_IMAGES = {
  "doc-1": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&h=600&fit=crop",
  "doc-2": "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600&h=600&fit=crop",
  "doc-3": "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=600&h=600&fit=crop",
  "doc-4": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&h=600&fit=crop",
  "doc-5": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=600&fit=crop",
  "doc-6": "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=600&h=600&fit=crop",
  "doc-7": "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600&h=600&fit=crop",
  "doc-8": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&h=600&fit=crop",
};

// Specialties - themed medical images
const SPECIALTY_IMAGES: Record<string, string> = {
  "spec-1": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop", // Urology
  "spec-2": "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=800&h=600&fit=crop", // Dental
  "spec-3": "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&h=600&fit=crop", // Cardiology
  "spec-4": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop", // Neurology
  "spec-5": "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=800&h=600&fit=crop", // Orthopedics
  "spec-6": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop", // Ophthalmology
  "spec-7": "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=800&h=600&fit=crop", // Pain
  "spec-8": "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&h=600&fit=crop", // Surgery
  "spec-9": "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800&h=600&fit=crop", // Bariatric
  "spec-10": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop", // Gastro
  "spec-11": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop", // Nephrology
  "spec-12": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop", // Endocrine
  "spec-13": "https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=800&h=600&fit=crop", // Cosmetic
};

// Tours - Egypt tourism photos
const TOUR_IMAGES: Record<string, string> = {
  "tour-1": "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800&h=600&fit=crop", // Pyramids
  "tour-2": "https://images.unsplash.com/photo-1583500178690-f7facca6f7af?w=800&h=600&fit=crop", // Sharm/Red Sea
  "tour-3": "https://images.unsplash.com/photo-1568754223168-47e092f76e90?w=800&h=600&fit=crop", // Alexandria
  "tour-4": "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800&h=600&fit=crop", // Cairo
  "tour-5": "https://images.unsplash.com/photo-1606293459337-0b8d8b9bfbe1?w=800&h=600&fit=crop", // Luxor
};

// Gallery - hospital/medical facility photos
const GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1591808216268-ce0b82787efe?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1591808216268-ce0b82787efe?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop",
];

// Stories - patient portraits
const STORY_IMAGES = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
];

// Partners - hospital logos (placeholder)
const PARTNER_LOGOS: Record<string, string> = {
  "partner-1": "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=300&h=200&fit=crop",
  "partner-2": "https://images.unsplash.com/photo-1551076805-e1869033e561?w=300&h=200&fit=crop",
  "partner-3": "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=300&h=200&fit=crop",
};

// Homepage images
const HERO_BG = "https://images.unsplash.com/photo-1551076805-e1869033e561?w=1600&h=900&fit=crop";
const FOUNDER_IMAGE = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=600&fit=crop";

interface DoctorSeed {
  id: string;
  nameAr: string;
  nameEn: string;
  titleAr: string;
  titleEn: string;
  specialtyId: string;
  image: string;
  order: number;
}

const DOCTORS: DoctorSeed[] = [
  { id: "doc-1", nameAr: "د. عماد كمال الدين", nameEn: "Dr. Emad Kamal El-Din", titleAr: "استشاري أمراض الذكورة والخصوبة", titleEn: "Urology & Fertility Consultant", specialtyId: "spec-1", image: DOCTOR_IMAGES["doc-1"], order: 1 },
  { id: "doc-2", nameAr: "د. ادوارد عزيز", nameEn: "Dr. Edward Aziz", titleAr: "استشاري تركيبات الاسنان", titleEn: "Consultant Prosthodontist", specialtyId: "spec-2", image: DOCTOR_IMAGES["doc-2"], order: 2 },
  { id: "doc-3", nameAr: "د. محمد عباس", nameEn: "Dr. Mohamed Abbas", titleAr: "استشاري الجراحة والمناظير", titleEn: "Surgery & Laparoscopy Consultant", specialtyId: "spec-8", image: DOCTOR_IMAGES["doc-3"], order: 3 },
  { id: "doc-4", nameAr: "د. رامز عبد المسيح", nameEn: "Dr. Ramz Abdel-Messih", titleAr: "استشاري علاج الآلام بالتردد الحراري", titleEn: "Pain Management Consultant", specialtyId: "spec-7", image: DOCTOR_IMAGES["doc-4"], order: 4 },
  { id: "doc-5", nameAr: "د. ياسر شبانة", nameEn: "Dr. Yasser Shabana", titleAr: "استشاري أمراض العيون", titleEn: "Ophthalmology Consultant", specialtyId: "spec-6", image: DOCTOR_IMAGES["doc-5"], order: 5 },
  { id: "doc-6", nameAr: "د. طاهر بطة", nameEn: "Dr. Taha Batta", titleAr: "استشاري القلب والقسطرة القلبية", titleEn: "Cardiology & Catheterization Consultant", specialtyId: "spec-3", image: DOCTOR_IMAGES["doc-6"], order: 6 },
  { id: "doc-7", nameAr: "د. أحمد السبكي", nameEn: "Dr. Ahmed El-Sabki", titleAr: "استشاري جراحات السمنة", titleEn: "Bariatric Surgery Consultant", specialtyId: "spec-9", image: DOCTOR_IMAGES["doc-7"], order: 7 },
  { id: "doc-8", nameAr: "د. محمد عطية", nameEn: "Dr. Mohamed Attia", titleAr: "استشاري المسالك البولية", titleEn: "Consultant Urologist", specialtyId: "spec-11", image: DOCTOR_IMAGES["doc-8"], order: 8 },
];

interface SpecialtySeed {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  image: string;
  order: number;
}

const SPECIALTIES: SpecialtySeed[] = [
  { id: "spec-1", nameAr: "أمراض الذكورة والخصوبة", nameEn: "Urology & Fertility", icon: "👨‍⚕️", image: SPECIALTY_IMAGES["spec-1"], order: 1 },
  { id: "spec-2", nameAr: "الأسنان", nameEn: "Dentistry", icon: "🦷", image: SPECIALTY_IMAGES["spec-2"], order: 2 },
  { id: "spec-3", nameAr: "القلب والأوعية الدموية", nameEn: "Cardiology", icon: "❤️", image: SPECIALTY_IMAGES["spec-3"], order: 3 },
  { id: "spec-4", nameAr: "المخ والأعصاب", nameEn: "Neurology", icon: "🧠", image: SPECIALTY_IMAGES["spec-4"], order: 4 },
  { id: "spec-5", nameAr: "العظام والمفاصل", nameEn: "Orthopedics", icon: "🦴", image: SPECIALTY_IMAGES["spec-5"], order: 5 },
  { id: "spec-6", nameAr: "العيون", nameEn: "Ophthalmology", icon: "👁️", image: SPECIALTY_IMAGES["spec-6"], order: 6 },
  { id: "spec-7", nameAr: "علاج الآلام", nameEn: "Pain Management", icon: "💉", image: SPECIALTY_IMAGES["spec-7"], order: 7 },
  { id: "spec-8", nameAr: "الجراحة والمناظير", nameEn: "Surgery & Laparoscopy", icon: "🔬", image: SPECIALTY_IMAGES["spec-8"], order: 8 },
  { id: "spec-9", nameAr: "جراحات السمنة", nameEn: "Bariatric Surgery", icon: "⚖️", image: SPECIALTY_IMAGES["spec-9"], order: 9 },
  { id: "spec-10", nameAr: "الجهاز الهضمي والكبد", nameEn: "Gastroenterology", icon: "🫁", image: SPECIALTY_IMAGES["spec-10"], order: 10 },
  { id: "spec-11", nameAr: "الكلى والمسالك البولية", nameEn: "Nephrology & Urology", icon: "🩺", image: SPECIALTY_IMAGES["spec-11"], order: 11 },
  { id: "spec-12", nameAr: "الغدد الصماء والسكري", nameEn: "Endocrinology", icon: "🧬", image: SPECIALTY_IMAGES["spec-12"], order: 12 },
  { id: "spec-13", nameAr: "جراحات التجميل", nameEn: "Cosmetic Surgery", icon: "✨", image: SPECIALTY_IMAGES["spec-13"], order: 13 },
];

interface ServiceSeed {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  order: number;
}

const SERVICES: ServiceSeed[] = [
  { id: "srv-1", nameAr: "استقبال المرضى من جميع المطارات المصرية", nameEn: "Airport pickup from all Egyptian airports", icon: "✈️", order: 1 },
  { id: "srv-2", nameAr: "توفير السكن المناسب", nameEn: "Accommodation arrangement", icon: "🏨", order: 2 },
  { id: "srv-tourism", nameAr: "أفضل البرامج السياحية", nameEn: "Best Tourism Programs", icon: "🌍", order: 3 },
  { id: "srv-4", nameAr: "تنسيق جميع المواعيد الطبية", nameEn: "Medical appointment coordination", icon: "👨‍⚕️", order: 4 },
  { id: "srv-6", nameAr: "متابعة المريض طوال رحلة العلاج", nameEn: "Patient follow-up throughout treatment journey", icon: "📱", order: 6 },
  { id: "srv-7", nameAr: "متابعة المريض بعد انتهاء البرنامج السياحي", nameEn: "Patient Follow-up After Tourism Program", icon: "📞", order: 7 },
];

interface PartnerSeed {
  id: string;
  name: string;
  logo: string;
  url: string;
  order: number;
}

const PARTNERS: PartnerSeed[] = [
  { id: "partner-1", name: "مستشفى القصر العيني", logo: PARTNER_LOGOS["partner-1"], url: "#", order: 1 },
  { id: "partner-2", name: "مستشفى دار الفؤاد", logo: PARTNER_LOGOS["partner-2"], url: "#", order: 2 },
  { id: "partner-3", name: "عيادة الأندلس الطبية", logo: PARTNER_LOGOS["partner-3"], url: "#", order: 3 },
];

interface StorySeed {
  id: string;
  nameAr: string;
  nameEn: string;
  country: string;
  storyAr: string;
  storyEn: string;
  image: string;
  rating: number;
  order: number;
}

const STORIES: StorySeed[] = [
  { id: "story-1", nameAr: "ست فضيلة عبدالله", nameEn: "Set Fadhila Abdullah", country: "العراق",
    storyAr: "جربت رحلة علاجية مع EMT وكانت تجربة ممتازة من البداية للنهاية. الاستقبال في المطار كان رائع والسكن كان مريح وقريب من المستشفى. الأطباء كانوا محترفين جداً والنتيجة فاقت توقعاتي.",
    storyEn: "I tried a medical trip with EMT and it was an excellent experience from start to finish. The airport reception was wonderful and the accommodation was comfortable and close to the hospital.",
    image: STORY_IMAGES[0], rating: 5, order: 1 },
  { id: "story-2", nameAr: "ست فضيلة محمد", nameEn: "Set Fadhila Mohammed", country: "العراق",
    storyAr: "تجربتي مع EMT كانت من أحسن التجارب اللي مرت عليا. من أول ما وصلت المطار لحد ما رجعت بلدي، كل حاجة كانت منظمة تمام. الأطباء في مصر مستواهم عالي والنتيجة الحمد لله كانت ممتازة.",
    storyEn: "My experience with EMT was one of the best I have ever had. From the moment I arrived at the airport until I returned to my country, everything was perfectly organized.",
    image: STORY_IMAGES[1], rating: 5, order: 2 },
  { id: "story-3", nameAr: "خالد العمري", nameEn: "Khaled Al-Omari", country: "الأردن",
    storyAr: "تجربتي مع EMT كانت مميزة. التنسيق بين المواعيد والتنقل كان ممتاز والأطباء في مستوى عالي جداً. أنصح بهم بشدة لأي شخص يبحث عن علاج في مصر.",
    storyEn: "My experience with EMT was outstanding. The coordination between appointments and transportation was excellent and the doctors are at a very high level.",
    image: STORY_IMAGES[2], rating: 5, order: 3 },
  { id: "story-4", nameAr: "منيرة السعيد", nameEn: "Munira Al-Saeed", country: "السعودية",
    storyAr: "خدمة ممتازة من EMT. كل حاجة كانت منظمة بدقة من السفر وحتى العودة. المتابعة بعد العلاج كانت شيئاً رائعاً لأنهم بيتواصلوا معايا حتى بعد ما رجعت بلدي.",
    storyEn: "Excellent service from EMT. Everything was organized precisely from travel to return. The follow-up after treatment was wonderful.",
    image: STORY_IMAGES[3], rating: 5, order: 4 },
  { id: "story-5", nameAr: "ياسر الحداد", nameEn: "Yasser Al-Haddad", country: "ليبيا",
    storyAr: "سافرت مصر للعلاج عن طريق EMT والحمد لله النتيجة كانت ممتازة. الفريق كان متعاون جداً ووفروا كل ما أحتاجه من سكن وتنقل ومواعيد.",
    storyEn: "I traveled to Egypt for treatment through EMT and thank God the result was excellent. The team was very cooperative.",
    image: STORY_IMAGES[4], rating: 4, order: 5 },
  { id: "story-6", nameAr: "نورة العتيبي", nameEn: "Noura Al-Otaibi", country: "الكويت",
    storyAr: "تجربة رائعة مع EMT. الدكتورة ايمان حواش شخص محترفة جداً وبتهتم بكل تفاصيل المريض. العلاج كان ناجح والمتابعة مستمرة لحد الآن.",
    storyEn: "Wonderful experience with EMT. Mrs. Iman Hawash is a very professional person who cares about every detail of the patient.",
    image: STORY_IMAGES[5], rating: 5, order: 6 },
];

interface TourSeed {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  image: string;
  price: string;
  duration: string;
  locationAr: string;
  locationEn: string;
  includesAr: string;
  includesEn: string;
  category: string;
  featured: boolean;
  order: number;
}

const TOURS: TourSeed[] = [
  { id: "tour-1", nameAr: "جولة الأهرامات والمعابد", nameEn: "Pyramids & Temples Tour",
    descriptionAr: "جولة شاملة لأهرامات الجيزة وأبو الهول ومعبد سقارة والمتحف المصري. يتضمن مرشد سياحي متخصص ووجبة غداء.",
    descriptionEn: "A comprehensive tour of the Giza Pyramids, Sphinx, Saqqara, and the Egyptian Museum. Includes a specialized guide and lunch.",
    image: TOUR_IMAGES["tour-1"], price: "$150", duration: "يوم واحد", locationAr: "الجيزة، القاهرة", locationEn: "Giza, Cairo",
    includesAr: "مرشد سياحي، تذاكر دخول، نقل، غداء", includesEn: "Tour guide, entrance tickets, transport, lunch",
    category: "tourism", featured: true, order: 1 },
  { id: "tour-2", nameAr: "رحلة شرم الشيخ", nameEn: "Sharm El Sheikh Trip",
    descriptionAr: "رحلة ترفيهية كاملة إلى شرم الشيخ تشمل الغوص والسنوركلينج واستكشاف الشعاب المرجانية.",
    descriptionEn: "A complete recreational trip to Sharm El Sheikh including diving, snorkeling, and reef exploration.",
    image: TOUR_IMAGES["tour-2"], price: "$500", duration: "4 أيام / 3 ليالي", locationAr: "شرم الشيخ", locationEn: "Sharm El Sheikh",
    includesAr: "فندق 5 نجوم، نقل، وجبات، رحلة بحرية", includesEn: "5-star hotel, transport, meals, boat trip",
    category: "entertainment", featured: true, order: 2 },
  { id: "tour-3", nameAr: "رحلة الإسكندرية التاريخية", nameEn: "Alexandria Historical Tour",
    descriptionAr: "استكشاف معالم الإسكندرية العريقة من قلعة قايتباي ومكتبة الإسكندرية ورومانية الكون.",
    descriptionEn: "Explore Alexandria's historic landmarks: Qaitbay Citadel, Bibliotheca Alexandrina, and Roman Amphitheater.",
    image: TOUR_IMAGES["tour-3"], price: "$120", duration: "يوم واحد", locationAr: "الإسكندرية", locationEn: "Alexandria",
    includesAr: "مرشد، تذاكر دخول، نقل، غداء بحري", includesEn: "Guide, tickets, transport, seafood lunch",
    category: "tourism", featured: false, order: 3 },
  { id: "tour-4", nameAr: "باقة سياحة وعلاج - القاهرة", nameEn: "Medical Tourism Package - Cairo",
    descriptionAr: "باقة متكاملة تجمع بين الاستشارات الطبية والعلاج في أفضل مستشفيات القاهرة مع جولات سياحية للأهرامات والمتحف.",
    descriptionEn: "An integrated package combining medical consultations and treatment at Cairo's top hospitals with tours to the Pyramids and Museum.",
    image: TOUR_IMAGES["tour-4"], price: "$2,000", duration: "7 أيام / 6 ليالي", locationAr: "القاهرة", locationEn: "Cairo",
    includesAr: "استشارات طبية، فندق، نقل، جولات سياحية، مترجم", includesEn: "Medical consultations, hotel, transport, city tours, translator",
    category: "medical_tourism", featured: true, order: 4 },
  { id: "tour-5", nameAr: "رحلة الأقصر وأسوان", nameEn: "Luxor & Aswan Tour",
    descriptionAr: "جولة نيلية ساحرة من الأقصر إلى أسوان تشمل معابد الكرنك ووادي الملوك ومعبد فيلة.",
    descriptionEn: "A magical Nile cruise from Luxor to Aswan including Karnak Temple, Valley of the Kings, and Philae Temple.",
    image: TOUR_IMAGES["tour-5"], price: "$800", duration: "5 أيام / 4 ليالي", locationAr: "الأقصر وأسوان", locationEn: "Luxor & Aswan",
    includesAr: "كروز نيلي، فندق، وجبات، مرشد، تذاكر دخول", includesEn: "Nile cruise, hotel, meals, guide, entrance tickets",
    category: "tourism", featured: true, order: 5 },
];

const HOMEPAGE_CONTENT = [
  { key: "hero_headline", valueAr: "رحلتك نحو الشفاء تبدأ هنا", valueEn: "Your Journey to Healing Starts Here", type: "text" },
  { key: "hero_subheadline", valueAr: "EMT - إيمي للسياحة العلاجية", valueEn: "EMT - Emy Medical Tourism", type: "text" },
  { key: "hero_description", valueAr: "نربطك بأفضل الأطباء والمستشفيات المتخصصة في مصر. نقدم تجربة علاجية متكاملة من الاستشارة الأولى وحتى المتابعة بعد العلاج.", valueEn: "We connect you with the best specialized doctors and hospitals in Egypt. A complete medical journey from first consultation to post-treatment follow-up.", type: "textarea" },
  { key: "hero_bg_image", valueAr: HERO_BG, valueEn: HERO_BG, type: "image" },
  { key: "about_description", valueAr: "EMT - إيمي للسياحة العلاجية هي شركة رائدة في تنظيم السياحة العلاجية في مصر. نعمل على ربط المرضى من الدول العربية بأفضل الأطباء والمستشفيات المتخصصة في مصر، لنوفر لهم تجربة علاجية متكاملة وآمنة.", valueEn: "EMT - Emy Medical Tourism is a leading medical tourism company in Egypt. We connect patients from Arab countries with the best specialized doctors and hospitals in Egypt, providing a complete and safe medical experience.", type: "textarea" },
  { key: "about_mission", valueAr: "تقديم أعلى مستويات الرعاية الصحية للمرضى الدوليين من خلال شبكة من الأطباء المتخصصين والمستشفيات الحديثة، مع ضمان تجربة علاجية سلسة ومريحة.", valueEn: "Providing the highest levels of healthcare for international patients through a network of specialized doctors and modern hospitals, ensuring a smooth and comfortable medical experience.", type: "textarea" },
  { key: "about_vision", valueAr: "أن نكون الخيار الأول والأكثر ثقة في السياحة العلاجية في المنطقة العربية، ونساهم في تحسين حياة المرضى من خلال الوصول إلى أفضل الرعاية الصحية.", valueEn: "To be the first and most trusted choice in medical tourism in the Arab region, improving patients' lives through access to the best healthcare.", type: "textarea" },
  { key: "founder_name", valueAr: "ايمان حواش", valueEn: "Eman Hawash", type: "text" },
  { key: "founder_title", valueAr: "مؤسسة EMT للسياحة العلاجية", valueEn: "Founder of EMT Medical Tourism", type: "text" },
  { key: "founder_image", valueAr: FOUNDER_IMAGE, valueEn: FOUNDER_IMAGE, type: "image" },
  { key: "stats_doctors", valueAr: "+150", valueEn: "+150", type: "text" },
  { key: "stats_specialties", valueAr: "+13", valueEn: "+13", type: "text" },
  { key: "stats_patients", valueAr: "+500", valueEn: "+500", type: "text" },
  { key: "services_title", valueAr: "خدماتنا", valueEn: "Our Services", type: "text" },
  { key: "services_description", valueAr: "نقدم مجموعة متكاملة من الخدمات لضمان رحلة علاجية مريحة وآمنة", valueEn: "We provide a comprehensive set of services to ensure a comfortable and safe medical journey", type: "text" },
  { key: "contact_title", valueAr: "تواصل معنا", valueEn: "Contact Us", type: "text" },
  { key: "contact_description", valueAr: "نحن هنا لمساعدتك. تواصل معنا لأي استفسار أو لحجز موعدك.", valueEn: "We are here to help. Contact us for any inquiry or to book your appointment.", type: "text" },
];

const SETTINGS = [
  { key: "whatsapp", value: "201117009641", type: "text" },
  { key: "email", value: "Emyhawash71@gmail.com", type: "text" },
  { key: "phone", value: "+20 111 700 9641", type: "text" },
  { key: "facebook", value: "#", type: "url" },
  { key: "instagram", value: "#", type: "url" },
];

export async function GET() {
  try {
    const createTables = `
      CREATE TABLE IF NOT EXISTS "Admin" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "name" TEXT NOT NULL DEFAULT 'Admin',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS "SiteSetting" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "key" TEXT NOT NULL,
        "value" TEXT NOT NULL DEFAULT '',
        "type" TEXT NOT NULL DEFAULT 'text'
      );
      CREATE TABLE IF NOT EXISTS "HomepageContent" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "key" TEXT NOT NULL,
        "valueAr" TEXT NOT NULL DEFAULT '',
        "valueEn" TEXT NOT NULL DEFAULT '',
        "type" TEXT NOT NULL DEFAULT 'text'
      );
      CREATE TABLE IF NOT EXISTS "Specialty" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "nameAr" TEXT NOT NULL,
        "nameEn" TEXT NOT NULL DEFAULT '',
        "icon" TEXT NOT NULL DEFAULT '',
        "image" TEXT NOT NULL DEFAULT '',
        "order" INTEGER NOT NULL DEFAULT 0,
        "active" BOOLEAN NOT NULL DEFAULT TRUE,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS "Doctor" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "nameAr" TEXT NOT NULL,
        "nameEn" TEXT NOT NULL DEFAULT '',
        "titleAr" TEXT NOT NULL,
        "titleEn" TEXT NOT NULL DEFAULT '',
        "specialtyId" TEXT,
        "image" TEXT NOT NULL DEFAULT '',
        "order" INTEGER NOT NULL DEFAULT 0,
        "active" BOOLEAN NOT NULL DEFAULT TRUE,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS "Booking" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "patientName" TEXT NOT NULL,
        "country" TEXT NOT NULL,
        "phone" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "specialtyId" TEXT,
        "specialtyName" TEXT,
        "preferredDoctorId" TEXT,
        "preferredDoctorName" TEXT,
        "notes" TEXT,
        "reports" TEXT NOT NULL DEFAULT '[]',
        "status" TEXT NOT NULL DEFAULT 'pending',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS "Service" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "nameAr" TEXT NOT NULL,
        "nameEn" TEXT NOT NULL DEFAULT '',
        "icon" TEXT NOT NULL DEFAULT '',
        "order" INTEGER NOT NULL DEFAULT 0,
        "active" BOOLEAN NOT NULL DEFAULT TRUE,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS "Partner" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "logo" TEXT NOT NULL DEFAULT '',
        "url" TEXT NOT NULL DEFAULT '',
        "order" INTEGER NOT NULL DEFAULT 0,
        "active" BOOLEAN NOT NULL DEFAULT TRUE,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS "PatientStory" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "nameAr" TEXT NOT NULL,
        "nameEn" TEXT NOT NULL DEFAULT '',
        "country" TEXT NOT NULL DEFAULT '',
        "storyAr" TEXT NOT NULL,
        "storyEn" TEXT NOT NULL DEFAULT '',
        "image" TEXT NOT NULL DEFAULT '',
        "rating" INTEGER NOT NULL DEFAULT 5,
        "order" INTEGER NOT NULL DEFAULT 0,
        "active" BOOLEAN NOT NULL DEFAULT TRUE,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS "GalleryImage" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL DEFAULT '',
        "image" TEXT NOT NULL,
        "category" TEXT NOT NULL DEFAULT 'general',
        "order" INTEGER NOT NULL DEFAULT 0,
        "active" BOOLEAN NOT NULL DEFAULT TRUE,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS "Tour" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "nameAr" TEXT NOT NULL,
        "nameEn" TEXT NOT NULL DEFAULT '',
        "descriptionAr" TEXT NOT NULL DEFAULT '',
        "descriptionEn" TEXT NOT NULL DEFAULT '',
        "image" TEXT NOT NULL DEFAULT '',
        "price" TEXT NOT NULL DEFAULT '',
        "duration" TEXT NOT NULL DEFAULT '',
        "locationAr" TEXT NOT NULL DEFAULT '',
        "locationEn" TEXT NOT NULL DEFAULT '',
        "includesAr" TEXT NOT NULL DEFAULT '',
        "includesEn" TEXT NOT NULL DEFAULT '',
        "category" TEXT NOT NULL DEFAULT 'tourism',
        "featured" BOOLEAN NOT NULL DEFAULT FALSE,
        "order" INTEGER NOT NULL DEFAULT 0,
        "active" BOOLEAN NOT NULL DEFAULT TRUE,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      DO $$ BEGIN
        CREATE UNIQUE INDEX IF NOT EXISTS "Admin_email_key" ON "Admin"("email");
        CREATE UNIQUE INDEX IF NOT EXISTS "SiteSetting_key_key" ON "SiteSetting"("key");
        CREATE UNIQUE INDEX IF NOT EXISTS "HomepageContent_key_key" ON "HomepageContent"("key");
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `;

    await db.$executeRawUnsafe(createTables);

    // Clear existing data (except bookings which we keep)
    await db.$executeRawUnsafe(`TRUNCATE TABLE "Admin", "SiteSetting", "HomepageContent", "Specialty", "Doctor", "Service", "Partner", "PatientStory", "GalleryImage", "Tour" CASCADE;`);

    // Create admin
    const email = "Emyhawash71@gmail.com";
    const password = "admin123";
    const hashedPassword = hashPassword(password);
    await db.admin.create({
      data: { id: "admin001", email, password: hashedPassword, name: "Admin" },
    });

    // Seed specialties
    for (const s of SPECIALTIES) {
      await db.specialty.create({
        data: { id: s.id, nameAr: s.nameAr, nameEn: s.nameEn, icon: s.icon, image: s.image, order: s.order, active: true },
      });
    }

    // Seed doctors
    for (const d of DOCTORS) {
      await db.doctor.create({
        data: { id: d.id, nameAr: d.nameAr, nameEn: d.nameEn, titleAr: d.titleAr, titleEn: d.titleEn, specialtyId: d.specialtyId, image: d.image, order: d.order, active: true },
      });
    }

    // Seed services
    for (const s of SERVICES) {
      await db.service.create({
        data: { id: s.id, nameAr: s.nameAr, nameEn: s.nameEn, icon: s.icon, order: s.order, active: true },
      });
    }

    // Seed partners
    for (const p of PARTNERS) {
      await db.partner.create({
        data: { id: p.id, name: p.name, logo: p.logo, url: p.url, order: p.order, active: true },
      });
    }

    // Seed stories
    for (const s of STORIES) {
      await db.patientStory.create({
        data: { id: s.id, nameAr: s.nameAr, nameEn: s.nameEn, country: s.country, storyAr: s.storyAr, storyEn: s.storyEn, image: s.image, rating: s.rating, order: s.order, active: true },
      });
    }

    // Seed gallery
    for (let i = 0; i < GALLERY_IMAGES.length; i++) {
      await db.galleryImage.create({
        data: { id: `gallery-${i + 1}`, title: "", image: GALLERY_IMAGES[i], category: "general", order: i + 1, active: true },
      });
    }

    // Seed tours
    for (const t of TOURS) {
      await db.tour.create({
        data: {
          id: t.id, nameAr: t.nameAr, nameEn: t.nameEn, descriptionAr: t.descriptionAr, descriptionEn: t.descriptionEn,
          image: t.image, price: t.price, duration: t.duration, locationAr: t.locationAr, locationEn: t.locationEn,
          includesAr: t.includesAr, includesEn: t.includesEn, category: t.category, featured: t.featured, order: t.order, active: true,
        },
      });
    }

    // Seed homepage content
    for (const h of HOMEPAGE_CONTENT) {
      await db.homepageContent.create({
        data: { id: `home-${h.key}`, key: h.key, valueAr: h.valueAr, valueEn: h.valueEn, type: h.type },
      });
    }

    // Seed settings
    for (const s of SETTINGS) {
      await db.siteSetting.create({
        data: { id: `set-${s.key}`, key: s.key, value: s.value, type: s.type },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Setup complete! All content has been seeded with placeholder images.",
      admin: { email, password },
      seeded: {
        specialties: SPECIALTIES.length,
        doctors: DOCTORS.length,
        services: SERVICES.length,
        partners: PARTNERS.length,
        stories: STORIES.length,
        gallery: GALLERY_IMAGES.length,
        tours: TOURS.length,
        homepage: HOMEPAGE_CONTENT.length,
        settings: SETTINGS.length,
      },
    });
  } catch (error: any) {
    console.error("Setup error:", error);
    return NextResponse.json({ success: false, error: error.message, stack: error.stack }, { status: 500 });
  }
}
