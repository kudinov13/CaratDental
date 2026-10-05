'use client'

import { useEffect, useRef, useState } from 'react'
import { MessageCircle, Send, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useClinic } from '../context/clinic'

interface Message {
  from: 'bot' | 'user'
  text: string
}

interface ChatBotProps {
  onBook: () => void
}

const quickReplies = ['Записаться на приём', 'Цены', 'Адреса филиалов', 'Врачи', 'Режим работы']

function botAnswer(raw: string, branches: { shortName: string; address: string; phone: string; hours: string }[], doctors: { name: string; role: string; services: { name: string; price: number }[] }[]): string {
  const q = raw.toLowerCase()

  if (/запис|при[её]м|записать/.test(q))
    return 'Конечно! Нажмите «Записаться на приём» ниже — выберите филиал, врача, дату и время. Заявка сразу уйдёт администратору филиала.'
  if (/цен|стоим|сколько|прайс|руб/.test(q)) {
    return 'Ориентировочные цены: первичная консультация — от 1 200 ₽, лечение кариеса — от 3 000 ₽, удаление зуба — от 2 500 ₽. Полный актуальный прайс — на странице «Цены».'
  }
  if (/адрес|где|филиал|находитесь|добраться/.test(q))
    return `У нас 2 филиала в Тобольске:\n${branches.map((b) => `• ${b.address}`).join('\n')}\nФилиал на 15 мкр. — детская стоматология.`
  if (/врач|доктор|кто принимает|специалист/.test(q))
    return `Наши врачи:\n${doctors.map((d) => `• ${d.name} — ${d.role}`).join('\n')}\nВыберите врача при записи.`
  if (/время|работа|график|когда|часы/.test(q))
    return `Режим работы:\n${branches.map((b) => `• ${b.shortName}: ${b.hours}`).join('\n')}`
  if (/телефон|звон|связаться|позвон/.test(q))
    return `Телефоны филиалов:\n${branches.map((b) => `• ${b.shortName}: ${b.phone}`).join('\n')}`
  if (/больн|болит|страшн|анестез/.test(q))
    return 'Лечение проходит без боли — используем современную анестезию и бережные технологии. Если переживаете, скажите врачу — подберём комфортный вариант.'
  if (/дет|реб[её]н|малыш/.test(q))
    return 'Для детей у нас отдельный филиал — детская стоматология на 15-м микрорайоне, д. 18. Лечим без страха и слёз.'
  if (/привет|здравств|добрый/.test(q))
    return 'Здравствуйте! Я помогу записаться на приём, подскажу цены, адреса и врачей. Что вас интересует?'
  if (/спасибо|благодар/.test(q))
    return 'Всегда рады помочь! Если появятся вопросы — пишите.'

  return 'Я пока учусь и могу подсказать про цены, врачей, адреса и запись. Для сложных вопросов оставьте заявку — администратор перезвонит.'
}

export function ChatBot({ onBook }: ChatBotProps) {
  const { branches, doctors } = useClinic()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { from: 'bot', text: 'Здравствуйте! Я — помощник клиники KARAT TITAN. Подскажу цены, адреса и помогу записаться. Чем помочь?' },
  ])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const send = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setMessages((m) => [...m, { from: 'user', text: trimmed }])
    setInput('')
    setTimeout(() => {
      setMessages((m) => [...m, { from: 'bot', text: botAnswer(trimmed, branches, doctors) }])
    }, 500)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Закрыть чат' : 'Открыть чат с ботом'}
        className="fixed bottom-5 right-5 z-[90] flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-accent-primary text-text-inverse shadow-lg transition-transform hover:scale-105"
      >
        {open ? <X size={22} /> : <MessageCircle size={24} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-[5.5rem] right-4 z-[90] flex h-[30rem] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-[1.35rem] border border-line bg-surface shadow-2xl sm:right-5"
          >
            <div className="flex items-center gap-3 bg-accent-primary-700 px-4 py-3 text-text-inverse">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                <MessageCircle size={18} aria-hidden="true" />
              </span>
              <span>
                <strong className="block text-sm font-semibold">Помощник KARAT TITAN</strong>
                <span className="block text-[11px] text-white/60">Отвечает мгновенно</span>
              </span>
            </div>

            <div className="flex-1 space-y-2.5 overflow-y-auto p-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                    m.from === 'bot'
                      ? 'rounded-bl-sm bg-bg-secondary text-ink'
                      : 'ml-auto rounded-br-sm bg-accent-primary text-text-inverse'
                  }`}
                >
                  {m.text}
                </div>
              ))}
              {/запис|при[её]м/.test(messages[messages.length - 1]?.text.toLowerCase() ?? '') &&
                messages[messages.length - 1]?.from === 'bot' && (
                <button
                  type="button"
                  onClick={() => { setOpen(false); onBook() }}
                  className="mt-1 cursor-pointer rounded-full bg-accent-secondary-300 px-4 py-2 text-xs font-semibold text-accent-primary-700 transition-colors hover:bg-[#edca82]"
                >
                  Открыть форму записи
                </button>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="border-t border-line p-3">
              <div className="mb-2 flex gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {quickReplies.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => send(r)}
                    className="shrink-0 cursor-pointer rounded-full border border-line bg-bg-primary px-3 py-1.5 text-[11px] font-medium text-text-secondary transition-colors hover:border-accent-primary/60 hover:text-ink"
                  >
                    {r}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => { e.preventDefault(); send(input) }}
                className="flex items-center gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Напишите вопрос…"
                  className="min-w-0 flex-1 rounded-full border border-line bg-bg-primary px-4 py-2.5 text-sm text-ink placeholder:text-text-muted focus:border-accent-primary focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Отправить"
                  className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-accent-primary text-text-inverse transition-colors hover:bg-accent-primary-700"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
