import React, { useState, useEffect, createContext, useContext } from 'react';
import { CssBaseline, ThemeProvider, createTheme, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import ArchitectureViewer from './components/ArchitectureViewer';

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

// API Key Context
export const ApiKeyContext = createContext<{ apiKey: string; setApiKey: (key: string) => void }>({ apiKey: '', setApiKey: () => {} });
export const useApiKey = () => useContext(ApiKeyContext);

function ApiKeyProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKey] = useState<string>(import.meta.env.VITE_OPENAI_API_KEY || '');
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (!apiKey) setOpen(true);
  }, [apiKey]);

  const handleSave = () => {
    setApiKey(input.trim());
    setOpen(false);
  };

  return (
    <ApiKeyContext.Provider value={{ apiKey, setApiKey }}>
      {children}
      <Dialog open={open} disableEscapeKeyDown>
        <DialogTitle>Enter OpenAI API Key</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="OpenAI API Key"
            type="password"
            fullWidth
            value={input}
            onChange={e => setInput(e.target.value)}
            helperText="You can find your API key at https://platform.openai.com/account/api-keys"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSave} disabled={!input.trim()} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </ApiKeyContext.Provider>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ApiKeyProvider>
        <ArchitectureViewer />
      </ApiKeyProvider>
    </ThemeProvider>
  );
}

export default App;
