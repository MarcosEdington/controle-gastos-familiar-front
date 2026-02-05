import axios from 'axios';

const api = axios.create({
  baseURL: 'https://localhost:7064/api',  // Mude para a porta do seu backend se for diferente
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;