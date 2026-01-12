import React from 'react';
import { twMerge } from 'tailwind-merge';

export const GlassInput = React.forwardRef(({ className, icon: Icon, error, ...props }, ref) => {
    return (
        <div className="relative group">
            {Icon && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors duration-300">
                    <Icon size={20} />
                </div>
            )}
            <input
                ref={ref}
                className={twMerge(
                    "w-full bg-slate-900/50 border border-slate-700/50 text-slate-100 rounded-xl px-4 py-3 placeholder:text-slate-500 outline-none transition-all duration-300 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 focus:bg-slate-900/80",
                    Icon && "pl-12",
                    error && "border-red-500/50 focus:border-red-500 focus:ring-red-500/50",
                    className
                )}
                {...props}
            />
            {error && (
                <span className="text-red-400 text-xs mt-1 ml-2 block">{error}</span>
            )}
        </div>
    );
});
