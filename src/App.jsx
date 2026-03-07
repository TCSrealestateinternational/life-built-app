import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useProject } from './hooks/useProject';
import AuthScreen from './components/AuthScreen';
import Shell from './components/Shell';
import Dashboard from './components/Dashboard';
import Properties from './components/Properties';
import Design from './components/Design';
import Budget from './components/Budget';
import Timeline from './components/Timeline';
import Checklists from './components/Checklists';
import Team from './components/Team';
import ShareView from './components/ShareView';

function getShareUid() {
  const match = window.location.pathname.match(/^\/share\/([^/]+)$/);
  return match ? match[1] : null;
}

export default function App() {
  const shareUid = getShareUid();
  const user = useAuth();
  const [section, setSection] = useState('dashboard');
  const { project, loading, updateProject } = useProject(user?.uid ?? null);

  if (shareUid) return <ShareView uid={shareUid} />;

  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream text-mist text-sm">
        Loading…
      </div>
    );
  }

  if (!user) return <AuthScreen />;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream text-mist text-sm">
        Loading your project…
      </div>
    );
  }

  const sectionProps = { project, updateProject };

  return (
    <Shell user={user} section={section} onSection={setSection}>
      {section === 'dashboard' && <Dashboard {...sectionProps} user={user} onSection={setSection} />}
      {section === 'properties' && <Properties {...sectionProps} />}
      {section === 'design' && <Design {...sectionProps} />}
      {section === 'budget' && <Budget {...sectionProps} />}
      {section === 'timeline' && <Timeline {...sectionProps} />}
      {section === 'checklists' && <Checklists {...sectionProps} />}
      {section === 'team' && <Team {...sectionProps} uid={user.uid} />}
    </Shell>
  );
}
