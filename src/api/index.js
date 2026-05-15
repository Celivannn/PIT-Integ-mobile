import api from './axios';
import { API_BASE_URL } from '../utils/config';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Auth ────────────────────────────────────────────────────────────────────
export const loginApi = async (email, password) => {
  // Mobile uses body-based refresh token (not HttpOnly cookie)
  const { data } = await axios.post(`${API_BASE_URL}/auth/login/`, { email, password });
  return data;
};

export const registerApi = (data) => api.post('/auth/register/', data);
export const logoutApi   = (refreshToken) =>
  api.post('/auth/logout/', { refresh: refreshToken });
export const getProfileApi    = () => api.get('/auth/profile/');
export const updateProfileApi = (data) => api.patch('/auth/profile/', data);

// ─── Rooms ───────────────────────────────────────────────────────────────────
export const getRoomsApi        = (params) => api.get('/rooms/', { params });
export const getRoomApi         = (id)     => api.get(`/rooms/${id}/`);
export const getRoomTypesApi    = ()       => api.get('/rooms/types/');
export const checkAvailabilityApi = (params) => api.get('/rooms/availability/', { params });

// ─── Reservations ─────────────────────────────────────────────────────────────
export const getMyReservationsApi = () => api.get('/reservations/');
export const createReservationApi = (data) => api.post('/reservations/', data);
export const cancelReservationApi = (id)   => api.post(`/reservations/${id}/cancel/`);

// ─── Settings (public) ────────────────────────────────────────────────────────
export const getHotelSettingsApi = () => api.get('/settings/');
