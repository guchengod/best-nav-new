import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'zh' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <Button
      variant="ghost"
      onClick={toggleLanguage}
    >
      {i18n.language === 'en' ? '中文' : 'English'}
    </Button>
  );
}
