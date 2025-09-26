import React from 'react';
import { DumbbellIcon, CalculatorIcon, PlusCircleIcon, BookOpenIcon } from './Icons';

type View = 'prs' | 'calculator' | 'add' | 'wods';

interface BottomNavProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const navItems = [
  { view: 'prs' as View, label: 'PRs', icon: DumbbellIcon },
  { view: 'calculator' as View, label: 'Calculator', icon: CalculatorIcon },
  { view: 'add' as View, label: 'Add PR', icon: PlusCircleIcon },
  { view: 'wods' as View, label: 'WODs', icon: BookOpenIcon },
];

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setCurrentView }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-dark-card border-t border-dark-border shadow-lg z-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-around">
          {navItems.map(({ view, label, icon: Icon }) => {
            const isActive = currentView === view;
            return (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`flex flex-col items-center justify-center w-full pt-2 pb-1 text-xs sm:text-sm transition-colors duration-200 ${
                  isActive ? 'text-brand-primary' : 'text-dark-text-secondary hover:text-white'
                }`}
                aria-current={isActive ? 'page' : undefined}
                aria-label={label}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span>{label}</span>
                {isActive && <div className="w-8 h-1 bg-brand-primary rounded-full mt-1"></div>}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
