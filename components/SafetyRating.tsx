type SafetyColor = {
    background: string,
    text: string,
    border: string
}

// Safety level colors
const SAFETY_COLORS = {
    SAFE: {
        background: '#D1FAE5',
        text: '#065F46',
        border: '#10B981',
    },
    CAUTION: {
        background: '#FEF3C7',
        text: '#92400E',
        border: '#F59E0B',
    },
    AVOID: {
        background: '#FEE2E2',
        text: '#991B1B',
        border: '#EF4444',
    },
};

// FODMAP rating colors
const FODMAP_COLORS = {
    LOW_FODMAP: '#10B981',
    HIGH_FODMAP: '#EF4444',
    GLUTEN_FREE: '#3B82F6',
};

export function getSafetyLevelColor(rating?: string): SafetyColor {

    if (rating === 'SAFE') {
        return {
            background: '#D1FAE5',
            text: '#065F46',
            border: '#10B981',
        }
    }

    return {
        background: '#c5c5c5ff',
        text: '#070000ff',
        border: '#979797ff',
    }


}