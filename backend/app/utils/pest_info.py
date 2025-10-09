"""
Pest information database with multilingual support.
Contains details about various pests including descriptions, spread methods, and precautions.
"""

from typing import Dict, Any, Optional

# Comprehensive pest information database
PEST_DATABASE: Dict[str, Dict[str, Any]] = {
    "Fall Armyworm": {
        "scientific_name": "Spodoptera frugiperda",
        "is_harmful": True,
        "description": {
            "english": "Fall Armyworm is a highly destructive pest that affects crops like maize, rice, sorghum, and vegetables. The larvae feed on leaves, creating characteristic window-pane damage patterns.",
            "hindi": "फॉल आर्मीवर्म एक अत्यधिक विनाशकारी कीट है जो मक्का, चावल, ज्वार और सब्जियों जैसी फसलों को प्रभावित करता है। लार्वा पत्तियों पर भोजन करते हैं, विशिष्ट खिड़की के शीशे जैसी क्षति पैटर्न बनाते हैं।"
        },
        "spread_method": {
            "english": "Spreads rapidly through adult moth flight, capable of traveling up to 100km per night. Female moths lay eggs in masses of 100-200 on plant leaves, covered with scales and hairs. One generation completes in 30 days.",
            "hindi": "वयस्क पतंगे की उड़ान के माध्यम से तेजी से फैलता है, प्रति रात 100 किमी तक की यात्रा करने में सक्षम। मादा पतंगे पौधों की पत्तियों पर 100-200 के समूह में अंडे देती हैं, जो शल्कों और बालों से ढके होते हैं। एक पीढ़ी 30 दिनों में पूरी होती है।"
        },
        "precautions": {
            "english": [
                "Apply neem-based pesticides (1500 ppm) early morning or evening at 2-3 ml per liter of water",
                "Introduce natural predators like Trichogramma wasps, ladybugs, and lacewings",
                "Implement crop rotation with non-host crops like legumes",
                "Use pheromone traps to monitor adult moth populations",
                "Monitor fields regularly for early detection, especially during vegetative stages",
                "Remove and destroy egg masses and heavily infested plants",
                "Maintain field hygiene by removing crop residues after harvest"
            ],
            "hindi": [
                "सुबह या शाम को 2-3 मिली प्रति लीटर पानी की दर से नीम आधारित कीटनाशक (1500 पीपीएम) का प्रयोग करें",
                "ट्राइकोग्रामा ततैया, लेडीबग और लेसविंग जैसे प्राकृतिक शिकारियों को शामिल करें",
                "फलियों जैसी गैर-मेजबान फसलों के साथ फसल चक्र लागू करें",
                "वयस्क पतंगे की आबादी की निगरानी के लिए फेरोमोन जाल का उपयोग करें",
                "प्रारंभिक पहचान के लिए नियमित रूप से खेतों की निगरानी करें, विशेष रूप से वनस्पति चरणों के दौरान",
                "अंडे के समूह और अत्यधिक संक्रमित पौधों को हटाएं और नष्ट करें",
                "फसल कटाई के बाद फसल अवशेष हटाकर खेत की स्वच्छता बनाए रखें"
            ]
        },
        "severity": "high",
        "affected_crops": ["Maize", "Rice", "Sorghum", "Cotton", "Vegetables"]
    },
    "Aphid": {
        "scientific_name": "Aphidoidea",
        "is_harmful": True,
        "description": {
            "english": "Aphids are small sap-sucking insects that can cause significant damage to crops. They weaken plants by extracting nutrients and can transmit viral diseases.",
            "hindi": "एफिड्स छोटे रस चूसने वाले कीड़े हैं जो फसलों को महत्वपूर्ण नुकसान पहुंचा सकते हैं। वे पोषक तत्वों को निकालकर पौधों को कमजोर करते हैं और वायरल रोगों को संचारित कर सकते हैं।"
        },
        "spread_method": {
            "english": "Reproduce rapidly, with females giving birth to live young without mating. Can produce winged forms that fly to new plants. Often tended by ants.",
            "hindi": "तेजी से प्रजनन करते हैं, मादाएं बिना संभोग के जीवित बच्चों को जन्म देती हैं। पंख वाले रूप उत्पन्न कर सकते हैं जो नए पौधों पर उड़ते हैं। अक्सर चींटियों द्वारा देखभाल की जाती है।"
        },
        "precautions": {
            "english": [
                "Spray neem oil solution (3-5 ml per liter) on affected plants",
                "Introduce ladybugs and lacewings as biological control",
                "Use yellow sticky traps to monitor populations",
                "Remove heavily infested plant parts",
                "Avoid excessive nitrogen fertilization",
                "Encourage beneficial insects by planting flowering plants nearby"
            ],
            "hindi": [
                "प्रभावित पौधों पर नीम तेल का घोल (3-5 मिली प्रति लीटर) स्प्रे करें",
                "जैविक नियंत्रण के रूप में लेडीबग और लेसविंग को शामिल करें",
                "आबादी की निगरानी के लिए पीले चिपचिपे जाल का उपयोग करें",
                "अत्यधिक संक्रमित पौधे के हिस्सों को हटा दें",
                "अत्यधिक नाइट्रोजन उर्वरक से बचें",
                "आस-पास फूलों वाले पौधे लगाकर लाभकारी कीड़ों को प्रोत्साहित करें"
            ]
        },
        "severity": "medium",
        "affected_crops": ["Most crops", "Vegetables", "Fruits", "Ornamentals"]
    },
    "Whitefly": {
        "scientific_name": "Aleyrodidae",
        "is_harmful": True,
        "description": {
            "english": "Whiteflies are tiny white insects that suck plant sap and excrete honeydew, leading to sooty mold growth. They are major vectors of plant viruses.",
            "hindi": "सफेद मक्खियाँ छोटे सफेद कीड़े हैं जो पौधों का रस चूसते हैं और हनीड्यू का उत्सर्जन करते हैं, जिससे काली फफूंदी की वृद्धि होती है। वे पौधों के वायरस के प्रमुख वाहक हैं।"
        },
        "spread_method": {
            "english": "Adults fly and spread to new plants. Lay eggs on leaf undersides. Complete life cycle in 2-4 weeks depending on temperature.",
            "hindi": "वयस्क उड़ते हैं और नए पौधों में फैलते हैं। पत्तियों के नीचे की तरफ अंडे देते हैं। तापमान के आधार पर 2-4 सप्ताह में जीवन चक्र पूरा करते हैं।"
        },
        "precautions": {
            "english": [
                "Use yellow sticky traps for monitoring and control",
                "Apply neem oil or insecticidal soap spray",
                "Remove heavily infested leaves",
                "Use reflective mulches to repel whiteflies",
                "Introduce parasitic wasps (Encarsia formosa)",
                "Avoid water stress to plants",
                "Practice crop rotation"
            ],
            "hindi": [
                "निगरानी और नियंत्रण के लिए पीले चिपचिपे जाल का उपयोग करें",
                "नीम तेल या कीटनाशक साबुन स्प्रे का प्रयोग करें",
                "अत्यधिक संक्रमित पत्तियों को हटा दें",
                "सफेद मक्खियों को भगाने के लिए परावर्तक मल्च का उपयोग करें",
                "परजीवी ततैया (एनकार्सिया फॉर्मोसा) को शामिल करें",
                "पौधों में पानी के तनाव से बचें",
                "फसल चक्र का अभ्यास करें"
            ]
        },
        "severity": "medium",
        "affected_crops": ["Tomatoes", "Cotton", "Vegetables", "Ornamentals"]
    },
    "Ladybug": {
        "scientific_name": "Coccinellidae",
        "is_harmful": False,
        "description": {
            "english": "Ladybugs are beneficial insects that feed on aphids, mites, and other soft-bodied pests. Both adults and larvae are voracious predators.",
            "hindi": "लेडीबग लाभकारी कीड़े हैं जो एफिड्स, माइट्स और अन्य नरम शरीर वाले कीटों को खाते हैं। वयस्क और लार्वा दोनों ही भक्षक हैं।"
        },
        "spread_method": {
            "english": "Flies naturally to areas with prey. Lays eggs near aphid colonies. Complete life cycle in 3-6 weeks.",
            "hindi": "शिकार वाले क्षेत्रों में स्वाभाविक रूप से उड़ता है। एफिड कॉलोनियों के पास अंडे देता है। 3-6 सप्ताह में जीवन चक्र पूरा करता है।"
        },
        "precautions": {
            "english": [
                "Protect and encourage ladybugs in your field",
                "Avoid broad-spectrum pesticides that harm beneficial insects",
                "Plant flowering plants to provide nectar for adult ladybugs",
                "Purchase and release ladybugs if pest pressure is high",
                "Provide shelter areas like bunched grasses or mulch"
            ],
            "hindi": [
                "अपने खेत में लेडीबग की रक्षा करें और प्रोत्साहित करें",
                "व्यापक-स्पेक्ट्रम कीटनाशकों से बचें जो लाभकारी कीड़ों को नुकसान पहुंचाते हैं",
                "वयस्क लेडीबग के लिए अमृत प्रदान करने के लिए फूलों वाले पौधे लगाएं",
                "यदि कीट दबाव अधिक है तो लेडीबग खरीदें और छोड़ें",
                "गुच्छेदार घास या मल्च जैसे आश्रय क्षेत्र प्रदान करें"
            ]
        },
        "severity": "beneficial",
        "affected_crops": []
    },
    "Grasshopper": {
        "scientific_name": "Caelifera",
        "is_harmful": True,
        "description": {
            "english": "Grasshoppers are voracious feeders that can defoliate crops rapidly. Large swarms can cause devastating damage to agriculture.",
            "hindi": "टिड्डियाँ भक्षक होती हैं जो तेजी से फसलों को निपात कर सकती हैं। बड़े झुंड कृषि को विनाशकारी नुकसान पहुंचा सकते हैं।"
        },
        "spread_method": {
            "english": "Strong fliers that can travel long distances. Lay eggs in soil. Can form large swarms under favorable conditions.",
            "hindi": "मजबूत उड़ने वाले जो लंबी दूरी तय कर सकते हैं। मिट्टी में अंडे देते हैं। अनुकूल परिस्थितियों में बड़े झुंड बना सकते हैं।"
        },
        "precautions": {
            "english": [
                "Use row covers on vulnerable crops",
                "Apply neem-based biopesticides",
                "Encourage natural predators like birds",
                "Till soil in fall to destroy eggs",
                "Use barrier crops that grasshoppers prefer",
                "Apply diatomaceous earth around plants"
            ],
            "hindi": [
                "संवेदनशील फसलों पर पंक्ति कवर का उपयोग करें",
                "नीम आधारित जैव कीटनाशक लगाएं",
                "पक्षियों जैसे प्राकृतिक शिकारियों को प्रोत्साहित करें",
                "अंडों को नष्ट करने के लिए पतझड़ में मिट्टी की जुताई करें",
                "बाधा फसलों का उपयोग करें जिन्हें टिड्डियाँ पसंद करती हैं",
                "पौधों के आसपास डायटोमेसियस पृथ्वी लगाएं"
            ]
        },
        "severity": "high",
        "affected_crops": ["Grains", "Vegetables", "Legumes"]
    },
    # IP102 Dataset Pests
    "rice leaf roller": {
        "scientific_name": "Cnaphalocrocis medinalis",
        "is_harmful": True,
        "description": {
            "english": "Rice leaf roller is a major pest of rice that feeds on leaves by rolling them into tubes. Larvae cause significant damage during vegetative stages.",
            "hindi": "चावल की पत्ती रोलर चावल का एक प्रमुख कीट है जो पत्तियों को ट्यूब में रोल करके खाता है। लार्वा वनस्पति अवस्था के दौरान महत्वपूर्ण नुकसान पहुंचाता है।"
        },
        "spread_method": {
            "english": "Moths migrate long distances. Females lay eggs on rice leaves. Multiple generations per season.",
            "hindi": "पतंगे लंबी दूरी तय करते हैं। मादाएं चावल की पत्तियों पर अंडे देती हैं। प्रति मौसम कई पीढ़ियां।"
        },
        "precautions": {
            "english": [
                "Monitor fields regularly during vegetative stage",
                "Use light traps to catch adult moths",
                "Apply neem-based biopesticides",
                "Introduce natural predators like spiders and wasps",
                "Remove infested leaves and destroy them",
                "Maintain proper water management"
            ],
            "hindi": [
                "वनस्पति अवस्था के दौरान नियमित रूप से खेतों की निगरानी करें",
                "वयस्क पतंगों को पकड़ने के लिए प्रकाश जाल का उपयोग करें",
                "नीम आधारित जैव कीटनाशक लगाएं",
                "मकड़ियों और ततैया जैसे प्राकृतिक शिकारियों को शामिल करें",
                "संक्रमित पत्तियों को हटाएं और नष्ट करें",
                "उचित जल प्रबंधन बनाए रखें"
            ]
        },
        "severity": "high",
        "affected_crops": ["Rice", "Paddy"]
    },
    "brown plant hopper": {
        "scientific_name": "Nilaparvata lugens",
        "is_harmful": True,
        "description": {
            "english": "Brown planthopper is one of the most destructive rice pests. It sucks plant sap and transmits viral diseases causing hopper burn.",
            "hindi": "भूरा प्लांटहॉपर सबसे विनाशकारी चावल कीटों में से एक है। यह पौधे का रस चूसता है और वायरल रोगों को फैलाता है जो हॉपर बर्न का कारण बनते हैं।"
        },
        "spread_method": {
            "english": "Migrates long distances aided by wind. Reproduces rapidly in warm humid conditions. Can cause complete crop failure.",
            "hindi": "हवा की सहायता से लंबी दूरी तय करता है। गर्म आर्द्र परिस्थितियों में तेजी से प्रजनन करता है। पूर्ण फसल विफलता का कारण बन सकता है।"
        },
        "precautions": {
            "english": [
                "Use resistant rice varieties",
                "Maintain optimal nitrogen levels (avoid excess)",
                "Keep fields clean and weed-free",
                "Use light traps for early detection",
                "Apply recommended insecticides only when threshold is reached",
                "Encourage natural enemies like spiders and mirid bugs"
            ],
            "hindi": [
                "प्रतिरोधी चावल किस्मों का उपयोग करें",
                "इष्टतम नाइट्रोजन स्तर बनाए रखें (अधिकता से बचें)",
                "खेतों को साफ और खरपतवार मुक्त रखें",
                "प्रारंभिक पहचान के लिए प्रकाश जाल का उपयोग करें",
                "अनुशंसित कीटनाशकों को केवल तभी लगाएं जब सीमा पार हो जाए",
                "मकड़ियों और मिरिड बग जैसे प्राकृतिक दुश्मनों को प्रोत्साहित करें"
            ]
        },
        "severity": "high",
        "affected_crops": ["Rice", "Paddy"]
    },
    "army worm": {
        "scientific_name": "Mythimna separata",
        "is_harmful": True,
        "description": {
            "english": "Army worms are highly destructive pests that feed on leaves and can defoliate entire fields. They move in large groups like an army.",
            "hindi": "आर्मी वर्म अत्यधिक विनाशकारी कीट हैं जो पत्तियों पर भोजन करते हैं और पूरे खेतों को नष्ट कर सकते हैं। वे सेना की तरह बड़े समूहों में चलते हैं।"
        },
        "spread_method": {
            "english": "Adult moths migrate long distances. Females lay eggs in clusters on leaves. Larvae feed gregariously and can devastate crops quickly.",
            "hindi": "वयस्क पतंगे लंबी दूरी तय करते हैं। मादाएं पत्तियों पर समूहों में अंडे देती हैं। लार्वा सामूहिक रूप से भोजन करते हैं और फसलों को जल्दी नष्ट कर सकते हैं।"
        },
        "precautions": {
            "english": [
                "Scout fields regularly for egg masses and early larvae",
                "Use pheromone traps for monitoring adult moths",
                "Apply biological pesticides (Bacillus thuringiensis)",
                "Encourage natural predators like birds and parasitic wasps",
                "Practice deep plowing to destroy pupae in soil",
                "Use light traps to catch adult moths"
            ],
            "hindi": [
                "अंडे के समूह और प्रारंभिक लार्वा के लिए नियमित रूप से खेतों की जांच करें",
                "वयस्क पतंगों की निगरानी के लिए फेरोमोन जाल का उपयोग करें",
                "जैविक कीटनाशक (बैसिलस थुरिंगिएंसिस) लगाएं",
                "पक्षियों और परजीवी ततैया जैसे प्राकृतिक शिकारियों को प्रोत्साहित करें",
                "मिट्टी में प्यूपा को नष्ट करने के लिए गहरी जुताई करें",
                "वयस्क पतंगों को पकड़ने के लिए प्रकाश जाल का उपयोग करें"
            ]
        },
        "severity": "high",
        "affected_crops": ["Rice", "Wheat", "Maize", "Sorghum"]
    },
    "corn borer": {
        "scientific_name": "Ostrinia nubilalis",
        "is_harmful": True,
        "description": {
            "english": "Corn borer larvae tunnel into corn stalks, ears, and tassels, weakening plants and reducing yield. One of the most damaging corn pests.",
            "hindi": "मक्का बोरर लार्वा मकई के तनों, कानों और टैसल में सुरंग बनाते हैं, पौधों को कमजोर करते हैं और उपज कम करते हैं। सबसे हानिकारक मकई कीटों में से एक।"
        },
        "spread_method": {
            "english": "Moths fly at night and lay eggs on corn plants. Larvae bore into stalks causing breakage. Multiple generations per year.",
            "hindi": "पतंगे रात में उड़ते हैं और मकई के पौधों पर अंडे देते हैं। लार्वा तनों में छेद करते हैं जिससे टूटना होता है। प्रति वर्ष कई पीढ़ियां।"
        },
        "precautions": {
            "english": [
                "Plant Bt corn varieties for resistance",
                "Scout for egg masses on undersides of leaves",
                "Destroy crop residues after harvest",
                "Use pheromone traps for monitoring",
                "Apply biological control (Trichogramma wasps)",
                "Time planting to avoid peak moth flights"
            ],
            "hindi": [
                "प्रतिरोध के लिए Bt मकई किस्में लगाएं",
                "पत्तियों के नीचे अंडे के समूह की जांच करें",
                "फसल कटाई के बाद फसल अवशेष नष्ट करें",
                "निगरानी के लिए फेरोमोन जाल का उपयोग करें",
                "जैविक नियंत्रण (ट्राइकोग्रामा ततैया) लगाएं",
                "चरम पतंगे की उड़ानों से बचने के लिए रोपण का समय तय करें"
            ]
        },
        "severity": "high",
        "affected_crops": ["Corn", "Maize", "Sorghum"]
    },
    "aphids": {
        "scientific_name": "Aphididae",
        "is_harmful": True,
        "description": {
            "english": "Aphids are small sap-sucking insects that weaken plants and transmit viral diseases. They reproduce rapidly and can cause severe crop damage.",
            "hindi": "एफिड्स छोटे रस चूसने वाले कीड़े हैं जो पौधों को कमजोर करते हैं और वायरल रोगों को फैलाते हैं। वे तेजी से प्रजनन करते हैं और गंभीर फसल क्षति का कारण बन सकते हैं।"
        },
        "spread_method": {
            "english": "Reproduce rapidly through parthenogenesis. Winged forms migrate to new plants. Often protected by ants that feed on honeydew.",
            "hindi": "पार्थेनोजेनेसिस के माध्यम से तेजी से प्रजनन करते हैं। पंख वाले रूप नए पौधों में प्रवास करते हैं। अक्सर चींटियों द्वारा संरक्षित जो हनीड्यू पर भोजन करती हैं।"
        },
        "precautions": {
            "english": [
                "Use yellow sticky traps for early detection",
                "Spray neem oil or insecticidal soap",
                "Introduce ladybugs and lacewings",
                "Remove heavily infested plant parts",
                "Control ant populations",
                "Use reflective mulches to deter aphids"
            ],
            "hindi": [
                "प्रारंभिक पहचान के लिए पीले चिपचिपे जाल का उपयोग करें",
                "नीम का तेल या कीटनाशक साबुन स्प्रे करें",
                "लेडीबग और लेसविंग को शामिल करें",
                "अत्यधिक संक्रमित पौधे के हिस्सों को हटा दें",
                "चींटी की आबादी को नियंत्रित करें",
                "एफिड्स को रोकने के लिए परावर्तक मल्च का उपयोग करें"
            ]
        },
        "severity": "medium",
        "affected_crops": ["Most crops", "Vegetables", "Fruits", "Grains"]
    }
}


