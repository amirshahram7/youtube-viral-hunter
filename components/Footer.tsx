'use client';

import React from 'react';
import { useI18n } from './I18nProvider';

const Footer: React.FC = () => {
  const { t } = useI18n();

  return (
    <footer className="w-full py-12 px-6 border-t border-white/5 mt-auto">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 opacity-40">
        <div className="text-sm font-medium tracking-tight">
          {t.footer.copyright}
        </div>
        
        <div className="flex items-center gap-6 text-sm group">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Security</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
