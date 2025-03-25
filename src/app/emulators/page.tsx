import { EmulatorManager } from '@/components/EmulatorManager';

export const metadata = {
  title: 'Эмуляторы | Farming App',
  description: 'Управление эмуляторами Android',
};

export default function EmulatorsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Эмуляторы Android</h1>
      <EmulatorManager />
    </div>
  );
} 