def get_pest_info(pest_name: str, language: str = "english") -> Optional[Dict[str, Any]]:
    """
    Retrieve pest information from the database.
    
    Args:
        pest_name: Name of the pest (case-insensitive, partial matching supported)
        language: Language for the response ("english" or "hindi")
    
    Returns:
        Dictionary containing pest information or None if not found
    """
    # Normalize pest name for matching
    pest_name_lower = pest_name.lower()
    
    # Try exact match first
    for key, value in PEST_DATABASE.items():
        if key.lower() == pest_name_lower:
            return _format_pest_info(key, value, language)
    
    # Try partial match
    for key, value in PEST_DATABASE.items():
        if pest_name_lower in key.lower() or key.lower() in pest_name_lower:
            return _format_pest_info(key, value, language)
    
    # Default fallback for unknown pests
    return _get_default_pest_info(pest_name, language)


def _format_pest_info(pest_name: str, pest_data: Dict[str, Any], language: str) -> Dict[str, Any]:
    """Format pest information in the requested language."""
    lang = "hindi" if language.lower() == "hindi" else "english"
    
    return {
        "name": pest_name,
        "scientific_name": pest_data.get("scientific_name", ""),
        "is_harmful": pest_data["is_harmful"],
        "description": pest_data["description"][lang],
        "spread_method": pest_data["spread_method"][lang],
        "precautions": pest_data["precautions"][lang],
        "severity": pest_data.get("severity", "unknown"),
        "affected_crops": pest_data.get("affected_crops", [])
    }


