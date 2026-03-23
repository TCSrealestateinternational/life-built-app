import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useProject } from './hooks/useProject';
import { useSubscription } from './hooks/useSubscription';
import { useInstallPrompt } from './hooks/useInstallPrompt';
import { useTokenStore } from './hooks/useTokenStore';
import { useTeamProfile } from './hooks/useTeamProfile';
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
import TeamPortalHome from './components/TeamPortalHome';
import TeamAuthScreen from './components/TeamAuthScreen';
import PaywallScreen from './components/PaywallScreen';
import InstallPrompt from './components/InstallPrompt';
import TourOverlay from './components/TourOverlay';
import { TOUR_STEPS } from './data/tourSteps';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

const TOUR_KEY = 'lifebuilt_tour_seen';

function getShareUid() {
  const match = window.location.pathname.match(/^\/share\/([^/]+)$/);
  return match ? match[1] : null;
}

function getTeamToken() {
  const match = window.location.pathname.match(/^\/t\/([^/]+)$/);
  return match ? match[1] : null;
}

function getPortalPath() {
  const p = window.location.pathname;
  if (p === '/portal' || p === '/portal/') return 'home';
  if (p === '/portal/auth' || p === '/portal/auth/') return 'auth';
  return null;
}

export default function App() {
  const shareUid = getShareUid();
  const teamToken = getTeamToken();
  const portalPath = getPortalPath();

  const user = useAuth();
  const tokenStore = useTokenStore(user ?? null);
  const { profile: teamProfile, loading: teamProfileLoading } = useTeamProfile(user?.uid ?? null);
  const { canAccess, loading: subLoading } = useSubscription(user?.uid ?? null);
  const [section, setSection] = useState('dashboard');
  const { project, loading, updateProject, saving } = useProject(user?.uid ?? null);

  const [tourActive, setTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const installPrompt = useInstallPrompt();

  // Auto-promote team account when subscription becomes active
  useEffect(() => {
    if (!user?.uid || !teamProfile || teamProfileLoading || subLoading) return;
    if (teamProfile.accountType === 'team' && canAccess) {
      updateDoc(doc(db, 'teamProfiles', user.uid), { accountType: 'full', updatedAt: new Date().toISOString() })
        .catch(() => {});
    }
  }, [user?.uid, teamProfile?.accountType, canAccess, teamProfileLoading, subLoading]);

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

  // ── Route: /share/{uid} ───────────────────────────────────────────────────
  if (shareUid) return <ShareView uid={shareUid} />;

  // ── Route: /t/{token} ─────────────────────────────────────────────────────
  if (teamToken) return <SharedPortal token={teamToken} tokenStore={tokenStore} />;

  // ── Route: /portal ────────────────────────────────────────────────────────
  if (portalPath === 'home') {
    return (
      <TeamPortalHome
        tokenStore={tokenStore}
        user={user ?? null}
        teamProfile={teamProfile}
      />
    );
  }

  // ── Route: /portal/auth ───────────────────────────────────────────────────
  if (portalPath === 'auth') {
    return <TeamAuthScreen tokenStore={tokenStore} user={user ?? null} />;
  }

  // ── Auth loading ──────────────────────────────────────────────────────────
  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream text-mist text-sm">
        Loading…
      </div>
    );
  }

  // ── Not logged in: if team tokens exist, show portal instead of auth ─────
  if (!user) {
    if (tokenStore.tokens.length > 0) {
      return (
        <TeamPortalHome
          tokenStore={tokenStore}
          user={null}
          teamProfile={null}
        />
      );
    }
    return <AuthScreen />;
  }

  // ── Subscription + team profile loading ───────────────────────────────────
  if (subLoading || teamProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream text-mist text-sm">
        Loading…
      </div>
    );
  }

  // ── Team member without subscription → portal (not paywall) ────────────────
  // Catches: team-only accounts OR any authenticated user with stored team tokens
  if (!canAccess && (
    (teamProfile && teamProfile.accountType === 'team') ||
    tokenStore.tokens.length > 0
  )) {
    return (
      <TeamPortalHome
        tokenStore={tokenStore}
        user={user}
        teamProfile={teamProfile}
      />
    );
  }

  // ── No subscription, no team tokens → Paywall ─────────────────────────────
  if (!canAccess) {
    return <PaywallScreen user={user} teamProfile={teamProfile} />;
  }

  // ── Project loading ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream text-mist text-sm">
        Loading your project…
      </div>
    );
  }

  // ── Full app ──────────────────────────────────────────────────────────────
  const sectionProps = { project, updateProject };
  const hasTeamTokens = tokenStore.tokens.length > 0;

  return (
    <>
    <InstallPrompt hideDuring={tourActive} installPrompt={installPrompt} />
    <Shell
      user={user}
      section={section}
      onSection={setSection}
      saving={saving}
      tourActive={tourActive}
      onStartTour={startTour}
      installPrompt={installPrompt}
      hasTeamTokens={hasTeamTokens}
    >
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
