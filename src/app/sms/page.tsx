'use client';

import { useState, useEffect } from 'react';
import { SmsActivateService } from '@/services/sms-activate';

interface Activation {
  id: string;
  phone: string;
  status: string;
  timeLeft: string;
}

export default function SmsPage() {
  const [activations, setActivations] = useState<Activation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState('0'); // 0 - Россия по умолчанию
  const [balance, setBalance] = useState<number | null>(null);

  // Список доступных стран
  const countries = [
    { id: '0', name: 'Россия' },
    { id: '1', name: 'Украина' },
    { id: '2', name: 'Казахстан' },
    { id: '3', name: 'Китай' },
    { id: '4', name: 'Филиппины' },
    { id: '5', name: 'Мьянма' },
    { id: '6', name: 'Индонезия' },
    { id: '7', name: 'Малайзия' },
    { id: '8', name: 'Кения' },
    { id: '9', name: 'Танзания' },
    { id: '10', name: 'Вьетнам' },
    { id: '11', name: 'Киргизия' },
    { id: '12', name: 'США' },
    { id: '13', name: 'Израиль' },
    { id: '14', name: 'Гонконг' },
    { id: '15', name: 'Польша' },
    { id: '16', name: 'Англия' },
    { id: '17', name: 'Мадагаскар' },
    { id: '18', name: 'ДР Конго' },
    { id: '19', name: 'Нигерия' },
    { id: '20', name: 'Македония' },
    { id: '21', name: 'Индонезия' },
    { id: '22', name: 'Сербия' },
    { id: '23', name: 'Боливия' },
    { id: '24', name: 'Чехия' },
    { id: '25', name: 'Словакия' },
    { id: '26', name: 'Азербайджан' },
    { id: '27', name: 'Словения' },
    { id: '28', name: 'Беларусь' },
    { id: '29', name: 'Узбекистан' },
    { id: '30', name: 'Монголия' },
    { id: '31', name: 'Армения' },
    { id: '32', name: 'Лаос' },
    { id: '33', name: 'Камбоджа' },
    { id: '34', name: 'Босния и Герцеговина' },
    { id: '35', name: 'Албания' },
    { id: '36', name: 'Латвия' },
    { id: '37', name: 'Саудовская Аравия' },
    { id: '38', name: 'Таиланд' },
    { id: '39', name: 'Сербия' },
    { id: '40', name: 'Ливан' },
    { id: '41', name: 'Перу' },
    { id: '42', name: 'Пакистан' },
    { id: '43', name: 'Шри-Ланка' },
    { id: '44', name: 'Бангладеш' },
    { id: '45', name: 'Палестина' },
    { id: '46', name: 'ОАЭ' },
    { id: '47', name: 'Венесуэла' },
    { id: '48', name: 'Молдова' },
    { id: '49', name: 'Эквадор' },
    { id: '50', name: 'Португалия' },
    { id: '51', name: 'Литва' },
    { id: '52', name: 'Гватемала' },
    { id: '53', name: 'Израиль' },
    { id: '54', name: 'Алжир' },
    { id: '55', name: 'Словения' },
    { id: '56', name: 'Южная Корея' },
    { id: '57', name: 'Эстония' },
    { id: '58', name: 'Иордания' },
    { id: '59', name: 'Вьетнам' },
    { id: '60', name: 'Монголия' },
    { id: '61', name: 'Бразилия' },
    { id: '62', name: 'Коста-Рика' },
    { id: '63', name: 'Беларусь' },
    { id: '64', name: 'Гаити' },
    { id: '65', name: 'Гвинея' },
    { id: '66', name: 'Панама' },
    { id: '67', name: 'Сенегал' },
    { id: '68', name: 'Замбия' },
    { id: '69', name: 'Чад' },
    { id: '70', name: 'Германия' },
    { id: '71', name: 'Литва' },
    { id: '72', name: 'Кот-д\'Ивуар' },
    { id: '73', name: 'Судан' },
    { id: '74', name: 'Ирак' },
    { id: '75', name: 'Нидерланды' },
    { id: '76', name: 'Латвия' },
    { id: '77', name: 'Камерун' },
    { id: '78', name: 'Гвинея-Бисау' },
    { id: '79', name: 'Мали' },
    { id: '80', name: 'Буркина-Фасо' },
    { id: '81', name: 'Мавритания' },
    { id: '82', name: 'Бенин' },
    { id: '83', name: 'Габон' },
    { id: '84', name: 'Ангола' },
    { id: '85', name: 'Никарагуа' },
    { id: '86', name: 'Джибути' },
    { id: '87', name: 'Ботсвана' },
    { id: '88', name: 'Коморы' },
    { id: '89', name: 'Уганда' },
    { id: '90', name: 'Свазиленд' },
    { id: '91', name: 'Руанда' },
    { id: '92', name: 'Чад' },
    { id: '93', name: 'Конго' },
    { id: '94', name: 'Эфиопия' },
    { id: '95', name: 'Эритрея' },
    { id: '96', name: 'Намибия' },
    { id: '97', name: 'Гамбия' },
    { id: '98', name: 'Малави' },
    { id: '99', name: 'Лесото' },
    { id: '100', name: 'Камерун' },
    { id: '101', name: 'Габон' },
    { id: '102', name: 'Алжир' },
    { id: '103', name: 'Уганда' },
    { id: '104', name: 'Зимбабве' },
    { id: '105', name: 'Ангола' },
    { id: '106', name: 'Гвинея' },
    { id: '107', name: 'Сейшелы' },
    { id: '108', name: 'Кения' },
    { id: '109', name: 'Танзания' },
    { id: '110', name: 'Тунис' },
    { id: '111', name: 'Сьерра-Леоне' },
    { id: '112', name: 'Ливия' },
    { id: '113', name: 'Конго' },
    { id: '114', name: 'Мавритания' },
    { id: '115', name: 'Кот-д\'Ивуар' },
    { id: '116', name: 'Свазиленд' },
    { id: '117', name: 'Алжир' },
    { id: '118', name: 'Буркина-Фасо' },
    { id: '119', name: 'Либерия' },
    { id: '120', name: 'Сомали' },
    { id: '121', name: 'Бенин' },
    { id: '122', name: 'Ботсвана' },
    { id: '123', name: 'Бурунди' },
    { id: '124', name: 'Камерун' },
    { id: '125', name: 'Кабо-Верде' },
    { id: '126', name: 'Центральноафриканская Республика' },
    { id: '127', name: 'Коморы' },
    { id: '128', name: 'Конго' },
    { id: '129', name: 'Джибути' },
    { id: '130', name: 'Экваториальная Гвинея' },
    { id: '131', name: 'Эритрея' },
    { id: '132', name: 'Эфиопия' },
    { id: '133', name: 'Габон' },
    { id: '134', name: 'Гамбия' },
    { id: '135', name: 'Гана' },
    { id: '136', name: 'Гвинея' },
    { id: '137', name: 'Гвинея-Бисау' },
    { id: '138', name: 'Кения' },
    { id: '139', name: 'Лесото' },
    { id: '140', name: 'Либерия' },
    { id: '141', name: 'Ливия' },
    { id: '142', name: 'Мадагаскар' },
    { id: '143', name: 'Малави' },
    { id: '144', name: 'Мали' },
    { id: '145', name: 'Мавритания' },
    { id: '146', name: 'Маврикий' },
    { id: '147', name: 'Марокко' },
    { id: '148', name: 'Мозамбик' },
    { id: '149', name: 'Намибия' },
    { id: '150', name: 'Нигер' },
    { id: '151', name: 'Нигерия' },
    { id: '152', name: 'Руанда' },
    { id: '153', name: 'Сан-Томе и Принсипи' },
    { id: '154', name: 'Сенегал' },
    { id: '155', name: 'Сейшелы' },
    { id: '156', name: 'Сьерра-Леоне' },
    { id: '157', name: 'Сомали' },
    { id: '158', name: 'Южная Африка' },
    { id: '159', name: 'Южный Судан' },
    { id: '160', name: 'Судан' },
    { id: '161', name: 'Свазиленд' },
    { id: '162', name: 'Танзания' },
    { id: '163', name: 'Того' },
    { id: '164', name: 'Тунис' },
    { id: '165', name: 'Уганда' },
    { id: '166', name: 'Замбия' },
    { id: '167', name: 'Зимбабве' }
  ];

  useEffect(() => {
    loadBalance();
    loadActivations();
  }, []);

  const loadBalance = async () => {
    try {
      const smsService = SmsActivateService.getInstance();
      const balance = await smsService.getBalance();
      setBalance(balance);
    } catch (error) {
      console.error('Ошибка при загрузке баланса:', error);
    }
  };

  const loadActivations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sms');
      if (!response.ok) {
        throw new Error('Не удалось загрузить активации');
      }
      const data = await response.json();
      setActivations(data.activeActivations || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const getNewNumber = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service: 'fb',
          country: selectedCountry
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось получить номер');
      }

      const data = await response.json();
      await loadActivations();
      await loadBalance();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const cancelActivation = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/sms/cancel?id=${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось отменить активацию');
      }

      await loadActivations();
      await loadBalance();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const getCode = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/sms/code?id=${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось получить код');
      }

      const data = await response.json();
      if (data.success) {
        // Начинаем периодический опрос статуса
        const checkStatus = async () => {
          const statusResponse = await fetch(`/api/sms/${id}`);
          if (!statusResponse.ok) {
            return;
          }
          const statusData = await statusResponse.json();
          if (statusData.status === 'code_received') {
            alert(`Получен код: ${statusData.code}`);
          } else if (statusData.status === 'finished' || statusData.status === 'canceled') {
            return;
          } else {
            setTimeout(checkStatus, 5000); // Проверяем каждые 5 секунд
          }
        };
        checkStatus();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">SMS верификация</h1>
      
      {error && (
        <div className="bg-red-500 text-white p-4 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Баланс</h2>
            <p className="text-2xl font-bold text-green-500">
              {balance !== null ? `$${balance.toFixed(2)}` : 'Загрузка...'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-gray-700 text-white rounded px-3 py-2"
            >
              {countries.map(country => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
            <button
              onClick={getNewNumber}
              disabled={loading}
              className={`px-4 py-2 rounded ${
                loading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {loading ? 'Загрузка...' : 'Получить номер'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Активные активации</h2>
        
        {loading ? (
          <p>Загрузка...</p>
        ) : activations.length > 0 ? (
          <div className="space-y-4">
            {activations.map(activation => (
              <div
                key={activation.id}
                className="bg-gray-700 rounded p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{activation.phone}</p>
                  <p className="text-sm text-gray-400">
                    Статус: {activation.status}
                    {activation.timeLeft && ` | Осталось: ${activation.timeLeft}`}
                  </p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => getCode(activation.id)}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-white"
                  >
                    Получить код
                  </button>
                  <button
                    onClick={() => cancelActivation(activation.id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white"
                  >
                    Отменить
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">Нет активных активаций</p>
        )}
      </div>
    </div>
  );
} 