def _get_default_pest_info(pest_name: str, language: str) -> Dict[str, Any]:
    """Provide default information for unknown pests."""
    if language.lower() == "hindi":
        return {
            "name": pest_name,
            "scientific_name": "अज्ञात",
            "is_harmful": True,  # Assume harmful for caution
            "description": f"'{pest_name}' का पता चला है। विशिष्ट जानकारी उपलब्ध नहीं है। कृपया स्थानीय कृषि विशेषज्ञ से परामर्श लें।",
            "spread_method": "फैलने की विधि की जानकारी उपलब्ध नहीं है।",
            "precautions": [
                "नियमित रूप से अपनी फसलों की निगरानी करें",
                "स्थानीय कृषि विस्तार सेवा से परामर्श लें",
                "उचित खेत स्वच्छता बनाए रखें",
                "यदि संक्रमण फैलता है तो विशेषज्ञ सहायता लें"
            ],
            "severity": "unknown",
            "affected_crops": []
        }
    else:
        return {
            "name": pest_name,
            "scientific_name": "Unknown",
            "is_harmful": True,  # Assume harmful for caution
            "description": f"The pest '{pest_name}' has been detected. Specific information is not available in our database. Please consult with local agricultural experts for detailed guidance.",
            "spread_method": "Spread method information not available.",
            "precautions": [
                "Monitor your crops regularly for any changes",
                "Consult with local agricultural extension services",
                "Maintain proper field hygiene",
                "Seek expert help if infestation spreads"
            ],
            "severity": "unknown",
            "affected_crops": []
        }
