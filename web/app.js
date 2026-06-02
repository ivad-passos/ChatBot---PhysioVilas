// Gera um ID de sessão único por aba do navegador
const sessionId = sessionStorage.getItem('sessionId') ?? `user-${Math.random().toString(36).slice(2, 9)}`
sessionStorage.setItem('sessionId', sessionId)

const messagesEl = document.getElementById('messages')
const inputEl = document.getElementById('input')
const sendBtn = document.getElementById('send-btn')
const statusEl = document.getElementById('status')

// Conecta ao WebSocket passando o sessionId
const wsUrl = `ws://${location.host}?sessionId=${encodeURIComponent(sessionId)}`
const ws = new WebSocket(wsUrl)

ws.addEventListener('open', () => {
  statusEl.textContent = 'online'
  statusEl.classList.add('online')
  inputEl.disabled = false
  sendBtn.disabled = false
})

ws.addEventListener('close', () => {
  statusEl.textContent = 'desconectado'
  statusEl.classList.remove('online')
  inputEl.disabled = true
  sendBtn.disabled = true
})

ws.addEventListener('message', (event) => {
  removeTypingIndicator()
  const { from, text } = JSON.parse(event.data)
  appendBubble(from === 'bot' ? 'bot' : 'user', text)
})

// Envio de mensagem
function sendMessage() {
  const text = inputEl.value.trim()
  if (!text || ws.readyState !== WebSocket.OPEN) return

  appendBubble('user', text)
  ws.send(JSON.stringify({ text }))
  inputEl.value = ''
  showTypingIndicator()
}

sendBtn.addEventListener('click', sendMessage)
inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
})

// Renderização dos balões
function appendBubble(origin, text) {
  const wrapper = document.createElement('div')
  wrapper.className = `bubble-wrapper ${origin}`

  const bubble = document.createElement('div')
  bubble.className = 'bubble'
  bubble.textContent = text

  const time = document.createElement('span')
  time.className = 'bubble-time'
  time.textContent = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  wrapper.appendChild(bubble)
  wrapper.appendChild(time)
  messagesEl.appendChild(wrapper)
  messagesEl.scrollTop = messagesEl.scrollHeight
}

// Indicador de digitação
let typingEl = null

function showTypingIndicator() {
  if (typingEl) return
  typingEl = document.createElement('div')
  typingEl.className = 'typing-indicator'
  typingEl.innerHTML = '<span></span><span></span><span></span>'
  messagesEl.appendChild(typingEl)
  messagesEl.scrollTop = messagesEl.scrollHeight
}

function removeTypingIndicator() {
  if (typingEl) {
    typingEl.remove()
    typingEl = null
  }
}

// Estado inicial
inputEl.disabled = true
sendBtn.disabled = true
