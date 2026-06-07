BANANA_SYMPTOM_WEIGHTS = {
    'yellowing_of_leaves': 2,
    'wilting_of_leaves': 3,
    'leaf_collapse': 3,
    'yellow_brown_leaf_streaks': 2,
    'premature_ripening_of_fruits': 2,
    'splitting_of_pseudostem': 3,
    'black_spots_on_leaves': 2,
    'stunted_growth': 1,
    'drying_leaf_edges': 1,
}

COFFEE_SYMPTOM_WEIGHTS = {
    'yellow_leaf_spots': 2,
    'orange_powder_on_leaf_underside': 3,
    'leaf_drop': 2,
    'brown_lesions_on_leaves': 2,
    'wilting_branches': 3,
    'dieback_of_twigs': 3,
    'premature_berry_drop': 2,
    'blackened_berries': 2,
    'stunted_growth': 1,
}

BANANA_DISEASE_SIGNATURES = {
    'banana_bacterial_wilt': {
        'label': 'Banana Bacterial Wilt',
        'required': ['wilting_of_leaves', 'yellowing_of_leaves'],
        'strong': ['splitting_of_pseudostem', 'premature_ripening_of_fruits'],
        'description': (
            'A devastating bacterial disease caused by Xanthomonas campestris pv. musacearum. '
            'It causes rapid wilting, yellowing, and premature ripening of fruits. '
            'The disease spreads through infected planting materials, tools, and insect vectors.'
        ),
    },
    'banana_black_sigatoka': {
        'label': 'Black Sigatoka',
        'required': ['black_spots_on_leaves', 'yellow_brown_leaf_streaks'],
        'strong': ['leaf_collapse', 'drying_leaf_edges'],
        'description': (
            'A fungal leaf spot disease caused by Mycosphaerella fijiensis. '
            'It starts as small black spots that enlarge into streaks with yellow halos. '
            'Severe infection causes leaf collapse and premature drying, reducing fruit yield.'
        ),
    },
    'banana_fusarium_wilt': {
        'label': 'Fusarium Wilt (Panama Disease)',
        'required': ['yellowing_of_leaves', 'wilting_of_leaves'],
        'strong': ['stunted_growth', 'drying_leaf_edges'],
        'description': (
            'A soil-borne fungal disease caused by Fusarium oxysporum f. sp. cubense. '
            'It causes progressive yellowing and wilting of lower leaves, stunted growth, '
            'and eventual death of the plant. The fungus persists in soil for decades.'
        ),
    },
    'banana_streak_virus': {
        'label': 'Banana Streak Virus',
        'required': ['yellow_brown_leaf_streaks', 'stunted_growth'],
        'strong': ['leaf_collapse', 'drying_leaf_edges'],
        'description': (
            'A viral disease caused by Banana streak virus (BSV). '
            'It produces yellow or brown streaking on leaves, stunted growth, '
            'and reduced fruit yield. The virus can remain dormant and activate under stress.'
        ),
    },
}

COFFEE_DISEASE_SIGNATURES = {
    'coffee_leaf_rust': {
        'label': 'Coffee Leaf Rust',
        'required': ['orange_powder_on_leaf_underside', 'yellow_leaf_spots'],
        'strong': ['leaf_drop', 'brown_lesions_on_leaves'],
        'description': (
            'A fungal disease caused by Hemileia vastatrix. It appears as yellow spots '
            'on the upper leaf surface and orange powder on the underside. Severe infection '
            'causes defoliation, reduced yield, and dieback of branches.'
        ),
    },
    'coffee_berry_disease': {
        'label': 'Coffee Berry Disease',
        'required': ['premature_berry_drop', 'blackened_berries'],
        'strong': ['leaf_drop', 'brown_lesions_on_leaves'],
        'description': (
            'A fungal disease caused by Colletotrichum kahawae. It attacks green berries, '
            'causing dark sunken lesions that lead to premature dropping. Severe outbreaks '
            'can destroy up to 80% of the crop.'
        ),
    },
    'coffee_wilt_disease': {
        'label': 'Coffee Wilt Disease',
        'required': ['wilting_branches', 'dieback_of_twigs'],
        'strong': ['leaf_drop', 'stunted_growth'],
        'description': (
            'A vascular wilt disease caused by Fusarium xylarioides. It causes progressive '
            'wilting of branches, dieback, leaf drop, and eventually death of the tree. '
            'It is one of the most destructive diseases in African coffee production.'
        ),
    },
    'coffee_leaf_miner': {
        'label': 'Coffee Leaf Miner',
        'required': ['brown_lesions_on_leaves', 'leaf_drop'],
        'strong': ['yellow_leaf_spots', 'dieback_of_twigs'],
        'description': (
            'Insect damage caused by the coffee leaf miner (Leucoptera spp.). Larvae tunnel '
            'between leaf surfaces causing brown lesions and premature leaf drop. '
            'Heavy infestation reduces photosynthesis and coffee yield.'
        ),
    },
}

DISEASE_SIGNATURES = {
    'banana': BANANA_DISEASE_SIGNATURES,
    'coffee': COFFEE_DISEASE_SIGNATURES,
}

SYMPTOM_WEIGHTS = {
    'banana': BANANA_SYMPTOM_WEIGHTS,
    'coffee': COFFEE_SYMPTOM_WEIGHTS,
}


def analyze_symptoms(crop_type, symptoms):
    weights = SYMPTOM_WEIGHTS.get(crop_type, {})
    signatures = DISEASE_SIGNATURES.get(crop_type, {})

    selected = [s for s, v in symptoms.items() if v]
    total_score = sum(weights.get(s, 0) for s in selected)

    if not selected:
        return None, None, 0, 'low', 0.0

    scored = []
    for key, sig in signatures.items():
        match_count = sum(1 for s in sig['required'] if symptoms.get(s))
        strong_count = sum(1 for s in sig['strong'] if symptoms.get(s))
        has_required = all(symptoms.get(s) for s in sig['required'])

        if has_required:
            score = 60 + strong_count * 10 + match_count * 5
        elif match_count > 0:
            score = strong_count * 15 + match_count * 5
        else:
            score = 0

        scored.append((key, sig, score))

    scored.sort(key=lambda x: x[2], reverse=True)
    best = scored[0] if scored else (None, None, 0)

    confidence = min(best[2] / 100, 0.95)

    if best[2] >= 70:
        severity = 'critical'
    elif best[2] >= 50:
        severity = 'high'
    elif best[2] >= 30:
        severity = 'medium'
    elif best[2] >= 10:
        severity = 'low'
    else:
        return None, None, 0, 'low', 0.0

    return best[0], best[1]['label'], best[1]['description'], severity, round(confidence, 2)
