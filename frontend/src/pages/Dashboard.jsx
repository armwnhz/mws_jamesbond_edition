import { useState } from 'react';
import Layout from '../components/Layout';
import ScrapeTab from './ScrapeTab';
import HistoryTab from './HistoryTab';
import TrashTab from './TrashTab';
import StatsTab from './StatsTab';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('scrape');

  const renderTab = () => {
    switch (activeTab) {
      case 'scrape': return <ScrapeTab />;
      case 'history': return <HistoryTab />;
      case 'trash': return <TrashTab />;
      case 'stats': return <StatsTab />;
      default: return <ScrapeTab />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderTab()}
    </Layout>
  );
}