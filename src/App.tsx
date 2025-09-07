import { MainLayout } from './components/layout/MainLayout';
import { ProgramList } from './components/features/ProgramList';
import { SettingsProvider } from './contexts/SettingsContext';

function App() {
  return (
    <SettingsProvider>
      <MainLayout>
        <ProgramList />
      </MainLayout>
    </SettingsProvider>
  );
}

export default App;
