import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import ArchitectureViewer from './components/ArchitectureViewer';

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ArchitectureViewer />
    </ThemeProvider>
  );
}

export default App;
