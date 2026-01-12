import React from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

export const GlassButton = ({ children, className, variant = 'primary', isLoading, ...props }) => {
    const variants = {
        primary: "bg-primary/20 hover:bg-primary/30 text-primary border-primary/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]",
        secondary: "bg-slate-800/50 hover:bg-slate-700/50 text-slate-200 border-slate-600 hover:border-slate-500",
        danger: "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]",
        ghost: "bg-transparent hover:bg-white/5 text-slate-300 border-transparent"
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={twMerge(
                "relative px-6 py-3 rounded-xl font-medium tracking-wide transition-all duration-300 border backdrop-blur-sm flex items-center justify-center gap-2",
                variants[variant],
                className
            )}
            disabled={isLoading}
            {...props}
        >
            {isLoading ? (
                <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : children}
            {variant === 'primary' && (
                <div className="absolute inset-0 rounded-xl bg-primary/20 blur-xl opacity-0 group-hover:opacity-50 transition-opacity" />
            )}
        </motion.button>
    );
};
