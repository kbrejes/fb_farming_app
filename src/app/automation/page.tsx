import dynamic from 'next/dynamic';

// Динамический импорт для клиентских компонентов
const FacebookAutomationComponent = dynamic(
  () => import('./FacebookAutomation'),
  { ssr: false }
);

export const metadata = {
  title: 'Автоматизация Facebook | Farming App',
  description: 'Автоматизация действий в Facebook через эмуляторы Android',
};

export default function AutomationPage() {
  return (
    <div className="container mx-auto py-8">
      <FacebookAutomationComponent />
    </div>
  );
} 