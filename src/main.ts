// Ponto de entrada do PhysioVilas Chatbot
// Pacote 1 — simulador local, sem banco, sem API WhatsApp

import { criarServidor } from './channels/webSimulator/server.js'

criarServidor(3022)
