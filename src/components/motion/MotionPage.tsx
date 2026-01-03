import { motion } from "framer-motion";
import { pageTransition } from "@/lib/animations";
import { ReactNode } from "react";

interface MotionPageProps {
    children: ReactNode;
    className?: string;
}

const MotionPage = ({ children, className }: MotionPageProps) => {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={pageTransition}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export default MotionPage;
