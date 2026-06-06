ADVISORIES = {
    'banana_bacterial_wilt': {
        'disease_name': 'Banana Bacterial Wilt',
        'description': (
            'A devastating bacterial disease caused by Xanthomonas campestris pv. musacearum. '
            'It causes rapid wilting, yellowing, and premature ripening of fruits.'
        ),
        'treatment': [
            'Remove and destroy all infected plants immediately by uprooting and burying',
            'Disinfect all farm tools using jik (sodium hypochlorite) or fire',
            'Apply copper-based bactericides to surrounding healthy plants',
            'Cut and burn infected pseudostems to reduce inoculum',
            'Practice crop rotation; avoid replanting bananas in same spot for at least 6 months',
        ],
        'prevention': [
            'Use only certified disease-free planting materials',
            'Clean farm tools with disinfectant before and after each use',
            'Control insect vectors especially bees and trips',
            'Remove male buds regularly to reduce vector attraction',
            'Establish quarantine zones to prevent spread to neighboring farms',
            'Report any suspected cases to local agricultural extension officers',
        ],
        'best_practices': [
            'Maintain proper field sanitation at all times',
            'Practice intercropping with legumes to improve soil health',
            'Apply mulch to retain moisture and suppress weeds',
            'Implement a regular scouting schedule for early detection',
            'Use disease-resistant banana varieties when available',
            'Ensure proper drainage to prevent waterlogging',
            'Maintain optimal plant spacing for good air circulation',
        ],
    },
    'black_sigatoka': {
        'disease_name': 'Black Sigatoka',
        'description': (
            'A fungal leaf spot disease caused by Mycosphaerella fijiensis. '
            'It causes black streaks and spots on leaves, reducing photosynthesis and fruit quality.'
        ),
        'treatment': [
            'Apply systemic fungicides (triazoles or strobilurins) at early stages',
            'Remove and destroy heavily infected leaves to reduce inoculum',
            'Apply protective fungicides like mancozeb or chlorothalonil',
            'Use spray adjuvant for better fungicide coverage',
            'Repeat fungicide applications every 14-21 days during rainy season',
        ],
        'prevention': [
            'Plant resistant or tolerant banana varieties',
            'Ensure proper plant spacing to reduce humidity',
            'Remove and destroy infected leaves during routine field maintenance',
            'Avoid overhead irrigation; use drip irrigation instead',
            'Maintain proper nutrition especially potassium and silicon',
        ],
        'best_practices': [
            'Practice regular de-leafing to remove infected leaves',
            'Maintain proper drainage in the field',
            'Apply balanced fertilizers based on soil analysis',
            'Monitor weather conditions for disease forecasting',
            'Keep field records to track disease progression',
        ],
    },
    'fusarium_wilt': {
        'disease_name': 'Fusarium Wilt (Panama Disease)',
        'description': (
            'A soil-borne fungal disease caused by Fusarium oxysporum f. sp. cubense. '
            'It causes yellowing and wilting, and can survive in soil for decades.'
        ),
        'treatment': [
            'Remove and destroy all infected plants immediately',
            'Apply soil fumigants in severe cases but with caution',
            'Use bio-control agents like Trichoderma spp. in the soil',
            'Apply fungicides containing thiophanate-methyl to surrounding plants',
            'Solarize infected soil by covering with clear plastic for 4-6 weeks',
        ],
        'prevention': [
            'Use certified Fusarium-resistant banana varieties',
            'Avoid moving soil or water from infected areas',
            'Disinfect boots and tools before entering and leaving fields',
            'Plant in well-draining soils to reduce fungal proliferation',
            'Practice long crop rotation (non-host crops for 3-5 years)',
        ],
        'best_practices': [
            'Maintain proper field drainage',
            'Apply organic matter to improve soil microbial diversity',
            'Monitor fields regularly for early signs of wilting',
            'Use tissue-culture plantlets from certified sources',
            'Establish windbreaks to reduce spread of fungal spores',
        ],
    },
    'coffee_leaf_rust': {
        'disease_name': 'Coffee Leaf Rust',
        'description': (
            'A fungal disease caused by Hemileia vastatrix causing yellow spots and orange powder '
            'on leaves, leading to defoliation and reduced yield.'
        ),
        'treatment': [
            'Apply copper-based fungicides early in the rainy season',
            'Use systemic fungicides (triazoles) when infection is severe',
            'Spray thoroughly to cover both leaf surfaces',
            'Apply fungicide every 21-30 days during peak infection periods',
            'Prune infected branches and apply fungicide paste on cuts',
        ],
        'prevention': [
            'Plant rust-resistant coffee varieties',
            'Maintain proper shading to reduce leaf wetness',
            'Ensure optimal plant spacing for air circulation',
            'Prune regularly to improve canopy ventilation',
            'Apply balanced nutrition especially potassium',
        ],
        'best_practices': [
            'Regular scouting and monitoring of rust incidence',
            'Maintain proper soil pH (5.5-6.5) for coffee',
            'Apply organic mulch to conserve soil moisture',
            'Practice integrated pest management (IPM)',
            'Keep accurate records of spray applications',
        ],
    },
    'coffee_berry_disease': {
        'disease_name': 'Coffee Berry Disease',
        'description': (
            'Caused by Colletotrichum kahawae, attacking developing coffee berries causing '
            'dark lesions, premature dropping, and significant yield losses.'
        ),
        'treatment': [
            'Apply copper-based fungicides during flowering and berry development',
            'Use systemic fungicides containing carbendazim or tebuconazole',
            'Remove and destroy all infected berries from trees and ground',
            'Spray at 14-day intervals during the rainy season',
            'Apply lime sulfur as an organic alternative',
        ],
        'prevention': [
            'Plant resistant coffee varieties',
            'Prune trees to improve air circulation and light penetration',
            'Avoid dense planting; maintain recommended spacing',
            'Apply balanced fertilizer to reduce plant stress',
            'Control weeds to reduce humidity in the plantation',
        ],
        'best_practices': [
            'Harvest berries promptly when ripe',
            'Remove fallen berries from the ground regularly',
            'Maintain proper shade management',
            'Conduct regular field inspections during wet periods',
            'Keep pruning tools clean and disinfected',
        ],
    },
    'coffee_wilt_disease': {
        'disease_name': 'Coffee Wilt Disease',
        'description': (
            'A vascular wilt caused by Fusarium xylarioides, causing progressive wilting, '
            'leaf drop, dieback, and eventual death of the tree.'
        ),
        'treatment': [
            'Remove and destroy all infected trees completely including roots',
            'Apply fungicide drench (carbendazim) to surrounding healthy trees',
            'Apply Trichoderma-based bio-control to the soil',
            'Solarize planting holes before replanting',
            'Disinfect all tools used on infected trees',
        ],
        'prevention': [
            'Plant wilt-resistant coffee varieties',
            'Use disease-free nursery seedlings',
            'Avoid injuring roots and stems during cultivation',
            'Maintain proper soil drainage',
            'Quarantine new plants before introducing to the farm',
        ],
        'best_practices': [
            'Regular monitoring for early wilt symptoms',
            'Keep farm tools disinfected',
            'Maintain good soil organic matter content',
            'Practice intercropping to improve farm biodiversity',
            'Replace infected trees with resistant varieties',
        ],
    },
}


DISEASE_SEVERITY_GUIDELINES = {
    'low': {
        'label': 'Low',
        'advice': 'Early stages detected. Monitor regularly and apply preventive measures.',
    },
    'medium': {
        'label': 'Medium',
        'advice': 'Disease is progressing. Initiate treatment protocols immediately.',
    },
    'high': {
        'label': 'High',
        'advice': 'Significant infection. Urgent action required to prevent crop loss.',
    },
    'critical': {
        'label': 'Critical',
        'advice': 'Severe outbreak. Immediate intervention and expert consultation needed.',
    },
}


def generate_advisory(disease_key, severity):
    if disease_key not in ADVISORIES:
        return None

    adv = ADVISORIES[disease_key]
    severity_info = DISEASE_SEVERITY_GUIDELINES.get(severity, DISEASE_SEVERITY_GUIDELINES['low'])

    return {
        'disease_name': adv['disease_name'],
        'description': adv['description'],
        'severity': severity_info['label'],
        'severity_advice': severity_info['advice'],
        'treatment': adv['treatment'],
        'prevention': adv['prevention'],
        'best_practices': adv['best_practices'],
    }
