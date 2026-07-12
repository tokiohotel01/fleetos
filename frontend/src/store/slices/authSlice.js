import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../services/api';
export const login = createAsyncThunk('auth/login', async (creds, { rejectWithValue }) => {
  try { const r = await authAPI.login(creds); localStorage.setItem('token', r.data.token); return r.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Error al iniciar sesión'); }
});
export const loadUser = createAsyncThunk('auth/loadUser', async (_, { rejectWithValue }) => {
  try { return (await authAPI.me()).data.user; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});
const s = createSlice({
  name: 'auth',
  initialState: { user: null, token: localStorage.getItem('token'), loading: false, error: null },
  reducers: {
    logout: (s) => { s.user = null; s.token = null; localStorage.removeItem('token'); },
    clearError: (s) => { s.error = null; }
  },
  extraReducers: (b) => {
    b.addCase(login.pending, s => { s.loading = true; s.error = null; })
     .addCase(login.fulfilled, (s,a) => { s.loading = false; s.token = a.payload.token; s.user = a.payload.user; })
     .addCase(login.rejected, (s,a) => { s.loading = false; s.error = a.payload; })
     .addCase(loadUser.fulfilled, (s,a) => { s.user = a.payload; })
     .addCase(loadUser.rejected, (s) => { s.user = null; s.token = null; localStorage.removeItem('token'); });
  }
});
export const { logout, clearError } = s.actions;
export default s.reducer;
