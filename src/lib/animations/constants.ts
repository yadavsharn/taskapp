export const EASE = {
    easeOut: [0.215, 0.61, 0.355, 1],
    easeInOut: [0.4, 0, 0.2, 1],
    gentle: [0.4, 0, 0.2, 1], // Standard gentle easing
};

export const DURATION = {
    fast: 0.15,
    medium: 0.3,
    slow: 0.6,
};

export const SPRING = {
    gentle: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        mass: 1,
    },
    bouncy: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        mass: 1,
    },
};

export const TRANSITION = {
    default: {
        duration: DURATION.medium,
        ease: EASE.easeOut,
    },
    page: {
        duration: 0.4,
        ease: EASE.easeOut,
    },
};
