
import './App.css'
import ThemeSwitcher from './themeSwitch';

function App({ children }) {
  

  return (
    <div className="min-h-screen flex flex-col">
      <ThemeSwitcher />
      {/* Your timetable or other components go here */}
    </div>
  );
}

export default App
