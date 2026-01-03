import { Variants } from "framer-motion";
import { DURATION, EASE, TRANSITION } from "./constants";

export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: TRANSITION.default
    },
    exit: {
        opacity: 0,
        transition: { duration: DURATION.fast, ease: EASE.easeOut }
    }
};

export const slideUp: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
        opacity: 1,
        y: 0,
        transition: TRANSITION.default
    },
    exit: {
        opacity: 0,
        y: -12,
        transition: { duration: DURATION.fast, ease: EASE.easeOut }
    }
};

export const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: TRANSITION.default
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        transition: { duration: DURATION.fast, ease: EASE.easeOut }
    }
};

export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.05,
        },
    },
};

export const pageTransition: Variants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: EASE.easeOut,
            staggerChildren: 0.1
        }
    },
    exit: {
        opacity: 0,
        y: -8,
        transition: { duration: 0.2, ease: EASE.easeOut }
    }
};

export const checkMark: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
        pathLength: 1,
        opacity: 1,
        transition: {
            duration: 0.4,
            ease: EASE.easeOut,
            delay: 0.2,
        },
    },
};

export const shake: Variants = {
    idle: { x: 0 },
    error: {
        x: [-4, 4, -2, 2, 0],
        transition: { duration: 0.4, ease: EASE.easeInOut },
    },
};
