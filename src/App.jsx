import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useProject } from './hooks/useProject';
import { useInstallPrompt } from './hooks/useInstallPrompt';
import AuthScreen from './components/AuthScreen';
import Shell from './components/Shell';
import Dashboard from './components/Dashboard';
import Properties from './components/Properties';
import Design from './components/Design';
import Budget from './components/Budget';
import Timeline from './components/Timeline';
import Checklists from './components/Checklists';
import Team from './components/Team';
import Profile from './components/Profile';
import Documents from './components/Documents';
import KeyContacts from './components/KeyContacts';
import ChangeOrders from './components/ChangeOrders';
import PaymentSchedule from './components/PaymentSchedule';
import CommunicationLog from './components/CommunicationLog';
import LienWaivers from './components/LienWaivers';
import ShareView from './components/ShareView';
import SharedPortal from './components/SharedPortal';
import InstallPrompt from './components/InstallPrompt';
import TourOverlay from './components/TourOverlay';
import { TOUR_STEPS } from './data/tourSteps';

const TOUR_KEY = 'lifebuilt_tour_seen';

function getShareUid() {
  const match = window.location.pathname.match(/^\/share\/([^/]+)$/);
  return match ? match[1] : null;
}

function getTeamToken() {
  const match = window.location.pathname.match(/^\/t\/([^/]+)$/);
  return match ? match[1] : null;
}

export default function App() {
  const shareUid = getShareUid();
  const teamToken = getTeamToken();
  const user = useAuth();
  const [section, setSection] = useState('dashboard');
  const { project, loading, updateProject, saving } = useProject(user?.uid ?? null);

  const [tourActive, setTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const installPrompt = useInstallPrompt();

  useEffect(() => {
    if (!user || loading) return;
    if (localStorage.getItem(TOUR_KEY)) return;
    const timer = setTimeout(() => {
      setTourStep(0);
      setSection(TOUR_STEPS[0].sectionId);
      setTourActive(true);
      localStorage.setItem(TOUR_KEY, '1');
    }, 600);
    return () => clearTimeout(timer);
  }, [user, loading]);

  function startTour() {
    setTourStep(0);
    setSection(TOUR_STEPS[0].sectionId);
    setTourActive(true);
  }
  function nextStep() {
    const next = tourStep + 1;
    setTourStep(next);
    setSection(TOUR_STEPS[next].sectionId);
  }
  function backStep() {
    const prev = tourStep - 1;
    setTourStep(prev);
    setSection(TOUR_STEPS[prev].sectionId);
  }
  function endTour() {
    setTourActive(false);
    setTourStep(0);
  }

  if (shareUid) return <ShareView uid={shareUid} />;
  if (teamToken) return <SharedPortal token={teamToken} />;

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
    <>
    <InstallPrompt hideDuring={tourActive} installPrompt={installPrompt} />
    <Shell user={user} section={section} onSection={setSection} saving={saving} tourActive={tourActive} onStartTour={startTour} installPrompt={installPrompt}>
      {section === 'dashboard' && <Dashboard {...sectionProps} user={user} onSection={setSection} />}
      {section === 'profile' && <Profile {...sectionProps} user={user} />}
      {section === 'properties' && <Properties {...sectionProps} uid={user.uid} />}
      {section === 'design' && <Design {...sectionProps} />}
      {section === 'budget' && <Budget {...sectionProps} />}
      {section === 'timeline' && <Timeline {...sectionProps} />}
      {section === 'changeorders' && <ChangeOrders {...sectionProps} />}
      {section === 'payments' && <PaymentSchedule {...sectionProps} />}
      {section === 'commslog' && <CommunicationLog {...sectionProps} />}
      {section === 'lienwaiver' && <LienWaivers {...sectionProps} />}
      {section === 'checklists' && <Checklists {...sectionProps} />}
      {section === 'documents' && <Documents {...sectionProps} uid={user.uid} />}
      {section === 'keycontacts' && <KeyContacts {...sectionProps} />}
      {section === 'team' && <Team {...sectionProps} uid={user.uid} />}
    </Shell>
    <TourOverlay
      tourActive={tourActive}
      tourStep={tourStep}
      onNext={nextStep}
      onBack={backStep}
      onSkip={endTour}
      onEnd={endTour}
      installPrompt={installPrompt}
    />
    </>
  );
}
